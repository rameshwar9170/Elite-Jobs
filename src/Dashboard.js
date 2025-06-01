import React, { useState, useEffect } from 'react';
import { FaBars, FaTimes, FaBriefcase, FaUser, FaBuilding, FaDownload } from 'react-icons/fa';
import { auth } from './firebase';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Seekers from './Seekers';
import Providers from './Providers';
import Jobs from './Jobs';
import Download from './Download';
import './Dashboard.css';

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('Seekers');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user);
        // Only redirect to login if the active tab is not 'Download' and no user is authenticated
        if (!user && activeTab !== 'Download') {
          navigate('/login');
        }
        setLoading(false);
      },
      (error) => {
        console.error('Auth error:', error);
        setLoading(false);
        // Only redirect on error if the active tab is not 'Download'
        if (activeTab !== 'Download') {
          navigate('/login');
        }
      }
    );
    return () => unsubscribe();
  }, [navigate, activeTab]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = () => {
    signOut(auth)
      .then(() => navigate('/login'))
      .catch((error) => console.error('Logout error:', error));
  };

  const menuItems = [
    { name: 'Jobs', icon: <FaBriefcase />, component: Jobs },
    { name: 'Seekers', icon: <FaUser />, component: Seekers },
    { name: 'Providers', icon: <FaBuilding />, component: Providers },
    { name: 'Download', icon: <FaDownload />, component: Download },
  ];

  const ActiveComponent = menuItems.find((item) => item.name === activeTab)?.component;

  if (loading) {
    return (
      <div className="loading-screen">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className={`sidebar ${isSidebarOpen ? '' : 'closed'}`}>
        <div className="sidebar-header">
          <h1>Elite Jobs</h1>
          <button className="toggle-button" onClick={toggleSidebar}>
            <FaTimes />
          </button>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${activeTab === item.name ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(item.name);
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className={`main-content ${isSidebarOpen ? '' : 'full-width'}`}>
        <header className="header">
          <button className="menu-button" onClick={toggleSidebar}>
            <FaBars />
          </button>
          <h2>{activeTab}</h2>
          {user && (
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          )}
        </header>
        <main className="main-section">
          {ActiveComponent ? <ActiveComponent /> : <p>Invalid Tab</p>}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;