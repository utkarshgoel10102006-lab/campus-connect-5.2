// animations.js

// Confetti generator
function launchConfetti() {
  for (let i = 0; i < 45; i++) {
    const c = document.createElement("div");
    c.className = "confetti";

    c.style.left = Math.random() * 100 + "vw";
    c.style.animationDuration = (Math.random() * 2 + 1) + "s";
    c.style.opacity = Math.random();

    document.body.appendChild(c);

    setTimeout(() => c.remove(), 3000);
  }
}

// Typing indicator
function showTypingIndicator() {
  $("chat-title").innerText = "Typing...";
  setTimeout(() => {
    $("chat-title").innerText = "Chat 💬";
  }, 2000);
}

// Sound
const matchSound = new Audio("https://cdn.pixabay.com/audio/2022/03/09/audio_57daff6b42.mp3");

// Vibrate
function vibrate(ms = 80) {
  if (navigator.vibrate) navigator.vibrate(ms);
}
