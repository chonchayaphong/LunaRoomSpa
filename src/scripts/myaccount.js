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
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// Firebase Configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ============ Bookings CRUD ==============

let currentBookings = [];

async function getBookings() {
  try {
    const bookCol = collection(db, 'bookings');
    const q = query(bookCol, orderBy('createdAt', 'desc'));
    const bookSnap = await getDocs(q);
    const bookings = [];
    bookSnap.forEach(doc => {
      bookings.push({ id: doc.id, ...doc.data() });
    });
    return bookings;
  } catch (error) {
    console.error('❌ Error getting bookings:', error);
    throw error;
  }
}

async function updateBookingStatus(bookingId, newStatus) {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, { Status: newStatus });
    await initializeMyAccount();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function deleteBooking(bookingId) {
  try {
    await deleteDoc(doc(db, 'bookings', bookingId));
    await initializeMyAccount();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ========== Orders CRUD (NEW!!) =============

async function getOrders(userId) {
  try {
    const orderCol = collection(db, "orders");
    const q = query(orderCol, orderBy("createdAt", "desc"));
    const orderSnap = await getDocs(q);
    const orders = [];
    orderSnap.forEach(doc => {
      const data = doc.data();
      if (!userId || data.userId === userId) {
        orders.push({ id: doc.id, ...data });
      }
    });
    return orders;
  } catch (error) {
    console.error("❌ Error getting orders:", error);
    throw error;
  }
}

function displayOrders(orders) {
  const orderList = document.querySelector(".order-list");
  if (!orderList) return;
  if (orders.length === 0) {
    orderList.innerHTML = "<div style='text-align:center; color:#888;'>ไม่พบประวัติการสั่งซื้อ</div>";
    return;
  }
  orderList.innerHTML = "";
  orders.forEach(order => {
    orderList.innerHTML += `
      <div class="order-card">
        <div class="order-header">
          <span class="order-id">#${order.id.slice(0,10).toUpperCase()}</span>
          <span class="order-status">${order.status || "-"}</span>
        </div>
        <div class="order-details">
          <div><b>วันที่:</b> ${order.date || "-"}</div>
          <div><b>สินค้า:</b> ${(Array.isArray(order.items) ? order.items.join(", ") : "-")}</div>
          <div><b>ยอดรวม:</b> ${order.total || "-"} บาท</div>
        </div>
      </div>
    `;
  });
}

// =============== Loading/Error UI ===============

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
function showError(containerClass, message) {
  const container = document.querySelector(containerClass);
  if (!container) return;
  container.innerHTML = `<div style='color:#d32f2f; text-align:center; padding:40px;'>${message}</div>`;
}
function showEmpty(containerClass, title, message, buttonText, buttonLink) {
  const container = document.querySelector(containerClass);
  if (!container) return;
  container.innerHTML = `
    <div class="no-data" style="text-align:center;padding:40px;">
      <div style="font-size:60px;">📋</div>
      <h3>${title}</h3>
      <p>${message}</p>
      <button onclick="window.location.href='${buttonLink}'">${buttonText}</button>
    </div>
  `;
}

// ============= Utilities & Booking UI =============

// ... (utilities ฟอร์แมทวันที่, สร้าง booking-card, menu sidebar) ... (ตามที่คุณเขียนไว้เดิม)

function displayBookings(bookings) {
  const bookingList = document.querySelector('.booking-list');
  if (!bookingList) return;
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
  bookingList.innerHTML = '';
  bookings.forEach(booking => {
    const bookingCard = createBookingCard(booking); // ใช้ของเดิมคุณได้เลย
    bookingList.appendChild(bookingCard);
  });
}

// ============= Main Init =============

async function initializeMyAccount() {
  console.log('🚀 เริ่มโหลด MyAccount...');
  showLoading('.booking-list');
  showLoading('.order-list');
  try {
    const bookings = await getBookings();
    currentBookings = bookings;
    displayBookings(bookings);

    // ต้องรอ auth state พร้อม ค่อย fetch orders (filter เฉพาะ user นี้)
    const auth = getAuth();
    onAuthStateChanged(auth, async user => {
      if (user) {
        const orders = await getOrders(user.uid);
        displayOrders(orders);
      } else {
        displayOrders([]);
      }
    });
  } catch (error) {
    showError('.booking-list', 'ไม่สามารถโหลดจองได้ กรุณาลองใหม่');
    showError('.order-list', 'ไม่สามารถโหลดสั่งซื้อได้ กรุณาลองใหม่');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initializeSidebar && initializeSidebar();
  initializeLogout && initializeLogout();
  initializeProfileForm && initializeProfileForm();
  initializeMyAccount();
});