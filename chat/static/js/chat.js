const chatBlock = document.querySelector("[data-chat-app]");

const startChats = [
    {
        id: 1,
        title: "Dream Team",
        lastMessage: "I just shared the new mockups in Figma",
        time: "15m ago",
        unread: 0,
        color: "purple",
        messages: [
            { name: "Diana", avatar: "D", time: "9:18 AM", text: "I just shared the new mockups in Figma." },
            { name: "You", avatar: "Y", time: "9:20 AM", text: "Great, I'll review them before lunch.", my: true }
        ]
    },
    {
        id: 2,
        title: "General Chat",
        lastMessage: "Hey everyone! How is the project going?",
        time: "2m ago",
        unread: 3,
        color: "blue",
        messages: [
            { name: "Alex", avatar: "A", time: "9:24 AM", text: "Hey everyone! Good morning!" },
            { name: "Maria", avatar: "M", time: "9:26 AM", text: "Morning Alex! How was your weekend?", color: "purple" },
            { name: "Alex", avatar: "A", time: "9:26 AM", text: "It was great! I finished the new feature implementation and it's ready for review." },
            { name: "John", avatar: "J", time: "9:29 AM", text: "Nice work Alex! I'll take a look at it this afternoon.", color: "green" },
            { name: "Kate", avatar: "K", time: "9:44 AM", text: "I just shared the updated design files in Figma. The new color scheme looks amazing! What do you all think?", color: "orange" },
            { name: "You", avatar: "Y", time: "9:40 AM", text: "Looks great! I'll start working on the next step.", my: true }
        ]
    },
    {
        id: 3,
        title: "Design Team",
        lastMessage: "The API integration is complete",
        time: "1h ago",
        unread: 0,
        color: "red",
        messages: [
            { name: "Emma", avatar: "E", time: "8:55 AM", text: "The API integration is complete." },
            { name: "You", avatar: "Y", time: "9:02 AM", text: "Perfect, thanks for the update.", my: true }
        ]
    },
    {
        id: 4,
        title: "Marketing Team",
        lastMessage: "Great work on the campaign launch!",
        time: "1h ago",
        unread: 7,
        color: "green",
        messages: [
            { name: "Michael", avatar: "M", time: "8:20 AM", text: "Great work on the campaign launch!" }
        ]
    },
    {
        id: 5,
        title: "Random",
        lastMessage: "Anyone up for lunch?",
        time: "5h ago",
        unread: 2,
        color: "navy",
        messages: [
            { name: "Sarah", avatar: "S", time: "12:05 PM", text: "Anyone up for lunch?" }
        ]
    }
];

const colors = ["blue", "purple", "green", "orange", "navy"];

let chats = startChats.slice();
let activeChat = 2;
let deleteChatId = null;

const chatList = chatBlock.querySelector("[data-chat-list]");
const chatSearch = chatBlock.querySelector("[data-chat-search]");
const loading = chatBlock.querySelector("[data-loading-state]");
const emptyBlock = chatBlock.querySelector("[data-empty-state]");
const notFound = chatBlock.querySelector("[data-not-found-state]");
const chatTitle = chatBlock.querySelector("[data-active-title]");
const chatInfo = chatBlock.querySelector("[data-active-subtitle]");
const messagesBlock = chatBlock.querySelector("[data-message-list]");
const createForm = chatBlock.querySelector("[data-create-form]");
const createError = chatBlock.querySelector("[data-create-error]");
const messageForm = chatBlock.querySelector("[data-message-form]");

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

function getChatText(chat) {
    return chat.lastMessage || "Повідомлень ще немає";
}

function getChats() {
    const value = chatSearch.value.trim().toLowerCase();

    if (!value) {
        return chats;
    }

    return chats.filter((chat) => {
        const title = chat.title.toLowerCase();
        const lastMessage = getChatText(chat).toLowerCase();

        return title.includes(value) || lastMessage.includes(value);
    });
}

