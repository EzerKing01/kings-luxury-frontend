import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCalendar, 
  FiShoppingBag, 
  FiChevronDown, 
  FiChevronUp, 
  FiUser, 
  FiHome, 
  FiCoffee, 
  FiClock, 
  FiDollarSign, 
  FiPackage, 
  FiCheckCircle, 
  FiXCircle,
  FiMapPin
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { fetchUserBookings, fetchUserOrders } from '../services/api';

function Dashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('bookings');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, ordersRes] = await Promise.all([
          fetchUserBookings(),
          fetchUserOrders()
        ]);
        setBookings(bookingsRes.data);
        setOrders(ordersRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateNights = (checkIn, checkOut) => {
    const diff = new Date(checkOut) - new Date(checkIn);
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      confirmed: { label: 'Confirmed', color: '#10b981' },
      pending: { label: 'Pending', color: '#f59e0b' },
      cancelled: { label: 'Cancelled', color: '#ef4444' },
      completed: { label: 'Completed', color: '#3b82f6' },
      preparing: { label: 'Preparing', color: '#f59e0b' },
      ready: { label: 'Ready', color: '#10b981' },
    };
    const s = status?.toLowerCase() || 'pending';
    return statusMap[s] || { label: status, color: '#6b7280' };
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="user-dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Welcome Banner */}
      <div className="dashboard-welcome">
        <div className="welcome-content">
          <div className="avatar-large">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="welcome-text">
            <h1>Welcome back, {user?.name?.split(' ')[0] || 'Guest'}!</h1>
            <p>Here's what's happening with your account</p>
          </div>
        </div>
        <div className="quick-stats">
          <div className="stat-pill">
            <FiCalendar /> {bookings.length} Bookings
          </div>
          <div className="stat-pill">
            <FiShoppingBag /> {orders.length} Orders
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          <FiCalendar /> My Bookings
        </button>
        <button 
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <FiShoppingBag /> My Orders
        </button>
      </div>

      {/* Content */}
      <div className="dashboard-content">
        <AnimatePresence mode="wait">
          {activeTab === 'bookings' && (
            <motion.div
              key="bookings"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="cards-grid"
            >
              {bookings.length === 0 ? (
                <div className="empty-state">
                  <FiPackage size={48} />
                  <h3>No bookings yet</h3>
                  <p>Ready to experience luxury? <a href="/rooms">Browse rooms</a></p>
                </div>
              ) : (
                bookings.map(booking => {
                  const statusBadge = getStatusBadge(booking.status);
                  return (
                    <motion.div 
                      key={booking.id} 
                      className="dashboard-card"
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <div 
                        className="card-summary"
                        onClick={() => setExpandedBooking(expandedBooking === booking.id ? null : booking.id)}
                      >
                        <div className="card-header">
                          <div className="card-icon-wrapper">
                            <FiHome className="card-icon" />
                          </div>
                          <div className="card-header-info">
                            <h3>{booking.room?.name || 'Room'}</h3>
                            <p className="card-subtitle">{booking.room?.category || 'Standard'}</p>
                          </div>
                          <div className="card-status" style={{ backgroundColor: statusBadge.color + '20', color: statusBadge.color }}>
                            <span>{statusBadge.label}</span>
                          </div>
                        </div>
                        <div className="card-meta">
                          <div className="meta-item">
                            <FiCalendar className="meta-icon" />
                            <span>{formatDate(booking.checkInDate)} – {formatDate(booking.checkOutDate)}</span>
                          </div>
                          <div className="meta-item">
                            <FiClock className="meta-icon" />
                            <span>{calculateNights(booking.checkInDate, booking.checkOutDate)} nights</span>
                          </div>
                          <div className="meta-item">
                            <FiMapPin className="meta-icon" />
                            <span>Room {booking.room?.number || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="card-footer">
                          <div className="card-price">
                            <span className="price-label">Total</span>
                            <span className="price-value">${booking.totalPrice}</span>
                          </div>
                          <button className="expand-btn">
                            {expandedBooking === booking.id ? <FiChevronUp /> : <FiChevronDown />}
                          </button>
                        </div>
                      </div>
                      <AnimatePresence>
                        {expandedBooking === booking.id && (
                          <motion.div 
                            className="card-details"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="details-grid">
                              <div className="detail-item">
                                <span className="detail-label">Check-in</span>
                                <span className="detail-value">{formatDate(booking.checkInDate)}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Check-out</span>
                                <span className="detail-value">{formatDate(booking.checkOutDate)}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Nights</span>
                                <span className="detail-value">{calculateNights(booking.checkInDate, booking.checkOutDate)}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Guests</span>
                                <span className="detail-value">{booking.guests || '2'}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Price per night</span>
                                <span className="detail-value">${booking.room?.pricePerNight}</span>
                              </div>
                              <div className="detail-item total">
                                <span className="detail-label">Total paid</span>
                                <span className="detail-value">${booking.totalPrice}</span>
                              </div>
                            </div>
                            <div className="details-actions">
                              <button className="btn btn-outline btn-sm">Modify</button>
                              <button className="btn btn-outline btn-sm">Cancel</button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="cards-grid"
            >
              {orders.length === 0 ? (
                <div className="empty-state">
                  <FiPackage size={48} />
                  <h3>No orders yet</h3>
                  <p>Hungry? <a href="/restaurant">View menu</a></p>
                </div>
              ) : (
                orders.map(order => {
                  const statusBadge = getStatusBadge(order.status);
                  return (
                    <motion.div 
                      key={order.id} 
                      className="dashboard-card"
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <div 
                        className="card-summary"
                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      >
                        <div className="card-header">
                          <div className="card-icon-wrapper">
                            <FiCoffee className="card-icon" />
                          </div>
                          <div className="card-header-info">
                            <h3>Order #{order.orderCode}</h3>
                            <p className="card-subtitle">{formatDate(order.createdAt)}</p>
                          </div>
                          <div className="card-status" style={{ backgroundColor: statusBadge.color + '20', color: statusBadge.color }}>
                            <span>{statusBadge.label}</span>
                          </div>
                        </div>
                        <div className="card-meta">
                          <div className="meta-item">
                            <FiShoppingBag className="meta-icon" />
                            <span>{order.items?.length || 0} items</span>
                          </div>
                          <div className="meta-item">
                            <FiDollarSign className="meta-icon" />
                            <span>${order.totalAmount}</span>
                          </div>
                          {order.deliveryOption && (
                            <div className="meta-item">
                              <FiMapPin className="meta-icon" />
                              <span>{order.deliveryOption === 'room' ? `Room ${order.roomNumber}` : order.deliveryOption}</span>
                            </div>
                          )}
                        </div>
                        <div className="card-footer">
                          <div className="card-price">
                            <span className="price-label">Total</span>
                            <span className="price-value">${order.totalAmount}</span>
                          </div>
                          <button className="expand-btn">
                            {expandedOrder === order.id ? <FiChevronUp /> : <FiChevronDown />}
                          </button>
                        </div>
                      </div>
                      <AnimatePresence>
                        {expandedOrder === order.id && (
                          <motion.div 
                            className="card-details"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <h4>Order Items</h4>
                            <table className="items-table">
                              <thead>
                                <tr>
                                  <th>Item</th>
                                  <th>Qty</th>
                                  <th>Price</th>
                                  <th>Subtotal</th>
                                </tr>
                              </thead>
                              <tbody>
                                {order.items?.map(item => (
                                  <tr key={item.id}>
                                    <td>{item.name}</td>
                                    <td>{item.quantity || 1}</td>
                                    <td>${item.price}</td>
                                    <td>${(item.price * (item.quantity || 1)).toFixed(2)}</td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr>
                                  <td colSpan="3" className="total-label">Total</td>
                                  <td className="total-value">${order.totalAmount}</td>
                                </tr>
                              </tfoot>
                            </table>
                            <div className="details-actions">
                              <button className="btn btn-outline btn-sm">Reorder</button>
                              <button className="btn btn-outline btn-sm">Track Order</button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default Dashboard;