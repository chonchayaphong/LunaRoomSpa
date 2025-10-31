// Product database - ข้อมูลสินค้าทั้งหมด
const PRODUCTS = {
    1: { 
        id: 1,
        name: 'ONSEN MINERAL BATH POWDER', 
        subtitle: 'ผงอาบน้ำรสฮุ่นอวาสเหมือนดักได้', 
        price: 250 
    },
    2: { 
        id: 2,
        name: 'SAKURA BODY OIL', 
        subtitle: 'น้ำมันบำรุงผิวกลิ่นซากุระ', 
        price: 390 
    },
    3: { 
        id: 3,
        name: 'YUZU SALT SCRUB', 
        subtitle: 'สครับผลิตผิวกลิ่นยูซุ', 
        price: 190 
    },
    4: {  
        id: 4,
        name: 'HINOKI AROMA CANDLE', 
        subtitle: 'เทียนหอมกลิ่นไม้ฮิโนกิ', 
        price: 399 
    }
};

// Cart array
let cart = [];

// Load cart when page loads (แทนที่ฟังก์ชันเดิม)
window.addEventListener('DOMContentLoaded', function() {
    loadCart();
    updateCartDisplay();
    createQuantityModal();  // สร้าง quantity modal
    createCartModal();      // สร้าง cart modal ← เพิ่มบรรทัดนี้
});

// Create quantity modal
function createQuantityModal() {
    const modalHTML = `
        <div class="quantity-modal" id="quantityModal">
            <div class="quantity-modal-overlay" onclick="closeQuantityModal()"></div>
            <div class="quantity-modal-container">
                <button class="quantity-modal-close" onclick="closeQuantityModal()">×</button>
                <h3 class="quantity-modal-title">เลือกจำนวนสินค้า</h3>
                <div class="quantity-modal-product">
                    <h4 id="modalProductName"></h4>
                    <p id="modalProductSubtitle"></p>
                    <span id="modalProductPrice"></span>
                </div>
                <div class="quantity-modal-input">
                    <button class="qty-modal-btn" onclick="changeModalQuantity(-1)">−</button>
                    <input type="number" id="modalQuantityInput" value="1" min="1" max="99">
                    <button class="qty-modal-btn" onclick="changeModalQuantity(1)">+</button>
                </div>
                <div class="quantity-modal-total">
                    <span>ยอดรวม:</span>
                    <span id="modalTotalPrice">0 ฿</span>
                </div>
                <button class="quantity-modal-confirm" onclick="confirmAddToCart()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    เพิ่มลงตะกร้า
                </button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .quantity-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
            display: none;
            align-items: center;
            justify-content: center;
        }
        
        .quantity-modal.active {
            display: flex;
        }
        
        .quantity-modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(5px);
        }
        
        .quantity-modal-container {
            position: relative;
            background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
            border-radius: 20px;
            padding: 40px;
            max-width: 450px;
            width: 90%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            border: 2px solid #333;
            animation: modalSlideIn 0.3s ease;
        }
        
        @keyframes modalSlideIn {
            from {
                transform: translateY(-50px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        
        .quantity-modal-close {
            position: absolute;
            top: 15px;
            right: 15px;
            background: transparent;
            border: none;
            color: #999;
            font-size: 32px;
            cursor: pointer;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }
        
        .quantity-modal-close:hover {
            color: #ffce00;
            transform: rotate(90deg);
        }
        
        .quantity-modal-title {
            font-family: 'Playfair Display', serif;
            font-size: 24px;
            color: #ffce00;
            text-align: center;
            margin: 0 0 25px 0;
            letter-spacing: 1px;
        }
        
        .quantity-modal-product {
            background: #1a1a1a;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 25px;
            border: 1px solid #333;
        }
        
        .quantity-modal-product h4 {
            font-family: 'Playfair Display', serif;
            color: #fff;
            font-size: 18px;
            margin: 0 0 8px 0;
        }
        
        .quantity-modal-product p {
            color: #999;
            font-size: 14px;
            margin: 0 0 12px 0;
        }
        
        .quantity-modal-product span {
            color: #ffce00;
            font-weight: bold;
            font-size: 20px;
        }
        
        .quantity-modal-input {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 20px;
            margin-bottom: 25px;
            background: #1a1a1a;
            border-radius: 15px;
            padding: 15px;
        }
        
        .qty-modal-btn {
            background: #ffce00;
            border: none;
            color: #1a1a1a;
            font-size: 24px;
            font-weight: bold;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .qty-modal-btn:hover {
            background: #fff;
            transform: scale(1.1);
        }
        
        .qty-modal-btn:active {
            transform: scale(0.95);
        }
        
        #modalQuantityInput {
            background: transparent;
            border: 2px solid #ffce00;
            color: #fff;
            font-size: 28px;
            font-weight: bold;
            width: 80px;
            height: 50px;
            text-align: center;
            border-radius: 10px;
            font-family: inherit;
        }
        
        #modalQuantityInput:focus {
            outline: none;
            border-color: #fff;
            box-shadow: 0 0 20px rgba(255, 206, 0, 0.3);
        }
        
        .quantity-modal-total {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 20px;
            color: #fff;
            margin-bottom: 25px;
            padding: 15px 20px;
            background: #1a1a1a;
            border-radius: 10px;
            border: 2px solid #333;
        }
        
        .quantity-modal-total span:last-child {
            color: #ffce00;
            font-size: 24px;
            font-weight: bold;
        }
        
        .quantity-modal-confirm {
            width: 100%;
            background: linear-gradient(135deg, #ffce00 0%, #ff9500 100%);
            border: none;
            color: #1a1a1a;
            padding: 18px;
            border-radius: 12px;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            transition: all 0.3s ease;
            letter-spacing: 1px;
        }
        
        .quantity-modal-confirm:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 30px rgba(255, 206, 0, 0.4);
        }
        
        .quantity-modal-confirm:active {
            transform: translateY(-1px);
        }
        
        @media (max-width: 768px) {
            .quantity-modal-container {
                padding: 30px 20px;
            }
            
            .quantity-modal-title {
                font-size: 20px;
            }
            
            #modalQuantityInput {
                width: 70px;
            }
        }
    `;
    document.head.appendChild(style);
}

