// leaderboard.js (complete)

let unsubscribeLeaderboard = null;

function subscribeLeaderboard() {
  try {
    if (unsubscribeLeaderboard) {
      try { unsubscribeLeaderboard(); } catch (e) { /* ignore */ }
    }

    if (!profile) {
      const list = document.getElementById("leaderboard-list");
      if (list) list.innerHTML = `<div class="bubble">Leaderboard will appear after profile setup</div>`;
      return;
    }

    unsubscribeLeaderboard = db.collection("users")
      .where("college", "==", profile.college)
      .orderBy("points", "desc")
      .limit(30)
      .onSnapshot(snapshot => {
        const list = document.getElementById("leaderboard-list");
        if (!list) return;
        list.innerHTML = "";
        let rank = 1;

        snapshot.forEach(doc => {
          const u = doc.data();
          const div = document.createElement("div");
          div.className = "bubble";
          div.innerHTML = `
            <div style="display:flex;align-items:center;gap:10px;">
              <img src="assets/avatars/${u.avatar || 'avatar1.png'}" style="width:34px;height:34px;border-radius:50%;">
              #${rank} ${u.username || 'Unknown'} — ${u.points || 0} pts (${u.referralCount || 0} invites)
            </div>
          `;
          list.appendChild(div);
          rank++;
        });
      }, err => {
        console.error("Leaderboard snapshot error", err);
      });

    // register unsubscribe cleanup (so safeSignOut can clear)
    if (typeof addUnsubscribe === "function") addUnsubscribe(unsubscribeLeaderboard);
  } catch (err) {
    console.error("subscribeLeaderboard failed", err);
  }
}
