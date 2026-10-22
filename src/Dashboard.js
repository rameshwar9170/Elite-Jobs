import React, { useState, useEffect } from 'react';
import {
  FaBars,
  FaTimes,
  FaBriefcase,
  FaUser,
  FaBuilding,
  FaMoneyCheckAlt,
  FaUserEdit,
  FaUserPlus,
  FaSignOutAlt,
  FaChevronRight,
  FaBell,
  FaUserFriends,
  FaFileAlt,
  FaEllipsisH
} from 'react-icons/fa';
import { auth } from './firebase';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Seekers from './Seekers';
import Providers from './Providers';
import Jobs from './Jobs';
import SeekerProfile from './SeekerProfile';
import ProviderProfile from './ProviderProfile';
import AddProviders from './AddProviders';
import AddSeeker from './AddSeeker';
import Subscriptions from './Subscriptions';
import Notifications from './Notifications';
import ManageSubscriptions from './ManageSubscriptions';
import Application from './Application';
import './Dashboard.css';

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('Jobs');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeekerId, setSelectedSeekerId] = useState(null);
  const [selectedProviderId, setSelectedProviderId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Show sidebar by default on desktop and tablet
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user);
        if (!user && activeTab !== 'Download') {
          navigate('/login');
        }
        setLoading(false);
      },
      (error) => {
        console.error('Auth error:', error);
        setLoading(false);
        if (activeTab !== 'Download') {
          navigate('/login');
        }
      }
    );
    return () => unsubscribe();
  }, [navigate, activeTab]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      signOut(auth)
        .then(() => navigate('/login'))
        .catch((error) => console.error('Logout error:', error));
    }
  };

  const handleSeekerClick = (id) => {
    setSelectedSeekerId(id);
  };

  const handleProviderClick = (id) => {
    setSelectedProviderId(id);
  };

  const handleBackToList = () => {
    setSelectedSeekerId(null);
    setSelectedProviderId(null);
  };

  const handleAddJobClick = (providerId) => {
    navigate(`/add-job/${providerId}`);
  };

  const handleTabSelect = (tabName) => {
    setActiveTab(tabName);
    setSelectedSeekerId(null);
    setSelectedProviderId(null);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  // Menu categorization
  const mainDockItems = [
    { name: 'Jobs', icon: <FaBriefcase />, label: 'Jobs', component: Jobs },
    { name: 'Seekers', icon: <FaUser />, label: 'Seekers', component: Seekers },
    { name: 'Providers', icon: <FaBuilding />, label: 'Providers', component: Providers },
    { name: 'Applications', icon: <FaFileAlt />, label: 'Apps', component: Application },
  ];

  const allMenuItems = [
    {
      category: 'Recruitment & Jobs',
      items: [
        { name: 'Jobs', icon: <FaBriefcase />, component: Jobs },
        { name: 'Seekers', icon: <FaUser />, component: Seekers },
        { name: 'Providers', icon: <FaBuilding />, component: Providers },
        { name: 'Applications', icon: <FaFileAlt />, component: Application },
      ],
    },
    {
      category: 'Quick Actions',
      items: [
        { name: 'Add Providers', icon: <FaUserPlus />, component: AddProviders },
        { name: 'Add Seeker', icon: <FaUserEdit />, component: AddSeeker },
      ],
    },
    {
      category: 'Subscriptions & Billing',
      items: [
        { name: 'Subscriptions', icon: <FaMoneyCheckAlt />, component: Subscriptions },
        { name: 'Manage Subscriptions', icon: <FaMoneyCheckAlt />, component: ManageSubscriptions },
      ],
    },
    {
      category: 'Alerts & Communications',
      items: [
        { name: 'Notifications', icon: <FaBell />, component: Notifications },
      ],
    },
  ];

  // Find active component
  let ActiveComponent = Jobs;
  for (const cat of allMenuItems) {
    const found = cat.items.find((i) => i.name === activeTab);
    if (found) {
      ActiveComponent = found.component;
      break;
    }
  }

  if (loading) {
    return (
      <div className="app-mobile-loading">
        <div className="app-loading-brand">
          <div className="brand-logo-icon">EJ</div>
          <h2>Elite Jobs</h2>
          <div className="app-spinner"></div>
          <p>Initializing secure dashboard...</p>
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

      {/* Slide-out Navigation Drawer / Sidebar */}
      <aside className={`app-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-brand-box">
          <div className="brand-badge-row">
            <div className="brand-logo-icon">EJ</div>
            <div>
              <h1 className="brand-title">Elite Jobs</h1>
              <span className="brand-sub">Management Portal</span>
            </div>
          </div>
          <button className="sidebar-close-btn" onClick={closeSidebar}>
            <FaTimes />
          </button>
        </div>

        {/* User Card inside Drawer */}
        {user && (
          <div className="sidebar-user-card">
            <div className="user-avatar-circle">
              {user.email ? user.email.slice(0, 2).toUpperCase() : 'AD'}
            </div>
            <div className="user-details">
              <span className="user-email">{user.email || 'Admin'}</span>
              <span className="user-status-pill">Active Admin</span>
            </div>
          </div>
        )}

        {/* Navigation Categories */}
        <div className="sidebar-scrollable-menu">
          {allMenuItems.map((cat, catIdx) => (
            <div key={catIdx} className="menu-category-section">
              <span className="menu-category-label">{cat.category}</span>
              <div className="menu-items-group">
                {cat.items.map((item) => (
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
          ))}

          {/* Member Portal Shortcut */}
          <div className="menu-category-section">
            <span className="menu-category-label">Portals</span>
            <button
              className="sidebar-nav-item portal-item"
              onClick={() => navigate('/member-dashboard')}
            >
              <span className="item-icon">
                <FaUserFriends />
              </span>
              <span className="item-name">Member Dashboard</span>
              <FaChevronRight className="item-arrow" />
            </button>
          </div>
        </div>

        {/* Sidebar Footer with Logout */}
        <div className="sidebar-footer">
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main App Content Viewport */}
      <div className={`app-main-viewport ${isSidebarOpen ? 'sidebar-expanded' : ''}`}>
        {/* Top App Header */}
        <header className="app-topbar">
          <div className="topbar-left">
            <button
              className="topbar-menu-toggle"
              onClick={toggleSidebar}
              aria-label="Toggle Navigation Menu"
            >
              <FaBars />
            </button>
            <div className="topbar-screen-info">
              <span className="screen-badge">EliteJobs</span>
              <h2 className="topbar-heading">{activeTab}</h2>
            </div>
          </div>

          <div className="topbar-right">
            <button
              className="topbar-member-btn"
              onClick={() => navigate('/member-dashboard')}
              title="Go to Member Dashboard"
            >
              <FaUserFriends className="btn-icon" />
              <span className="btn-text">Members</span>
            </button>

            <button
              className="topbar-icon-btn notification-btn"
              onClick={() => handleTabSelect('Notifications')}
              title="Notifications"
            >
              <FaBell />
            </button>

            {user && (
              <button
                className="topbar-user-badge"
                onClick={handleLogout}
                title="Click to Logout"
              >
                <div className="topbar-user-initials">
                  {user.email ? user.email.slice(0, 2).toUpperCase() : 'A'}
                </div>
                <FaSignOutAlt className="logout-hint-icon" />
              </button>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="app-content-body">
          <div className="content-container">
            {selectedSeekerId ? (
              <SeekerProfile id={selectedSeekerId} onBack={handleBackToList} />
            ) : selectedProviderId ? (
              <ProviderProfile id={selectedProviderId} onBack={handleBackToList} />
            ) : activeTab === 'Providers' ? (
              <Providers
                onProviderClick={handleProviderClick}
                onAddJobClick={handleAddJobClick}
              />
            ) : ActiveComponent ? (
              <ActiveComponent
                onSeekerClick={handleSeekerClick}
                onProviderClick={handleProviderClick}
              />
            ) : (
              <div className="invalid-tab-state">
                <p>Invalid Selection</p>
                <button onClick={() => handleTabSelect('Jobs')}>Return to Jobs</button>
              </div>
            )}
          </div>
        </main>

        {/* Mobile Native App Bottom Navigation Dock */}
        <nav className="mobile-bottom-dock">
          {mainDockItems.map((dock) => {
            const isActive = activeTab === dock.name && !selectedSeekerId && !selectedProviderId;
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

          {/* More / Menu Dock Tab */}
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

export default Dashboard;

