import { useState, useRef, useEffect } from 'react';
import { Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Home from './pages/Home';
import Rooms from './pages/Rooms';
import RoomDetail from './pages/RoomDetail';
import Restaurant from './pages/Restaurant';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import RoomsAdmin from './pages/admin/RoomsAdmin';
import RestaurantAdmin from './pages/admin/RestaurantAdmin';
import PrivateRoute from './components/PrivateRoute';
import { FiHome, FiGrid, FiCoffee, FiShoppingCart, FiUser } from 'react-icons/fi';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
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
        <Link to="/" className="logo">KINGS LUXURY</Link>
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
      </div>

      {/* Mobile Bottom Navigation (only on non-admin pages) */}
      {!location.pathname.startsWith('/admin') && (
        <div className="mobile-bottom-nav">
          <Link to="/" className="mobile-nav-item">
            <FiHome />
            <span>Home</span>
          </Link>
          <Link to="/rooms" className="mobile-nav-item">
            <FiGrid />
            <span>Rooms</span>
          </Link>
          <Link to="/restaurant" className="mobile-nav-item">
            <FiCoffee />
            <span>Restaurant</span>
          </Link>
          <Link to="/cart" className="mobile-nav-item">
            <FiShoppingCart />
            <span>Cart</span>
          </Link>
          {user ? (
            <Link to="/dashboard" className="mobile-nav-item">
              <FiUser />
              <span>Profile</span>
            </Link>
          ) : (
            <Link to="/login" className="mobile-nav-item">
              <FiUser />
              <span>Login</span>
            </Link>
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
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/rooms/:id" element={<RoomDetail />} />
          <Route path="/restaurant" element={<Restaurant />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="rooms" element={<RoomsAdmin />} />
            <Route path="restaurant" element={<RestaurantAdmin />} />
          </Route>
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;