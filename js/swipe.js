// swipe.js

let swipeUsers = [];
let swipeIndex = 0;

$("open-swipe-btn").addEventListener("click", () => {
  if (swipeUsers.length === 0) {
    alert("No profiles available right now");
    return;
  }

  swipeIndex = 0;
  showSwipe();
  $("swipe-overlay").classList.remove("hidden");
});

$("swipe-close-btn").addEventListener("click", () => {
  $("swipe-overlay").classList.add("hidden");
});

$("swipe-like-btn").addEventListener("click", () => swipe("like"));
$("swipe-skip-btn").addEventListener("click", () => swipe("skip"));

function showSwipe() {
  if (swipeIndex >= swipeUsers.length) {
    $("swipe-username").innerHTML = "No more profiles 😢";
    $("swipe-meta").innerText = "";
    $("swipe-bio").innerText = "Invite more users and earn points!";
    return;
  }

  const u = swipeUsers[swipeIndex];

  $("swipe-username").innerHTML = `
    <img src="assets/avatars/${u.avatar}" style="width:85px;height:85px;border-radius:50%;margin-bottom:6px;">
    <br>${u.username}
  `;
  $("swipe-meta").innerText = `${u.year} • ${u.points} pts`;
  $("swipe-bio").innerText = u.bio;
}

async function swipe(type) {
  const target = swipeUsers[swipeIndex];
  swipeIndex++;
  showSwipe();

  await db.collection("swipes").add({
    fromId: currentUser.uid,
    toId: target.id,
    type,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  if (type === "like") {
    const mutual = await db.collection("swipes")
      .where("fromId", "==", target.id)
      .where("toId", "==", currentUser.uid)
      .where("type", "==", "like")
      .get();

    if (!mutual.empty) {
      $("match-name").innerText = target.username;
      $("match-popup").classList.remove("hidden");
      launchConfetti();
      matchSound.play();
      vibrate(120);

      await db.collection("users").doc(currentUser.uid)
        .update({ points: firebase.firestore.FieldValue.increment(10) });
    }
  }
}

$("match-close-btn").addEventListener("click", () => {
  $("match-popup").classList.add("hidden");
});
