// chat.js — Final Encrypted Chat Version

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

    $("chat-title").innerText = "Connecting…";

    subscribeMessages(currentChatUserId);
  }
});

// Subscribe to messages between two users
function subscribeMessages(uid) {
  if (unsubscribeMessages) unsubscribeMessages();

  const chatId = currentUser.uid < uid
    ? currentUser.uid + "_" + uid
    : uid + "_" + currentUser.uid;

  unsubscribeMessages = db.collection("chats").doc(chatId)
    .collection("messages")
    .orderBy("createdAt", "asc")
    .onSnapshot(snapshot => {
      const box = $("messages");
      box.innerHTML = "";

      snapshot.forEach(doc => {
        const m = doc.data();
        const div = document.createElement("div");

        // Decrypt message text (Step 4)
        let decrypted = "";
        try {
          const bytes = CryptoJS.AES.decrypt(m.text, SECRET_KEY);
          decrypted = bytes.toString(CryptoJS.enc.Utf8);
        } catch (error) {
          decrypted = "[Encrypted]";
        }

        div.className = "bubble " + (m.senderId === currentUser.uid ? "me" : "");
        div.innerHTML = decrypted;
        box.appendChild(div);
      });

      $("chat-title").innerText = "Chat 💬";
      box.scrollTop = box.scrollHeight;
    });
}

// Send message button and enter-key
$("send-btn").addEventListener("click", sendMessage);
$("chat-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

// Send Message (Step 3 Encryption)
async function sendMessage() {
  const text = $("chat-input").value.trim();
  if (!text || !currentChatUserId) return;

  // Explicit Content Filter
  const bannedWords = ["sex", "nude", "porn", "naked", "dick", "boobs", "fuck", "horny"];
  if (bannedWords.some(w => text.toLowerCase().includes(w))) {
    alert("⚠ Explicit content is not allowed here.");
    return;
  }

  // Empty input UI reset + typing indicator
  $("chat-input").value = "";
  showTypingIndicator(); 

  const chatId = currentUser.uid < currentChatUserId
    ? currentUser.uid + "_" + currentChatUserId
    : currentChatUserId + "_" + currentUser.uid;

  // Encrypt text before storing
  const encryptedText = CryptoJS.AES.encrypt(text, SECRET_KEY).toString();

  await db.collection("chats").doc(chatId)
    .collection("messages")
    .add({
      senderId: currentUser.uid,
      text: encryptedText,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

  // Add points for chat activity
  db.collection("users").doc(currentUser.uid)
    .update({ points: firebase.firestore.FieldValue.increment(1) });
}

// Typing indicator helper
function showTypingIndicator() {
  $("chat-title").innerText = "Typing...";
  setTimeout(() => {
    $("chat-title").innerText = "Chat 💬";
  }, 1500);
}
