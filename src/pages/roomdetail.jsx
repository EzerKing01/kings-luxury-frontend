import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import { 
  FiUsers, 
  FiWifi, 
  FiCoffee, 
  FiTv, 
  FiWind,
  FiCalendar, 
  FiCheck, 
  FiChevronLeft, 
  FiStar, 
  FiMapPin, 
  FiX
} from 'react-icons/fi';
import { fetchRoom, fetchRooms, createBooking, getImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';

function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [room, setRoom] = useState(null);
  const [similarRooms, setSimilarRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 2
  });
  const [bookingStatus, setBookingStatus] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    loadRoom();
  }, [id]);

  const loadRoom = async () => {
    try {
      const res = await fetchRoom(id);
      setRoom(res.data);
      
      const roomsRes = await fetchRooms();
      const similar = roomsRes.data
        .filter(r => r.id !== parseInt(id))
        .slice(0, 3);
      setSimilarRooms(similar);
    } catch (error) {
      console.error('Error loading room:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (!bookingData.checkIn || !bookingData.checkOut) {
      setBookingStatus('Please select dates');
      return;
    }

    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    if (checkOut <= checkIn) {
      setBookingStatus('Check-out must be after check-in');
      return;
    }

    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const totalPrice = room.pricePerNight * nights;

    try {
      setBookingStatus('Processing...');
      await createBooking({
        roomId: room.id,
        checkInDate: bookingData.checkIn,
        checkOutDate: bookingData.checkOut,
        guests: bookingData.guests,
        totalPrice
      });
      setBookingStatus('');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Booking error:', error);
      setBookingStatus('Booking failed. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading room details...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="error-container">
        <h2>Room not found</h2>
        <Link to="/rooms" className="btn btn-primary">Back to Rooms</Link>
      </div>
    );
  }

  const images = (room.images || []).map(img => getImageUrl(img));

  return (
    <motion.div 
      className="room-detail-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="detail-nav">
        <button onClick={() => navigate(-1)} className="back-btn">
          <FiChevronLeft /> Back to Rooms
        </button>
      </div>

      {/* Image Gallery */}
      {images.length > 0 ? (
        <>
          <div className="room-gallery">
            <div className="main-image" onClick={() => setLightboxOpen(true)}>
              <img src={images[selectedImage]} alt={room.name} />
            </div>
            <div className="thumbnail-grid">
              {images.map((img, idx) => (
                <div 
                  key={idx} 
                  className={`thumbnail ${selectedImage === idx ? 'active' : ''}`}
                  onClick={() => setSelectedImage(idx)}
                >
                  <img src={img} alt={`${room.name} view ${idx+1}`} />
                </div>
              ))}
            </div>
          </div>
          {lightboxOpen && (
            <Lightbox
              mainSrc={images[photoIndex]}
              nextSrc={images[(photoIndex + 1) % images.length]}
              prevSrc={images[(photoIndex + images.length - 1) % images.length]}
              onCloseRequest={() => setLightboxOpen(false)}
              onMovePrevRequest={() => setPhotoIndex((photoIndex + images.length - 1) % images.length)}
              onMoveNextRequest={() => setPhotoIndex((photoIndex + 1) % images.length)}
            />
          )}
        </>
      ) : (
        <div className="no-image-placeholder">No images available</div>
      )}

      <div className="detail-content">
        <div className="detail-main">
          <div className="detail-header">
            <div>
              <h1>{room.name}</h1>
              <div className="room-meta">
                <span className="rating">
                  <FiStar /> 4.9 (128 reviews)
                </span>
                <span className="location">
                  <FiMapPin /> Prime Location
                </span>
              </div>
            </div>
            <div className="price-badge">
              <span className="price">${room.pricePerNight}</span>
              <span className="per-night">/ night</span>
            </div>
          </div>

          <div className="detail-section">
            <h2>About this room</h2>
            <p className="description">{room.description}</p>
          </div>

          <div className="detail-section">
            <h2>Amenities</h2>
            <div className="amenities-list">
              <div className="amenity-item">
                <FiUsers />
                <span>Up to {room.capacity} guests</span>
              </div>
              <div className="amenity-item">
                <FiWifi />
                <span>High-speed WiFi</span>
              </div>
              <div className="amenity-item">
                <FiCoffee />
                <span>Breakfast included</span>
              </div>
              <div className="amenity-item">
                <FiTv />
                <span>Smart TV</span>
              </div>
              <div className="amenity-item">
                <FiWind />
                <span>Air conditioning</span>
              </div>
              <div className="amenity-item">
                <FiCheck />
                <span>Room service</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h2>Policies</h2>
            <div className="policies-grid">
              <div className="policy">
                <h4>Check-in</h4>
                <p>From 3:00 PM</p>
              </div>
              <div className="policy">
                <h4>Check-out</h4>
                <p>Until 11:00 AM</p>
              </div>
              <div className="policy">
                <h4>Cancellation</h4>
                <p>Free cancellation up to 48 hours before check-in</p>
              </div>
            </div>
          </div>
        </div>

        <div className="booking-sidebar">
          <div className="booking-card">
            <h3>Book this room</h3>
            <form onSubmit={handleBooking}>
              <div className="form-group">
                <label>Check-in</label>
                <input
                  type="date"
                  value={bookingData.checkIn}
                  onChange={(e) => setBookingData({...bookingData, checkIn: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="form-group">
                <label>Check-out</label>
                <input
                  type="date"
                  value={bookingData.checkOut}
                  onChange={(e) => setBookingData({...bookingData, checkOut: e.target.value})}
                  min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="form-group">
                <label>Guests</label>
                <select
                  value={bookingData.guests}
                  onChange={(e) => setBookingData({...bookingData, guests: parseInt(e.target.value)})}
                >
                  {[...Array(room.capacity)].map((_, i) => (
                    <option key={i+1} value={i+1}>{i+1} guest{i+1 > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <div className="price-breakdown">
                <div className="price-row">
                  <span>${room.pricePerNight} x nights</span>
                  <span>${(bookingData.checkIn && bookingData.checkOut) 
                    ? (room.pricePerNight * Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000*60*60*24)))
                    : 0}</span>
                </div>
                <div className="price-row total">
                  <span>Total</span>
                  <span>${(bookingData.checkIn && bookingData.checkOut) 
                    ? (room.pricePerNight * Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000*60*60*24)))
                    : 0}</span>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-large book-btn">
                Book Now
              </button>
              {bookingStatus && (
                <p className={`booking-status ${bookingStatus.includes('failed') ? 'error' : ''}`}>
                  {bookingStatus}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      {similarRooms.length > 0 && (
        <div className="similar-rooms">
          <h2>You might also like</h2>
          <div className="similar-grid">
            {similarRooms.map(similar => (
              <Link to={`/rooms/${similar.id}`} key={similar.id} className="similar-card">
                <div className="similar-image">
                  <img src={getImageUrl(similar.images?.[0])} alt={similar.name} />
                </div>
                <div className="similar-info">
                  <h4>{similar.name}</h4>
                  <p className="similar-price">${similar.pricePerNight}/night</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {showSuccessModal && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSuccessModal(false)}
          >
            <motion.div 
              className="quick-view-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: '500px' }}
            >
              <button className="modal-close" onClick={() => setShowSuccessModal(false)}>
                <FiX />
              </button>
              <div className="modal-content" style={{ gridTemplateColumns: '1fr', textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '4rem', color: '#ffd700', marginBottom: '1rem' }}>
                  <FiCheck />
                </div>
                <h2 style={{ marginBottom: '1rem' }}>Booking Confirmed!</h2>
                <p style={{ color: '#666', marginBottom: '2rem' }}>
                  Your room has been booked successfully. You can view all your bookings in your dashboard.
                </p>
                <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
                  <p><strong>Room:</strong> {room.name}</p>
                  <p><strong>Check-in:</strong> {formatDate(bookingData.checkIn)}</p>
                  <p><strong>Check-out:</strong> {formatDate(bookingData.checkOut)}</p>
                  <p><strong>Total:</strong> ${(bookingData.checkIn && bookingData.checkOut) 
                    ? (room.pricePerNight * Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000*60*60*24)))
                    : 0}</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      setShowSuccessModal(false);
                      navigate('/dashboard');
                    }}
                  >
                    Go to Dashboard
                  </button>
                  <button 
                    className="btn btn-outline"
                    onClick={() => setShowSuccessModal(false)}
                  >
                    Continue Browsing
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default RoomDetail;