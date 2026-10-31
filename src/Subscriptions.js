import React, { useEffect, useState } from 'react';
import { ref, get, update } from 'firebase/database';
import { db } from './firebase';
import {
  FaSearch,
  FaEdit,
  FaTrashAlt,
  FaTimes,
  FaSave,
  FaUserCheck,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaFilter
} from 'react-icons/fa';
import './Subscriptions.css';

const Subscriptions = () => {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    role: 'All',
    status: 'All',
    type: 'All',
  });

  // Edit Subscription Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    subscriptionType: 'None',
    subscriptionPrice: 0,
    subscriptionDuration: '',
    expiryDate: '',
    subscriptionStatus: 'Active'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const snapshot = await get(ref(db, 'EliteJobs/users'));
      const usersData = snapshot.val() || {};
      const allUsers = Object.entries(usersData).map(([id, user]) => ({
        id,
        ...user,
      }));
      setUsers(allUsers);
      setFiltered(allUsers);
    } catch (err) {
      console.error('Error fetching users:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const result = users.filter((u) => {
      const name = (u.name || u.companyName || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const district = (u.district || '').toLowerCase();
      const q = searchTerm.toLowerCase().trim();

      const phoneRaw = String(u.phone || u.mobile || u.phoneNumber || u.contactNumber || '');
      const phoneDigits = phoneRaw.replace(/\D/g, '');
      const qDigits = q.replace(/\D/g, '');
      const matchesPhone = phoneRaw.toLowerCase().includes(q) || (qDigits.length >= 3 && phoneDigits.includes(qDigits));

      const matchesSearch =
        !searchTerm ||
        name.includes(q) ||
        email.includes(q) ||
        district.includes(q) ||
        matchesPhone;

      if (!matchesSearch) return false;

      const matchesRole =
        filters.role === 'All' || (u.role || '').toLowerCase() === filters.role.toLowerCase();

      const hasActiveSub = u.subscriptionType && u.subscriptionType !== 'None';
      const matchesStatus =
        filters.status === 'All' ||
        (filters.status === 'Active' && hasActiveSub) ||
        (filters.status === 'Inactive' && !hasActiveSub);

      const matchesType =
        filters.type === 'All' || (u.subscriptionType || 'None') === filters.type;

      return matchesRole && matchesStatus && matchesType;
    });

    setFiltered(result);
  }, [filters, users, searchTerm]);

  // Open Edit Modal
  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setEditFormData({
      subscriptionType: user.subscriptionType || 'None',
      subscriptionPrice: user.subscriptionPrice || 0,
      subscriptionDuration: user.subscriptionDuration || '1 Month',
      expiryDate: user.expiryDate ? new Date(user.expiryDate).toISOString().split('T')[0] : '',
      subscriptionStatus: user.subscriptionStatus || (user.subscriptionType && user.subscriptionType !== 'None' ? 'Active' : 'Inactive')
    });
  };

  // Save Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setSaving(true);
    try {
      const updatedFields = {
        subscriptionType: editFormData.subscriptionType,
        subscriptionPrice: Number(editFormData.subscriptionPrice) || 0,
        subscriptionDuration: editFormData.subscriptionDuration,
        expiryDate: editFormData.expiryDate ? new Date(editFormData.expiryDate).toISOString() : null,
        subscriptionStatus: editFormData.subscriptionStatus,
        lastUpdated: new Date().toISOString()
      };

      await update(ref(db, `EliteJobs/users/${editingUser.id}`), updatedFields);

      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...u, ...updatedFields } : u))
      );
      setEditingUser(null);
    } catch (err) {
      alert('Error updating subscription: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Delete / Remove Subscription
  const handleDelete = async (user) => {
    const displayName = user.name || user.companyName || 'this user';
    if (window.confirm(`Are you sure you want to cancel and remove the subscription for "${displayName}"?`)) {
      try {
        const clearedFields = {
          subscriptionType: 'None',
          subscriptionPrice: 0,
          subscriptionDuration: '',
          expiryDate: null,
          subscriptionStatus: 'Inactive'
        };
        await update(ref(db, `EliteJobs/users/${user.id}`), clearedFields);
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, ...clearedFields } : u))
        );
      } catch (err) {
        alert('Failed to delete subscription: ' + err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="table-responsive-container" style={{ padding: '3rem', textAlign: 'center' }}>
        <p>Loading subscriptions data...</p>
      </div>
    );
  }

  return (
    <div className="subscriptions-page animate-fade-in">
      {/* Header with Search and Filters */}
      <div className="subs-controls-header">
        <div className="seekers-search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, email, phone, district..."
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

        <div className="subs-filters-bar">
          <div className="filter-select-group">
            <label><FaFilter /> Role</label>
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            >
              <option value="All">All Roles</option>
              <option value="Seeker">Seeker</option>
              <option value="Provider">Provider</option>
            </select>
          </div>

          <div className="filter-select-group">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="filter-select-group">
            <label>Plan Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="All">All Plans</option>
              <option value="None">None</option>
              <option value="Basic">Basic</option>
              <option value="Premium">Premium</option>
            </select>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="seekers-empty-card">
          <h3>No Subscriptions Found</h3>
          <p>No records match the current filter or search criteria.</p>
        </div>
      ) : (
        /* Native Responsive Table */
        <div className="table-responsive-container">
          <table className="modern-data-table">
            <thead>
              <tr>
                <th>User / Organization</th>
                <th>Role</th>
                <th>Phone</th>
                <th>District</th>
                <th>Subscription Plan</th>
                <th>Price</th>
                <th>Duration</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => {
                const displayName = user.name || user.companyName || 'Unnamed';
                const hasActive = user.subscriptionType && user.subscriptionType !== 'None';
                return (
                  <tr key={user.id} className="table-row-hover">
                    <td>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                          {displayName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {user.email || 'No email'}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge-role ${user.role === 'provider' ? 'role-provider' : 'role-seeker'}`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td>{user.phone || '-'}</td>
                    <td>{user.district || '-'}</td>
                    <td>
                      <span className={`status-pill ${
                        user.subscriptionType === 'Premium'
                          ? 'status-open'
                          : user.subscriptionType === 'Basic'
                          ? 'status-pending'
                          : 'status-default'
                      }`}>
                        {user.subscriptionType || 'None'}
                      </span>
                    </td>
                    <td>
                      {user.subscriptionPrice ? `₹${user.subscriptionPrice}` : '₹0'}
                    </td>
                    <td>{user.subscriptionDuration || '-'}</td>
                    <td>
                      {user.expiryDate ? (
                        new Date(user.expiryDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })
                      ) : (
                        <span className="text-muted-sm">-</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-pill ${hasActive ? 'status-open' : 'status-closed'}`}>
                        {hasActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="table-action-btns">
                        <button
                          className="table-action-btn edit-btn"
                          onClick={() => handleOpenEdit(user)}
                          title="Edit Subscription"
                        >
                          <FaEdit /> Edit
                        </button>
                        <button
                          className="table-action-btn delete-btn"
                          onClick={() => handleDelete(user)}
                          title="Delete / Cancel Subscription"
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

      {/* Edit Subscription Modal Dialog */}
      {editingUser && (
        <div className="modal-backdrop-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FaEdit style={{ color: '#2563eb', marginRight: '8px' }} /> Edit User Subscription</h3>
              <button className="modal-close-icon" onClick={() => setEditingUser(null)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="modal-form">
              <div className="modal-form-grid">
                <div className="form-field-group full-width">
                  <label><FaUserCheck /> User: {editingUser.name || editingUser.companyName}</label>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Email: {editingUser.email} | Role: {editingUser.role}
                  </span>
                </div>

                <div className="form-field-group">
                  <label>Subscription Plan</label>
                  <select
                    value={editFormData.subscriptionType}
                    onChange={(e) => setEditFormData({ ...editFormData, subscriptionType: e.target.value })}
                  >
                    <option value="None">None</option>
                    <option value="Basic">Basic</option>
                    <option value="Premium">Premium</option>
                  </select>
                </div>

                <div className="form-field-group">
                  <label><FaMoneyBillWave /> Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.subscriptionPrice}
                    onChange={(e) => setEditFormData({ ...editFormData, subscriptionPrice: e.target.value })}
                  />
                </div>

                <div className="form-field-group">
                  <label>Duration</label>
                  <select
                    value={editFormData.subscriptionDuration}
                    onChange={(e) => setEditFormData({ ...editFormData, subscriptionDuration: e.target.value })}
                  >
                    <option value="1 Month">1 Month</option>
                    <option value="3 Months">3 Months</option>
                    <option value="6 Months">6 Months</option>
                    <option value="1 Year">1 Year</option>
                  </select>
                </div>

                <div className="form-field-group">
                  <label><FaCalendarAlt /> Expiry Date</label>
                  <input
                    type="date"
                    value={editFormData.expiryDate}
                    onChange={(e) => setEditFormData({ ...editFormData, expiryDate: e.target.value })}
                  />
                </div>

                <div className="form-field-group">
                  <label>Status</label>
                  <select
                    value={editFormData.subscriptionStatus}
                    onChange={(e) => setEditFormData({ ...editFormData, subscriptionStatus: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditingUser(null)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : <><FaSave /> Save Subscription</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
