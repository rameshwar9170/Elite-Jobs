import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue, update, remove } from 'firebase/database';
import './AllMembers.css';

const AllMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  const calculateTotalDiscount = (discount) => {
    if (!discount) return 0;
    return Object.values(discount).reduce((sum, d) => sum + (d.discountAmount || 0), 0);
  };

  const getDiscountCount = (discount) => {
    if (!discount) return 0;
    return Object.keys(discount).length;
  };

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
      hasActiveSubscription: member.hasActiveSubscription || false
    });
  };

  // Handle Save Edit
  const handleSaveEdit = async () => {
    if (!editingMember) return;
    
    setActionLoading('saving');
    try {
      const db = getDatabase();
      const memberRef = ref(db, `members/${editingMember}`);
      await update(memberRef, editForm);
      setEditingMember(null);
      setEditForm({});
      setActionLoading('');
    } catch (error) {
      console.error('Error updating member:', error);
      alert('Failed to update member. Please try again.');
      setActionLoading('');
    }
  };

  // Handle Cancel Edit
  const handleCancelEdit = () => {
    setEditingMember(null);
    setEditForm({});
  };

  // Handle Delete
  const handleDelete = async (memberId) => {
    setActionLoading('deleting');
    try {
      const db = getDatabase();
      const memberRef = ref(db, `members/${memberId}`);
      await remove(memberRef);
      setShowDeleteModal(null);
      setActionLoading('');
    } catch (error) {
      console.error('Error deleting member:', error);
      alert('Failed to delete member. Please try again.');
      setActionLoading('');
    }
  };

  // Handle Form Change
  const handleFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: field === 'subscriptionAmount' ? Number(value) : value
    }));
  };

  if (loading) {
    return <div className="loading">🔄 Loading members...</div>;
  }

  if (error) {
    return <div className="error">❌ {error}</div>;
  }

  if (members.length === 0) {
    return <div className="no-members">📋 No members found.</div>;
  }

  return (
    <div className="all-members-container">
      <h1 className="title">👥 All Members ({members.length})</h1>
      <div className="members-grid">
        {members.map(member => (
          <div className="member-card" key={member.id}>
            {/* Action Buttons */}
            <div className="action-buttons">
              <button 
                className="edit-btn"
                onClick={() => handleEdit(member)}
                disabled={actionLoading}
              >
                ✏️
              </button>
              <button 
                className="delete-btn"
                onClick={() => setShowDeleteModal(member.id)}
                disabled={actionLoading}
              >
                🗑️
              </button>
            </div>

            {editingMember === member.id ? (
              /* Edit Form */
              <div className="edit-form">
                <h3 className="edit-title">✏️ Edit Member</h3>
                
                <div className="form-group">
                  <label>Name:</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => handleFormChange('email', e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Phone:</label>
                  <input
                    type="text"
                    value={editForm.phoneNumber}
                    onChange={(e) => handleFormChange('phoneNumber', e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Address:</label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => handleFormChange('address', e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>District:</label>
                  <input
                    type="text"
                    value={editForm.district}
                    onChange={(e) => handleFormChange('district', e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Hotel ID:</label>
                  <input
                    type="text"
                    value={editForm.hotelId}
                    onChange={(e) => handleFormChange('hotelId', e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Subscription Amount:</label>
                  <input
                    type="number"
                    value={editForm.subscriptionAmount}
                    onChange={(e) => handleFormChange('subscriptionAmount', e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={editForm.hasActiveSubscription}
                      onChange={(e) => handleFormChange('hasActiveSubscription', e.target.checked)}
                    />
                    Active Subscription
                  </label>
                </div>

                <div className="form-actions">
                  <button 
                    className="save-btn"
                    onClick={handleSaveEdit}
                    disabled={actionLoading === 'saving'}
                  >
                    {actionLoading === 'saving' ? '⏳ Saving...' : '💾 Save'}
                  </button>
                  <button 
                    className="cancel-btn"
                    onClick={handleCancelEdit}
                    disabled={actionLoading === 'saving'}
                  >
                    ❌ Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* Display Mode */
              <>
                <div className="member-header">
                  <h3 className="member-name">{member.name || 'No Name'}</h3>
                  <span className={`status ${member.hasActiveSubscription ? 'active' : 'inactive'}`}>
                    {member.hasActiveSubscription ? '✅' : '❌'}
                  </span>
                </div>
                
                <div className="member-info">
                  <div className="info-row">
                    <span className="label">📧</span>
                    <span className="value">{member.email || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">📱</span>
                    <span className="value">{member.phoneNumber || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">📍</span>
                    <span className="value">{member.address || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">🏨</span>
                    <span className="value">{member.hotelId || 'N/A'}</span>
                  </div>
                </div>

                <div className="subscription-info">
                  <div className="section-title">💳 Subscription</div>
                  <div className="info-row">
                    <span className="label">Plan:</span>
                    <span className="value">{member.subscriptionPlan || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Amount:</span>
                    <span className="value">₹{member.subscriptionAmount || 0}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Expiry:</span>
                    <span className="value">
                      {member.subscriptionExpiry 
                        ? new Date(member.subscriptionExpiry).toLocaleDateString() 
                        : 'N/A'}
                    </span>
                  </div>
                </div>

                {member.discount && (
                  <div className="discount-info">
                    <div className="section-title">🎫 Discounts</div>
                    <div className="discount-stats">
                      <span className="stat">
                        <strong>{getDiscountCount(member.discount)}</strong> Used
                      </span>
                      <span className="stat">
                        <strong>₹{calculateTotalDiscount(member.discount)}</strong> Saved
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>🗑️ Delete Member</h3>
            <p>Are you sure you want to delete this member? This action cannot be undone.</p>
            <div className="modal-actions">
              <button 
                className="confirm-delete-btn"
                onClick={() => handleDelete(showDeleteModal)}
                disabled={actionLoading === 'deleting'}
              >
                {actionLoading === 'deleting' ? '⏳ Deleting...' : '🗑️ Delete'}
              </button>
              <button 
                className="cancel-modal-btn"
                onClick={() => setShowDeleteModal(null)}
                disabled={actionLoading === 'deleting'}
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllMembers;
