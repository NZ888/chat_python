const chatBlock = document.querySelector("[data-chat-app]");

let chats = [];
let otherChats = [];
let activeChat = null;
let deleteChatId = null;
let socket = null;
let socketConnected = false;
let pendingJoinChat = null;
let currentUserId = null;
let ownerChatId = null;

const colors = ["blue", "purple", "green", "orange", "navy"];

const chatList = chatBlock.querySelector("[data-chat-list]");
const availableWrap = chatBlock.querySelector("[data-available-wrap]");
const availableList = chatBlock.querySelector("[data-available-list]");
const chatSearch = chatBlock.querySelector("[data-chat-search]");
const loading = chatBlock.querySelector("[data-loading-state]");
const emptyBlock = chatBlock.querySelector("[data-empty-state]");
const notFound = chatBlock.querySelector("[data-not-found-state]");
const ownerDeleteButton = chatBlock.querySelector("[data-owner-delete]");
const conversation = chatBlock.querySelector(".conversation");
const conversationHeader = chatBlock.querySelector(".conversation-header");
const chatTitle = chatBlock.querySelector("[data-active-title]");
const chatInfo = chatBlock.querySelector("[data-active-subtitle]");
const messagesBlock = chatBlock.querySelector("[data-message-list]");
const createForm = chatBlock.querySelector("[data-create-form]");
const createError = chatBlock.querySelector("[data-create-error]");
const messageForm = chatBlock.querySelector("[data-message-form]");
const messageInput = chatBlock.querySelector("[data-message-input]");

