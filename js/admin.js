// admin.js

const adminEmail = "utkarshgoel10102006@gmail.com";

auth.onAuthStateChanged(async (user) => {
  if (!user || user.email !== adminEmail) {
    alert("Access denied ❌ Admin only");
    window.location.href = "index.html";
    return;
  }

  $("admin-email").innerText = `Logged in as: ${user.email}`;
  loadUsers();
  loadConfessions();
});

// Load users table
function loadUsers(){
  db.collection("users").orderBy("points","desc")
    .onSnapshot(snapshot=>{
      const table = $("users-table");
      table.innerHTML = `
        <tr>
          <th>Username</th><th>College</th><th>Points</th>
          <th>Reports</th><th>Status</th><th>Action</th>
        </tr>`;

      snapshot.forEach(doc=>{
        const u = doc.data();
        const row = document.createElement("tr");

        row.innerHTML = `
          <td>${u.username}</td>
          <td>${u.college}</td>
          <td>${u.points}</td>
          <td>${u.reports || 0}</td>
          <td>${u.banned ? "🚫 Banned" : "🟢 Active"}</td>
          <td>
            ${u.banned
              ? `<button class="unban-btn" onclick="unban('${doc.id}')">Unban</button>`
              : `<button class="ban-btn" onclick="ban('${doc.id}')">Ban</button>`}
          </td>
        `;
        table.appendChild(row);
      });
    });
}

// Ban / Unban
async function ban(id){
  await db.collection("users").doc(id).update({ banned:true });
  alert("User banned");
}

async function unban(id){
  await db.collection("users").doc(id).update({ banned:false, reports:0 });
  alert("User unbanned");
}

// Confessions
function loadConfessions(){
  db.collection("confessions").orderBy("createdAt","desc")
    .onSnapshot(snapshot=>{
      const table = $("conf-table");
      table.innerHTML = `
        <tr><th>Text</th><th>College</th><th>Action</th></tr>
      `;

      snapshot.forEach(doc=>{
        const d = doc.data();
        const row = document.createElement("tr");

        row.innerHTML = `
          <td>${d.text}</td>
          <td>${d.college}</td>
          <td><button class="delete-btn" onclick="delConf('${doc.id}')">Delete</button></td>
        `;
        table.appendChild(row);
      });
    });
}

async function delConf(id){
  await db.collection("confessions").doc(id).delete();
  alert("Confession deleted");
}
