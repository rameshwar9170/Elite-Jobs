import React, { useState, useEffect } from 'react';
import {
  FaBars,
  FaTimes,
  FaBriefcase,
  FaUser,
  FaBuilding,
  FaTrash,
  FaMoneyCheckAlt,
  FaUserEdit,
  FaUserPlus,
  FaDownload,
} from 'react-icons/fa';
import { auth } from './firebase';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Seekers from './Seekers';
import Providers from './Providers';
import Jobs from './Jobs';
import Download from './Download';
import DeleteAccount from './DeleteAccount';
import SeekerProfile from './SeekerProfile';
import ProviderProfile from './ProviderProfile';
import './Dashboard.css';
import AddProviders from './AddProviders';
import AddSeeker from './AddSeeker';
import Subscriptions from './Subscriptions';
import Notifications from './Notifications';
import ManageSubscriptions from './ManageSubscriptions.js'; // Import ManageSubscriptions component

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('Seekers');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeekerId, setSelectedSeekerId] = useState(null);
  const [selectedProviderId, setSelectedProviderId] = useState(null);

  const navigate = useNavigate();

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

  const handleLogout = () => {
    signOut(auth)
      .then(() => navigate('/login'))
      .catch((error) => console.error('Logout error:', error));
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

 const menuItems = [
  { name: 'Jobs', icon: <FaBriefcase />, component: Jobs },                        // Briefcase for jobs
  { name: 'Seekers', icon: <FaUser />, component: Seekers },                      // User for job seekers
  { name: 'Providers', icon: <FaBuilding />, component: Providers },            // Trash for delete
  { name: 'Add Providers', icon: <FaUserEdit />, component: AddProviders },       // User edit for adding provider
  { name: 'Add Seeker', icon: <FaUserEdit />, component: AddSeeker },             // User edit for adding seeker
  { name: 'Subscriptions', icon: <FaMoneyCheckAlt />, component: Subscriptions }, 
  { name: "Notifications", icon: <FaUserPlus />, component: Notifications }, // User plus for notifications
  // { name: 'Download', icon: <FaDownload />, component: Download },                // Download icon
  // { name: 'Delete Account', icon: <FaTrash />, component: DeleteAccount },  // Money/check for subscriptions
  { name: 'Manage Subscriptions', icon: <FaMoneyCheckAlt />, component: ManageSubscriptions }, // Money/check for manage subscriptions
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
                setSelectedSeekerId(null);
                setSelectedProviderId(null);
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
            <p>Invalid Tab</p>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
