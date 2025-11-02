// src/scripts/firebase-config.js
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { connectFirestoreEmulator } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";


// ถ้าต้องการ analytics จริงค่อย import เมื่อจำเป็น
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyBySeWqMxCrBI4oIEXwaCJnsjUbPW3afN4",
  authDomain: "lunaroomspa.firebaseapp.com",
  databaseURL: "https://lunaroomspa-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "lunaroomspa",
  storageBucket: "lunaroomspa.appspot.com",
  messagingSenderId: "299973663585",
  appId: "1:299973663585:web:9c3a5be0768e1eaa58c320",
  measurementId: "G-5KF6ZJ7XDW"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// เชื่อม Firestore Emulator เฉพาะตอน dev localhost
if (location.hostname === "localhost") {
  console.log("Connecting to Firestore emulator...");
  // connectFirestoreEmulator(db, "localhost", 8080);
}

// export สำหรับหน้าอื่น
export { app, auth, db, firebaseConfig };
