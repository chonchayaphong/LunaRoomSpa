// ===================================
        // Import Firebase
        // ===================================
        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { 
            getFirestore, 
            collection, 
            addDoc,
            serverTimestamp
        } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

        console.log('🚀 Starting Booking System...');

        // ===================================
        // Firebase Configuration
        // ===================================
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

        console.log('✅ Firebase initialized');
        console.log('✅ Firestore connected:', db ? 'Yes' : 'No');

        // ===================================
        // Package treatments mapping
        // ===================================
        const treatments = {
            'massage': [
                '1.Thai Relaxing Massage - นวดไทยผ่อนคลาย  (350 – 600 ฿ / 60 นาที)',
                '2.Thai Oil Massage - นวดไทยน้ำมัน  (450 – 700 ฿ / 60 นาที)',
                '3.Hot Stone Massage - นวดหินร้อน  (600 – 1,200 ฿ / 60 นาที)',
                '4.Aromatherapy Massage - นวดอโรมาเทอราพี  (600 – 1,000 ฿ / 60 นาที)',
                '5.Herbal Compress Massage - นวดประคบสมุนไพร  (700 – 1,200 ฿ / 60 นาที)',
                '6.Leg/Foot/Neck/Shoulder Massage - นวดขา‑เท้า‑คอ‑บ่า‑ไหล่  (300 – 500 ฿ / 30–60 นาที)',
                '7.Office Syndrome Massage - นวดออฟฟิศซินโดรม  (450 – 700 ฿ / 60 นาที )',
                '8.Body Scrub / Facial Spa - สครับผิวกาย / สปาหน้า  (500 – 1,000 ฿ / 60 นาที) '
            ],
            'onsen': [
                '1. Hot Bath + Sauna + Steam  (300 ฿)',
                '2.Public Onsen Bath  (400 – 600 ฿)',
            ],
            'waxing': [
                '1.Underarm Wax  (150 – 250 ฿)',
                '2.Bikini Line Wax  (400 – 600 ฿)',
                '3.Full Leg Wax (500 – 700 ฿)',
                '4.Facial Wax (Forehead, Eyebrows, Sideburns) (899 (โปรโมชั่น) ฿)',
            ]
        };

        // Package names mapping
        const packageNames = {
            'massage': 'MASSAGE - นวดผ่อนคลาย',
            'onsen': 'ONSEN - ออนเซ็นญี่ปุ่น',
            'waxing': 'WAXING - แว็กซ์ขน'
        };

        // ===================================
        // Set minimum date to today
        // ===================================
        const dateInput = document.getElementById('date');
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);

        console.log('✅ Date input configured');

        // ===================================
        // Package change handler
        // ===================================
        const packageSelect = document.getElementById('package');
        const treatmentOptions = document.getElementById('treatmentOptions');
        const treatmentSelect = document.getElementById('treatment');

        packageSelect.addEventListener('change', function() {
            const selectedPackage = this.value;
            
            console.log('📦 Package selected:', selectedPackage);
            
            // Clear previous options
            treatmentSelect.innerHTML = '<option value="" disabled selected>เลือกทรีทเมนต์</option>';
            
            // Check if package has treatment options
            if (treatments[selectedPackage]) {
                // Show treatment options
                treatmentOptions.classList.add('show');
                
                // Add new options
                treatments[selectedPackage].forEach(treatment => {
                    const option = document.createElement('option');
                    option.value = treatment;
                    option.textContent = treatment;
                    treatmentSelect.appendChild(option);
                });
                
                treatmentSelect.required = true;
                console.log('✅ Treatment options loaded');
            } else {
                // Hide treatment options
                treatmentOptions.classList.remove('show');
                treatmentSelect.required = false;
            }
        });

        console.log('✅ Package selector configured');

        // ===================================
        // บันทึกข้อมูลการจองลง Firebase
        // ===================================
        async function saveBooking(bookingData) {
            try {
                console.log('💾 กำลังบันทึกข้อมูลการจอง...', bookingData);
                
                const docRef = await addDoc(collection(db, 'bookings'), bookingData);
                
                console.log('✅✅✅ บันทึกสำเร็จ! Document ID:', docRef.id);
                return { success: true, id: docRef.id };
                
            } catch (error) {
                console.error('❌❌❌ เกิดข้อผิดพลาดในการบันทึก:', error);
                console.error('Error details:', error.message);
                return { success: false, error: error.message };
            }
        }

        // ===================================
        // Test Firebase Connection
        // ===================================
        window.testFirebaseConnection = async function() {
            try {
                console.log('🧪 Testing Firebase connection...');
                const testData = {
                    test: true,
                    message: 'Test from booking page',
                    timestamp: serverTimestamp()
                };
                const docRef = await addDoc(collection(db, 'test'), testData);
                console.log('✅ Firebase connection successful! Test document ID:', docRef.id);
                alert('✅ Firebase เชื่อมต่อสำเร็จ!\nTest Document ID: ' + docRef.id);
                return true;
            } catch (error) {
                console.error('❌ Firebase connection failed:', error);
                alert('❌ Firebase เชื่อมต่อไม่สำเร็จ:\n' + error.message);
                return false;
            }
        };

        console.log('✅ Test function ready: testFirebaseConnection()');

        // ===================================
        // Form submission
        // ===================================
        const bookingForm = document.getElementById('bookingForm');

        if (!bookingForm) {
            console.error('❌❌❌ ไม่พบ Form #bookingForm');
        } else {
            console.log('✅ Form found, adding listener...');
            
            bookingForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                console.log('🎯 Form submitted!');
                
                // Disable submit button to prevent double submission
                const submitBtn = this.querySelector('.submit-btn');
                const originalText = submitBtn.textContent;
                submitBtn.disabled = true;
                submitBtn.textContent = 'กำลังบันทึก...';
                
                try {
                    // รวบรวมข้อมูลจากฟอร์ม
                    const dateValue = document.getElementById('date').value;
                    const timeValue = document.getElementById('time').value;
                    const packageValue = document.getElementById('package').value;
                    const treatmentValue = treatmentSelect.value || 'ไม่ระบุ';
                    
                    console.log('📝 ข้อมูลจากฟอร์ม:', {
                        date: dateValue,
                        time: timeValue,
                        packageId: packageValue,
                        treatment: treatmentValue
                    });
                    
                    const formData = {
                        date: dateValue,
                        time: timeValue,
                        packageId: packageValue,
                        packageName: packageNames[packageValue],
                        treatmentName: treatmentValue,
                        Status: 'รอการดำเนินการ',
                        createdAt: serverTimestamp()
                    };
                    
                    console.log('📦 ข้อมูลที่จะบันทึก:', formData);
                    
                    // บันทึกลง Firebase
                    console.log('💾 กำลังบันทึกลง Firebase...');
                    const result = await saveBooking(formData);
                    
                    if (result.success) {
                        console.log('✅✅✅ บันทึกสำเร็จ! Document ID:', result.id);
                        
                        // แสดงข้อความสำเร็จ
                        alert(`✅ การจองสำเร็จ!\n\nวันที่: ${formData.date}\nเวลา: ${formData.time}\nแพ็กเกจ: ${formData.packageName}\nทรีทเมนต์: ${formData.treatmentName}\n\nรหัสการจอง: #${result.id.substring(0, 10).toUpperCase()}\n\nเราจะติดต่อกลับไปยืนยันการจองในเร็วๆ นี้ค่ะ`);
                        
                        // ถามว่าต้องการไปหน้า My Account หรือไม่
                        const goToAccount = confirm('ต้องการดูประวัติการจองของคุณหรือไม่?');
                        if (goToAccount) {
                            window.location.href = '/src/pages/Myaccount.html';
                        } else {
                            // Reset form
                            this.reset();
                            treatmentOptions.classList.remove('show');
                        }
                    } else {
                        console.error('❌❌❌ บันทึกไม่สำเร็จ:', result.error);
                        // แสดงข้อความผิดพลาด
                        alert(`❌ เกิดข้อผิดพลาด\n\n${result.error}\n\nกรุณาลองใหม่อีกครั้ง`);
                    }
                    
                } catch (error) {
                    console.error('❌❌❌ Error:', error);
                    alert('❌ เกิดข้อผิดพลาดที่ไม่คาดคิด:\n' + error.message);
                } finally {
                    // Enable submit button again
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            });
            
            console.log('✅ Form listener installed successfully!');
        }

        console.log('🎉 Booking system ready!');
        console.log('💡 ทดสอบด้วย: testFirebaseConnection()');