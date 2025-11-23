// confessions.js

let unsubscribeConfessions = null;

$("post-confession-btn").addEventListener("click", async () => {
  const text = $("confession-input").value.trim();
  if (!text) return;

  $("confession-input").value = "";

  await db.collection("confessions").add({
    text,
    college: profile.college,
    hearts: 0,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  await db.collection("users").doc(currentUser.uid)
    .update({ points: firebase.firestore.FieldValue.increment(4) });
});

function subscribeConfessions() {
  if (unsubscribeConfessions) unsubscribeConfessions();

  unsubscribeConfessions = db.collection("confessions")
    .where("college", "==", profile.college)
    .orderBy("createdAt", "desc")
    .limit(40)
    .onSnapshot(snapshot => {
      const list = $("confessions-list");
      list.innerHTML = "";

      snapshot.forEach(doc => {
        const d = doc.data();
        const div = document.createElement("div");
        div.className = "bubble";
        div.innerHTML = `${d.text}<br><small style="color:#555;">❤️ ${d.hearts}</small>`;
        list.appendChild(div);
      });
    });
}
