import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import {
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiCoffee,
  FiShoppingBag,
  FiStar,
  FiClock,
  FiInfo,
  FiHeart,
  FiShoppingCart,
  FiImage
} from 'react-icons/fi';
import { fetchMenu, getImageUrl } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

// Inline SVG fallback (no network request)
const noImageSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='24' fill='%23999'%3ENo%20Image%3C/text%3E%3C/svg%3E`;

function Restaurant() {
  const [menu, setMenu] = useState([]);
  const [filteredMenu, setFilteredMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showQuickView, setShowQuickView] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  const { addToCart } = useCart();
  const { user } = useAuth();

  const categories = ['all', ...new Set(menu.map(item => item.category).filter(Boolean))];

  useEffect(() => {
    loadMenu();
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
  }, []);

  useEffect(() => {
    applyFilters();
  }, [menu, searchTerm, selectedCategory, priceFilter, sortBy]);

  const loadMenu = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchMenu();
      if (Array.isArray(res.data)) {
        const processedData = res.data.map(item => ({
          ...item,
          price: parseFloat(item.price) || 0,
          // Ensure images is an array
          images: item.images ? (Array.isArray(item.images) ? item.images : [item.images]) : []
        }));
        setMenu(processedData);
        setFilteredMenu(processedData);
      } else {
        setError('Invalid data format');
        setMenu([]);
        setFilteredMenu([]);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load menu');
      setMenu([]);
      setFilteredMenu([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...menu];

    if (searchTerm) {
      filtered = filtered.filter(item =>
        (item.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (item.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    switch (priceFilter) {
      case 'under-20':
        filtered = filtered.filter(item => item.price < 20);
        break;
      case '20-40':
        filtered = filtered.filter(item => item.price >= 20 && item.price <= 40);
        break;
      case '40-60':
        filtered = filtered.filter(item => item.price >= 40 && item.price <= 60);
        break;
      case 'over-60':
        filtered = filtered.filter(item => item.price > 60);
        break;
      default: break;
    }

    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name-desc':
        filtered.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      default: break;
    }

    setFilteredMenu(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setPriceFilter('all');
    setSortBy('default');
  };

  const toggleFavorite = (item) => {
    const newFavorites = favorites.some(fav => fav.id === item.id)
      ? favorites.filter(fav => fav.id !== item.id)
      : [...favorites, item];
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const handleQuickView = (item) => {
    setSelectedItem(item);
    setQuantity(1);
    setPhotoIndex(0);
    setShowQuickView(true);
  };

  const handleAddToCart = (item, qty = quantity) => {
    for (let i = 0; i < qty; i++) addToCart(item);
    setShowQuickView(false);
    alert(`${qty} x ${item.name} added to cart!`);
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
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -30 },
    transition: { duration: 0.5 }
  };

  const staggerContainer = {
    animate: { transition: { staggerChildren: 0.05 } }
  };

  if (loading) {
    return (
      <div className="restaurant-loading">
        <div className="loading-spinner"></div>
        <p>Loading delicious menu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Oops! Something went wrong.</h2>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={loadMenu}>Try Again</button>
      </div>
    );
  }

  if (menu.length === 0) {
    return (
      <div className="no-items">
        <h2>No menu items available</h2>
        <p>Please check back later.</p>
      </div>
    );
  }

  return (
    <motion.div
      className="restaurant-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Hero Section */}
      <section className="restaurant-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Culinary Excellence
          </motion.h1>
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Experience a symphony of flavors
          </motion.p>
          <motion.div
            className="hero-stats"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="stat-item">
              <span className="stat-number">{menu.length}+</span>
              <span className="stat-label">Dishes</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">5</span>
              <span className="stat-label">Star Chef</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Service</span>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container">
        {/* Search and Filter Bar */}
        <motion.div
          className="restaurant-search-bar"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search dishes..."
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

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              className="restaurant-filters-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="filters-grid">
                <div className="filter-group">
                  <label>Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? 'All' : cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label>Price Range</label>
                  <select
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="under-20">Under $20</option>
                    <option value="20-40">$20–$40</option>
                    <option value="40-60">$40–$60</option>
                    <option value="over-60">Over $60</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="default">Default</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name-asc">Name A–Z</option>
                    <option value="name-desc">Name Z–A</option>
                  </select>
                </div>
              </div>

              <div className="filter-actions">
                <button className="btn btn-outline" onClick={clearFilters}>
                  Clear Filters
                </button>
                <span className="results-count">
                  {filteredMenu.length} items
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Tabs */}
        <motion.div
          className="category-tabs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {categories.map(cat => (
            <button
              key={cat}
              className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              <span className="category-icon">{getCategoryIcon(cat)}</span>
              <span className="category-name">
                {cat === 'all' ? 'All' : cat}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Menu Grid */}
        {filteredMenu.length === 0 ? (
          <motion.div
            className="no-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2>No dishes found</h2>
            <p>Try adjusting your filters or search criteria</p>
            <button className="btn btn-primary" onClick={clearFilters}>
              Clear All Filters
            </button>
          </motion.div>
        ) : (
          <motion.div
            className="menu-grid"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <AnimatePresence>
              {filteredMenu.map(item => (
                <motion.div
                  key={item.id}
                  className="menu-card"
                  variants={fadeInUp}
                  exit={{ opacity: 0, scale: 0.9 }}
                  layout
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
                    <button
                      className={`favorite-btn ${favorites.some(fav => fav.id === item.id) ? 'active' : ''}`}
                      onClick={() => toggleFavorite(item)}
                    >
                      <FiHeart />
                    </button>
                    <div className="menu-card-category">
                      {getCategoryIcon(item.category)} {item.category || 'Uncategorized'}
                    </div>
                  </div>

                  <div className="menu-card-content">
                    <div className="menu-card-header">
                      <h3>{item.name || 'Unnamed Item'}</h3>
                      <div className="menu-card-price">${item.price.toFixed(2)}</div>
                    </div>

                    <p className="menu-card-description">
                      {item.description || 'No description available.'}
                    </p>

                    <div className="menu-card-footer">
                      <div className="menu-card-rating">
                        <FiStar className="star-icon" />
                        <span>4.8</span>
                        <span className="rating-count">(120 reviews)</span>
                      </div>

                      <div className="menu-card-actions">
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleQuickView(item)}
                        >
                          <FiInfo />
                          Details
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleAddToCart(item, 1)}
                        >
                          <FiShoppingCart />
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Enhanced Quick View Modal with Gallery */}
      <AnimatePresence>
        {showQuickView && selectedItem && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowQuickView(false)}
          >
            <motion.div
              className="quick-view-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <button className="modal-close" onClick={() => setShowQuickView(false)}>
                <FiX />
              </button>

              <div className="modal-content">
                {/* Image Gallery Section */}
                <div className="modal-gallery">
                  <div className="main-image" onClick={() => setLightboxOpen(true)}>
                    <img
                      src={getImageUrl(selectedItem.images?.[photoIndex]) || noImageSvg}
                      alt={selectedItem.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = noImageSvg;
                      }}
                    />
                  </div>
                  {selectedItem.images?.length > 1 && (
                    <div className="thumbnail-strip">
                      {selectedItem.images.map((img, idx) => (
                        <div
                          key={idx}
                          className={`thumbnail ${photoIndex === idx ? 'active' : ''}`}
                          onClick={() => setPhotoIndex(idx)}
                        >
                          <img src={getImageUrl(img)} alt={`thumbnail ${idx}`} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div className="modal-details">
                  <h2>{selectedItem.name}</h2>
                  <p className="modal-description">{selectedItem.description}</p>
                  <div className="modal-ingredients">
                    <h4>Ingredients</h4>
                    <p>{selectedItem.ingredients || 'Not specified'}</p>
                  </div>
                  <div className="modal-price">${selectedItem.price.toFixed(2)}</div>
                  <div className="modal-quantity">
                    <label>Quantity:</label>
                    <div className="quantity-controls">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <span>{quantity}</span>
                      <button onClick={() => setQuantity(quantity + 1)}>+</button>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleAddToCart(selectedItem, quantity)}
                  >
                    Add to Cart - ${(selectedItem.price * quantity).toFixed(2)}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox for full-screen images */}
      {lightboxOpen && selectedItem && selectedItem.images?.length > 0 && (
        <Lightbox
          mainSrc={getImageUrl(selectedItem.images[photoIndex])}
          nextSrc={getImageUrl(selectedItem.images[(photoIndex + 1) % selectedItem.images.length])}
          prevSrc={getImageUrl(selectedItem.images[(photoIndex + selectedItem.images.length - 1) % selectedItem.images.length])}
          onCloseRequest={() => setLightboxOpen(false)}
          onMovePrevRequest={() => setPhotoIndex((photoIndex + selectedItem.images.length - 1) % selectedItem.images.length)}
          onMoveNextRequest={() => setPhotoIndex((photoIndex + 1) % selectedItem.images.length)}
        />
      )}

      {/* Floating Cart Button */}
      <motion.div
        className="floating-cart"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring' }}
      >
        <Link to="/cart" className="floating-cart-btn">
          <FiShoppingBag />
          <span className="cart-count">{/* cart count from context */}</span>
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default Restaurant;