// profile.js

$("save-profile-btn").addEventListener("click", async () => {
  const username = $("username-input").value.trim();
  const college = $("college-input").value;
  const year = $("year-input").value.trim();
  const gender = $("gender-input").value;
  const age = parseInt($("age-input").value);
  const bio = $("bio-input").value.trim();
  const referral = $("referral-input").value.trim();

  if (!username || !college || !gender || !age) {
    alert("⚠ Fill all fields");
    return;
  }
  if (age < 18) {
    alert("⚠ Must be 18+ to use this app");
    return;
  }

  const userDoc = {
    username,
    college,
    year,
    gender,
    age,
    bio,
    avatar: selectedAvatar || "avatar1.png",
    email: currentUser.email,
    points: 5,
    referralCode: currentUser.uid.slice(0, 6),
    referredBy: referral || null,
    referralCount: 0,
    banned: false,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  };

  await db.collection("users").doc(currentUser.uid).set(userDoc);

  // Referral logic
  if (referral && referral !== currentUser.uid.slice(0, 6)) {
    const refSnap = await db.collection("users")
      .where("referralCode", "==", referral)
      .limit(1)
      .get();

    if (!refSnap.empty) {
      const refUser = refSnap.docs[0];

      await db.collection("users").doc(refUser.id).update({
        points: firebase.firestore.FieldValue.increment(15),
        referralCount: firebase.firestore.FieldValue.increment(1)
      });
    }
  }

  profile = { id: currentUser.uid, ...userDoc };

  $("profile-card").classList.add("hidden");
  $("app-card").classList.remove("hidden");
  $("user-pill").innerText =
    `${profile.username} • Code: ${profile.referralCode} • ${profile.points} pts`;

  subscribeAllRealtime();
});
