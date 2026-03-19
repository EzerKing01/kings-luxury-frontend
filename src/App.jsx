import { useState, useRef, useEffect } from 'react';
import { Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext'; // Fixed import
import Home from './pages/home';
import Rooms from './pages/rooms';
import RoomDetail from './pages/roomdetail';
import Restaurant from './pages/restaurant';
import Cart from './pages/cart';
import Login from './pages/login';
import Register from './pages/register';
import Dashboard from './pages/dashboard';
import AdminRoute from './components/AdminRoute';
import PrivateRoute from './components/PrivateRoute';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import RoomsAdmin from './pages/admin/RoomsAdmin';
import RestaurantAdmin from './pages/admin/RestaurantAdmin';
import { FiHome, FiGrid, FiCoffee, FiShoppingCart, FiUser, FiMenu, FiX } from 'react-icons/fi';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Don't show navbar on admin pages
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  return (
    <nav>
      <div className="nav-container">
        <Link to="/" className="logo" onClick={() => setMobileMenuOpen(false)}>KINGS LUXURY</Link>

        {/* Desktop Navigation */}
        <div className="nav-links desktop-nav">
          <Link to="/">Home</Link>
          <Link to="/rooms">Rooms</Link>
          <Link to="/restaurant">Restaurant</Link>
          {user ? (
            <>
              <Link to="/cart">Cart</Link>
              <div className="profile-dropdown" ref={dropdownRef}>
                <button 
                  className="profile-button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span className="avatar">{getUserInitials()}</span>
                  <span className="user-name">{user.name?.split(' ')[0]}</span>
                  <span className="dropdown-arrow">▼</span>
                </button>
                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <Link to="/dashboard" onClick={() => setDropdownOpen(false)}>Dashboard</Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setDropdownOpen(false)}>Admin Panel</Link>
                    )}
                    <button onClick={handleLogout} className="dropdown-logout">Logout</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline-light">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="mobile-nav-menu">
          <Link to="/" onClick={() => setMobileMenuOpen(false)}><FiHome /> Home</Link>
          <Link to="/rooms" onClick={() => setMobileMenuOpen(false)}><FiGrid /> Rooms</Link>
          <Link to="/restaurant" onClick={() => setMobileMenuOpen(false)}><FiCoffee /> Restaurant</Link>
          {user ? (
            <>
              <Link to="/cart" onClick={() => setMobileMenuOpen(false)}><FiShoppingCart /> Cart</Link>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}><FiUser /> Dashboard</Link>
              {user.role === 'admin' && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>Admin</Link>
              )}
              <button onClick={handleLogout} className="mobile-logout"><FiUser /> Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/rooms/:id" element={<RoomDetail />} />
          <Route path="/restaurant" element={<Restaurant />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected User Routes */}
          <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

          {/* Admin Routes – nested under AdminLayout */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="rooms" element={<RoomsAdmin />} />
            <Route path="restaurant" element={<RestaurantAdmin />} />
          </Route>

          {/* 404 redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;