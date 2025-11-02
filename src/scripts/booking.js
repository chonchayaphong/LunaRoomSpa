console.log("Booking JS loaded (path): ", window.location.pathname);

import { db, auth } from "../scripts/firebase-config.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { isAuthenticated } from "../scripts/authService.js";

document.addEventListener('DOMContentLoaded', function() {
  // ===== Block ถ้าไม่ได้ login จะ redirect ไป login.html =====
  (async () => {
    const loggedIn = await isAuthenticated();
    if (!loggedIn || !auth.currentUser) {
      window.location.href = "login.html";
      return;
    }
  })();

  // ===== Mapping ชื่อ treatment และ package =====
  const treatments = {
    // ... (เหมือนเดิมทั้งหมด)
    'massage': [
      '1.Thai Relaxing Massage - นวดไทยผ่อนคลาย  (350 – 600 ฿ / 60 นาที)',
      '2.Thai Oil Massage - นวดไทยน้ำมัน  (450 – 700 ฿ / 60 นาที)',
      '3.Hot Stone Massage - นวดหินร้อน  (600 – 1,200 ฿ / 60 นาที)',
      '4.Aromatherapy Massage - นวดอโรมาเทอราพี  (600 – 1,000 ฿ / 60 นาที)',
      '5.Herbal Compress Massage - นวดประคบสมุนไพร  (700 – 1,200 ฿ / 60 นาที)',
      '6.Leg/Foot/Neck/Shoulder Massage - นวดขา‑เท้า‑คอ‑บ่า‑ไหล่  (300 – 500 ฿ / 30–60 นาที)',
      '7.Office Syndrome Massage - นวดออฟฟิศซินโดรม  (450 – 700 ฿ / 60 นาที )',
      '8.Body Scrub / Facial Spa - สครับผิวกาย / สปาหน้า  (500 – 1,000 ฿ / 60 นาที) '
    ],
    'onsen': [
      '1. Hot Bath + Sauna + Steam  (300 ฿)',
      '2.Public Onsen Bath  (400 – 600 ฿)',
    ],
    'waxing': [
      '1.Underarm Wax  (150 – 250 ฿)',
      '2.Bikini Line Wax  (400 – 600 ฿)',
      '3.Full Leg Wax (500 – 700 ฿)',
      '4.Facial Wax (Forehead, Eyebrows, Sideburns) (899 (โปรโมชั่น) ฿)',
    ]
  };
  const packageNames = {
    'massage': 'MASSAGE - นวดผ่อนคลาย',
    'onsen': 'ONSEN - ออนเซ็นญี่ปุ่น',
    'waxing': 'WAXING - แว็กซ์ขน'
  };

  // ====== Date/Package/treatment selector logic ======
  const dateInput = document.getElementById('date');
  const today = new Date().toISOString().split('T')[0];
  dateInput.setAttribute('min', today);

  const packageSelect = document.getElementById('package');
  const treatmentOptions = document.getElementById('treatmentOptions');
  const treatmentSelect = document.getElementById('treatment');
  packageSelect.addEventListener('change', function() {
    const selectedPackage = this.value;
    treatmentSelect.innerHTML = '<option value="" disabled selected>เลือกทรีทเมนต์</option>';
    if (treatments[selectedPackage]) {
      treatmentOptions.classList.add('show');
      treatments[selectedPackage].forEach(treatment => {
        const option = document.createElement('option');
        option.value = treatment;
        option.textContent = treatment;
        treatmentSelect.appendChild(option);
      });
      treatmentSelect.required = true;
    } else {
      treatmentOptions.classList.remove('show');
      treatmentSelect.required = false;
    }
  });

  // ===== form submission (บันทึกเข้า Firestore ด้วย userId, userEmail) =====
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      // ตรวจสอบ auth ซ้ำก่อนบันทึก (กรณี session หลุด)
      const loggedIn = await isAuthenticated();
      if (!loggedIn || !auth.currentUser) {
        window.location.href = "login.html";
        return;
      }
      const user = auth.currentUser;
      // ดึงค่าจากฟอร์ม
      const submitBtn = this.querySelector('.submit-btn');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'กำลังบันทึก...';
      try {
        const dateValue = document.getElementById('date').value;
        const timeValue = document.getElementById('time').value;
        const packageValue = document.getElementById('package').value;
        const treatmentValue = treatmentSelect.value || 'ไม่ระบุ';
        const formData = {
          date: dateValue,
          time: timeValue,
          packageId: packageValue,
          packageName: packageNames[packageValue],
          treatmentName: treatmentValue,
          Status: 'รอการดำเนินการ',
          userId: user.uid,
          userEmail: user.email,
          createdAt: serverTimestamp()
        };

        console.log("Will attempt booking for uid:", user && user.uid);
        console.log("formData:", formData);

        const docRef = await addDoc(collection(db, 'bookings'), formData);
        alert(`✅ การจองสำเร็จ!\n\nวันที่: ${formData.date}\nเวลา: ${formData.time}\nแพ็กเกจ: ${formData.packageName}\nทรีทเมนต์: ${formData.treatmentName}\n\nรหัสการจอง: #${docRef.id.substring(0, 10).toUpperCase()}`);
        const goToAccount = confirm('ต้องการดูประวัติการจองหรือไม่?');
        if (goToAccount) {
          window.location.href = '/src/pages/Myaccount.html';
        } else {
          this.reset();
          treatmentOptions.classList.remove('show');
        }
      } catch (error) {
        alert('❌ เกิดข้อผิดพลาดไม่คาดคิด:\n' + error.message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  } else {
    console.error('❌❌❌ ไม่พบ Form #bookingForm');
  }
});
