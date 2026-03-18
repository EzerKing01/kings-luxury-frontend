import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingCart, FiTrash2, FiArrowLeft, FiPlus, FiMinus, FiShoppingBag, FiX, FiCheckCircle } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder, getImageUrl } from '../services/api';

// Toast component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      className={`toast ${type}`}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
    >
      <FiCheckCircle className="toast-icon" />
      <span>{message}</span>
    </motion.div>
  );
};

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderStatus, setOrderStatus] = useState('');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [step, setStep] = useState(1); // 1: payment, 2: delivery details
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [deliveryOption, setDeliveryOption] = useState('room');
  const [roomNumber, setRoomNumber] = useState('');
  const [address, setAddress] = useState('');
  const [orderResult, setOrderResult] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity >= 1) updateQuantity(itemId, newQuantity);
  };

  const openCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }
    setShowCheckoutModal(true);
    setStep(1);
    setPaymentMethod('card');
    setDeliveryOption('room');
    setRoomNumber('');
    setAddress('');
  };

  const handleNext = () => {
    if (step === 1) setStep(2);
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
  };

  const handlePlaceOrder = async () => {
    if (deliveryOption === 'room' && !roomNumber.trim()) {
      alert('Please enter your room number');
      return;
    }
    if (deliveryOption === 'location' && !address.trim()) {
      alert('Please enter your delivery address');
      return;
    }

    setPlacingOrder(true);
    setOrderStatus('Processing order...');

    try {
      const orderData = {
        items: cartItems.map(item => ({ id: item.id, quantity: item.quantity })),
        totalAmount: total,
        paymentMethod,
        deliveryOption,
        roomNumber: deliveryOption === 'room' ? roomNumber : undefined,
        address: deliveryOption === 'location' ? address : undefined,
      };
      const response = await createOrder(orderData);
      setOrderResult(response.data);
      clearCart();
      setOrderStatus('');
      setStep(3); // success step
      setToastMessage(`Order placed! Your code: ${response.data.orderCode}`);
      setShowToast(true);
      setTimeout(() => {
        setShowCheckoutModal(false);
        navigate('/dashboard');
      }, 3000);
    } catch (error) {
      console.error('Order failed:', error);
      setOrderStatus('Order failed. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const subtotal = total;
  const tax = subtotal * 0.1;
  const grandTotal = subtotal + tax;

  if (cartItems.length === 0) {
    return (
      <motion.div className="cart-page empty-cart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="empty-cart-content">
          <FiShoppingBag size={80} color="#fbbf24" />
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <Link to="/restaurant" className="btn btn-primary">Browse Menu</Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="cart-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="cart-header">
        <h1>Your Cart</h1>
        <Link to="/restaurant" className="btn-link"><FiArrowLeft /> Continue Shopping</Link>
      </div>

      <div className="cart-grid">
        {/* Cart Items */}
        <div className="cart-items">
          <AnimatePresence>
            {cartItems.map(item => (
              <motion.div key={item.id} className="cart-item" layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.2 }}
              >
                <div className="cart-item-image">
                  <img 
                    src={getImageUrl(item.image) || 'https://via.placeholder.com/100x100?text=No+Image'} 
                    alt={item.name}
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/100x100?text=No+Image'; }}
                  />
                </div>
                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p className="item-category">{item.category}</p>
                  <p className="item-price">${item.price.toFixed(2)} each</p>
                </div>
                <div className="cart-item-quantity">
                  <button className="quantity-btn" onClick={() => handleQuantityChange(item.id, item.quantity - 1)} disabled={item.quantity <= 1}><FiMinus /></button>
                  <span>{item.quantity}</span>
                  <button className="quantity-btn" onClick={() => handleQuantityChange(item.id, item.quantity + 1)}><FiPlus /></button>
                </div>
                <div className="cart-item-total">${(item.price * item.quantity).toFixed(2)}</div>
                <button className="remove-btn" onClick={() => removeFromCart(item.id)} title="Remove item"><FiTrash2 /></button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          <div className="summary-row"><span>Tax (10%)</span><span>${tax.toFixed(2)}</span></div>
          <div className="summary-row total"><span>Total</span><span>${grandTotal.toFixed(2)}</span></div>
          <button className="btn btn-primary btn-large checkout-btn" onClick={openCheckout}>
            Proceed to Checkout
          </button>
        </div>
      </div>

      {/* Checkout Modal - Redesigned */}
      <AnimatePresence>
        {showCheckoutModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCheckoutModal(false)}>
            <motion.div className="modal-content checkout-modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowCheckoutModal(false)}><FiX /></button>
              
              {step === 3 ? (
                // Success step
                <div className="checkout-success">
                  <div className="success-icon">🎉</div>
                  <h2>Order Confirmed!</h2>
                  <p>Your order <strong>{orderResult?.orderCode}</strong> has been placed.</p>
                  <p>You will be redirected to your dashboard.</p>
                </div>
              ) : (
                <>
                  <div className="checkout-steps">
                    <div className={`step-indicator ${step >= 1 ? 'active' : ''}`}>
                      <span className="step-number">1</span>
                      <span className="step-label">Payment</span>
                    </div>
                    <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
                    <div className={`step-indicator ${step >= 2 ? 'active' : ''}`}>
                      <span className="step-number">2</span>
                      <span className="step-label">Delivery</span>
                    </div>
                  </div>

                  <div className="checkout-step">
                    {step === 1 && (
                      <>
                        <h3>Select Payment Method</h3>
                        <div className="options-grid">
                          <label className={`option-card ${paymentMethod === 'card' ? 'selected' : ''}`}>
                            <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                            <span className="option-content">
                              <span className="option-title">Credit / Debit Card</span>
                              <span className="option-desc">Pay securely with your card</span>
                            </span>
                          </label>
                          <label className={`option-card ${paymentMethod === 'paypal' ? 'selected' : ''}`}>
                            <input type="radio" name="payment" value="paypal" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} />
                            <span className="option-content">
                              <span className="option-title">PayPal</span>
                              <span className="option-desc">Fast and secure</span>
                            </span>
                          </label>
                          <label className={`option-card ${paymentMethod === 'cash' ? 'selected' : ''}`}>
                            <input type="radio" name="payment" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} />
                            <span className="option-content">
                              <span className="option-title">Cash on Delivery</span>
                              <span className="option-desc">Pay when you receive</span>
                            </span>
                          </label>
                        </div>
                      </>
                    )}

                    {step === 2 && (
                      <>
                        <h3>Delivery Options</h3>
                        <div className="options-grid">
                          <label className={`option-card ${deliveryOption === 'room' ? 'selected' : ''}`}>
                            <input type="radio" name="delivery" value="room" checked={deliveryOption === 'room'} onChange={() => setDeliveryOption('room')} />
                            <span className="option-content">
                              <span className="option-title">Deliver to my room</span>
                              <span className="option-desc">We'll bring it to your room</span>
                            </span>
                          </label>
                          {deliveryOption === 'room' && (
                            <div className="detail-field">
                              <label>Room Number</label>
                              <input type="text" placeholder="e.g., 305" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} />
                            </div>
                          )}

                          <label className={`option-card ${deliveryOption === 'pickup' ? 'selected' : ''}`}>
                            <input type="radio" name="delivery" value="pickup" checked={deliveryOption === 'pickup'} onChange={() => setDeliveryOption('pickup')} />
                            <span className="option-content">
                              <span className="option-title">Pickup at restaurant</span>
                              <span className="option-desc">Collect from our restaurant</span>
                            </span>
                          </label>

                          <label className={`option-card ${deliveryOption === 'location' ? 'selected' : ''}`}>
                            <input type="radio" name="delivery" value="location" checked={deliveryOption === 'location'} onChange={() => setDeliveryOption('location')} />
                            <span className="option-content">
                              <span className="option-title">Deliver to specific location</span>
                              <span className="option-desc">Provide an address</span>
                            </span>
                          </label>
                          {deliveryOption === 'location' && (
                            <div className="detail-field">
                              <label>Delivery Address</label>
                              <input type="text" placeholder="Full address" value={address} onChange={(e) => setAddress(e.target.value)} />
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="modal-actions">
                    {step > 1 && <button className="btn-outline" onClick={handleBack}>Back</button>}
                    {step < 2 ? (
                      <button className="btn-primary" onClick={handleNext}>Next</button>
                    ) : (
                      <button className="btn-primary" onClick={handlePlaceOrder} disabled={placingOrder}>
                        {placingOrder ? 'Placing...' : 'Confirm Order'}
                      </button>
                    )}
                  </div>
                  {orderStatus && <p className={`order-status ${orderStatus.includes('failed') ? 'error' : ''}`}>{orderStatus}</p>}
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <Toast message={toastMessage} type="success" onClose={() => setShowToast(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default Cart;