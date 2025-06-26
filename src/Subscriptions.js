import React, { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';
import { db } from './firebase';
import './Jobs.css'; // Reusing job card styles

const Subscriptions = () => {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogUser, setDialogUser] = useState(null);
  const [filters, setFilters] = useState({
    role: 'All',
    status: 'All',
    type: 'All',
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snapshot = await get(ref(db, 'EliteJobs/users'));
        const usersData = snapshot.val() || {};
        const allUsers = Object.values(usersData);
        setUsers(allUsers);
        setFiltered(allUsers);
      } catch (err) {
        console.error('Error fetching users:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const result = users.filter((u) => {
      const matchesRole = filters.role === 'All' || u.role === filters.role.toLowerCase();
      const matchesStatus =
        filters.status === 'All' ||
        (filters.status === 'Active' && u.subscriptionType && u.subscriptionType !== 'None') ||
        (filters.status === 'Inactive' && (!u.subscriptionType || u.subscriptionType === 'None'));
      const matchesType =
        filters.type === 'All' || (u.subscriptionType || 'None') === filters.type;

      return matchesRole && matchesStatus && matchesType;
    });

    setFiltered(result);
  }, [filters, users]);

  if (loading) return <div className="jobs-container">Loading...</div>;

  return (
    <div className="jobs-container">
      <div className="subs-header" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="jobs-title">User Subscriptions</h2>

        <div className="subs-filters" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="form-group">
            <label>Role</label>
            <select onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
              <option>All</option>
              <option>Seeker</option>
              <option>Provider</option>
            </select>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option>All</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>

          <div className="form-group">
            <label>Subscription Type</label>
            <select onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
              <option>All</option>
              <option>None</option>
              <option>Basic</option>
              <option>Premium</option>
            </select>
          </div>
        </div>
      </div>

      <div className="jobs-grid">
        {filtered.map((user, index) => (
          <div key={index} className="job-card" onClick={() => setDialogUser(user)}>
            <div className="job-header">
              <h4>{user.name || 'Unnamed'}</h4>
              <p>{user.email}</p>
            </div>

            <div className="job-body">
              <p><strong>Phone:</strong> {user.phone}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <p><strong>District:</strong> {user.district || 'N/A'}</p>
              <p><strong>Subscription:</strong> {user.subscriptionType || 'None'}</p>
              <p><strong>Expiry:</strong> {user.expiryDate ? new Date(user.expiryDate).toLocaleDateString() : 'N/A'}</p>
            </div>

            <div className="job-footer">
              <span className={`job-status ${
                user.subscriptionType === 'Premium'
                  ? 'status-open'
                  : user.subscriptionType === 'Basic'
                  ? 'status-pending'
                  : 'status-default'
              }`}>
                {user.subscriptionType || 'None'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Dialog */}
      {dialogUser && (
        <div className="subs-dialog-backdrop" onClick={() => setDialogUser(null)}>
          <div className="subs-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>{dialogUser.name}</h3>
            <p><strong>Email:</strong> {dialogUser.email}</p>
            <p><strong>Phone:</strong> {dialogUser.phone}</p>
            <p><strong>District:</strong> {dialogUser.district}</p>
            <p><strong>Role:</strong> {dialogUser.role}</p>
            <p><strong>Subscription Type:</strong> {dialogUser.subscriptionType || 'None'}</p>
            <p><strong>Duration:</strong> {dialogUser.subscriptionDuration || 'N/A'}</p>
            <p><strong>Price:</strong> ₹{dialogUser.subscriptionPrice || '0'}</p>
            <p><strong>Expiry Date:</strong> {dialogUser.expiryDate ? new Date(dialogUser.expiryDate).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Payment ID:</strong> {dialogUser.paymentId || 'N/A'}</p>

            {dialogUser.role === 'provider' && (
              <>
                <hr />
                <p><strong>Company:</strong> {dialogUser.companyName || 'N/A'}</p>
                <p><strong>Contact Person:</strong> {dialogUser.contactPerson || 'N/A'}</p>
                <p><strong>Industry:</strong> {dialogUser.industry || 'N/A'}</p>
                <p><strong>Location:</strong> {dialogUser.location || 'N/A'}</p>
              </>
            )}

            <button className="close-btn" onClick={() => setDialogUser(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
