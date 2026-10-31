import React, { useState, useEffect, useMemo } from 'react';
import { db } from './firebase';
import { ref, get, query, orderByChild, equalTo, update, remove } from 'firebase/database';
import {
  FaUser,
  FaFilePdf,
  FaSearch,
  FaEdit,
  FaTrashAlt,
  FaEye,
  FaTimes,
  FaSave,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaBriefcase,
  FaGraduationCap
} from 'react-icons/fa';
import './Seekers.css';

const Seekers = ({ onSeekerClick }) => {
  const [seekers, setSeekers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, withResume, fresher

  // Editing state
  const [editingSeeker, setEditingSeeker] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    district: '',
    designation: '',
    experience: '',
    skills: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSeekers();
  }, []);

  const fetchSeekers = () => {
    const seekersRef = query(
      ref(db, 'EliteJobs/users'),
      orderByChild('role'),
      equalTo('seeker')
    );

    get(seekersRef)
      .then((snapshot) => {
        const data = snapshot.val() || {};
        const seekersArray = Object.entries(data).map(([id, user]) => ({
          id,
          ...user,
        }));
        setSeekers(seekersArray);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Seekers error:', error);
        setError('Failed to load seekers: ' + error.message);
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

  const getInitials = (name) => {
    if (!name) return 'JS';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarGradient = (name = '') => {
    const gradients = [
      'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
      'linear-gradient(135deg, #10b981 0%, #047857 100%)',
      'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return gradients[Math.abs(hash) % gradients.length];
  };

  const formatSkills = (skills) => {
    if (!skills) return [];
    if (Array.isArray(skills)) return skills;
    if (typeof skills === 'string') {
      return skills.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [];
  };

  // Delete Seeker
  const handleDelete = async (e, seekerId, seekerName) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete candidate "${seekerName || 'this seeker'}"? This action cannot be undone.`)) {
      try {
        await remove(ref(db, `EliteJobs/users/${seekerId}`));
        setSeekers((prev) => prev.filter((s) => s.id !== seekerId));
      } catch (err) {
        alert('Failed to delete seeker: ' + err.message);
      }
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (e, seeker) => {
    e.stopPropagation();
    setEditingSeeker(seeker);
    const skillsVal = Array.isArray(seeker.skills)
      ? seeker.skills.join(', ')
      : seeker.skills || '';

    setEditFormData({
      name: seeker.name || '',
      email: seeker.email || '',
      phone: seeker.phone || '',
      district: seeker.district || '',
      designation: seeker.designation || '',
      experience: seeker.experience || '',
      skills: skillsVal
    });
  };

  // Save Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingSeeker) return;
    setSaving(true);
    try {
      const skillsArray = editFormData.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const updatedFields = {
        name: editFormData.name,
        email: editFormData.email,
        phone: editFormData.phone,
        district: editFormData.district,
        designation: editFormData.designation,
        experience: editFormData.experience,
        skills: skillsArray,
        lastUpdated: new Date().toISOString()
      };

      await update(ref(db, `EliteJobs/users/${editingSeeker.id}`), updatedFields);

      setSeekers((prev) =>
        prev.map((s) => (s.id === editingSeeker.id ? { ...s, ...updatedFields } : s))
      );
      setEditingSeeker(null);
    } catch (err) {
      alert('Error updating candidate: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Filtered list
  const filteredSeekers = useMemo(() => {
    return seekers.filter((seeker) => {
      const name = (seeker.name || '').toLowerCase();
      const designation = (seeker.designation || '').toLowerCase();
      const district = (seeker.district || '').toLowerCase();
      const email = (seeker.email || '').toLowerCase();
      const skillsStr = Array.isArray(seeker.skills)
        ? seeker.skills.join(' ').toLowerCase()
        : (seeker.skills || '').toLowerCase();
      const query = searchTerm.toLowerCase().trim();

      const phoneRaw = String(seeker.phone || seeker.mobile || seeker.phoneNumber || seeker.contactNumber || '');
      const phoneDigits = phoneRaw.replace(/\D/g, '');
      const queryDigits = query.replace(/\D/g, '');
      const matchesPhone = phoneRaw.toLowerCase().includes(query) || (queryDigits.length >= 3 && phoneDigits.includes(queryDigits));

      const matchesSearch =
        !searchTerm ||
        name.includes(query) ||
        designation.includes(query) ||
        district.includes(query) ||
        skillsStr.includes(query) ||
        email.includes(query) ||
        matchesPhone;

      if (!matchesSearch) return false;

      if (filterType === 'withResume') return Boolean(seeker.resumeUrl);
      if (filterType === 'fresher') {
        const exp = (seeker.experience || '').toLowerCase();
        return exp.includes('fresher') || exp === '0' || exp === '0 years' || exp === '';
      }
      return true;
    });
  }, [seekers, searchTerm, filterType]);

  const resumeCount = useMemo(() => seekers.filter((s) => s.resumeUrl).length, [seekers]);

  return (
    <div className="seekers-page animate-fade-in">
      {/* Search and Filter Mobile Bar */}
      <div className="seekers-header-controls">
        <div className="seekers-search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search candidates, mobile number, skills, location..."
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

        <div className="seekers-actions-row">
          {/* Filter Pills */}
          <div className="filter-chips-scroll">
            <button
              className={`chip ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              All ({seekers.length})
            </button>
            <button
              className={`chip ${filterType === 'withResume' ? 'active' : ''}`}
              onClick={() => setFilterType('withResume')}
            >
              📄 With Resume ({resumeCount})
            </button>
            <button
              className={`chip ${filterType === 'fresher' ? 'active' : ''}`}
              onClick={() => setFilterType('fresher')}
            >
              🎓 Freshers
            </button>
          </div>
        </div>
      </div>

      {error && <div className="seekers-error-banner">{error}</div>}

      {loading ? (
        <div className="seekers-loading-state">
          <div className="app-spinner"></div>
          <p>Loading candidate profiles...</p>
        </div>
      ) : filteredSeekers.length === 0 ? (
        <div className="seekers-empty-card">
          <div className="empty-icon-wrap">
            <FaUser className="empty-icon" />
          </div>
          <h3>No Candidates Found</h3>
          <p>Try refining your search keyword or switching filters.</p>
          {searchTerm && (
            <button className="reset-filter-btn" onClick={() => setSearchTerm('')}>
              Clear Search
            </button>
          )}
        </div>
      ) : (
        /* Native Full Table Format with Action Buttons */
        <div className="table-responsive-container">
          <table className="modern-data-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Designation</th>
                <th>Experience</th>
                <th>District / Location</th>
                <th>Skills</th>
                <th>Resume</th>
                <th>Last Active</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSeekers.map((seeker) => (
                <tr
                  key={seeker.id}
                  className="table-row-hover"
                  onClick={() => onSeekerClick && onSeekerClick(seeker.id)}
                >
                  <td>
                    <div className="table-candidate-cell">
                      <div
                        className="table-avatar"
                        style={{ background: getAvatarGradient(seeker.name) }}
                      >
                        {getInitials(seeker.name)}
                      </div>
                      <div>
                        <div className="table-candidate-name">{seeker.name || 'Unnamed'}</div>
                        {seeker.email && <div className="table-candidate-contact">{seeker.email}</div>}
                        {(seeker.phone || seeker.mobile || seeker.phoneNumber || seeker.contactNumber) && (
                          <div style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 600, marginTop: '2px' }}>
                            📞 {seeker.phone || seeker.mobile || seeker.phoneNumber || seeker.contactNumber}
                          </div>
                        )}
                        {!seeker.email && !seeker.phone && !seeker.mobile && !seeker.phoneNumber && !seeker.contactNumber && (
                          <div className="table-candidate-contact">No contact</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge-light">{seeker.designation || 'Job Seeker'}</span>
                  </td>
                  <td>{seeker.experience || 'Fresher'}</td>
                  <td>{seeker.district || seeker.location || 'N/A'}</td>
                  <td>
                    <div className="table-skills-snippet">
                      {formatSkills(seeker.skills).slice(0, 3).join(', ') || 'N/A'}
                    </div>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    {seeker.resumeUrl ? (
                      <a
                        href={seeker.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="table-resume-link"
                      >
                        <FaFilePdf /> View PDF
                      </a>
                    ) : (
                      <span className="text-muted-sm">None</span>
                    )}
                  </td>
                  <td>
                    <span className="text-muted-sm">{formatTimestamp(seeker.lastActive)}</span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="table-action-btns">
                      <button
                        className="table-action-btn view-btn"
                        onClick={() => onSeekerClick && onSeekerClick(seeker.id)}
                        title="View Full Profile"
                      >
                        <FaEye /> View
                      </button>
                      <button
                        className="table-action-btn edit-btn"
                        onClick={(e) => handleOpenEdit(e, seeker)}
                        title="Edit Candidate"
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        className="table-action-btn delete-btn"
                        onClick={(e) => handleDelete(e, seeker.id, seeker.name)}
                        title="Delete Candidate"
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

      {/* Edit Seeker Modal Dialog */}
      {editingSeeker && (
        <div className="modal-backdrop-overlay" onClick={() => setEditingSeeker(null)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FaEdit style={{ color: '#2563eb', marginRight: '8px' }} /> Edit Candidate Profile</h3>
              <button className="modal-close-icon" onClick={() => setEditingSeeker(null)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="modal-form">
              <div className="modal-form-grid">
                <div className="form-field-group">
                  <label><FaUser /> Candidate Full Name</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  />
                </div>

                <div className="form-field-group">
                  <label><FaBriefcase /> Designation / Role</label>
                  <input
                    type="text"
                    value={editFormData.designation}
                    onChange={(e) => setEditFormData({ ...editFormData, designation: e.target.value })}
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
                  <label><FaMapMarkerAlt /> District / City</label>
                  <input
                    type="text"
                    value={editFormData.district}
                    onChange={(e) => setEditFormData({ ...editFormData, district: e.target.value })}
                  />
                </div>

                <div className="form-field-group">
                  <label><FaGraduationCap /> Experience</label>
                  <input
                    type="text"
                    placeholder="e.g. 2 Years / Fresher"
                    value={editFormData.experience}
                    onChange={(e) => setEditFormData({ ...editFormData, experience: e.target.value })}
                  />
                </div>

                <div className="form-field-group full-width">
                  <label>Skills (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. React, Node.js, Chef, Driver"
                    value={editFormData.skills}
                    onChange={(e) => setEditFormData({ ...editFormData, skills: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditingSeeker(null)}
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

export default Seekers;
