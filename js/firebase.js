// firebase.js

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

const auth = firebase.auth();
const db = firebase.firestore();

const $ = (id) => document.getElementById(id);

let currentUser = null;
let profile = null;
