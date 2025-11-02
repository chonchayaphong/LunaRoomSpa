// src/scripts/authService.js
import { auth, db } from './firebase-config.js';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { 
  doc, 
  setDoc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  updateDoc
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// ===========================
// Helper Functions
// ===========================
function getBrowserInfo() { /* ...โค้ดตรงเดิม... */ }
function getOSInfo() { /* ...โค้ดตรงเดิม... */ }

async function logLoginHistory(userId, email, success = true, errorMessage = null, loginMethod = 'email') { /* ...โค้ดตรงเดิม... */ }

// ===========================
// Authentication Functions
// ===========================

export async function registerUser(userData) { 
// สร้าง Authentication User
  const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
  const user = userCredential.user;
  await updateProfile(user, { displayName: userData.name });

  // บันทึก Firestore users/{uid}
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    name: userData.name,
    email: userData.email,
    phone: userData.phone || '',
    birthday: userData.birthday || '',
    gender: userData.gender || '',
    address: userData.address || '',
    createdAt: serverTimestamp(),
    provider: 'email',
    termsAccepted: userData.terms ?? false
  });
  return { success: true, user };
}

export async function registerWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  // บันทึก Firestore users/{uid} ทุกครั้ง (merge ทับข้อมูลเดิม)
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    name: user.displayName || '',
    email: user.email,
    phone: '',
    birthday: '',
    gender: '',
    address: '',
    createdAt: serverTimestamp(),
    provider: 'google',
    photoURL: user.photoURL || ''
  }, { merge: true });
  return { success: true, user };
}

export async function signIn(email, password) {
  try {
    console.log('🔐 Sign in attempt for:', email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('✅ Sign in successful:', user.uid);

    // ตรวจสอบ getDoc
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        console.log("Firestore: document does not exist! uid:", user.uid);
      } else {
        console.log("Firestore: document exists!", userDoc.data());
      }
      const userData = userDoc.exists() ? userDoc.data() : null;
      console.log('📄 User data retrieved:', userData);
      await logLoginHistory(user.uid, email, true, null, 'email-login');
      return { success: true, user, userData };
    } catch (e) {
      console.error("Firestore getDoc error:", e);
      return { success: true, user, userData: null, error: "Firestore error" };
    }
  } catch (error) {
    console.error("❌ Sign in error:", error.code, error.message);
    await logLoginHistory(null, email, false, error.code, 'email-login');
    return { success: false, error: error.code, message: error.message };
  }
}


export async function signOutUser() {
  try {
    const user = auth.currentUser;
    const userEmail = user ? user.email : 'unknown';
    await signOut(auth);
    if (user) {
      await addDoc(collection(db, 'loginHistory'), {
        userId: user.uid,
        email: userEmail,
        success: true,
        loginMethod: 'logout',
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent,
        platform: navigator.platform
      });
    }
    return { success: true };
  } catch (error) {
    console.error("❌ Sign out error:", error);
    return {
      success: false,
      error: error.code,
      message: error.message
    };
  }
}


// ตรวจสอบล็อกอิน (แบบ async, เช็ค onAuthStateChanged ด้วย)
export async function isAuthenticated() {
  return new Promise((resolve) => {
    // 1. กรณี currentUser มีใน auth แล้ว
    if (auth.currentUser) {
      resolve(true);
      return;
    }
    // 2. ฟัง event Firebase Auth (ถ้า refresh หรือโหลดใหม่)
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe(); // หยุดฟังทันทีที่ได้ค่า
      resolve(!!user);
    });
    // 3. กันแอพค้าง ถ้าไม่ตอบใน 3 วินาที (ถือว่าไม่ล็อกอิน)
    setTimeout(() => { resolve(false); }, 3000);
  });
}
export async function resetPassword(email) { /* ...โค้ดตรงเดิม... */ }
export function getCurrentUser() { return auth.currentUser; }
export async function getUserData(uid) { /* ...โค้ดตรงเดิม... */ }
export function onAuthChange(callback) { /* ...โค้ดตรงเดิม... */ }

export { auth, db };