function drawChats() {
    const filteredChats = getChats();
    const hasSearch = chatSearch.value.trim() !== "";

    chatList.innerHTML = "";
    emptyBlock.hidden = chats.length !== 0 || hasSearch;
    notFound.hidden = chats.length === 0 || filteredChats.length !== 0;
    chatList.hidden = filteredChats.length === 0;

    filteredChats.forEach((chat) => {
        const item = document.createElement("li");
        const activeClass = chat.id === activeChat ? " active" : "";

        item.className = `chat-item${activeClass}`;
        item.dataset.chatId = chat.id;

        item.innerHTML = `
            <span class="chat-avatar ${chat.color || "blue"}">${getLetters(chat.title)}</span>
            <button class="chat-open" type="button" data-select-chat="${chat.id}">
                <span class="chat-name-line">
                    <strong>${cleanText(chat.title)}</strong>
                    <span class="chat-time">${cleanText(chat.time || "")}</span>
                </span>
                <span class="chat-preview">${cleanText(getChatText(chat))}</span>
            </button>
            <span class="chat-meta">
                ${chat.unread ? `<span class="unread-badge">${chat.unread}</span>` : ""}
                <button class="delete-chat-button" type="button" data-delete-chat="${chat.id}" aria-label="Видалити ${cleanText(chat.title)}">×</button>
            </span>
        `;

        chatList.appendChild(item);
    });
}

function drawMessages() {
    const chat = chats.find((item) => item.id === activeChat);

    messagesBlock.innerHTML = "";

    if (!chat) {
        chatTitle.textContent = "Чат не вибрано";
        chatInfo.textContent = "Створіть чат або виберіть його зі списку";
        messagesBlock.innerHTML = '<div class="empty-state"><p>Активного чату поки немає.</p></div>';
        return;
    }

    const messages = chat.messages || [];

    chatTitle.textContent = chat.title;
    chatInfo.textContent = `${messages.length} повідомлень`;

    messages.forEach((message) => {
        const messageItem = document.createElement("article");
        const messageClass = message.my ? " own" : "";

        messageItem.className = `message${messageClass}`;
        messageItem.innerHTML = `
            <span class="message-avatar ${message.color || "blue"}">${cleanText(message.avatar || "?")}</span>
            <div class="message-body">
                <div class="message-head">
                    <strong>${cleanText(message.name || "User")}</strong>
                    <time>${cleanText(message.time || "")}</time>
                </div>
                <p>${cleanText(message.text || "")}</p>
            </div>
        `;

        messagesBlock.appendChild(messageItem);
    });
}

function drawPage() {
    drawChats();
    drawMessages();
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

function createChat(title) {
    const newChat = {
        id: Date.now(),
        title: title,
        lastMessage: "Чат створено. Можна починати спілкування.",
        time: "now",
        unread: 0,
        color: colors[chats.length % colors.length],
        messages: [
            {
                name: "System",
                avatar: "S",
                time: "now",
                text: "Чат створено. Можна починати спілкування.",
                color: "navy"
            }
        ]
    };

    chats.unshift(newChat);
    activeChat = newChat.id;
    chatSearch.value = "";
}

function deleteChat() {
    if (!deleteChatId) {
        return;
    }

    chats = chats.filter((chat) => chat.id !== deleteChatId);

    if (activeChat === deleteChatId) {
        activeChat = chats.length ? chats[0].id : null;
    }
}

chatBlock.addEventListener("click", (event) => {
    const createButton = event.target.closest("[data-open-create]");
    const profileButton = event.target.closest("[data-open-profile]");
    const closeButton = event.target.closest("[data-close-modal]");
    const selectButton = event.target.closest("[data-select-chat]");
    const deleteButton = event.target.closest("[data-delete-chat]");
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
        activeChat = Number(selectButton.dataset.selectChat);

        const chat = chats.find((item) => item.id === activeChat);
        if (chat) {
            chat.unread = 0;
        }

        drawPage();
        return;
    }

    if (deleteButton) {
        deleteChatId = Number(deleteButton.dataset.deleteChat);
        openModal("delete");
        return;
    }

    if (confirmDelete) {
        deleteChat();
        closeModal();
        drawPage();
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
        createError.hidden = false;
        createForm.chatName.focus();
        return;
    }

    createChat(title);
    createError.hidden = true;
    closeModal();
    drawPage();
});

messageForm.addEventListener("submit", (event) => {
    event.preventDefault();
});

setTimeout(() => {
    loading.hidden = true;
    drawPage();
}, 400);