// Current product being added
let currentProductId = null;

// Toggle cart modal
// Toggle cart modal (แทนที่ฟังก์ชันเดิม)
function toggleCart() {
    const cartModal = document.getElementById('cartModal');
    
    if (!cartModal) {
        console.error('Cart modal not found!');
        return;
    }
    
    const isActive = cartModal.classList.contains('active');
    
    if (isActive) {
        // Closing
        cartModal.classList.remove('active');
        document.body.style.overflow = '';
    } else {
        // Opening
        renderCartItems();
        cartModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Create cart modal (เพิ่มหลัง createQuantityModal)
// Create cart modal with border (แทนที่ฟังก์ชันเดิม)
function createCartModal() {
    const modalHTML = `
        <div class="cart-modal" id="cartModal">
            <div class="cart-modal-overlay" onclick="toggleCart()"></div>
            <div class="cart-modal-wrapper">
                <div class="cart-modal-container">
                    <div class="cart-modal-header">
                        <h2 class="cart-modal-title">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="9" cy="21" r="1"></circle>
                                <circle cx="20" cy="21" r="1"></circle>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                            </svg>
                            ตะกร้าสินค้า
                        </h2>
                        <button class="cart-modal-close" onclick="toggleCart()" aria-label="Close cart">
                            ×
                        </button>
                    </div>
                    
                    <div class="cart-modal-body" id="cartItems">
                        <div class="cart-empty">
                            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <circle cx="9" cy="21" r="1"></circle>
                                <circle cx="20" cy="21" r="1"></circle>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                            </svg>
                            <p>ตะกร้าสินค้าว่างเปล่า</p>
                        </div>
                    </div>
                    
                    <div class="cart-modal-footer">
                        <div class="cart-total-section">
                            <span class="cart-total-label">ยอดรวมทั้งหมด:</span>
                            <span class="cart-total-amount" id="cartTotal">0 ฿</span>
                        </div>
                        <button class="cart-checkout-btn" onclick="checkout()">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                            ดำเนินการชำระเงิน
                        </button>
                        <button class="cart-continue-btn" onclick="toggleCart()">
                            เลือกสินค้าต่อ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        /* Cart Modal Styles - เพิ่มทั้งหมด */
#cartModal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
    display: none;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

#cartModal.active {
    display: flex;
}

.cart-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    backdrop-filter: blur(8px);
}

.cart-container {
    position: relative;
    background: #2a2a2a;
    border-radius: 20px;
    max-width: 600px;
    width: 100%;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 
        0 0 0 6px rgba(255, 206, 0, 0.2),
        0 0 40px rgba(255, 206, 0, 0.4),
        0 25px 80px rgba(0, 0, 0, 0.6);
    animation: cartSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes cartSlideIn {
    from {
        transform: translateY(100px) scale(0.9);
        opacity: 0;
    }
    to {
        transform: translateY(0) scale(1);
        opacity: 1;
    }
}

.cart-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 25px 30px;
    background: linear-gradient(135deg, #1a1a1a 0%, #252525 100%);
    border-bottom: 3px solid #FFFFFFFF;
    position: relative;
}

.cart-header::after {
    content: '';
    position: absolute;
    bottom: -3px;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, 
        transparent 0%, 
        #FFFFFFFF 20%, 
        #FFFFFFFF 50%, 
        #FFFFFFFF 80%, 
        transparent 100%);
    animation: headerShine 2s ease-in-out infinite;
}

@keyframes headerShine {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
}

.cart-title {
    font-family: 'Playfair Display', serif;
    font-size: 24px;
    color: #FFFFFFFF;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 12px;
    letter-spacing: 1px;
    text-shadow: 0 2px 10px rgba(255, 206, 0, 0.3);
}

.cart-title svg {
    stroke: #FFFFFFFF;
    filter: drop-shadow(0 0 8px rgba(255, 206, 0, 0.5));
}

.cart-close {
    background: rgba(255, 206, 0, 0.1);
    color: #FFFFFFFF;
    font-size: 36px;
    cursor: pointer;
    width: 45px;
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    border-radius: 50%;
    font-weight: bold;
    line-height: 1;
}

.cart-close:hover {
    color: #1a1a1a;
    background: #ffce00;
    transform: rotate(90deg) scale(1.1);
    box-shadow: 0 0 20px rgba(255, 206, 0, 0.6);
}

.cart-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    background: #1a1a1a;
}

.cart-body::-webkit-scrollbar {
    width: 10px;
}

.cart-body::-webkit-scrollbar-track {
    background: #0a0a0a;
    border-radius: 10px;
    margin: 5px;
    border: 1px solid #333;
}

.cart-body::-webkit-scrollbar-thumb {
    border-radius: 10px;
    border: 2px solid #0a0a0a;
}

.cart-body::-webkit-scrollbar-thumb:hover {
    background: #FFFFFFFF;
    box-shadow: 0 0 10px rgba(255, 206, 0, 0.5);
}

.cart-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: #666;
    border: 2px dashed #333;
    border-radius: 15px;
    margin: 20px 0;
}

.cart-empty svg {
    stroke: #333;
    margin-bottom: 20px;
    opacity: 0.5;
    animation: emptyCartFloat 3s ease-in-out infinite;
}

@keyframes emptyCartFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}

.cart-empty p {
    font-size: 18px;
    margin: 0;
}

.cart-item {
    background: linear-gradient(135deg, #252525 0%, #1f1f1f 100%);
    border-radius: 15px;
    padding: 20px;
    margin-bottom: 15px;
    border: 2px solid #333;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 15px;
    transition: all 0.3s ease;
    animation: itemSlideIn 0.3s ease;
    position: relative;
    overflow: hidden;
}

.cart-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, 
        transparent, 
        rgba(255, 206, 0, 0.1), 
        transparent);
    transition: left 0.5s ease;
}

.cart-item:hover::before {
    left: 100%;
}

@keyframes itemSlideIn {
    from {
        transform: translateX(-20px);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.cart-item:hover {
    border-color: #FFFFFFFF;
    transform: translateX(5px);
    box-shadow: 
        0 5px 20px rgba(255, 206, 0, 0.2),
        inset 0 0 20px rgba(255, 206, 0, 0.05);
}

.cart-item-info {
    flex: 1;
    min-width: 0;
}

.cart-item-name {
    font-family: 'Playfair Display', serif;
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 5px;
}

.cart-item-subtitle {
    color: #999;
    font-size: 13px;
    margin-bottom: 8px;
}

.cart-item-price-mobile {
    color: #FFFFFFFF;
    font-weight: bold;
    font-size: 14px;
    display: none;
}

.cart-item-controls {
    display: flex;
    align-items: center;
    gap: 15px;
}

.quantity-control {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #1a1a1a;
    border-radius: 25px;
    padding: 5px 10px;
    border: 2px solid #FFFFFFFF;
    box-shadow: 0 0 15px rgba(255, 206, 0, 0.2);
}

.quantity-btn {
    background: linear-gradient(135deg, #ffce00 0%, #ff9500 100%);
    border: 2px solid #1a1a1a;
    color: #1a1a1a;
    font-size: 18px;
    font-weight: bold;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(255, 206, 0, 0.3);
}

.quantity-btn:hover {
    background: linear-gradient(135deg, #fff 0%, #ffce00 100%);
    transform: scale(1.15);
    box-shadow: 0 4px 15px rgba(255, 206, 0, 0.5);
}

.quantity-btn:active {
    transform: scale(0.95);
}

.quantity-display {
    color: #ffce00;
    font-weight: bold;
    min-width: 25px;
    text-align: center;
    font-size: 16px;
    text-shadow: 0 0 10px rgba(255, 206, 0, 0.3);
}

.cart-item-price {
    color: #ffce00;
    font-weight: bold;
    font-size: 18px;
    min-width: 80px;
    text-align: right;
    text-shadow: 0 0 10px rgba(255, 206, 0, 0.3);
}

.remove-btn {
    background: transparent;
    border: 2px solid #ff4444;
    color: #ff4444;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.remove-btn:hover {
    background: #ff4444;
    color: #fff;
    transform: scale(1.1) rotate(90deg);
    box-shadow: 0 0 20px rgba(255, 68, 68, 0.5);
}

.remove-btn svg {
    stroke: currentColor;
}

.cart-footer {
    padding: 25px 30px;
    background: linear-gradient(135deg, #1a1a1a 0%, #252525 100%);
    border-top: 3px solid #ffce00;
    position: relative;
}

.cart-footer::before {
    content: '';
    position: absolute;
    top: -3px;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, 
        transparent 0%, 
        #ffce00 20%, 
        #ff9500 50%, 
        #ffce00 80%, 
        transparent 100%);
    animation: footerShine 2s ease-in-out infinite reverse;
}

@keyframes footerShine {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
}

.cart-total-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 18px 25px;
    background: #0a0a0a;
    border-radius: 12px;
    border: 3px solid #ffce00;
    box-shadow: 
        0 0 20px rgba(255, 206, 0, 0.2),
        inset 0 0 20px rgba(255, 206, 0, 0.05);
}

.cart-total-label {
    color: #fff;
    font-size: 18px;
    font-weight: 600;
}

.cart-total-amount,
#cartTotal {
    color: #ffce00;
    font-size: 26px;
    font-weight: bold;
    font-family: 'Playfair Display', serif;
    text-shadow: 0 0 20px rgba(255, 206, 0, 0.5);
}

.cart-checkout-btn {
    width: 100%;
    background: linear-gradient(135deg, #ffce00 0%, #ff9500 100%);
    border: 3px solid #1a1a1a;
    color: #1a1a1a;
    padding: 18px;
    border-radius: 12px;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: all 0.3s ease;
    margin-bottom: 12px;
    letter-spacing: 0.5px;
    box-shadow: 0 5px 20px rgba(255, 206, 0, 0.3);
    position: relative;
    overflow: hidden;
}

.cart-checkout-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s ease;
}

.cart-checkout-btn:hover::before {
    left: 100%;
}

.cart-checkout-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(255, 206, 0, 0.5);
    border-color: #ffce00;
}

.cart-checkout-btn:active {
    transform: translateY(-1px);
}

.cart-checkout-btn:disabled {
    background: #333;
    color: #666;
    cursor: not-allowed;
    transform: none;
    border-color: #1a1a1a;
}

.cart-continue-btn {
    width: 100%;
    background: transparent;
    border: 3px solid #ffce00;
    color: #ffce00;
    padding: 14px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 0 15px rgba(255, 206, 0, 0.2);
}

.cart-continue-btn:hover {
    background: rgba(255, 206, 0, 0.1);
    transform: scale(1.02);
    box-shadow: 0 0 25px rgba(255, 206, 0, 0.4);
}

/* Mobile Responsive */
@media (max-width: 768px) {
    .cart-container {
        max-height: 90vh;
    }
    
    .cart-header {
        padding: 20px;
    }
    
    .cart-title {
        font-size: 20px;
    }
    
    .cart-close {
        width: 40px;
        height: 40px;
        font-size: 32px;
    }
    
    .cart-footer {
        padding: 20px;
    }
    
    .cart-item {
        flex-direction: column;
        align-items: flex-start;
    }
    
    .cart-item-info {
        width: 100%;
    }
    
    .cart-item-price-mobile {
        display: block;
    }
    
    .cart-item-controls {
        width: 100%;
        justify-content: space-between;
    }
    
    .cart-item-price {
        display: none;
    }
}

@media (max-width: 480px) {
    .cart-header {
        padding: 15px;
    }
    
    .cart-title {
        font-size: 18px;
    }
    
    .cart-body {
        padding: 15px;
    }
    
    .cart-item {
        padding: 15px;
    }
}
    `;
    document.head.appendChild(style);
}

// Add item to cart - Show quantity modal
function addToCart(productId) {
    const id = parseInt(productId);
    const product = PRODUCTS[id];
    
    if (!product) {
        console.error('Product not found:', productId);
        alert('ไม่พบสินค้านี้');
        return;
    }
    
    currentProductId = id;
    
    // Set product info in modal
    document.getElementById('modalProductName').textContent = product.name;
    document.getElementById('modalProductSubtitle').textContent = product.subtitle;
    document.getElementById('modalProductPrice').textContent = `${product.price} ฿/ชิ้น`;
    document.getElementById('modalQuantityInput').value = 1;
    
    updateModalTotal();
    
    // Show modal
    const modal = document.getElementById('quantityModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus on input
    setTimeout(() => {
        document.getElementById('modalQuantityInput').select();
    }, 100);
}

// Change quantity in modal
function changeModalQuantity(change) {
    const input = document.getElementById('modalQuantityInput');
    let value = parseInt(input.value) || 1;
    value += change;
    
    if (value < 1) value = 1;
    if (value > 99) value = 99;
    
    input.value = value;
    updateModalTotal();
}

// Update modal total price
function updateModalTotal() {
    const quantity = parseInt(document.getElementById('modalQuantityInput').value) || 1;
    const product = PRODUCTS[currentProductId];
    const total = product.price * quantity;
    
    document.getElementById('modalTotalPrice').textContent = `${total.toLocaleString()} ฿`;
}

// Listen to input changes
document.addEventListener('input', function(e) {
    if (e.target.id === 'modalQuantityInput') {
        let value = parseInt(e.target.value);
        if (value < 1) e.target.value = 1;
        if (value > 99) e.target.value = 99;
        updateModalTotal();
    }
});

// Close quantity modal
function closeQuantityModal() {
    const modal = document.getElementById('quantityModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    currentProductId = null;
}

// Confirm add to cart
function confirmAddToCart() {
    const quantity = parseInt(document.getElementById('modalQuantityInput').value) || 1;
    const product = PRODUCTS[currentProductId];
    
    if (!product) return;
    
    // Check if product already in cart
    const existingProductIndex = cart.findIndex(item => item.id === currentProductId);
    
    if (existingProductIndex > -1) {
        // Add to existing quantity
        cart[existingProductIndex].quantity += quantity;
    } else {
        // Add new product
        cart.push({
            id: product.id,
            name: product.name,
            subtitle: product.subtitle,
            price: product.price,
            quantity: quantity
        });
    }
    
    saveCart();
    updateCartDisplay();
    closeQuantityModal();
    
    // Show success feedback
    showSuccessFeedback(quantity);
}

// Show success feedback
function showSuccessFeedback(quantity) {
    // Animate cart button
    const cartBtn = document.querySelector('.cart-btn');
    if (cartBtn) {
        cartBtn.style.transform = 'scale(1.3)';
        setTimeout(() => {
            cartBtn.style.transform = 'scale(1)';
        }, 300);
    }
    
    // Show toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, #4CAF50, #45a049);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        z-index: 10001;
        font-weight: bold;
        animation: slideInRight 0.3s ease, slideOutRight 0.3s ease 2.5s;
    `;
    toast.textContent = `✓ เพิ่ม ${quantity} ชิ้น ลงตะกร้าแล้ว`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
    
    // Add animation keyframes
    if (!document.getElementById('toastAnimations')) {
        const style = document.createElement('style');
        style.id = 'toastAnimations';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Update quantity in cart
function updateQuantity(productId, change) {
    const id = parseInt(productId);
    const productIndex = cart.findIndex(item => item.id === id);
    
    if (productIndex > -1) {
        cart[productIndex].quantity += change;
        
        // Remove if quantity is 0 or less
        if (cart[productIndex].quantity <= 0) {
            removeFromCart(id);
            return;
        }
        
        saveCart();
        updateCartDisplay();
        renderCartItems();
    }
}

// Remove item from cart
function removeFromCart(productId) {
    const id = parseInt(productId);
    
    if (confirm('ต้องการลบสินค้านี้ออกจากตะกร้าใช่หรือไม่?')) {
        cart = cart.filter(item => item.id !== id);
        saveCart();
        updateCartDisplay();
        renderCartItems();
    }
}

// Render all cart items
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartItemsContainer || !cartTotal) {
        console.error('Cart elements not found!');
        return;
    }
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="cart-empty">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <p>ตะกร้าสินค้าว่างเปล่า</p>
            </div>
        `;
        cartTotal.textContent = '0 ฿';
        return;
    }
    
    let total = 0;
    let html = '';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        html += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-subtitle">${item.subtitle}</div>
                    <div class="cart-item-price-mobile">${item.price} ฿</div>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-control">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">−</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                    <span class="cart-item-price">${itemTotal.toLocaleString()} ฿</span>
                    <button class="remove-btn" onclick="removeFromCart(${item.id})" title="ลบสินค้า">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    });
    
    cartItemsContainer.innerHTML = html;
    cartTotal.textContent = `${total.toLocaleString()} ฿`;
}

// Update cart count display
function updateCartDisplay() {
    const cartCount = document.getElementById('cartCount');
    
    if (!cartCount) {
        console.error('Cart count element not found!');
        return;
    }
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Show/hide badge
    if (totalItems > 0) {
        cartCount.style.display = 'flex';
    } else {
        cartCount.style.display = 'none';
    }
    
    // Add scale animation
    cartCount.style.transform = 'scale(1.3)';
    setTimeout(() => {
        cartCount.style.transform = 'scale(1)';
    }, 200);
}

// Save cart to localStorage
function saveCart() {
    try {
        localStorage.setItem('lunaRoomCart', JSON.stringify(cart));
    } catch (e) {
        console.error('Error saving cart:', e);
    }
}

// Load cart from localStorage
function loadCart() {
    try {
        const savedCart = localStorage.getItem('lunaRoomCart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            cart = cart.map(item => ({
                ...item,
                id: parseInt(item.id),
                quantity: parseInt(item.quantity),
                price: parseInt(item.price)
            }));
        }
    } catch (e) {
        console.error('Error loading cart:', e);
        cart = [];
    }
}

