import React, { useEffect, useState } from 'react';
import { ref, get, remove, update } from 'firebase/database';
import { db } from './firebase';
import './SeekerProfile.css';

const ProviderProfile = ({ id, onBack }) => {
  const [provider, setProvider] = useState(null);
  const [formData, setFormData] = useState({});
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setError('Invalid provider ID');
      return;
    }

    const providerRef = ref(db, `EliteJobs/users/${id}`);
    get(providerRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setProvider(data);
          setFormData(data);
        } else {
          setError('Provider not found');
        }
      })
      .catch((err) => setError('Failed to load provider: ' + err.message));
  }, [id]);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this provider?')) {
      remove(ref(db, `EliteJobs/users/${id}`))
        .then(() => alert('Deleted successfully'))
        .catch((err) => alert('Delete failed: ' + err.message));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };

    if (name === 'subscriptionType') {
      if (value === 'Basic') {
        updated.subscriptionPrice = 3999;
        updated.subscriptionDuration = '6 months';
        updated.expiryDate = new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString();
      } else if (value === 'Elite') {
        updated.subscriptionPrice = 6999;
        updated.subscriptionDuration = '12 months';
        updated.expiryDate = new Date(new Date().setMonth(new Date().getMonth() + 12)).toISOString();
      } else {
        updated.subscriptionPrice = '';
        updated.subscriptionDuration = '';
        updated.expiryDate = '';
      }
    }

    setFormData(updated);
  };

  const handleUpdate = () => {
    const updateData = { ...formData };
    update(ref(db, `EliteJobs/users/${id}`), updateData)
      .then(() => {
        alert('Profile updated successfully');
        setProvider(updateData);
        setEditing(false);
      })
      .catch((err) => alert('Update failed: ' + err.message));
  };

  if (error) return <p className="profile-error">{error}</p>;
  if (!provider) return <p className="profile-loading">Loading...</p>;

  return (
    <div className="profile-container">
      <button onClick={onBack} className="profile-back-button">← Back</button>
      <div className="profile-card">
        <h2 className="profile-name">{provider.name}</h2>
        {provider.companyLogoUrl && (
          <img
            src={`https://firebasestorage.googleapis.com/v0/b/<your-firebase-project-id>.appspot.com/o/${encodeURIComponent(provider.companyLogoUrl)}?alt=media`}
            alt="Company Logo"
            className="profile-image"
          />
        )}

        {editing ? (
          <div className="profile-form">
            {[
              'name', 'email', 'phone', 'district',
              'companyName', 'industry', 'location', 'role', 'paymentId'
            ].map((field) => (
              <div className="form-group" key={field}>
                <label>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
                <input
                  type="text"
                  name={field}
                  value={formData[field] || ''}
                  onChange={handleChange}
                />
              </div>
            ))}

            <div className="form-group">
              <label>Online:</label>
              <select
                name="isOnline"
                value={formData.isOnline ? 'true' : 'false'}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, isOnline: e.target.value === 'true' }))
                }
              >
                <option value="true">Online</option>
                <option value="false">Offline</option>
              </select>
            </div>

            <div className="form-group">
              <label>Is Active?</label>
              <select
                name="isActive"
                value={formData.isActive || 'Yes'}
                onChange={handleChange}
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div className="form-group">
              <label>Profile Visibility:</label>
              <select
                name="profileVisibility"
                value={formData.profileVisibility || 'Public'}
                onChange={handleChange}
              >
                <option value="Public">Public</option>
                <option value="Private">Private</option>
              </select>
            </div>

            <div className="form-group">
              <label>Subscription Type:</label>
              <select
                name="subscriptionType"
                value={formData.subscriptionType || 'None'}
                onChange={handleChange}
              >
                <option value="None">None</option>
                <option value="Basic">Basic - ₹3999 (6 months)</option>
                <option value="Elite">Elite - ₹6999 (12 months)</option>
              </select>
            </div>

            {formData.subscriptionType !== 'None' && (
              <>
                <div className="form-group">
                  <label>Price (₹):</label>
                  <input type="number" name="subscriptionPrice" value={formData.subscriptionPrice || ''} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Duration:</label>
                  <input type="text" name="subscriptionDuration" value={formData.subscriptionDuration || ''} readOnly />
                </div>
                <div className="form-group">
                  <label>Expiry Date:</label>
                  <input type="text" value={new Date(formData.expiryDate).toLocaleString()} readOnly />
                </div>
              </>
            )}

            <div className="profile-actions">
              <button className="update-button" onClick={handleUpdate}>Save</button>
              <button className="cancel-button" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <div className="profile-info">
              <p><strong>Email:</strong> {provider.email}</p>
              <p><strong>Phone:</strong> {provider.phone}</p>
              <p><strong>District:</strong> {provider.district}</p>
              <p><strong>Company Name:</strong> {provider.companyName}</p>
              <p><strong>Industry:</strong> {provider.industry}</p>
              <p><strong>Location:</strong> {provider.location}</p>
              <p><strong>Role:</strong> {provider.role}</p>
              <p><strong>Payment ID:</strong> {provider.paymentId}</p>
              <p><strong>Online:</strong> {provider.isOnline ? 'Online' : 'Offline'}</p>
              <p><strong>Last Active:</strong> {new Date(provider.lastActive).toLocaleString()}</p>
              <p><strong>Profile Visibility:</strong> {provider.profileVisibility}</p>
              <p><strong>Is Active:</strong> {provider.isActive}</p>
              <p><strong>Subscription:</strong> {provider.subscriptionType || 'None'}</p>
              {provider.subscriptionType !== 'None' && (
                <>
                  <p><strong>Price:</strong> ₹{provider.subscriptionPrice}</p>
                  <p><strong>Duration:</strong> {provider.subscriptionDuration}</p>
                  <p><strong>Expiry Date:</strong> {new Date(provider.expiryDate).toLocaleString()}</p>
                </>
              )}
            </div>

            <div className="profile-actions">
              <button className="update-button" onClick={() => setEditing(true)}>Update</button>
              <button className="delete-button" onClick={handleDelete}>Delete</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProviderProfile;
