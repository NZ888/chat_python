import random
import string

import flask
import flask_login
from flask_socketio import emit, join_room

from project.db import DATABASE
from project.socket import socketio
from user.models import User
from .models import Chat, Message, UserChatLink

ONLINE_USER_SIDS = {}
SID_USERS = {}


def render_chat():
    if not flask_login.current_user.is_authenticated:
        return flask.redirect("/login")

    return flask.render_template("chat.html", is_authenticated=True)


def make_word():
    while True:
        word = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
        if Chat.query.filter_by(word=word).first() is None:
            return word


def get_user_name(user):
    if user.name:
        return user.name
    if user.user_name:
        return user.user_name
    return user.email.split("@")[0]


def get_letters(name):
    words = str(name or "User").split()
    letters = "".join([word[0] for word in words[:2]])
    return letters.upper() or "U"


def add_online_user(user_id, sid):
    ONLINE_USER_SIDS.setdefault(user_id, set()).add(sid)
    SID_USERS[sid] = user_id


def remove_online_sid(sid):
    user_id = SID_USERS.pop(sid, None)
    if user_id is None:
        return

    user_sids = ONLINE_USER_SIDS.get(user_id, set())
    user_sids.discard(sid)

    if user_sids:
        ONLINE_USER_SIDS[user_id] = user_sids
    else:
        ONLINE_USER_SIDS.pop(user_id, None)


def get_online_user_ids():
    return set(ONLINE_USER_SIDS.keys())


def is_user_online(user_id):
    return user_id in ONLINE_USER_SIDS


def get_user_data(user):
    name = get_user_name(user)

    return {
        "id": user.id,
        "name": name,
        "username": user.user_name or user.email,
        "avatar": get_letters(name),
        "online": is_user_online(user.id)
    }


def get_presence_data():
    user_ids = list(get_online_user_ids())
    if not user_ids:
        return {
            "onlineUserIds": [],
            "onlineUsers": []
        }

    users = User.query.filter(User.id.in_(user_ids)).all()
    users = sorted(users, key=lambda user: get_user_name(user).lower())

    return {
        "onlineUserIds": user_ids,
        "onlineUsers": [get_user_data(user) for user in users]
    }


def broadcast_presence():
    socketio.emit("presence_changed", get_presence_data())


def get_message_data(message):
    user = message.user
    name = get_user_name(user)

    return {
        "id": message.id,
        "text": message.text,
        "time": message.created_at.strftime("%H:%M"),
        "userId": user.id,
        "name": name,
        "avatar": get_letters(name),
        "my": user.id == flask_login.current_user.id
    }


def get_chat_data(chat, with_messages=False):
    created_at = chat.created_at.strftime("%d.%m") if chat.created_at else ""
    members = [get_user_data(user) for user in chat.users]

    data = {
        "id": chat.id,
        "title": chat.title,
        "word": chat.word,
        "lastMessage": chat.last_message or "Повідомлень поки немає",
        "time": created_at,
        "ownerId": chat.owner_id,
        "isOwner": chat.owner_id == flask_login.current_user.id,
        "usersCount": len(members),
        "onlineCount": len([user for user in members if user["online"]]),
        "members": members
    }

    if with_messages:
        data["messages"] = [get_message_data(message) for message in chat.messages]

    return data


def is_chat_user(chat):
    return flask_login.current_user in chat.users


def get_chats():
    if not flask_login.current_user.is_authenticated:
        return flask.jsonify({"success": False}), 401

    user = flask_login.current_user
    my_chats = Chat.query.join(UserChatLink).filter(UserChatLink.user_id == user.id).order_by(Chat.created_at.desc()).all()
    other_chats = Chat.query.filter(~Chat.users.any(id=user.id)).order_by(Chat.created_at.desc()).all()
    owner_chat_id = user_owned_chat_id()

    return flask.jsonify({
        "success": True,
        "currentUserId": user.id,
        "myChats": [get_chat_data(chat, True) for chat in my_chats],
        "otherChats": [get_chat_data(chat) for chat in other_chats],
        "ownerChatId": owner_chat_id,
        "canCreateChat": owner_chat_id is None,
        **get_presence_data()
    })


