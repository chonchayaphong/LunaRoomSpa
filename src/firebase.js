import { initializeApp } from "firebase/app"
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore"
import { connectFunctionsEmulator, getFunctions, httpsCallable } from "firebase/functions"
import { connectStorageEmulator, getStorage } from "firebase/storage"

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp
} from "firebase/firestore";

//------------------------//
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
//------------------------//

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);


//// Auth helpers
async function registerWithEmail(email, password) {
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  return userCred.user;
}

async function loginWithEmail(email, password) {
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  return userCred.user;
}

function logout() {
  return signOut(auth);
}


// Booking helpers (Firestore)
async function createBooking(bookingObj) {
  // bookingObj should include: uid, name, service, date, time, price, ...etc
  const col = collection(db, "bookings");
  const docRef = await addDoc(col, {
    ...bookingObj,
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

async function getBookingsForUser(uid) {
  const col = collection(db, "bookings");
  const q = query(col, where("uid", "==", uid), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  const items = [];
  snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
  return items;
}


// Exports
export {
  auth,
  db,
  registerWithEmail,
  loginWithEmail,
  logout,
  onAuthStateChanged,
  createBooking,
  getBookingsForUser
};



//const functions = getFunctions(app,"asia-southeast1")

const functions = getFunctions(app)

if (true) {
  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true })
  connectFirestoreEmulator(db, 'localhost', 8080)
  connectFunctionsEmulator(functions, "localhost", 5001)
  connectStorageEmulator(storage, "localhost", 9199)
}

const call = async(functionName, params) => {
  try {
    let callableFunctions = httpsCallable(functions, functionName)
    let res = await callableFunctions(params)
    if (res.data.success) {
      return res.data
    } else if(res.data.success === false) {
      console.log(res.data.reason)
    }
    
  } catch (err) {
    console.log(err)
  }
}

export { app, auth, call, db, functions, storage }

