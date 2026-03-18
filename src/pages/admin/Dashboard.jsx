import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiHome, 
  FiCoffee, 
  FiCalendar, 
  FiDollarSign,
  FiShoppingBag,
  FiUsers,
  FiTrendingUp
} from 'react-icons/fi';
import { fetchStats } from '../../services/api';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    totalBookings: 0,
    pendingBookings: 0,
    totalMenuItems: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await fetchStats();
      setStats(res.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Rooms',
      value: stats.totalRooms,
      icon: <FiHome />,
      color: '#4CAF50',
      link: '/admin/rooms'
    },
    {
      title: 'Available Rooms',
      value: stats.availableRooms,
      icon: <FiHome />,
      color: '#2196F3',
      link: '/admin/rooms'
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: <FiCalendar />,
      color: '#FF9800',
      link: '/admin/rooms'
    },
    {
      title: 'Pending Bookings',
      value: stats.pendingBookings,
      icon: <FiCalendar />,
      color: '#F44336',
      link: '/admin/rooms'
    },
    {
      title: 'Menu Items',
      value: stats.totalMenuItems,
      icon: <FiCoffee />,
      color: '#9C27B0',
      link: '/admin/restaurant'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: <FiShoppingBag />,
      color: '#FF5722',
      link: '/admin/restaurant'
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: <FiShoppingBag />,
      color: '#E91E63',
      link: '/admin/restaurant'
    },
    {
      title: 'Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: <FiDollarSign />,
      color: '#607D8B',
      link: '#'
    }
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard stats...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <h1>Dashboard Overview</h1>
      
      <div className="stats-grid">
        {statCards.map((card, index) => (
          <Link to={card.link} key={index} className="stat-card" style={{ borderTopColor: card.color }}>
            <div className="stat-icon" style={{ backgroundColor: card.color + '20', color: card.color }}>
              {card.icon}
            </div>
            <div className="stat-content">
              <h3>{card.title}</h3>
              <p className="stat-value">{card.value}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-placeholder">
          <p>Recent bookings and orders will appear here.</p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;