def user_owned_chat_id():
    chat = Chat.query.filter_by(owner_id=flask_login.current_user.id).first()
    if chat:
        return chat.id
    return None


def create_chat():
    if not flask_login.current_user.is_authenticated:
        return flask.jsonify({"success": False}), 401

    if user_owned_chat_id() is not None:
        return flask.jsonify({
            "success": False,
            "error": "Можна створити тільки один свій чат."
        }), 400

    data = flask.request.get_json(silent=True) or {}
    title = str(data.get("title", "")).strip()

    if not title:
        return flask.jsonify({
            "success": False,
            "error": "Введіть назву чату."
        }), 400

    chat = Chat(
        title=title[:50],
        word=make_word(),
        last_message="Чат створено. Можна починати спілкування.",
        owner_id=flask_login.current_user.id
    )
    chat.users.append(flask_login.current_user)

    DATABASE.session.add(chat)
    DATABASE.session.commit()

    return flask.jsonify({
        "success": True,
        "chat": get_chat_data(chat, True)
    })


def delete_chat(chat_id):
    if not flask_login.current_user.is_authenticated:
        return flask.jsonify({"success": False}), 401

    chat = Chat.query.filter_by(id=chat_id).first()
    if chat is None:
        return flask.jsonify({"success": False}), 404

    if chat.owner_id != flask_login.current_user.id:
        return flask.jsonify({
            "success": False,
            "error": "Видалити може тільки власник чату."
        }), 403

    DATABASE.session.delete(chat)
    DATABASE.session.commit()
    socketio.emit("chat_deleted", {"chatId": chat_id}, to=get_room(chat_id))

    return flask.jsonify({"success": True})


def join_chat(chat_id):
    if not flask_login.current_user.is_authenticated:
        return flask.jsonify({"success": False}), 401

    chat = Chat.query.filter_by(id=chat_id).first()
    if chat is None:
        return flask.jsonify({"success": False}), 404

    if flask_login.current_user not in chat.users:
        chat.users.append(flask_login.current_user)
        DATABASE.session.commit()

    return flask.jsonify({
        "success": True,
        "chat": get_chat_data(chat, True)
    })


def get_room(chat_id):
    return f"chat_{chat_id}"


@socketio.on("connect")
def socket_connect():
    if not flask_login.current_user.is_authenticated:
        return False

    add_online_user(flask_login.current_user.id, flask.request.sid)
    emit("connected", {"userId": flask_login.current_user.id})
    broadcast_presence()


@socketio.on("disconnect")
def socket_disconnect():
    remove_online_sid(flask.request.sid)
    broadcast_presence()


@socketio.on("join_chat_room")
def socket_join_chat(data):
    if not flask_login.current_user.is_authenticated:
        return {"success": False}

    chat_id = data.get("chatId")
    chat = Chat.query.filter_by(id=chat_id).first()

    if chat is None or not is_chat_user(chat):
        return {"success": False}

    join_room(get_room(chat.id))
    return {
        "success": True,
        "chatId": chat.id
    }


@socketio.on("send_message")
def socket_send_message(data):
    if not flask_login.current_user.is_authenticated:
        return {"success": False}

    chat_id = data.get("chatId")
    text = str(data.get("text", "")).strip()
    chat = Chat.query.filter_by(id=chat_id).first()

    if chat is None or not is_chat_user(chat) or not text:
        return {"success": False}

    message = Message(
        text=text[:500],
        chat_id=chat.id,
        user_id=flask_login.current_user.id
    )
    chat.last_message = message.text
    DATABASE.session.add(message)
    DATABASE.session.commit()

    socketio.emit(
        "new_message",
        {
            "chatId": chat.id,
            "message": get_message_data(message),
            "lastMessage": chat.last_message
        },
        to=get_room(chat.id)
    )

    return {"success": True}
