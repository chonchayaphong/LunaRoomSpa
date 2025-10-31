// account.js

import {
  auth,
  registerWithEmail,
  loginWithEmail,
  logout,
  onAuthStateChanged
} from "../firebase.js";

// ---- ใส่ listener ให้ปุ่ม/ฟอร์ม ----
// สมมติ HTML มี form id="register-form", input id="reg-email", id="reg-pass"
// และ form id="login-form", input id="login-email", id="login-pass"
// ปุ่ม logout id="logout-btn"
// ถ้าหน้า HTML ของคุณใช้ id ต่างกัน ให้ปรับชื่อ element ให้ตรง

// Register
const regForm = document.getElementById("register-form");
if (regForm) {
  regForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("reg-email").value.trim();
    const pass  = document.getElementById("reg-pass").value.trim();
    try {
      await registerWithEmail(email, pass);
      alert("ลงทะเบียนเรียบร้อย! เข้าสู่ระบบอัตโนมัติแล้ว");
      regForm.reset();
      // คุณอาจจะ redirect ไปหน้าอื่นได้
      location.href = "/src/pages/Myaccount.html";
    } catch (err) {
      console.error(err);
      alert("ลงทะเบียนไม่สำเร็จ: " + err.message);
    }
  });
}

// Login
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const pass  = document.getElementById("login-pass").value.trim();
    try {
      await loginWithEmail(email, pass);
      alert("เข้าสู่ระบบสำเร็จ");
      loginForm.reset();
      location.href = "/src/pages/Myaccount.html";
    } catch (err) {
      console.error(err);
      alert("เข้าสู่ระบบไม่สำเร็จ: " + err.message);
    }
  });
}

// Logout
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await logout();
    alert("ออกจากระบบแล้ว");
    location.reload();
  });
}

// Manage UI on auth state
onAuthStateChanged(auth, (user) => {
  // ตัวอย่าง: เก็บสถานะลง localStorage เพื่อให้หน้าอื่นๆ รู้ว่า logged in
  if (user) {
    localStorage.setItem("luna_logged_in_uid", user.uid);
    // ปรับ UI ถ้ามีช่องชื่อผู้ใช้
    const usernameNode = document.querySelector(".username");
    if (usernameNode && user.email) usernameNode.textContent = user.email.split("@")[0];
  } else {
    localStorage.removeItem("luna_logged_in_uid");
  }
});

// จัดการการแสดง/ซ่อน sections
const menuButtons = document.querySelectorAll('.menu-btn:not(.logout-btn)');
const contentSections = document.querySelectorAll('.content-section');

menuButtons.forEach(button => {
    button.addEventListener('click', () => {
        // ลบ active class จากปุ่มทั้งหมด
        menuButtons.forEach(btn => btn.classList.remove('active'));
        
        // เพิ่ม active class ให้ปุ่มที่คลิก
        button.classList.add('active');
        
        // ซ่อน sections ทั้งหมด
        contentSections.forEach(section => section.classList.remove('active'));
        
        // แสดง section ที่เลือก
        const targetSection = button.getAttribute('data-section');
        document.getElementById(targetSection).classList.add('active');
    });
});



// จัดการการบันทึกข้อมูลโปรไฟล์
const profileForm = document.querySelector('.profile-form');
profileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // ตรวจสอบรหัสผ่าน
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword && newPassword !== confirmPassword) {
        alert('รหัสผ่านใหม่ไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง');
        return;
    }
    
    // ในระบบจริงจะส่งข้อมูลไป API
    alert('บันทึกข้อมูลสำเร็จ');
});

// จัดการปุ่มดูรายละเอียด
const viewDetailButtons = document.querySelectorAll('.view-detail-btn');
viewDetailButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const card = e.target.closest('.booking-card, .order-card');
        const id = card.querySelector('.booking-id, .order-id').textContent;
        
        // ในระบบจริงจะเปิด modal หรือไปหน้ารายละเอียด
        alert(`ดูรายละเอียดของ ${id}`);
    });
});