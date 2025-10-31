// ไฟล์: /src/scripts/authService.js
// Authentication Service - รวม Register, Login, Logout และบันทึก Login History

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
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js"; // *** FIXED VERSION ***
import { 
    doc, 
    setDoc,
    getDoc,
    collection,
    addDoc,
    serverTimestamp,
    updateDoc
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js"; // *** FIXED VERSION ***

// ===========================
// Helper Functions
// ===========================

/**
 * บันทึก Login History ลง Firestore
 */
async function logLoginHistory(userId, email, success = true, errorMessage = null, loginMethod = 'email') {
    try {
        // ตรวจสอบความถูกต้องของ db ก่อนเรียกใช้ Firestore functions
        if (!db) {
             console.error('❌ Firestore instance (db) is undefined. Skipping login history.');
             return { success: false, error: 'Firestore not initialized.' };
        }
        
        const loginData = {
            userId: userId || 'unknown',
            email: email,
            success: success,
            loginMethod: loginMethod, // 'email' หรือ 'google'
            timestamp: serverTimestamp(),
            
            // Device & Browser Info
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            
            // Browser Details
            browser: getBrowserInfo(),
            os: getOSInfo(),
            
            // Page Info
            referrer: document.referrer || 'direct',
            currentUrl: window.location.href
        };

        // เพิ่ม error message ถ้า login ไม่สำเร็จ
        if (!success && errorMessage) {
            loginData.errorMessage = errorMessage;
            loginData.errorCode = errorMessage;
        }

        // บันทึกลง collection "loginHistory"
        const historyRef = await addDoc(collection(db, 'loginHistory'), loginData);
        console.log('✅ Login history recorded:', historyRef.id);
        
        // ถ้า login สำเร็จ - อัพเดท lastLogin ใน user document
        if (success && userId) {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                lastLogin: serverTimestamp(),
                lastLoginMethod: loginMethod,
                lastLoginDevice: navigator.userAgent,
                lastLoginBrowser: getBrowserInfo(),
                lastLoginOS: getOSInfo()
            });
            console.log('✅ User lastLogin updated');
        }
        
        return { success: true, historyId: historyRef.id };
        
    } catch (error) {
        console.error('❌ Error logging login history:', error);
        return { success: false, error: error.message };
    }
}

/**
 * ดึงข้อมูล Browser
 */
function getBrowserInfo() {
    const userAgent = navigator.userAgent;
    let browser = "Unknown";
    
    if (userAgent.indexOf("Chrome") > -1) {
        browser = "Chrome";
    } else if (userAgent.indexOf("Safari") > -1) {
        browser = "Safari";
    } else if (userAgent.indexOf("Firefox") > -1) {
        browser = "Firefox";
    } else if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident") > -1) {
        browser = "Internet Explorer";
    } else if (userAgent.indexOf("Edge") > -1) {
        browser = "Edge";
    }
    
    return browser;
}

/**
 * ดึงข้อมูล Operating System
 */
function getOSInfo() {
    const userAgent = navigator.userAgent;
    let os = "Unknown";
    
    if (userAgent.indexOf("Win") > -1) {
        os = "Windows";
    } else if (userAgent.indexOf("Mac") > -1) {
        os = "MacOS";
    } else if (userAgent.indexOf("Linux") > -1) {
        os = "Linux";
    } else if (userAgent.indexOf("Android") > -1) {
        os = "Android";
    } else if (userAgent.indexOf("iOS") > -1 || userAgent.indexOf("iPhone") > -1 || userAgent.indexOf("iPad") > -1) {
        os = "iOS";
    }
    
    return os;
}

// ===========================
// Authentication Functions
// ===========================

/**
 * Register with Email/Password
 */
export async function registerUser(userData) {
    try {
        console.log('📝 Registering user:', userData.email);
        
        // สร้าง User ใน Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            userData.email,
            userData.password
        );
        
        const user = userCredential.user;
        
        // อัพเดท Display Name
        await updateProfile(user, {
            displayName: userData.name
        });
        
        // บันทึกข้อมูลลง Firestore
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            birthday: userData.birthday,
            gender: userData.gender,
            address: userData.address,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            provider: 'email',
            termsAccepted: userData.terms,
            emailVerified: user.emailVerified,
            role: 'customer'
        });
        
        console.log('✅ User registered successfully:', user.uid);
        
        // บันทึก Registration History
        await logLoginHistory(user.uid, userData.email, true, null, 'email-register');
        
        return {
            success: true,
            user: user,
            message: 'สมัครสมาชิกสำเร็จ!'
        };
        
    } catch (error) {
        console.error("❌ Registration error:", error);
        
        let errorMessage = 'เกิดข้อผิดพลาดในการสมัครสมาชิก';
        
        switch(error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'อีเมลนี้ถูกใช้งานแล้ว';
                break;
            case 'auth/invalid-email':
                errorMessage = 'รูปแบบอีเมลไม่ถูกต้อง';
                break;
            case 'auth/weak-password':
                errorMessage = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
                break;
            case 'auth/network-request-failed':
                errorMessage = 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่';
                break;
        }
        
        return {
            success: false,
            error: error,
            message: errorMessage
        };
    }
}

