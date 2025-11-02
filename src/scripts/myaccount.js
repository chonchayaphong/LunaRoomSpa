// ไฟล์: /src/scripts/myaccount.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Firebase Configuration
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
const db = getFirestore(app);

// ===================================
// State Management
// ===================================
let currentBookings = [];

// ===================================
// ดึงข้อมูล Bookings จาก Firebase
// ===================================
async function getBookings() {
  try {
    console.log('📚 กำลังโหลดข้อมูลการจอง...');
    
    const bookCol = collection(db, 'bookings');
    const q = query(bookCol, orderBy('createdAt', 'desc'));
    const bookSnap = await getDocs(q);
    
    const bookings = [];
    bookSnap.forEach(doc => {
      bookings.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log('✅ โหลดข้อมูลสำเร็จ:', bookings.length, 'รายการ');
    return bookings;
  } catch (error) {
    console.error('❌ Error getting bookings:', error);
    throw error;
  }
}

// ===================================
// อัพเดท Status การจอง
// ===================================
async function updateBookingStatus(bookingId, newStatus) {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      Status: newStatus
    });
    
    console.log('✅ อัพเดท Status สำเร็จ:', bookingId, '→', newStatus);
    
    // Reload bookings
    await initializeMyAccount();
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error updating status:', error);
    return { success: false, error: error.message };
  }
}

// ===================================
// ลบการจอง
// ===================================
async function deleteBooking(bookingId) {
  try {
    await deleteDoc(doc(db, 'bookings', bookingId));
    console.log('✅ ลบการจองสำเร็จ:', bookingId);
    
    // Reload bookings
    await initializeMyAccount();
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error deleting booking:', error);
    return { success: false, error: error.message };
  }
}

