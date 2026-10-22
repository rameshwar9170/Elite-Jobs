import React, { useState, useEffect, useMemo } from 'react';
import { db } from './firebase';
import { ref, get, query, orderByChild, equalTo, update, remove } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import {
  FaBuilding,
  FaSearch,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaUserTie,
  FaFileAlt,
  FaEdit,
  FaTrashAlt,
  FaTimes,
  FaSave
} from 'react-icons/fa';
import './Application.css';

const Application = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Edit provider modal state
  const [editingProvider, setEditingProvider] = useState(null);
  const [editFormData, setEditFormData] = useState({
    companyName: '',
    name: '',
    email: '',
    phone: '',
    district: '',
    location: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = () => {
    const providersRef = query(
      ref(db, 'EliteJobs/users'),
      orderByChild('role'),
      equalTo('provider')
    );

    get(providersRef)
      .then((snapshot) => {
        const data = snapshot.val() || {};
        const providersArray = Object.entries(data).map(([id, user]) => ({
          id,
          ...user,
        }));
        setProviders(providersArray);
        setLoading(false);
      })
      .catch((error) => {
        setError('Failed to load providers: ' + error.message);
        setLoading(false);
      });
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Recently';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Recently';
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  const getCompanyInitials = (name = '') => {
    if (!name) return 'EP';
    const clean = name.trim();
    const parts = clean.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return clean.slice(0, 2).toUpperCase();
  };

  const handleProviderClick = (providerId) => {
    navigate(`/Applications/${providerId}`);
  };

  // Open Edit Modal
  const handleOpenEdit = (e, provider) => {
    e.stopPropagation();
    setEditingProvider(provider);
    setEditFormData({
      companyName: provider.companyName || '',
      name: provider.name || '',
      email: provider.email || '',
      phone: provider.phone || '',
      district: provider.district || '',
      location: provider.location || ''
    });
  };

  // Save Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingProvider) return;
    setSaving(true);
    try {
      const updatedFields = {
        companyName: editFormData.companyName,
        name: editFormData.name,
        email: editFormData.email,
        phone: editFormData.phone,
        district: editFormData.district,
        location: editFormData.location,
        lastUpdated: new Date().toISOString()
      };

      await update(ref(db, `EliteJobs/users/${editingProvider.id}`), updatedFields);

      setProviders((prev) =>
        prev.map((p) => (p.id === editingProvider.id ? { ...p, ...updatedFields } : p))
      );
      setEditingProvider(null);
    } catch (err) {
      alert('Error updating provider: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Delete Provider
  const handleDelete = async (e, providerId, providerName) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${providerName || 'this provider'}"?`)) {
      try {
        await remove(ref(db, `EliteJobs/users/${providerId}`));
        setProviders((prev) => prev.filter((p) => p.id !== providerId));
      } catch (err) {
        alert('Failed to delete provider: ' + err.message);
      }
    }
  };

  const filteredProviders = useMemo(() => {
    return providers.filter((p) => {
      const company = (p.companyName || '').toLowerCase();
      const name = (p.name || '').toLowerCase();
      const email = (p.email || '').toLowerCase();
      const district = (p.district || '').toLowerCase();
      const query = searchTerm.toLowerCase();

      return (
        !searchTerm ||
        company.includes(query) ||
        name.includes(query) ||
        email.includes(query) ||
        district.includes(query)
      );
    });
  }, [providers, searchTerm]);

  return (
    <div className="applications-hub-page animate-fade-in">
      {/* Search Header */}
      <div className="apps-header-box">
        <div className="apps-search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search provider company or recruiter to view job applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="apps-search-input"
          />
          {searchTerm && (
            <button className="clear-btn" onClick={() => setSearchTerm('')}>
              ✕
            </button>
          )}
        </div>
      </div>

      {error && <div className="apps-error-alert">{error}</div>}

      {loading ? (
        <div className="apps-loading-state">
          <div className="app-spinner"></div>
          <p>Loading provider application channels...</p>
        </div>
      ) : filteredProviders.length === 0 ? (
        <div className="apps-empty-state">
          <FaBuilding className="empty-icon" />
          <h3>No Providers Found</h3>
          <p>Try searching with another company name.</p>
        </div>
      ) : (
        /* Native Table View with View Apps, Edit, and Delete action buttons */
        <div className="table-responsive-container">
          <table className="modern-data-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Recruiter / Contact</th>
                <th>Email</th>
                <th>Phone</th>
                <th>District / Location</th>
                <th>Last Active</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProviders.map((provider) => {
                const displayName = provider.companyName || provider.name || 'Unnamed Company';
                return (
                  <tr
                    key={provider.id}
                    className="table-row-hover"
                    onClick={() => handleProviderClick(provider.id)}
                  >
                    <td>
                      <div className="table-provider-cell">
                        <div className="apps-provider-avatar-small">
                          {getCompanyInitials(displayName)}
                        </div>
                        <div>
                          <div className="table-company-name">{displayName}</div>
                          <div className="table-contact-sub">{provider.location || 'Company'}</div>
                        </div>
                      </div>
                    </td>
                    <td>{provider.name || '-'}</td>
                    <td>{provider.email || '-'}</td>
                    <td>{provider.phone || '-'}</td>
                    <td>{provider.district || provider.location || '-'}</td>
                    <td>
                      <span className="text-muted-sm">{formatTimestamp(provider.lastActive)}</span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="table-action-btns">
                        <button
                          className="table-action-btn view-btn"
                          onClick={() => handleProviderClick(provider.id)}
                          title="View Applications for this provider"
                        >
                          <FaFileAlt /> View Applications
                        </button>
                        <button
                          className="table-action-btn edit-btn"
                          onClick={(e) => handleOpenEdit(e, provider)}
                          title="Edit Provider"
                        >
                          <FaEdit /> Edit
                        </button>
                        <button
                          className="table-action-btn delete-btn"
                          onClick={(e) => handleDelete(e, provider.id, displayName)}
                          title="Delete Provider"
                        >
                          <FaTrashAlt /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Provider Modal */}
      {editingProvider && (
        <div className="modal-backdrop-overlay" onClick={() => setEditingProvider(null)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FaEdit style={{ color: '#2563eb', marginRight: '8px' }} /> Edit Provider Details</h3>
              <button className="modal-close-icon" onClick={() => setEditingProvider(null)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="modal-form">
              <div className="modal-form-grid">
                <div className="form-field-group">
                  <label><FaBuilding /> Company Name</label>
                  <input
                    type="text"
                    required
                    value={editFormData.companyName}
                    onChange={(e) => setEditFormData({ ...editFormData, companyName: e.target.value })}
                  />
                </div>

                <div className="form-field-group">
                  <label><FaUserTie /> Contact Person Name</label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  />
                </div>

                <div className="form-field-group">
                  <label><FaEnvelope /> Email Address</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  />
                </div>

                <div className="form-field-group">
                  <label><FaPhoneAlt /> Phone Number</label>
                  <input
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  />
                </div>

                <div className="form-field-group">
                  <label><FaMapMarkerAlt /> District</label>
                  <input
                    type="text"
                    value={editFormData.district}
                    onChange={(e) => setEditFormData({ ...editFormData, district: e.target.value })}
                  />
                </div>

                <div className="form-field-group">
                  <label><FaMapMarkerAlt /> Location</label>
                  <input
                    type="text"
                    value={editFormData.location}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditingProvider(null)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : <><FaSave /> Save Changes</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Application;
