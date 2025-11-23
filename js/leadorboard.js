// leaderboard.js

let unsubscribeLeaderboard = null;

function subscribeLeaderboard() {
  if (unsubscribeLeaderboard) unsubscribeLeaderboard();

  unsubscribeLeaderboard = db.collection("users")
    .where("college", "==", profile.college)
    .orderBy("points", "desc")
    .limit(30)
    .onSnapshot(snapshot => {
      const list = $("leaderboard-list");
      list.innerHTML = "";
      let rank = 1;

      snapshot.forEach(doc => {
        const u = doc.data();
        const div = document.createElement("div");
        div.className = "bubble";
        div.innerHTML = `
          <div style="display:flex;align-items:center;gap:10px;">
            <img src="assets/avatars/${u.avatar}" style="width:34px;height:34px;border-radius:50%;">
            #${rank} ${u.username} — ${u.points} pts (${u.referralCount || 0} invites)
          </div>
        `;
        list.appendChild(div);
        rank++;
      });
    });
}
