// auth.js

$("google-login-btn").addEventListener("click", () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).catch((err) => alert(err.message));
});

$("logout-btn").addEventListener("click", () => auth.signOut());

// onAuthStateChanged
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    $("login-card").classList.remove("hidden");
    $("profile-card").classList.add("hidden");
    $("app-card").classList.add("hidden");
    return;
  }

  currentUser = user;

  const snap = await db.collection("users").doc(user.uid).get();
  if (!snap.exists) {
    $("login-card").classList.add("hidden");
    $("profile-card").classList.remove("hidden");
  } else {
    profile = { id: snap.id, ...snap.data() };

    $("login-card").classList.add("hidden");
    $("profile-card").classList.add("hidden");
    $("app-card").classList.remove("hidden");

    $("user-pill").innerText =
      `${profile.username} • Code: ${profile.referralCode} • ${profile.points} pts`;

    subscribeAllRealtime();
  }
});