/**
 * Register with Google
 */
export async function registerWithGoogle() {
    try {
        console.log('🔐 Google Sign-in initiated');
        
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        console.log('✅ Google Sign-in successful:', user.email);
        
        // ตรวจสอบว่ามีข้อมูลผู้ใช้ใน Firestore หรือไม่
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const isNewUser = !userDoc.exists();
        
        // บันทึกข้อมูลลง Firestore
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            phone: '',
            birthday: '',
            gender: '',
            address: '',
            createdAt: isNewUser ? serverTimestamp() : userDoc.data().createdAt,
            lastLogin: serverTimestamp(),
            provider: 'google',
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
            role: userDoc.exists() ? userDoc.data().role : 'customer'
        }, { merge: true });
        
        // บันทึก Login History
        await logLoginHistory(
            user.uid, 
            user.email, 
            true, 
            null, 
            isNewUser ? 'google-register' : 'google-login'
        );
        
        return {
            success: true,
            user: user,
            isNewUser: isNewUser,
            message: isNewUser ? 'สมัครสมาชิกด้วย Google สำเร็จ!' : 'เข้าสู่ระบบด้วย Google สำเร็จ!'
        };
        
    } catch (error) {
        console.error("❌ Google sign-in error:", error);
        
        let errorMessage = 'เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google';
        
        if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = 'ยกเลิกการเข้าสู่ระบบ';
        } else if (error.code === 'auth/network-request-failed') {
            errorMessage = 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
        }
        
        return {
            success: false,
            error: error,
            message: errorMessage
        };
    }
}

/**
 * Sign In with Email and Password
 */
export async function signIn(email, password) {
    try {
        console.log('🔐 Sign in attempt for:', email);
        
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        console.log('✅ Sign in successful:', user.uid);
        
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.exists() ? userDoc.data() : null;
        
        console.log('📄 User data retrieved:', userData);
        
        // บันทึก Login History - สำเร็จ
        await logLoginHistory(user.uid, email, true, null, 'email-login');
        
        return {
            success: true,
            user: user,
            userData: userData
        };
        
    } catch (error) {
        console.error("❌ Sign in error:", error.code, error.message);
        
        // บันทึก Login History - ล้มเหลว
        await logLoginHistory(null, email, false, error.code, 'email-login');
        
        return {
            success: false,
            error: error.code,
            message: error.message
        };
    }
}

/**
 * Sign Out
 */
export async function signOutUser() {
    try {
        const user = auth.currentUser;
        const userEmail = user ? user.email : 'unknown';
        
        console.log('🚪 Signing out user:', userEmail);
        
        await signOut(auth);
        
        console.log('✅ Sign out successful');
        
        // บันทึก Logout History
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

/**
 * Reset Password
 */
export async function resetPassword(email) {
    try {
        console.log('📧 Sending password reset email to:', email);
        
        await sendPasswordResetEmail(auth, email);
        
        console.log('✅ Password reset email sent');
        
        // บันทึก Password Reset Request
        await addDoc(collection(db, 'loginHistory'), {
            email: email,
            success: true,
            loginMethod: 'password-reset-request',
            timestamp: serverTimestamp(),
            userAgent: navigator.userAgent
        });
        
        return { success: true };
        
    } catch (error) {
        console.error("❌ Reset password error:", error);
        return {
            success: false,
            error: error.code,
            message: error.message
        };
    }
}

/**
 * Get Current User
 */
export function getCurrentUser() {
    return auth.currentUser;
}

/**
 * Get User Data from Firestore
 */
export async function getUserData(uid) {
    try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
            return {
                success: true,
                data: userDoc.data()
            };
        } else {
            return {
                success: false,
                error: "User data not found"
            };
        }
    } catch (error) {
        console.error("❌ Get user data error:", error);
        return {
            success: false,
            error: error.code,
            message: error.message
        };
    }
}

/**
 * Auth State Observer
 */
export function onAuthChange(callback) {
    return onAuthStateChanged(auth, async (user) => {
        if (user) {
            // User is signed in
            const userData = await getUserData(user.uid);
            callback(user, userData.success ? userData.data : null);
        } else {
            // User is signed out
            callback(null, null);
        }
    });
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve(!!user);
        });
    });
}

// Export auth and db for direct access if needed
export { auth, db };


