import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, 
  FiFilter, 
  FiUsers, 
  FiDollarSign,
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiStar,
  FiWifi,
  FiCoffee,
  FiTv,
  FiWind,
  FiHome
} from 'react-icons/fi';
import { fetchRooms, getImageUrl } from '../services/api';

function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    capacity: '',
    sortBy: 'price-low'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });

  // Extract unique categories, filtering out empty or null values
  const categories = ['all', ...new Set(rooms.map(room => room.category).filter(Boolean))];

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [rooms, searchTerm, selectedCategory, filters]);

  const loadRooms = async () => {
    try {
      const res = await fetchRooms();
      console.log('API response:', res.data);
      setRooms(res.data);
      setFilteredRooms(res.data);
      
      const prices = res.data.map(room => room.pricePerNight).filter(p => p != null);
      if (prices.length > 0) {
        setPriceRange({
          min: Math.min(...prices),
          max: Math.max(...prices)
        });
      }
    } catch (error) {
      console.error('Error loading rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    // If no filters active, just show all rooms
    if (
      !searchTerm && 
      selectedCategory === 'all' && 
      !filters.minPrice && 
      !filters.maxPrice && 
      !filters.capacity
    ) {
      setFilteredRooms(rooms);
      return;
    }

    let filtered = [...rooms];

    if (searchTerm) {
      filtered = filtered.filter(room =>
        (room.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (room.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(room => room.category === selectedCategory);
    }

    if (filters.minPrice) {
      const min = parseFloat(filters.minPrice);
      if (!isNaN(min)) {
        filtered = filtered.filter(room => (room.pricePerNight ?? 0) >= min);
      }
    }
    if (filters.maxPrice) {
      const max = parseFloat(filters.maxPrice);
      if (!isNaN(max)) {
        filtered = filtered.filter(room => (room.pricePerNight ?? 0) <= max);
      }
    }

    if (filters.capacity) {
      const cap = parseInt(filters.capacity, 10);
      if (!isNaN(cap)) {
        filtered = filtered.filter(room => (room.capacity ?? 0) >= cap);
      }
    }

    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => (a.pricePerNight ?? 0) - (b.pricePerNight ?? 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.pricePerNight ?? 0) - (a.pricePerNight ?? 0));
        break;
      case 'name-asc':
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name-desc':
        filtered.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      case 'capacity':
        filtered.sort((a, b) => (b.capacity ?? 0) - (a.capacity ?? 0));
        break;
      default:
        break;
    }

    setFilteredRooms(filtered);
  };

  const clearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      capacity: '',
      sortBy: 'price-low'
    });
    setSearchTerm('');
    setSelectedCategory('all');
  };

  const getAmenityIcon = (amenity) => {
    switch(amenity?.toLowerCase()) {
      case 'wifi': return <FiWifi />;
      case 'breakfast': return <FiCoffee />;
      case 'tv': return <FiTv />;
      case 'ac': return <FiWind />;
      default: return null;
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -30 },
    transition: { duration: 0.5 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Discovering luxury rooms...</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="rooms-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Hero Section */}
      <section className="rooms-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Luxury Accommodations
          </motion.h1>
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Experience the epitome of comfort and elegance
          </motion.p>
        </div>
      </section>

      <div className="container">
        {/* Search and Filter Bar */}
        <motion.div 
          className="search-filter-bar"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search rooms by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>
                <FiX />
              </button>
            )}
          </div>

          <button 
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter />
            <span>Filters</span>
            {showFilters ? <FiChevronUp /> : <FiChevronDown />}
          </button>
        </motion.div>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              className="filters-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="filters-grid">
                {/* Category Filter */}
                <div className="filter-group">
                  <label>
                    <FiHome /> Room Type
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? 'All Types' : cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label>
                    <FiDollarSign /> Price Range
                  </label>
                  <div className="price-inputs">
                    <input
                      type="number"
                      placeholder={`Min $${priceRange.min}`}
                      value={filters.minPrice}
                      onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                      min={priceRange.min}
                      max={priceRange.max}
                    />
                    <span>to</span>
                    <input
                      type="number"
                      placeholder={`Max $${priceRange.max}`}
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                      min={priceRange.min}
                      max={priceRange.max}
                    />
                  </div>
                </div>

                <div className="filter-group">
                  <label>
                    <FiUsers /> Guest Capacity
                  </label>
                  <select
                    value={filters.capacity}
                    onChange={(e) => setFilters({...filters, capacity: e.target.value})}
                  >
                    <option value="">Any</option>
                    <option value="2">2+ Guests</option>
                    <option value="4">4+ Guests</option>
                    <option value="6">6+ Guests</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>
                    <FiHome /> Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                  >
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name-asc">Name: A to Z</option>
                    <option value="name-desc">Name: Z to A</option>
                    <option value="capacity">Capacity: High to Low</option>
                  </select>
                </div>
              </div>

              <div className="filter-actions">
                <button className="btn btn-outline" onClick={clearFilters}>
                  Clear All Filters
                </button>
                <span className="results-count">
                  {filteredRooms.length} rooms found
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Stats */}
        {!showFilters && (
          <motion.div 
            className="results-stats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p>Showing {filteredRooms.length} of {rooms.length} rooms</p>
          </motion.div>
        )}

        {/* Rooms Grid */}
        {filteredRooms.length === 0 ? (
          <motion.div 
            className="no-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2>No rooms found</h2>
            <p>Try adjusting your filters or search criteria</p>
            <button className="btn btn-primary" onClick={clearFilters}>
              Clear All Filters
            </button>
          </motion.div>
        ) : (
          <motion.div 
            className="rooms-grid"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <AnimatePresence>
              {filteredRooms.map(room => (
                <motion.div
                  key={room.id}
                  className="room-card"
                  variants={fadeInUp}
                  exit={{ opacity: 0, scale: 0.9 }}
                  layout
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
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default Rooms;