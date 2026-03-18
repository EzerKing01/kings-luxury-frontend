import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiCoffee, 
  FiLogOut, 
  FiPieChart,
  FiBell,
  FiUser,
  FiSearch,
  FiMenu,
  FiX,
  FiSettings,
  FiHelpCircle,
  FiChevronDown
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/admin/dashboard', icon: <FiPieChart />, label: 'Dashboard' },
    { path: '/admin/rooms', icon: <FiHome />, label: 'Rooms' },
    { path: '/admin/restaurant', icon: <FiCoffee />, label: 'Restaurant' },
  ];

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <div className="admin-layout">
      {/* Top Navigation Bar */}
      <header className="admin-topbar">
        <div className="topbar-left">
          <button 
            className="mobile-menu-toggle" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
          <Link to="/admin" className="topbar-logo">
            Kings<span>Admin</span>
          </Link>
          <nav className="topbar-nav">
            {navItems.map(item => {
              const isActive = location.pathname === item.path || 
                             (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`topbar-nav-item ${isActive ? 'active' : ''}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="topbar-right">
          {/* Search */}
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input type="text" placeholder="Search..." />
          </div>

          {/* Notifications */}
          <div className="notifications">
            <button 
              className="notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <FiBell />
              <span className="notification-badge">3</span>
            </button>
            {showNotifications && (
              <div className="notification-dropdown">
                <div className="dropdown-header">
                  <h4>Notifications</h4>
                  <span>3 new</span>
                </div>
                <ul>
                  <li>
                    <p>New booking #123</p>
                    <span>5 min ago</span>
                  </li>
                  <li>
                    <p>New order #456</p>
                    <span>15 min ago</span>
                  </li>
                  <li>
                    <p>Room maintenance due</p>
                    <span>1 hour ago</span>
                  </li>
                </ul>
                <div className="dropdown-footer">
                  <a href="/admin/notifications">View all</a>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="profile-dropdown">
            <button 
              className="profile-button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="profile-avatar">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <span className="profile-name">{user?.name?.split(' ')[0] || 'Admin'}</span>
              <FiChevronDown />
            </button>
            {showProfileMenu && (
              <div className="profile-menu">
                <div className="profile-info">
                  <p className="profile-fullname">{user?.name || 'Admin User'}</p>
                  <p className="profile-role">{user?.role || 'Administrator'}</p>
                </div>
                <Link to="/admin/profile" className="profile-menu-item">
                  <FiUser /> Profile
                </Link>
                <Link to="/admin/settings" className="profile-menu-item">
                  <FiSettings /> Settings
                </Link>
                <Link to="/admin/help" className="profile-menu-item">
                  <FiHelpCircle /> Help
                </Link>
                <button onClick={handleLogout} className="profile-menu-item logout">
                  <FiLogOut /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="mobile-nav">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className="mobile-nav-item"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </div>
      )}

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;