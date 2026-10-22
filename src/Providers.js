import React, { useState, useEffect, useMemo } from 'react';
import { db } from './firebase';
import { ref, get, query, orderByChild, equalTo, update, remove } from 'firebase/database';
import {
  FaBuilding,
  FaSearch,
  FaPlusCircle,
  FaEdit,
  FaTrashAlt,
  FaEye,
  FaTimes,
  FaSave,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaUserTie,
  FaBriefcase
} from 'react-icons/fa';
import './Providers.css';

const Providers = ({ onProviderClick, onAddJobClick }) => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');

  // Edit Provider State
  const [editingProvider, setEditingProvider] = useState(null);
  const [editFormData, setEditFormData] = useState({
    companyName: '',
    name: '',
    email: '',
    phone: '',
    district: '',
    location: '',
    industry: ''
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
    const now = new Date();
    const diffHours = Math.round((now - date) / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  const getCompanyInitials = (name = '') => {
    if (!name) return 'EP';
    const clean = name.trim();
    const parts = clean.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return clean.slice(0, 2).toUpperCase();
  };

  const getCompanyGradient = (name = '') => {
    const gradients = [
      'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
      'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
      'linear-gradient(135deg, #0d9488 0%, #115e59 100%)',
      'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
      'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)',
      'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return gradients[Math.abs(hash) % gradients.length];
  };

  // Open Edit Provider Modal
  const handleOpenEdit = (e, provider) => {
    e.stopPropagation();
    setEditingProvider(provider);
    setEditFormData({
      companyName: provider.companyName || '',
      name: provider.name || '',
      email: provider.email || '',
      phone: provider.phone || '',
      district: provider.district || '',
      location: provider.location || '',
      industry: provider.industry || ''
    });
  };

  // Save Edit Provider
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
        industry: editFormData.industry,
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
    if (window.confirm(`Are you sure you want to delete "${providerName || 'this provider'}"? This action cannot be undone.`)) {
      try {
        await remove(ref(db, `EliteJobs/users/${providerId}`));
        setProviders((prev) => prev.filter((p) => p.id !== providerId));
      } catch (err) {
        alert('Failed to delete provider: ' + err.message);
      }
    }
  };

  const industriesList = useMemo(() => {
    const set = new Set();
    providers.forEach((p) => {
      if (p.industry && p.industry.trim()) set.add(p.industry.trim());
    });
    return Array.from(set);
  }, [providers]);

  const filteredProviders = useMemo(() => {
    return providers.filter((p) => {
      const company = (p.companyName || '').toLowerCase();
      const contact = (p.name || '').toLowerCase();
      const district = (p.district || '').toLowerCase();
      const industry = (p.industry || '').toLowerCase();
      const loc = (p.location || '').toLowerCase();
      const query = searchTerm.toLowerCase();

      const matchesSearch =
        !searchTerm ||
        company.includes(query) ||
        contact.includes(query) ||
        district.includes(query) ||
        industry.includes(query) ||
        loc.includes(query);

      if (!matchesSearch) return false;

      if (selectedIndustry !== 'all' && p.industry !== selectedIndustry) {
        return false;
      }

      return true;
    });
  }, [providers, searchTerm, selectedIndustry]);

  return (
    <div className="providers-page animate-fade-in">
      {/* Header Search & Control Bar */}
      <div className="providers-header-controls">
        <div className="providers-search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search company, recruiter, district, industry..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button className="clear-btn" onClick={() => setSearchTerm('')}>
              ✕
            </button>
          )}
        </div>

        <div className="providers-actions-row">
          {/* Industry Filter Pills */}
          <div className="filter-chips-scroll">
            <button
              className={`chip ${selectedIndustry === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedIndustry('all')}
            >
              All Providers ({providers.length})
            </button>
            {industriesList.map((ind) => (
              <button
                key={ind}
                className={`chip ${selectedIndustry === ind ? 'active' : ''}`}
                onClick={() => setSelectedIndustry(ind)}
              >
                {ind}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="providers-error-banner">{error}</div>}

      {loading ? (
        <div className="providers-loading-state">
          <div className="app-spinner"></div>
          <p>Loading hiring companies & providers...</p>
        </div>
      ) : filteredProviders.length === 0 ? (
        <div className="providers-empty-card">
          <div className="empty-icon-wrap">
            <FaBuilding className="empty-icon" />
          </div>
          <h3>No Providers Found</h3>
          <p>Try searching for a different company name or district.</p>
          {searchTerm && (
            <button className="reset-filter-btn" onClick={() => setSearchTerm('')}>
              Clear Search
            </button>
          )}
        </div>
      ) : (
        /* Native Table View with Action Buttons */
        <div className="table-responsive-container">
          <table className="modern-data-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Contact Person</th>
                <th>Industry</th>
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
                    onClick={() => onProviderClick && onProviderClick(provider.id)}
                  >
                    <td>
                      <div className="table-provider-cell">
                        <div
                          className="table-company-avatar"
                          style={{ background: getCompanyGradient(displayName) }}
                        >
                          {getCompanyInitials(displayName)}
                        </div>
                        <div>
                          <div className="table-company-name">{displayName}</div>
                          <div className="table-contact-sub">{provider.email || provider.phone || 'No contact'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {provider.name && provider.name !== displayName ? (
                        <span style={{ fontWeight: 600 }}>{provider.name}</span>
                      ) : (
                        <span className="text-muted-sm">-</span>
                      )}
                    </td>
                    <td>
                      {provider.industry ? (
                        <span className="badge-light">{provider.industry}</span>
                      ) : (
                        <span className="text-muted-sm">-</span>
                      )}
                    </td>
                    <td>{provider.district || provider.location || '-'}</td>
                    <td>
                      <span className="text-muted-sm">{formatTimestamp(provider.lastActive)}</span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="table-action-btns">
                        {onAddJobClick && (
                          <button
                            className="table-action-btn add-btn"
                            onClick={() => onAddJobClick(provider.id)}
                            title="Post Job for this company"
                          >
                            <FaPlusCircle /> Add Job
                          </button>
                        )}
                        <button
                          className="table-action-btn view-btn"
                          onClick={() => onProviderClick && onProviderClick(provider.id)}
                          title="View Company Profile"
                        >
                          <FaEye /> View
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

      {/* Edit Provider Modal Dialog */}
      {editingProvider && (
        <div className="modal-backdrop-overlay" onClick={() => setEditingProvider(null)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FaEdit style={{ color: '#2563eb', marginRight: '8px' }} /> Edit Provider / Company</h3>
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
                  <label><FaBriefcase /> Industry</label>
                  <input
                    type="text"
                    placeholder="e.g. IT, Hospitality, Healthcare"
                    value={editFormData.industry}
                    onChange={(e) => setEditFormData({ ...editFormData, industry: e.target.value })}
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

                <div className="form-field-group full-width">
                  <label><FaMapMarkerAlt /> Full Location / Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Jalna Road, Aurangabad"
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

export default Providers;
