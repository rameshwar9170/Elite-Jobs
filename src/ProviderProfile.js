import React, { useEffect, useState } from 'react';
import { ref, get, remove, update } from 'firebase/database';
import { db } from './firebase';
import './SeekerProfile.css'; // Reusing the styling

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
          setFormData(data); // Pre-fill form data
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = () => {
    update(ref(db, `EliteJobs/users/${id}`), formData)
      .then(() => {
        alert('Profile updated successfully');
        setProvider(formData);
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

        {editing ? (
          <div className="profile-form">
            {/* Editable Fields */}
            {[
              'name', 'email', 'phone', 'district',
              'companyName', 'industry', 'location', 'role'
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

            {/* Online Status Dropdown */}
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

            {/* Profile Visibility Dropdown */}
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
              <p><strong>Online:</strong> {provider.isOnline ? 'Online' : 'Offline'}</p>
              <p><strong>Last Active:</strong> {new Date(provider.lastActive).toLocaleString()}</p>
              <p><strong>Profile Visibility:</strong> {provider.profileVisibility}</p>
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
