// referrals.js

async function applyReferral(referralCode) {
  if (!referralCode || referralCode === currentUser.uid.slice(0, 6)) return;

  const refSnap = await db.collection("users")
    .where("referralCode", "==", referralCode)
    .limit(1)
    .get();

  if (!refSnap.empty) {
    const refUser = refSnap.docs[0];

    await db.collection("users").doc(refUser.id).update({
      points: firebase.firestore.FieldValue.increment(15),
      referralCount: firebase.firestore.FieldValue.increment(1)
    });

    console.log("Referral applied!");
  }
}
