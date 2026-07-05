import user, chat


user.user.add_url_rule(
    rule = '/register/',
    view_func = user.render_register,
    methods = ["GET", "POST"]
)

user.user.add_url_rule(
    rule = '/register/success/',
    view_func = user.render_register_success,
    methods = ["GET"]
)

chat.chat.add_url_rule(
    rule = '/',
    view_func = chat.render_chat,
    methods = ["GET", "POST"]
)

chat.chat.add_url_rule(
    rule = '/api/chats/',
    view_func = chat.get_chats,
    methods = ["GET"]
)

chat.chat.add_url_rule(
    rule = '/api/chats/create/',
    view_func = chat.create_chat,
    methods = ["POST"]
)

chat.chat.add_url_rule(
    rule = '/api/chats/<int:chat_id>/delete/',
    view_func = chat.delete_chat,
    methods = ["DELETE"]
)

chat.chat.add_url_rule(
    rule = '/api/chats/<int:chat_id>/join/',
    view_func = chat.join_chat,
    methods = ["POST"]
)

user.user.add_url_rule(
    rule = '/login/',
    view_func = user.render_login,
    methods = ["GET", "POST"]
)
user.user.add_url_rule(
    rule = '/check_email/',
    view_func = user.check_email,
    methods = ["GET", "POST"]
)
user.user.add_url_rule(
    rule = '/get_data/',
    view_func = user.get_data,
    methods = ["POST"]
)