// ===================================
// แสดง Loading State
// ===================================
function showLoading(containerClass) {
  const container = document.querySelector(containerClass);
  if (!container) return;

  container.innerHTML = `
    <div class="loading-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; gap: 20px;">
      <div class="loading-spinner" style="width: 50px; height: 50px; border: 4px solid #f3f3f3; border-top: 4px solid #d4a574; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <p class="loading-text" style="color: #666; font-size: 16px;">กำลังโหลดข้อมูล...</p>
    </div>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;
}

// ===================================
// แสดง Error State
// ===================================
function showError(containerClass, message) {
  const container = document.querySelector(containerClass);
  if (!container) return;

  container.innerHTML = `
    <div class="error-container" style="display: flex; flex-direction: column; align-items: center; padding: 60px 20px; gap: 15px; text-align: center;">
      <div class="error-icon" style="font-size: 60px;">⚠️</div>
      <h3 class="error-title" style="color: #d32f2f; margin: 0; font-size: 20px;">เกิดข้อผิดพลาด</h3>
      <p class="error-message" style="color: #666; margin: 0;">${message}</p>
      <button class="error-retry-btn" onclick="window.location.reload()" style="background: #d4a574; color: white; border: none; padding: 12px 30px; border-radius: 8px; cursor: pointer; font-size: 16px; margin-top: 10px;">
        ลองใหม่อีกครั้ง
      </button>
    </div>
  `;
}

// ===================================
// แสดง Empty State
// ===================================
function showEmpty(containerClass, title, message, buttonText, buttonLink) {
  const container = document.querySelector(containerClass);
  if (!container) return;

  container.innerHTML = `
    <div class="no-data" style="display: flex; flex-direction: column; align-items: center; padding: 60px 20px; gap: 15px; text-align: center;">
      <div class="no-data-icon" style="font-size: 60px;">📋</div>
      <h3 class="no-data-title" style="color: #333; margin: 0; font-size: 20px;">${title}</h3>
      <p class="no-data-message" style="color: #666; margin: 0;">${message}</p>
      <button class="no-data-button" onclick="window.location.href='${buttonLink}'" style="background: #d4a574; color: white; border: none; padding: 12px 30px; border-radius: 8px; cursor: pointer; font-size: 16px; margin-top: 10px;">
        ${buttonText}
      </button>
    </div>
  `;
}

// ===================================
// แปลง Status เป็น CSS Class
// ===================================
function getStatusClass(status) {
  const statusMap = {
    'รอการดำเนินการ': 'status-pending',
    'ยืนยันแล้ว': 'status-confirmed',
    'เสร็จสิ้น': 'status-completed',
    'ยกเลิก': 'status-cancelled'
  };
  return statusMap[status] || 'status-pending';
}

// ===================================
// แปลง Timestamp เป็น Date String
// ===================================
function formatDate(timestamp) {
  if (!timestamp) return '-';
  
  try {
    // ถ้าเป็น Firestore Timestamp
    if (timestamp.toDate) {
      const date = timestamp.toDate();
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    
    // ถ้าเป็น Date object
    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    
    // ถ้าเป็น string (YYYY-MM-DD)
    if (typeof timestamp === 'string') {
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    }
    
    return timestamp.toString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
}

// ===================================
// แปลงเวลา (24h format to 12h)
// ===================================
function formatTime(time) {
  if (!time) return '-';
  
  try {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    
    return `${hour12}:${minutes} ${period}`;
  } catch (error) {
    return time;
  }
}

// ===================================
// สร้าง Booking Card
// ===================================
function createBookingCard(booking) {
  const card = document.createElement('div');
  card.className = 'booking-card';
  
  const statusClass = getStatusClass(booking.Status);
  const statusText = booking.Status || 'รอดำเนินการ';
  const dateStr = formatDate(booking.date);
  const timeStr = formatTime(booking.time);
  
  card.innerHTML = `
    <div class="booking-header">
      <span class="booking-id">รหัสการจอง: #${booking.id.substring(0, 10).toUpperCase()}</span>
      <span class="booking-status ${statusClass}">${statusText}</span>
    </div>
    <div class="booking-details">
      <div class="detail-grid">
        <div class="detail-item">
          <span class="detail-label">Treatment Package</span>
          <span class="detail-value">${booking.packageName || 'ไม่ระบุ'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Treatment</span>
          <span class="detail-value">${booking.treatmentName || 'ไม่ระบุ'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">วันที่จอง</span>
          <span class="detail-value">${dateStr}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">เวลาที่จอง</span>
          <span class="detail-value">${timeStr}</span>
        </div>
      </div>
    </div>
    <div class="card-actions">
      ${getActionButtons(booking.Status, booking.id)}
    </div>
  `;
  
  return card;
}

// ===================================
// สร้างปุ่ม Actions ตาม Status
// ===================================
function getActionButtons(status, bookingId) {
  if (status === 'รอการดำเนินการ') {
    return `
      <button class="payment-btn" onclick="handlePayment('${bookingId}')">
        <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="5" width="20" height="14" rx="2"/>
          <line x1="2" y1="10" x2="22" y2="10"/>
        </svg>
        ชำระเงิน
      </button>
      <button class="cancel-btn" onclick="handleCancel('${bookingId}')">ยกเลิกการจอง</button>
    `;
  } else if (status === 'ยืนยันแล้ว') {
    return `
      <button class="detail-btn" onclick="handleViewDetail('${bookingId}')">ดูรายละเอียด</button>
    `;
  } else if (status === 'เสร็จสิ้น') {
    return `
      <button class="detail-btn" onclick="handleViewDetail('${bookingId}')">ดูรายละเอียด</button>
      <button class="review-btn" onclick="handleReview('${bookingId}')">เขียนรีวิว</button>
    `;
  } else {
    return `
      <button class="detail-btn" onclick="handleViewDetail('${bookingId}')">ดูรายละเอียด</button>
    `;
  }
}

// ===================================
// แสดงข้อมูล Bookings
// ===================================
function displayBookings(bookings) {
  const bookingList = document.querySelector('.booking-list');
  
  if (!bookingList) {
    console.error('❌ ไม่พบ element .booking-list');
    return;
  }

  // ถ้าไม่มีข้อมูล
  if (bookings.length === 0) {
    showEmpty(
      '.booking-list',
      'ไม่มีประวัติการจอง',
      'คุณยังไม่มีการจองใดๆ ในขณะนี้',
      'จองบริการเลย',
      '/src/pages/booking.html'
    );
    return;
  }

  // ลบข้อมูลเก่าออก
  bookingList.innerHTML = '';

  // แสดงข้อมูลแต่ละการจอง
  bookings.forEach(booking => {
    const bookingCard = createBookingCard(booking);
    bookingList.appendChild(bookingCard);
  });

  console.log('✅ แสดงข้อมูล', bookings.length, 'รายการ');
}

// ===================================
// Action Handlers (Global Functions)
// ===================================
window.handlePayment = function(bookingId) {
  alert(`🏦 เปิดหน้าชำระเงินสำหรับการจอง: ${bookingId}`);
  // TODO: เชื่อมต่อกับระบบชำระเงิน
  // window.location.href = `/payment.html?bookingId=${bookingId}`;
};

window.handleCancel = async function(bookingId) {
  if (confirm('⚠️ คุณต้องการยกเลิกการจองนี้หรือไม่?')) {
    const result = await updateBookingStatus(bookingId, 'ยกเลิก');
    
    if (result.success) {
      alert('✅ ยกเลิกการจองสำเร็จ');
    } else {
      alert('❌ ไม่สามารถยกเลิกการจองได้ กรุณาลองใหม่อีกครั้ง');
    }
  }
};

window.handleViewDetail = function(bookingId) {
  const booking = currentBookings.find(b => b.id === bookingId);
  if (booking) {
    console.log('📄 รายละเอียดการจอง:', booking);
    
    const details = `
📄 รายละเอียดการจอง

รหัสการจอง: #${booking.id.substring(0, 10).toUpperCase()}
สถานะ: ${booking.Status}

แพ็กเกจ: ${booking.packageName}
ทรีทเมนต์: ${booking.treatmentName}

วันที่: ${formatDate(booking.date)}
เวลา: ${formatTime(booking.time)}

วันที่จอง: ${formatDate(booking.createdAt)}
    `.trim();
    
    alert(details);
  }
};

window.handleReview = function(bookingId) {
  alert(`⭐ เขียนรีวิวสำหรับการจอง: ${bookingId}`);
  // TODO: เปิดหน้าเขียนรีวิว
  // window.location.href = `/review.html?bookingId=${bookingId}`;
};

// ===================================
// จัดการ Menu Sidebar
// ===================================
function initializeSidebar() {
  const menuButtons = document.querySelectorAll('.menu-btn:not(.logout-btn)');
  const contentSections = document.querySelectorAll('.content-section');
  
  menuButtons.forEach(button => {
    button.addEventListener('click', () => {
      // ลบ active class จากปุ่มทั้งหมด
      menuButtons.forEach(btn => btn.classList.remove('active'));
      
      // เพิ่ม active class ให้ปุ่มที่คลิก
      button.classList.add('active');
      
      // ซ่อน content ทั้งหมด
      contentSections.forEach(section => section.classList.remove('active'));
      
      // แสดง content ที่ต้องการ
      const targetSection = button.getAttribute('data-section');
      const targetElement = document.getElementById(targetSection);
      if (targetElement) {
        targetElement.classList.add('active');
      }
    });
  });
}

// ===================================
// จัดการ Logout
// ===================================
function initializeLogout() {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('🚪 คุณต้องการออกจากระบบหรือไม่?')) {
        alert('✅ ออกจากระบบสำเร็จ');
        window.location.href = '/index.html';
      }
    });
  }
}

// ===================================
// จัดการ Profile Form
// ===================================
function initializeProfileForm() {
  const profileForm = document.querySelector('.profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const formData = {
        firstName: document.getElementById('firstName')?.value,
        lastName: document.getElementById('lastName')?.value,
        email: document.getElementById('email')?.value,
        phone: document.getElementById('phone')?.value,
        address: document.getElementById('address')?.value,
      };
      
      console.log('💾 บันทึกข้อมูล:', formData);
      alert('✅ บันทึกข้อมูลสำเร็จ!');
    });
  }
}

// ===================================
// เริ่มต้นโหลดข้อมูล
// ===================================
async function initializeMyAccount() {
  console.log('🚀 เริ่มโหลด MyAccount...');
  
  // แสดง Loading
  showLoading('.booking-list');
  
  try {
    // ดึงข้อมูล
    const bookings = await getBookings();
    currentBookings = bookings;
    
    // แสดงข้อมูล
    displayBookings(bookings);
    
  } catch (error) {
    console.error('❌ Error:', error);
    showError('.booking-list', 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
  }
}

// ===================================
// เริ่มต้นเมื่อโหลดหน้าเว็บ
// ===================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 MyAccount Page Loaded');
  
  // Initialize ต่างๆ
  initializeSidebar();
  initializeLogout();
  initializeProfileForm();
  initializeMyAccount();
});