function cleanText(text) {
    return String(text || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function getLetters(name) {
    const words = String(name || "Chat").trim().split(" ");

    return words
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase();
}

function request(url, options = {}) {
    return fetch(url, {
        headers: {
            "Content-Type": "application/json"
        },
        ...options
    }).then((response) => response.json());
}

function getChatText(chat) {
    return chat.lastMessage || "Повідомлень поки немає";
}

function getFilteredChats() {
    const value = chatSearch.value.trim().toLowerCase();

    if (!value) {
        return chats;
    }

    return chats.filter((chat) => {
        return chat.title.toLowerCase().includes(value) || getChatText(chat).toLowerCase().includes(value);
    });
}

function drawChats() {
    const filteredChats = getFilteredChats();
    const hasSearch = chatSearch.value.trim() !== "";

    chatList.innerHTML = "";
    emptyBlock.hidden = chats.length !== 0 || hasSearch;
    notFound.hidden = chats.length === 0 || filteredChats.length !== 0;
    chatList.hidden = filteredChats.length === 0;
    ownerDeleteButton.hidden = !ownerChatId;
    ownerDeleteButton.dataset.deleteChat = ownerChatId || "";

    filteredChats.forEach((chat, index) => {
        chatList.appendChild(makeChatItem(chat, index, true));
    });

    drawAvailableChats();
}

function drawAvailableChats() {
    availableList.innerHTML = "";
    availableWrap.hidden = otherChats.length === 0;

    otherChats.forEach((chat, index) => {
        availableList.appendChild(makeChatItem(chat, index, false));
    });
}

function makeChatItem(chat, index, isMember) {
    const item = document.createElement("li");
    const activeClass = chat.id === activeChat ? " active" : "";
    const color = colors[index % colors.length];

    item.className = `chat-item${activeClass}`;
    item.dataset.chatId = chat.id;

    item.innerHTML = `
        <span class="chat-avatar ${color}">${cleanText(getLetters(chat.title))}</span>
        <button class="chat-open" type="button" data-select-chat="${chat.id}" ${isMember ? "" : "disabled"}>
            <span class="chat-name-line">
                <strong>${cleanText(chat.title)}</strong>
                <span class="chat-time">${cleanText(chat.time || "")}</span>
            </span>
            <span class="chat-preview">${cleanText(getChatText(chat))}</span>
        </button>
        <span class="chat-meta">
            ${!isMember ? `<button class="join-chat-button" type="button" data-join-chat="${chat.id}">Увійти</button>` : ""}
        </span>
    `;

    return item;
}

function drawMessages() {
    const chat = chats.find((item) => item.id === activeChat);

    messagesBlock.innerHTML = "";

    if (!chat) {
        conversation.classList.add("conversation-empty");
        conversationHeader.hidden = true;
        messageForm.hidden = true;
        messagesBlock.innerHTML = `
            <div class="empty-chat-screen">
                <div class="empty-chat-icon">
                    <svg viewBox="0 0 92 92" aria-hidden="true">
                        <path d="M25 61.5L29 47.5C27.8 44.8 27.2 41.9 27.2 38.8C27.2 24.7 39 13.8 53.2 13.8C67.3 13.8 79 24.7 79 38.8C79 52.9 67.3 63.8 53.2 63.8C47.8 63.8 42.8 62.2 38.8 59.5L25 61.5Z"/>
                    </svg>
                </div>
                <h2>Виберіть чат</h2>
                <p>Приєднайтеся до кімнати та почніть розмову</p>
            </div>
        `;
        messageInput.disabled = true;
        return;
    }

    const messages = chat.messages || [];

    conversation.classList.remove("conversation-empty");
    conversationHeader.hidden = false;
    messageForm.hidden = false;
    chatTitle.textContent = chat.title;
    chatInfo.textContent = `${chat.usersCount || 1} учасників · код ${chat.word}`;
    messageInput.disabled = false;

    messages.forEach((message) => {
        messagesBlock.appendChild(makeMessage(message));
    });

    messagesBlock.scrollTop = messagesBlock.scrollHeight;
}

function makeMessage(message) {
    const messageItem = document.createElement("article");
    const messageClass = message.my ? " own" : "";

    messageItem.className = `message${messageClass}`;
    messageItem.innerHTML = `
        <span class="message-avatar blue">${cleanText(message.avatar || "?")}</span>
        <div class="message-body">
            <div class="message-head">
                <strong>${cleanText(message.name || "User")}</strong>
                <time>${cleanText(message.time || "")}</time>
            </div>
            <p>${cleanText(message.text || "")}</p>
        </div>
    `;

    return messageItem;
}

function drawUsers() {
    const chat = chats.find((item) => item.id === activeChat);
    const usersList = chatBlock.querySelector(".users-list");
    const usersTitle = chatBlock.querySelector(".users-heading span");

    if (!chat || !usersList) {
        return;
    }

    usersTitle.textContent = `${chat.members.length} користувачів`;
    usersList.innerHTML = chat.members.map((user) => `
        <li>
            <span class="mini-avatar blue">${cleanText(user.avatar)}</span>
            <div>
                <strong>${cleanText(user.name)}</strong>
                <small>у чаті</small>
            </div>
        </li>
    `).join("");
}

function drawPage() {
    drawChats();
    drawMessages();
    drawUsers();
}

function openModal(name) {
    const modal = chatBlock.querySelector(`[data-modal="${name}"]`);

    if (!modal) {
        return;
    }

    modal.hidden = false;

    const field = modal.querySelector("input, select, button");
    if (field) {
        field.focus();
    }
}

function closeModal() {
    chatBlock.querySelectorAll("[data-modal]").forEach((modal) => {
        modal.hidden = true;
    });

    deleteChatId = null;
}

function readSocketPacket(packet) {
    if (packet === "2") {
        socket.send("3");
        return;
    }

    if (packet.startsWith("0")) {
        socket.send("40");
        return;
    }

    if (packet.startsWith("40")) {
        socketConnected = true;
        if (pendingJoinChat) {
            joinSocketRoom(pendingJoinChat);
            pendingJoinChat = null;
        }
        return;
    }

    if (!packet.startsWith("42")) {
        return;
    }

    const eventData = JSON.parse(packet.slice(2));
    const eventName = eventData[0];
    const data = eventData[1] || {};

    if (eventName === "new_message") {
        addSocketMessage(data);
    }

    if (eventName === "chat_deleted") {
        loadChats();
    }
}

function sendSocketEvent(name, data) {
    if (!socket || !socketConnected) {
        return false;
    }

    socket.send(`42${JSON.stringify([name, data])}`);
    return true;
}

function joinSocketRoom(chatId) {
    if (!sendSocketEvent("join_chat_room", { chatId: Number(chatId) })) {
        pendingJoinChat = Number(chatId);
    }
}

function addSocketMessage(data) {
    const chat = chats.find((item) => item.id === data.chatId);
    if (!chat) {
        return;
    }

    data.message.my = data.message.userId === currentUserId;
    chat.messages.push(data.message);
    chat.lastMessage = data.lastMessage;

    if (activeChat === data.chatId) {
        messagesBlock.appendChild(makeMessage(data.message));
        messagesBlock.scrollTop = messagesBlock.scrollHeight;
    }

    drawChats();
}

function connectSocket() {
    if (socket) {
        return;
    }

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    socket = new WebSocket(`${protocol}://${window.location.host}/socket.io/?EIO=4&transport=websocket`);

    socket.addEventListener("message", (event) => {
        readSocketPacket(event.data);
    });

    socket.addEventListener("close", () => {
        socket = null;
        socketConnected = false;
    });
}

function connectChat() {
    if (socket) {
        joinSocketRoom(activeChat);
        return;
    }

    if (!activeChat) {
        return;
    }

    pendingJoinChat = activeChat;
    connectSocket();
}

function selectChat(chatId) {
    activeChat = Number(chatId);
    drawPage();
    connectChat();
}

function loadChats() {
    loading.hidden = false;

    request("/api/chats/")
        .then((data) => {
            currentUserId = data.currentUserId;
            ownerChatId = data.ownerChatId || null;
            chats = data.myChats || [];
            otherChats = data.otherChats || [];

            if (!chats.find((chat) => chat.id === activeChat)) {
                activeChat = null;
            }

            loading.hidden = true;
            drawPage();
            connectChat();
        });
}

function createChat(title) {
    return request("/api/chats/create/", {
        method: "POST",
        body: JSON.stringify({ title })
    });
}

function deleteChat() {
    if (!deleteChatId) {
        return;
    }

    return request(`/api/chats/${deleteChatId}/delete/`, {
        method: "DELETE"
    }).then(() => {
        if (activeChat === deleteChatId) {
            activeChat = null;
        }
        loadChats();
    });
}

function joinChat(chatId) {
    return request(`/api/chats/${chatId}/join/`, {
        method: "POST"
    }).then(() => {
        activeChat = Number(chatId);
        loadChats();
    });
}

chatBlock.addEventListener("click", (event) => {
    const createButton = event.target.closest("[data-open-create]");
    const profileButton = event.target.closest("[data-open-profile]");
    const closeButton = event.target.closest("[data-close-modal]");
    const selectButton = event.target.closest("[data-select-chat]");
    const deleteButton = event.target.closest("[data-delete-chat]");
    const joinButton = event.target.closest("[data-join-chat]");
    const confirmDelete = event.target.closest("[data-confirm-delete]");

    if (event.target.classList.contains("modal-backdrop") || closeButton) {
        closeModal();
        return;
    }

    if (createButton) {
        createForm.reset();
        createError.hidden = true;
        openModal("create");
        return;
    }

    if (profileButton) {
        openModal("profile");
        return;
    }

    if (selectButton) {
        selectChat(selectButton.dataset.selectChat);
        return;
    }

    if (deleteButton) {
        deleteChatId = Number(deleteButton.dataset.deleteChat);
        openModal("delete");
        return;
    }

    if (joinButton) {
        joinChat(joinButton.dataset.joinChat);
        return;
    }

    if (confirmDelete) {
        deleteChat().then(closeModal);
    }
});

chatBlock.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeModal();
    }
});

chatSearch.addEventListener("input", drawChats);

createForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = createForm.chatName.value.trim();

    if (!title) {
        createError.textContent = "Введіть назву чату.";
        createError.hidden = false;
        createForm.chatName.focus();
        return;
    }

    createChat(title).then((data) => {
        if (!data.success) {
            createError.textContent = data.error || "Не вдалося створити чат.";
            createError.hidden = false;
            return;
        }

        activeChat = data.chat.id;
        createError.hidden = true;
        closeModal();
        loadChats();
    });
});

messageForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const text = messageInput.value.trim();
    if (!text) {
        return;
    }

    if (!sendSocketEvent("send_message", { chatId: activeChat, text })) {
        return;
    }

    messageInput.value = "";
});

loadChats();
