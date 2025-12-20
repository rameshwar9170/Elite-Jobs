import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from './firebase';
import { ref, get, remove, update } from 'firebase/database';
import './SeekerProfile.css';

const SeekerProfile = ({ id: propId, onBack }) => {
  const params = useParams();
  const id = propId || params.id;

  const [seeker, setSeeker] = useState(null);
  const [formData, setFormData] = useState({});
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setError('Invalid user ID');
      return;
    }

    const seekerRef = ref(db, `EliteJobs/users/${id}`);
    get(seekerRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setSeeker(data);
          setFormData(data); // pre-fill
        } else {
          setError('Seeker not found');
        }
      })
      .catch((error) => {
        setError('Failed to load seeker: ' + error.message);
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      remove(ref(db, `EliteJobs/users/${id}`))
        .then(() => {
          if (onBack) onBack();
        })
        .catch((err) => alert('Delete failed: ' + err.message));
    }
  };

  const handleSave = () => {
    update(ref(db, `EliteJobs/users/${id}`), formData)
      .then(() => {
        alert('Profile updated successfully');
        setSeeker(formData);
        setEditing(false);
      })
      .catch((err) => alert('Update failed: ' + err.message));
  };

  if (error) return <p className="profile-error">{error}</p>;
  if (!seeker) return <p className="profile-loading">Loading...</p>;

  return (
    <div className="profile-container">
      {onBack && (
        <button onClick={onBack} className="profile-back-button">← Back</button>
      )}

      <div className="profile-card">
        <h2 className="profile-name">{seeker.name}</h2>

        {editing ? (
          <div className="profile-form">
            {/* Editable Fields */}
            {[
              'name', 'email', 'phone', 'district',
              'designation', 'experience', 'skills', 'role'
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

            {/* Dropdown: Profile Visibility */}
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

            {/* Dropdown: Online Status */}
            <div className="form-group">
              <label>Online Status:</label>
              <select
                name="isOnline"
                value={formData.isOnline ? 'true' : 'false'}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isOnline: e.target.value === 'true',
                  }))
                }
              >
                <option value="true">Online</option>
                <option value="false">Offline</option>
              </select>
            </div>

            {/* Resume URL */}
            <div className="form-group">
              <label>Resume URL:</label>
              <input
                type="text"
                name="resumeUrl"
                value={formData.resumeUrl || ''}
                onChange={handleChange}
              />
            </div>

            <div className="profile-actions">
              <button className="update-button" onClick={handleSave}>Save</button>
              <button className="cancel-button" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <div className="profile-info">
              <p><strong>Email:</strong> {seeker.email}</p>
              <p><strong>Phone:</strong> {seeker.phone}</p>
              <p><strong>District:</strong> {seeker.district}</p>
              <p><strong>Designation:</strong> {seeker.designation}</p>
              <p><strong>Experience:</strong> {seeker.experience}</p>
              <p><strong>Skills:</strong> {seeker.skills?.join(', ')}</p>
              <p><strong>Profile Visibility:</strong> {seeker.profileVisibility}</p>
              <p><strong>Online Status:</strong> {seeker.isOnline ? 'Online' : 'Offline'}</p>
              <p><strong>Last Active:</strong> {new Date(seeker.lastActive).toLocaleString()}</p>
              <p><strong>Role:</strong> {seeker.role}</p>
              <p>
                <strong>Resume:</strong>{' '}
                <a href={seeker.resumeUrl} target="_blank" rel="noopener noreferrer">
                  View Resume
                </a>
              </p>
            </div>

            <div className="profile-actions">
              <button onClick={() => setEditing(true)} className="edit-button">Update</button>
              <button onClick={handleDelete} className="delete-button">Delete</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SeekerProfile;
