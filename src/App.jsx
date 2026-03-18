import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
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
import { useLocation, Link } from 'react-router-dom'; // for Navbar
import { FiHome, FiGrid, FiCoffee, FiShoppingCart, FiUser } from 'react-icons/fi'; // for mobile nav

// Navbar component – hidden on admin pages
function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Hide navbar on admin pages
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  // Desktop & mobile nav (your existing code – keep as is)
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
              <div className="profile-dropdown">
                <button className="profile-button">
                  <span className="avatar">{user.name?.charAt(0).toUpperCase()}</span>
                  <span className="user-name">{user.name?.split(' ')[0]}</span>
                  <span className="dropdown-arrow">▼</span>
                </button>
                <div className="dropdown-menu">
                  <Link to="/dashboard">Dashboard</Link>
                  {user.role === 'admin' && <Link to="/admin">Admin Panel</Link>}
                  <button onClick={logout} className="dropdown-logout">Logout</button>
                </div>
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

      {/* Mobile Bottom Navigation */}
      <div className="mobile-bottom-nav">
        <Link to="/" className="mobile-nav-item"><FiHome /><span>Home</span></Link>
        <Link to="/rooms" className="mobile-nav-item"><FiGrid /><span>Rooms</span></Link>
        <Link to="/restaurant" className="mobile-nav-item"><FiCoffee /><span>Restaurant</span></Link>
        <Link to="/cart" className="mobile-nav-item"><FiShoppingCart /><span>Cart</span></Link>
        {user ? (
          <Link to="/dashboard" className="mobile-nav-item"><FiUser /><span>Profile</span></Link>
        ) : (
          <Link to="/login" className="mobile-nav-item"><FiUser /><span>Login</span></Link>
        )}
      </div>
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
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

            {/* 404 fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;