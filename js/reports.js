// reports.js

async function reportUser(id) {
  const confirmReport = confirm("Report this user?");
  if (!confirmReport) return;

  const reportPath = `${id}_${currentUser.uid}`;
  const repRef = db.collection("reports").doc(reportPath);

  if ((await repRef.get()).exists) {
    alert("⚠ You already reported this user");
    return;
  }

  await repRef.set({ reported: id, reporter: currentUser.uid });

  await db.collection("users").doc(id)
    .update({ reports: firebase.firestore.FieldValue.increment(1) });

  const snap = await db.collection("users").doc(id).get();

  if (snap.data().reports >= 3) {
    await db.collection("users").doc(id).update({ banned: true });
    alert("🚫 User banned due to multiple reports");
  } else {
    alert("Report Submitted");
  }
}
