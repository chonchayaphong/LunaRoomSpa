// ไฟล์: /src/scripts/firebase-config.js
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { connectFirestoreEmulator, getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getAnalytics as getAnalyticsImport } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBySeWqMxCrBI4oIEXwaCJnsjUbPW3afN4",
  authDomain: "lunaroomspa.firebaseapp.com",
  databaseURL: "https://lunaroomspa-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "lunaroomspa",
  storageBucket: "lunaroomspa.firebasestorage.app",
  messagingSenderId: "299973663585",
  appId: "1:299973663585:web:9c3a5be0768e1eaa58c320",
  measurementId: "G-5KF6ZJ7XDW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// ถ้าใช้ Emulator
if (location.hostname === "localhost") {
    console.log("Connecting to Firestore emulator...");
    connectFirestoreEmulator(db, "localhost", 8080); 
}

// Export สำหรับใช้งานในไฟล์อื่น
export { app, analytics, auth, db, firebaseConfig };