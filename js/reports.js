// reports.js (complete)

// reportUser prevents double-reporting and increments reports atomically.
// Usage: call reportUser(targetUserId)
async function reportUser(targetUserId) {
  try {
    if (!currentUser) { alert("Sign in to report"); return; }
    if (!targetUserId) return;

    const confirmReport = confirm("Report this user for violating rules?");
    if (!confirmReport) return;

    const reportDocId = `${targetUserId}_${currentUser.uid}`;
    const repRef = db.collection("reports").doc(reportDocId);
    const targetRef = db.collection("users").doc(targetUserId);

    const res = await db.runTransaction(async (tx) => {
      const existing = await tx.get(repRef);
      if (existing.exists) {
        return { already: true };
      }
      tx.set(repRef, {
        reported: targetUserId,
        reporter: currentUser.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      const targetSnap = await tx.get(targetRef);
      const currentReports = (targetSnap.exists && targetSnap.data().reports) ? targetSnap.data().reports : 0;
      const newReports = currentReports + 1;
      tx.update(targetRef, { reports: newReports });

      if (newReports >= 3) {
        tx.update(targetRef, { banned: true });
      }

      return { already: false, newReports };
    });

    if (res.already) {
      alert("⚠ You have already reported this user.");
      return;
    }

    if (res.newReports >= 3) {
      alert("User has been banned due to multiple reports.");
    } else {
      alert("Report submitted. Thank you.");
    }
  } catch (err) {
    console.error("Reporting failed", err);
    alert("Could not submit report. Try again later.");
  }
}
