// avatar.js

const avatarList = [
  "avatar1.png", "avatar2.png", "avatar3.png", "avatar4.png",
  "avatar5.png", "avatar6.png", "avatar7.png", "avatar8.png",
  "avatar9.png", "avatar10.png", "avatar11.png", "avatar12.png"
];

let selectedAvatar = null;

function loadAvatars() {
  const container = $("avatar-container");
  container.innerHTML = "";

  avatarList.forEach(a => {
    const div = document.createElement("div");
    div.className = "avatar-option";
    div.innerHTML = `<img src="assets/avatars/${a}"/>`;

    div.addEventListener("click", () => {
      document.querySelectorAll(".avatar-option").forEach(o =>
        o.classList.remove("selected")
      );
      div.classList.add("selected");
      selectedAvatar = a;
    });

    container.appendChild(div);
  });
}

loadAvatars();
