import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiChevronRight, FiStar, FiWifi, FiCoffee, FiTv, FiWind, FiUsers, FiHeart } from 'react-icons/fi';
import { fetchRooms, fetchMenu, getImageUrl } from '../services/api';

// Inline SVG fallback for images (same as in Restaurant page)
const noImageSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='24' fill='%23999'%3ENo%20Image%3C/text%3E%3C/svg%3E`;

function Home() {
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [featuredMenu, setFeaturedMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchRooms(),
      fetchMenu()
    ])
      .then(([roomsRes, menuRes]) => {
        setFeaturedRooms(roomsRes.data.slice(0, 3));
        setFeaturedMenu(menuRes.data.slice(0, 4));
      })
      .catch(err => console.error('Error fetching data:', err))
      .finally(() => setLoading(false));
  }, []);

  const amenities = [
    { icon: <FiWifi />, name: 'Free High-Speed WiFi' },
    { icon: <FiCoffee />, name: 'Complimentary Breakfast' },
    { icon: <FiTv />, name: 'Smart TVs' },
    { icon: <FiWind />, name: 'Air Conditioning' },
  ];

  const getAmenityIcon = (amenity) => {
    switch(amenity?.toLowerCase()) {
      case 'wifi': return <FiWifi />;
      case 'breakfast': return <FiCoffee />;
      case 'tv': return <FiTv />;
      case 'ac': return <FiWind />;
      default: return null;
    }
  };

  const getCategoryIcon = (category) => {
    switch(category?.toLowerCase()) {
      case 'appetizer': return '🥗';
      case 'main': return '🍖';
      case 'dessert': return '🍰';
      case 'drink': return '🥂';
      default: return '🍽️';
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <motion.section 
        className="hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Welcome to Kings Luxury
          </motion.h1>
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Experience unparalleled luxury and comfort in the heart of the city
          </motion.p>
          <motion.div
            className="hero-buttons"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Link to="/rooms" className="btn btn-primary">
              Book a Room <FiChevronRight />
            </Link>
            <Link to="/restaurant" className="btn btn-secondary">
              View Menu <FiChevronRight />
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Amenities Section */}
      <motion.section 
        className="amenities"
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="container">
          <motion.h2 variants={fadeInUp}>Why Choose Kings Luxury</motion.h2>
          <motion.div className="amenities-grid" variants={staggerContainer}>
            {amenities.map((item, index) => (
              <motion.div 
                key={index}
                className="amenity-card"
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="amenity-icon">{item.icon}</div>
                <h3>{item.name}</h3>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Featured Rooms */}
      <motion.section 
        className="featured-rooms"
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="container">
          <motion.div className="section-header" variants={fadeInUp}>
            <h2>Featured Rooms</h2>
            <p>Discover our most luxurious accommodations</p>
          </motion.div>

          {loading ? (
            <div className="loading-spinner">Loading...</div>
          ) : (
            <motion.div className="rooms-grid" variants={staggerContainer}>
              {featuredRooms.map(room => (
                <motion.div 
                  key={room.id} 
                  className="room-card"
                  variants={fadeInUp}
                  whileHover={{ y: -10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="room-image">
                    <img 
                      src={getImageUrl(room.images?.[0]) || 'https://via.placeholder.com/400x300?text=No+Image'} 
                      alt={room.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                      }}
                    />
                    {room.category && (
                      <div className="room-category-badge">{room.category}</div>
                    )}
                    <div className="room-badge">
                      <FiStar /> {room.rating || '5.0'}
                    </div>
                    <div className="room-price-tag">
                      <span className="price">${room.pricePerNight}</span>
                      <span className="per-night">/night</span>
                    </div>
                  </div>
                  <div className="room-content">
                    <h3>{room.name}</h3>
                    <p className="room-description">
                      {room.description?.length > 120 
                        ? `${room.description.substring(0, 120)}...` 
                        : room.description}
                    </p>
                    <div className="room-details">
                      <div className="detail-item">
                        <FiUsers />
                        <span>Up to {room.capacity} guests</span>
                      </div>
                    </div>
                    <div className="room-amenities">
                      {room.amenities?.slice(0, 4).map((amenity, index) => (
                        <span key={index} className="amenity-tag">
                          {getAmenityIcon(amenity)}
                          {amenity}
                        </span>
                      ))}
                    </div>
                    <div className="room-actions">
                      <Link to={`/rooms/${room.id}`} className="btn btn-primary">
                        View Details
                      </Link>
                      <button className="btn btn-outline">
                        Quick Book
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          <motion.div className="view-all" variants={fadeInUp}>
            <Link to="/rooms" className="btn btn-outline">
              View All Rooms <FiChevronRight />
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Restaurant Preview */}
      <motion.section 
        className="restaurant-preview"
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="container">
          <motion.div className="section-header" variants={fadeInUp}>
            <h2>Fine Dining Experience</h2>
            <p>Exquisite cuisine prepared by world-class chefs</p>
          </motion.div>

          {loading ? (
            <div className="loading-spinner">Loading...</div>
          ) : (
            <motion.div className="menu-grid" variants={staggerContainer}>
              {featuredMenu.map(item => (
                <motion.div 
                  key={item.id} 
                  className="menu-card"
                  variants={fadeInUp}
                  whileHover={{ y: -5 }}
                >
                  <div className="menu-card-image">
                    <img 
                      src={getImageUrl(item.images?.[0]) || noImageSvg} 
                      alt={item.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = noImageSvg;
                      }}
                    />
                    <div className="favorite-btn">
                      <FiHeart />
                    </div>
                    <div className="menu-card-category">
                      {getCategoryIcon(item.category)} {item.category || 'Uncategorized'}
                    </div>
                  </div>
                  <div className="menu-card-content">
                    <div className="menu-card-header">
                      <h3>{item.name}</h3>
                      <div className="menu-card-price">${item.price}</div>
                    </div>
                    <p className="menu-card-description">
                      {item.description?.length > 100 ? `${item.description.substring(0, 100)}...` : item.description}
                    </p>
                    <div className="menu-card-footer">
                      <div className="menu-card-rating">
                        <FiStar className="star-icon" /> 4.8
                      </div>
                      <div className="menu-card-actions">
                        <Link to={`/restaurant`} className="btn btn-primary btn-sm">
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          <motion.div className="view-all" variants={fadeInUp}>
            <Link to="/restaurant" className="btn btn-outline">
              View Full Menu <FiChevronRight />
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.section 
        className="cta"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <div className="container">
          <h2>Ready for a Luxurious Experience?</h2>
          <p>Book your stay or reserve a table today</p>
          <div className="cta-buttons">
            <Link to="/rooms" className="btn btn-primary btn-large">
              Book a Room
            </Link>
            <Link to="/restaurant" className="btn btn-secondary btn-large">
              Reserve a Table
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

export default Home;