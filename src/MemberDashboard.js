import React, { useState, useEffect } from 'react';
import {
  FaBars,
  FaTimes,
  FaMoneyCheckAlt,
  FaSignOutAlt,
  FaChevronRight,
  FaHotel,
  FaUsers,
  FaShareAlt,
  FaArrowLeft,
  FaEllipsisH,
  FaThLarge
} from 'react-icons/fa';
import { auth } from './firebase';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Members from './Members';
import MemberSub from './MemberSub';
import HotelPlans from './HotelPlans';
import ReferralDashboard from './ReferralDashboard';
import AllMembers from './AllMembers';
import './Dashboard.css';

const MemberDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Manage Members');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setIsSidebarOpen(true);
    } else {
      setIsSidebarOpen(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user);
        if (!user) {
          navigate('/login');
        }
        setLoading(false);
      },
      (error) => {
        console.error('Auth error:', error);
        setLoading(false);
        navigate('/login');
      }
    );
    return () => unsubscribe();
  }, [navigate]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      signOut(auth)
        .then(() => navigate('/login'))
        .catch((error) => console.error('Logout error:', error));
    }
  };

  const handleTabSelect = (name) => {
    setActiveTab(name);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const menuItems = [
    { name: 'Manage Members', label: 'Members', icon: <FaUsers />, component: Members },
    { name: 'Members Subscriptions', label: 'Billing', icon: <FaMoneyCheckAlt />, component: MemberSub },
    { name: 'Hotel Plans', label: 'Hotels', icon: <FaHotel />, component: HotelPlans },
    { name: 'Referrals', label: 'Referrals', icon: <FaShareAlt />, component: ReferralDashboard },
    { name: 'All Members', label: 'Directory', icon: <FaThLarge />, component: AllMembers },
  ];

  const ActiveComponent = menuItems.find((item) => item.name === activeTab)?.component || Members;

  if (loading) {
    return (
      <div className="app-mobile-loading">
        <div className="app-loading-brand">
          <div className="brand-logo-icon">EJ</div>
          <h2>Member Portal</h2>
          <div className="app-spinner"></div>
          <p>Loading member data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-shell">
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div className="mobile-backdrop-overlay" onClick={closeSidebar} />
      )}

      {/* Slide-out Sidebar */}
      <aside className={`app-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-brand-box">
          <div className="brand-badge-row">
            <div className="brand-logo-icon">EJ</div>
            <div>
              <h1 className="brand-title">Member Portal</h1>
              <span className="brand-sub">EliteJobs Club</span>
            </div>
          </div>
          <button className="sidebar-close-btn" onClick={closeSidebar}>
            <FaTimes />
          </button>
        </div>

        {/* User Card */}
        {user && (
          <div className="sidebar-user-card">
            <div className="user-avatar-circle">
              {user.email ? user.email.slice(0, 2).toUpperCase() : 'AD'}
            </div>
            <div className="user-details">
              <span className="user-email">{user.email || 'Admin'}</span>
              <span className="user-status-pill">Member Manager</span>
            </div>
          </div>
        )}

        {/* Scrollable Navigation */}
        <div className="sidebar-scrollable-menu">
          <div className="menu-category-section">
            <span className="menu-category-label">Member Features</span>
            <div className="menu-items-group">
              {menuItems.map((item) => (
                <button
                  key={item.name}
                  className={`sidebar-nav-item ${activeTab === item.name ? 'active' : ''}`}
                  onClick={() => handleTabSelect(item.name)}
                >
                  <span className="item-icon">{item.icon}</span>
                  <span className="item-name">{item.name}</span>
                  {activeTab === item.name && <span className="active-dot" />}
                </button>
              ))}
            </div>
          </div>

          <div className="menu-category-section">
            <span className="menu-category-label">Switch Workspace</span>
            <button
              className="sidebar-nav-item portal-item"
              onClick={() => navigate('/')}
            >
              <span className="item-icon">
                <FaArrowLeft />
              </span>
              <span className="item-name">Main Dashboard</span>
              <FaChevronRight className="item-arrow" />
            </button>
          </div>
        </div>

        <div className="sidebar-footer">
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`app-main-viewport ${isSidebarOpen ? 'sidebar-expanded' : ''}`}>
        <header className="app-topbar">
          <div className="topbar-left">
            <button className="topbar-menu-toggle" onClick={toggleSidebar}>
              <FaBars />
            </button>
            <div className="topbar-screen-info">
              <span className="screen-badge">Member Portal</span>
              <h2 className="topbar-heading">{activeTab}</h2>
            </div>
          </div>

          <div className="topbar-right">
            <button
              className="topbar-member-btn"
              onClick={() => navigate('/')}
              title="Return to Main Dashboard"
            >
              <FaArrowLeft className="btn-icon" />
              <span className="btn-text">Main Portal</span>
            </button>

            {user && (
              <button
                className="topbar-user-badge"
                onClick={handleLogout}
                title="Click to Logout"
              >
                <div className="topbar-user-initials">
                  {user.email ? user.email.slice(0, 2).toUpperCase() : 'M'}
                </div>
                <FaSignOutAlt className="logout-hint-icon" />
              </button>
            )}
          </div>
        </header>

        <main className="app-content-body">
          <div className="content-container">
            <ActiveComponent />
          </div>
        </main>

        {/* Mobile Bottom Dock */}
        <nav className="mobile-bottom-dock">
          {menuItems.slice(0, 4).map((dock) => {
            const isActive = activeTab === dock.name;
            return (
              <button
                key={dock.name}
                className={`dock-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleTabSelect(dock.name)}
              >
                <span className="dock-icon">{dock.icon}</span>
                <span className="dock-label">{dock.label}</span>
                {isActive && <span className="dock-active-pill" />}
              </button>
            );
          })}

          <button
            className={`dock-tab-btn ${isSidebarOpen ? 'active' : ''}`}
            onClick={toggleSidebar}
          >
            <span className="dock-icon">
              <FaEllipsisH />
            </span>
            <span className="dock-label">More</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default MemberDashboard;

