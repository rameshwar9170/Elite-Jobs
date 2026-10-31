import React, { useEffect, useState, useMemo } from 'react';
import { getDatabase, ref, onValue, update, remove } from 'firebase/database';
import { FaEdit, FaTrashAlt, FaTimes, FaSave, FaSearch } from 'react-icons/fa';
import './AllMembers.css';

const AllMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMember, setEditingMember] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    const db = getDatabase();
    const membersRef = ref(db, 'members');

    const unsubscribe = onValue(membersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const membersList = Object.entries(data).map(([id, member]) => ({ 
          id, 
          ...member 
        }));
        setMembers(membersList);
        setLoading(false);
      } else {
        setMembers([]);
        setLoading(false);
      }
    }, (error) => {
      console.error('Error fetching members:', error);
      setError('Failed to load members.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle Edit
  const handleEdit = (member) => {
    setEditingMember(member.id);
    setEditForm({
      name: member.name || '',
      email: member.email || '',
      phoneNumber: member.phoneNumber || '',
      address: member.address || '',
      district: member.district || '',
      hotelId: member.hotelId || '',
      subscriptionAmount: member.subscriptionAmount || 0,
      subscriptionPlan: member.subscriptionPlan || '',
      subscriptionExpiry: member.subscriptionExpiry || '',
      hasActiveSubscription: member.hasActiveSubscription || false,
    });
  };

  const handleCancelEdit = () => {
    setEditingMember(null);
    setEditForm({});
  };

  const handleFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveEdit = async () => {
    setActionLoading('saving');
    try {
      const db = getDatabase();
      const memberRef = ref(db, `members/${editingMember}`);
      
      const updateData = {
        name: editForm.name,
        email: editForm.email,
        phoneNumber: editForm.phoneNumber,
        address: editForm.address,
        district: editForm.district,
        hotelId: editForm.hotelId,
        subscriptionAmount: Number(editForm.subscriptionAmount),
        subscriptionPlan: editForm.subscriptionPlan,
        subscriptionExpiry: editForm.subscriptionExpiry,
        hasActiveSubscription: editForm.hasActiveSubscription,
        lastUpdated: new Date().toISOString()
      };

      await update(memberRef, updateData);
      setEditingMember(null);
      setEditForm({});
    } catch (error) {
      console.error('Error updating member:', error);
      alert('Failed to update member: ' + error.message);
    } finally {
      setActionLoading('');
    }
  };

  // Handle Delete
  const handleDelete = async (memberId) => {
    setActionLoading('deleting');
    try {
      const db = getDatabase();
      const memberRef = ref(db, `members/${memberId}`);
      await remove(memberRef);
      setShowDeleteModal(null);
    } catch (error) {
      console.error('Error deleting member:', error);
      alert('Failed to delete member: ' + error.message);
    } finally {
      setActionLoading('');
    }
  };

  // Filtered members by search (including mobile number)
  const filteredMembers = useMemo(() => {
    if (!searchTerm.trim()) return members;
    const query = searchTerm.toLowerCase().trim();
    const queryDigits = query.replace(/\D/g, '');

    return members.filter((member) => {
      const name = (member.name || '').toLowerCase();
      const email = (member.email || '').toLowerCase();
      const address = (member.address || '').toLowerCase();
      const district = (member.district || '').toLowerCase();
      const hotelId = (member.hotelId || '').toLowerCase();
      const plan = (member.subscriptionPlan || '').toLowerCase();

      const phoneRaw = String(member.phoneNumber || member.phone || member.mobile || member.contactNumber || '');
      const phoneDigits = phoneRaw.replace(/\D/g, '');
      const matchesPhone = phoneRaw.toLowerCase().includes(query) || (queryDigits.length >= 3 && phoneDigits.includes(queryDigits));

      return (
        name.includes(query) ||
        email.includes(query) ||
        address.includes(query) ||
        district.includes(query) ||
        hotelId.includes(query) ||
        plan.includes(query) ||
        matchesPhone
      );
    });
  }, [members, searchTerm]);

  if (loading) {
    return <div className="loading" style={{ textAlign: 'center', padding: '3rem' }}>⏳ Loading members...</div>;
  }

  if (error) {
    return <div className="error-message" style={{ textAlign: 'center', padding: '2rem', color: '#ef4444' }}>❌ {error}</div>;
  }

  if (members.length === 0) {
    return <div className="no-members" style={{ textAlign: 'center', padding: '3rem' }}>📋 No members found.</div>;
  }

  return (
    <div className="all-members-container">
      <h1 className="title">👥 All Members ({filteredMembers.length}{filteredMembers.length !== members.length ? ` of ${members.length}` : ''})</h1>

      {/* Search Header */}
      <div className="members-search-wrapper">
        <div className="members-search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search member by mobile number, name, email, district, hotel ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button className="clear-btn" onClick={() => setSearchTerm('')} title="Clear search">
              ✕
            </button>
          )}
        </div>
      </div>

      {filteredMembers.length === 0 ? (
        <div className="no-members" style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', marginTop: '1rem' }}>
          <p style={{ fontSize: '1.1rem', color: '#64748b', fontWeight: 600 }}>🔍 No members found matching "{searchTerm}".</p>
          <button
            onClick={() => setSearchTerm('')}
            style={{
              marginTop: '12px',
              padding: '8px 18px',
              borderRadius: '8px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="table-responsive-container">
          <table className="modern-data-table">
            <thead>
              <tr>
                <th>Member Name & Contact</th>
                <th>Address / District</th>
                <th>Hotel ID</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Expiry</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id} className="table-row-hover">
                <td>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{member.name || 'No Name'}</div>
                    {member.email && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {member.email}
                      </div>
                    )}
                    {(member.phoneNumber || member.phone || member.mobile) && (
                      <div style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 600, marginTop: '2px' }}>
                        📞 {member.phoneNumber || member.phone || member.mobile}
                      </div>
                    )}
                    {!member.email && !member.phoneNumber && !member.phone && !member.mobile && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>-</div>
                    )}
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: '0.82rem' }}>
                    {[member.address, member.district].filter(Boolean).join(', ') || '-'}
                  </span>
                </td>
                <td>{member.hotelId || '-'}</td>
                <td>
                  <span className="badge-light">{member.subscriptionPlan || 'Default'}</span>
                </td>
                <td>₹{member.subscriptionAmount || 0}</td>
                <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {member.subscriptionExpiry ? new Date(member.subscriptionExpiry).toLocaleDateString() : '-'}
                </td>
                <td>
                  <span className={`status-pill ${member.hasActiveSubscription ? 'status-open' : 'status-closed'}`}>
                    {member.hasActiveSubscription ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="table-action-btns">
                    <button
                      className="table-action-btn edit-btn"
                      onClick={() => handleEdit(member)}
                      disabled={!!actionLoading}
                      title="Edit Member"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      className="table-action-btn delete-btn"
                      onClick={() => setShowDeleteModal(member.id)}
                      disabled={!!actionLoading}
                      title="Delete Member"
                    >
                      <FaTrashAlt /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {/* Edit Modal */}
      {editingMember && (
        <div className="modal-backdrop-overlay" onClick={handleCancelEdit}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FaEdit style={{ color: '#2563eb', marginRight: '8px' }} /> Edit Member</h3>
              <button className="modal-close-icon" onClick={handleCancelEdit}>
                <FaTimes />
              </button>
            </div>

            <div className="modal-form">
              <div className="modal-form-grid">
                <div className="form-field-group">
                  <label>Name:</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                  />
                </div>

                <div className="form-field-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => handleFormChange('email', e.target.value)}
                  />
                </div>

                <div className="form-field-group">
                  <label>Phone:</label>
                  <input
                    type="text"
                    value={editForm.phoneNumber}
                    onChange={(e) => handleFormChange('phoneNumber', e.target.value)}
                  />
                </div>

                <div className="form-field-group">
                  <label>District:</label>
                  <input
                    type="text"
                    value={editForm.district}
                    onChange={(e) => handleFormChange('district', e.target.value)}
                  />
                </div>

                <div className="form-field-group">
                  <label>Address:</label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => handleFormChange('address', e.target.value)}
                  />
                </div>

                <div className="form-field-group">
                  <label>Hotel ID:</label>
                  <input
                    type="text"
                    value={editForm.hotelId}
                    onChange={(e) => handleFormChange('hotelId', e.target.value)}
                  />
                </div>

                <div className="form-field-group">
                  <label>Subscription Amount (₹):</label>
                  <input
                    type="number"
                    value={editForm.subscriptionAmount}
                    onChange={(e) => handleFormChange('subscriptionAmount', e.target.value)}
                  />
                </div>

                <div className="form-field-group">
                  <label>Subscription Plan:</label>
                  <input
                    type="text"
                    value={editForm.subscriptionPlan}
                    onChange={(e) => handleFormChange('subscriptionPlan', e.target.value)}
                  />
                </div>

                <div className="form-field-group full-width" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="hasActiveSubCheck"
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    checked={editForm.hasActiveSubscription}
                    onChange={(e) => handleFormChange('hasActiveSubscription', e.target.checked)}
                  />
                  <label htmlFor="hasActiveSubCheck" style={{ cursor: 'pointer', margin: 0 }}>
                    Active Subscription
                  </label>
                </div>
              </div>

              <div className="modal-footer-actions">
                <button 
                  className="btn-secondary"
                  onClick={handleCancelEdit}
                  disabled={actionLoading === 'saving'}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary"
                  onClick={handleSaveEdit}
                  disabled={actionLoading === 'saving'}
                >
                  {actionLoading === 'saving' ? 'Saving...' : <><FaSave /> Save Member</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-backdrop-overlay" onClick={() => setShowDeleteModal(null)}>
          <div className="modal-content-card" style={{ maxWidth: '420px', padding: '1.5rem' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 10px 0', color: '#ef4444' }}><FaTrashAlt /> Delete Member</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Are you sure you want to delete this member? This action cannot be undone.
            </p>
            <div className="modal-footer-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowDeleteModal(null)}
                disabled={actionLoading === 'deleting'}
              >
                Cancel
              </button>
              <button 
                className="table-action-btn delete-btn"
                style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
                onClick={() => handleDelete(showDeleteModal)}
                disabled={actionLoading === 'deleting'}
              >
                {actionLoading === 'deleting' ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllMembers;
