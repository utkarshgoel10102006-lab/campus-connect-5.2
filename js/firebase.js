// firebase.js (complete)
// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCmwaUNUcC9Fawc0cCEcdwAn_5V5Y_KZZ0",
  authDomain: "campus-connect-e8665.firebaseapp.com",
  projectId: "campus-connect-e8665",
  storageBucket: "campus-connect-e8665.appspot.com",
  messagingSenderId: "178523533800",
  appId: "1:178523533800:web:81608cfe34cf19dbc7345d"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Services
const auth = firebase.auth();
const db = firebase.firestore();
const rtdb = firebase.database ? firebase.database() : null; // optional if using RTDB

// DOM helper
const $ = (id) => document.getElementById(id);

// Global state
let currentUser = null;
let profile = null;

// Unsubscribe bookkeeping for cleanups
let unsubscribeAll = [];
function addUnsubscribe(fn) {
  if (typeof fn === "function") unsubscribeAll.push(fn);
}

// Safe sign out with cleanup
async function safeSignOut() {
  try {
    unsubscribeAll.forEach(fn => {
      try { fn(); } catch (e) { console.warn("unsubscribe error", e); }
    });
    unsubscribeAll = [];
    await auth.signOut();
    currentUser = null;
    profile = null;
  } catch (e) {
    console.error("Sign out failed", e);
  }
}

// Called by this file when profile is loaded. Other modules can override.
window.onProfileReady = window.onProfileReady || null;

// Ensures that profile exists before performing some actions
function ensureProfileOrThrow() {
  if (!currentUser) throw new Error("No authenticated user");
  if (!profile) throw new Error("Profile not created yet");
}

// central auth listener
auth.onAuthStateChanged(async (user) => {
  currentUser = user;
  if (!user) {
    profile = null;
    console.log("User signed out");
    // optional UI handling can be done by auth.js
    return;
  }

  console.log("User signed in:", user.uid, user.email);

  // load profile document if exists
  try {
    const doc = await db.collection("users").doc(user.uid).get();
    if (doc.exists) {
      profile = { id: doc.id, ...doc.data() };
    } else {
      profile = null;
    }
  } catch (err) {
    console.error("Failed to load profile:", err);
    profile = null;
  }

  if (typeof window.onProfileReady === "function") {
    try { window.onProfileReady(); } catch (e) { console.error(e); }
  }
});

// Export helpers to global scope for other modules to use
window.safeSignOut = safeSignOut;
window.addUnsubscribe = addUnsubscribe;
window.ensureProfileOrThrow = ensureProfileOrThrow;