// Checkout function
// Checkout function (ปรับปรุง)
function checkout() {
    if (cart.length === 0) {
        alert('ตะกร้าสินค้าว่างเปล่า\nกรุณาเลือกสินค้าก่อนทำการชำระเงิน');
        return;
    }
    
    // Disable button
    const checkoutBtn = event.target;
    checkoutBtn.disabled = true;
    checkoutBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
            <circle cx="12" cy="12" r="10"></circle>
        </svg>
        กำลังดำเนินการ...
    `;
    
    // Add spin animation
    if (!document.getElementById('spinAnimation')) {
        const style = document.createElement('style');
        style.id = 'spinAnimation';
        style.textContent = `
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    setTimeout(() => {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        let orderDetails = '📋 รายการสั่งซื้อ\n';
        orderDetails += '━━━━━━━━━━━━━━━━━━\n\n';
        
        cart.forEach((item, index) => {
            orderDetails += `${index + 1}. ${item.name}\n`;
            orderDetails += `   ${item.subtitle}\n`;
            orderDetails += `   ${item.quantity} x ${item.price.toLocaleString()} ฿ = ${(item.price * item.quantity).toLocaleString()} ฿\n\n`;
        });
        
        orderDetails += '━━━━━━━━━━━━━━━━━━\n';
        orderDetails += `💰 ยอดรวมทั้งหมด: ${total.toLocaleString()} ฿\n\n`;
        orderDetails += 'ต้องการดำเนินการสั่งซื้อใช่หรือไม่?';
        
        if (confirm(orderDetails)) {
            alert('✅ สั่งซื้อสำเร็จ!\n\n' +
                  'ขอบคุณที่ใช้บริการ Luna Room Spa Studio 💕\n\n' +
                  'เราจะติดต่อกลับเพื่อยืนยันคำสั่งซื้อ\n' +
                  'ในเร็วๆ นี้ค่ะ');
            
            cart = [];
            saveCart();
            updateCartDisplay();
            toggleCart();
        } else {
            // Restore button
            checkoutBtn.disabled = false;
            checkoutBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
                ดำเนินการชำระเงิน
            `;
        }
    }, 500);
}

// Close modals when clicking overlay
document.addEventListener('click', function(event) {
    const cartModal = document.getElementById('cartModal');
    
    if (cartModal && cartModal.classList.contains('active')) {
        if (event.target === cartModal || 
            event.target.classList.contains('cart-overlay')) {
            toggleCart();
        }
    }
});

// Handle ESC key to close modals
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const cartModal = document.getElementById('cartModal');
        const quantityModal = document.getElementById('quantityModal');
        
        if (quantityModal && quantityModal.classList.contains('active')) {
            closeQuantityModal();
        } else if (cartModal && cartModal.classList.contains('active')) {
            toggleCart();
        }
    }
});

console.log('🛒 Cart system with quantity popup loaded successfully!');