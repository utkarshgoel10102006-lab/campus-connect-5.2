// chat.js (complete)
// Secret Key for AES Encryption (Global key system)
const SECRET_KEY = "CAMPUS_CONNECT_PRIVATE_KEY_2025";

let currentChatUserId = null;
let unsubscribeMessages = null;

// Click listener for selecting match or reporting
document.addEventListener("click", (e) => {
  const matchItem = e.target.closest(".match-item");
  const reportBtn = e.target.closest(".report-btn");

  if (reportBtn && matchItem) {
    reportUser(matchItem.dataset.uid);
    return;
  }

  if (matchItem) {
    document.querySelectorAll(".match-item").forEach(m =>
      m.classList.remove("active")
    );

    matchItem.classList.add("active");
    currentChatUserId = matchItem.dataset.uid;

    document.getElementById("chat-title").innerText = "Connecting…";

    subscribeMessages(currentChatUserId);
  }
});

// Subscribe to messages between two users
function subscribeMessages(uid) {
  try {
    if (unsubscribeMessages) {
      try { unsubscribeMessages(); } catch (e) { /* ignore */ }
    }
    if (!currentUser) { console.warn("subscribeMessages: no currentUser"); return; }
    if (!uid) { console.warn("subscribeMessages: no uid"); return; }

    const chatId = currentUser.uid < uid
      ? currentUser.uid + "_" + uid
      : uid + "_" + currentUser.uid;

    unsubscribeMessages = db.collection("chats").doc(chatId)
      .collection("messages")
      .orderBy("createdAt", "asc")
      .onSnapshot(snapshot => {
        const box = document.getElementById("messages");
        if (!box) return;
        box.innerHTML = "";

        snapshot.forEach(doc => {
          const m = doc.data();
          const div = document.createElement("div");

          // Decrypt message text
          let decrypted = "";
          try {
            const bytes = CryptoJS.AES.decrypt(m.text, SECRET_KEY);
            decrypted = bytes.toString(CryptoJS.enc.Utf8) || "[Encrypted]";
          } catch (error) {
            decrypted = "[Encrypted]";
          }

          div.className = "bubble " + (m.senderId === currentUser.uid ? "me" : "");
          div.innerHTML = decrypted;
          box.appendChild(div);
        });

        document.getElementById("chat-title").innerText = "Chat 💬";
        box.scrollTop = box.scrollHeight;
      }, err => {
        console.error("Messages snapshot error", err);
      });

    // register for cleanup
    if (typeof addUnsubscribe === "function") addUnsubscribe(unsubscribeMessages);
  } catch (err) {
    console.error("subscribeMessages failed", err);
  }
}

// Send message: optimistic UI + encryption
document.getElementById("send-btn")?.addEventListener("click", sendMessage);
document.getElementById("chat-input")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

function showTypingIndicator() {
  document.getElementById("chat-title").innerText = "Typing...";
  setTimeout(() => {
    document.getElementById("chat-title").innerText = "Chat 💬";
  }, 1500);
}

// Optimistic send with pending state
async function sendMessage() {
  const input = document.getElementById("chat-input");
  if (!input) return;
  const text = input.value.trim();
  if (!text || !currentChatUserId) return;

  // Explicit content filter
  const bannedWords = ["sex", "nude", "porn", "naked", "dick", "boobs", "fuck", "horny"];
  if (bannedWords.some(w => text.toLowerCase().includes(w))) {
    alert("⚠ Explicit content is not allowed here.");
    return;
  }

  input.value = "";
  showTypingIndicator();

  const chatId = currentUser.uid < currentChatUserId
    ? currentUser.uid + "_" + currentChatUserId
    : currentChatUserId + "_" + currentUser.uid;

  const encryptedText = CryptoJS.AES.encrypt(text, SECRET_KEY).toString();

  // optimistic UI: add a pending message
  const box = document.getElementById("messages");
  const tempId = "temp_" + Date.now();
  const pendingDiv = document.createElement("div");
  pendingDiv.className = "bubble me message-pending";
  pendingDiv.dataset.temp = tempId;
  pendingDiv.innerHTML = `${text} <small style="font-size:11px;color:#999;">sending…</small>`;
  box?.appendChild(pendingDiv);
  if (box) box.scrollTop = box.scrollHeight;

  try {
    const docRef = await db.collection("chats").doc(chatId)
      .collection("messages")
      .add({
        senderId: currentUser.uid,
        text: encryptedText,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

    // mark as sent
    pendingDiv.classList.remove("message-pending");
    const small = pendingDiv.querySelector("small");
    if (small) small.innerText = "sent";
    pendingDiv.dataset.id = docRef.id;

    // safe points increment
    db.collection("users").doc(currentUser.uid)
      .update({ points: firebase.firestore.FieldValue.increment(1) });

  } catch (err) {
    console.error("Send failed", err);
    if (pendingDiv) {
      const small = pendingDiv.querySelector("small");
      if (small) small.innerText = "failed — click to retry";
      pendingDiv.style.opacity = 0.8;
      pendingDiv.addEventListener("click", () => {
        pendingDiv.remove();
        sendMessageRaw(text);
      }, { once: true });
    }
  }
}

// fallback raw send (used by retry)
async function sendMessageRaw(text) {
  if (!text || !currentChatUserId) return;
  const chatId = currentUser.uid < currentChatUserId
    ? currentUser.uid + "_" + currentChatUserId
    : currentChatUserId + "_" + currentUser.uid;
  const encryptedText = CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
  await db.collection("chats").doc(chatId)
    .collection("messages")
    .add({
      senderId: currentUser.uid,
      text: encryptedText,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
}
