// profile.js (complete)
// NOTE: ensure the HTML contains form inputs with these IDs:
// username-input, college-input, year-input, gender-input, age-input, bio-input,
// referral-input, save-profile-btn, profile-card, app-card, user-pill

let selectedAvatar = "avatar1.png"; // fallback default

// When user clicks Save Profile
document.getElementById("save-profile-btn")?.addEventListener("click", async () => {
  try {
    if (!currentUser) { alert("Please sign in first"); return; }

    const username = document.getElementById("username-input")?.value?.trim();
    const college = document.getElementById("college-input")?.value;
    const year = document.getElementById("year-input")?.value?.trim();
    const gender = document.getElementById("gender-input")?.value;
    const ageVal = document.getElementById("age-input")?.value;
    const age = ageVal ? parseInt(ageVal) : null;
    const bio = document.getElementById("bio-input")?.value?.trim();
    const referral = document.getElementById("referral-input")?.value?.trim();

    if (!username || !college || !gender || !age) {
      alert("⚠ Please fill all required fields (nickname, college, gender, age).");
      return;
    }
    if (age < 18) {
      alert("⚠ You must be 18+ to use this app.");
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
      email: currentUser.email || null,
      points: 5,
      referralCode: currentUser.uid.slice(0, 6),
      referredBy: referral || null,
      referralCount: 0,
      banned: false,
      reports: 0,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    const userRef = db.collection("users").doc(currentUser.uid);

    // Create or update atomically
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(userRef);
      if (snap.exists) {
        // merge: update user fields (preserve other fields if present)
        tx.update(userRef, Object.assign({}, userDoc));
      } else {
        tx.set(userRef, userDoc);
      }
    });

    // Handle referral atomically if provided and not self
    if (referral && referral !== currentUser.uid.slice(0,6)) {
      const refQ = await db.collection("users").where("referralCode", "==", referral).limit(1).get();
      if (!refQ.empty) {
        const refUserRef = refQ.docs[0].ref;
        await db.runTransaction(async (tx) => {
          const r = await tx.get(refUserRef);
          const currentPts = (r.exists && r.data().points) ? r.data().points : 0;
          tx.update(refUserRef, {
            points: firebase.firestore.FieldValue.increment(15),
            referralCount: firebase.firestore.FieldValue.increment(1)
          });
        });
      }
    }

    // update local profile and UI
    profile = { id: currentUser.uid, ...userDoc };
    document.getElementById("profile-card")?.classList.add("hidden");
    document.getElementById("app-card")?.classList.remove("hidden");
    const pill = document.getElementById("user-pill");
    if (pill) pill.innerText = `${profile.username} • Code: ${profile.referralCode} • ${profile.points} pts`;

    // optional: start app realtime subscriptions if implemented elsewhere
    if (typeof window.subscribeAllRealtime === "function") window.subscribeAllRealtime();

    alert("Profile saved! 🎉");
  } catch (err) {
    console.error("Failed to save profile:", err);
    alert("An error occurred while saving profile. Check console.");
  }
});
