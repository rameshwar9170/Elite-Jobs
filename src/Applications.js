import React, { useEffect, useState } from "react";
import { getDatabase, ref, get, update, remove } from "firebase/database";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaEdit,
  FaTrashAlt,
  FaTimes,
  FaSave,
  FaFilePdf
} from "react-icons/fa";

const Applications = () => {
  const { id: providerId } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit status modal state
  const [editingApp, setEditingApp] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("Pending");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerId]);

  const fetchApplications = async () => {
    try {
      const db = getDatabase();
      const appsSnap = await get(ref(db, 'applications'));
      const appsData = appsSnap.val();
      const filtered = [];

      if (appsData) {
        for (const appId in appsData) {
          const app = appsData[appId];

          if (app.providerId === providerId) {
            const seekerSnap = await get(ref(db, `EliteJobs/users/${app.seekerId}`));
            const seekerData = seekerSnap.exists() ? seekerSnap.val() : {};

            filtered.push({
              id: appId,
              ...app,
              seekerInfo: seekerData,
            });
          }
        }
      }

      setApplications(filtered);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching applications:", error);
      setLoading(false);
    }
  };

  const handleOpenEdit = (app) => {
    setEditingApp(app);
    setSelectedStatus(app.status || "Pending");
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!editingApp) return;
    setSaving(true);
    try {
      const db = getDatabase();
      await update(ref(db, `applications/${editingApp.id}`), {
        status: selectedStatus,
        lastUpdated: new Date().toISOString()
      });

      setApplications((prev) =>
        prev.map((a) => (a.id === editingApp.id ? { ...a, status: selectedStatus } : a))
      );
      setEditingApp(null);
    } catch (err) {
      alert("Error updating application status: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (appId, seekerName) => {
    if (window.confirm(`Are you sure you want to delete application from "${seekerName || 'this candidate'}"?`)) {
      try {
        const db = getDatabase();
        await remove(ref(db, `applications/${appId}`));
        setApplications((prev) => prev.filter((a) => a.id !== appId));
      } catch (err) {
        alert("Failed to delete application: " + err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="table-responsive-container" style={{ padding: '3rem', textAlign: 'center', margin: '2rem auto', maxWidth: '1000px' }}>
        <p>Loading candidate applications...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1300px', margin: '20px auto', padding: '0 15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <FaArrowLeft /> Back to Providers
        </button>

        <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a' }}>
          Job Applications Received ({applications.length})
        </h2>
      </div>

      {applications.length === 0 ? (
        <div className="seekers-empty-card" style={{ background: '#fff', borderRadius: '12px', padding: '3rem', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
          <p style={{ color: '#64748b', fontSize: '1.05rem', margin: 0 }}>No applications found for this provider's posted jobs.</p>
        </div>
      ) : (
        <div className="table-responsive-container">
          <table className="modern-data-table">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Company</th>
                <th>Status</th>
                <th>Applied Date</th>
                <th>Candidate Name</th>
                <th>Contact</th>
                <th>District</th>
                <th>Experience</th>
                <th>Skills</th>
                <th>Resume</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} className="table-row-hover">
                  <td style={{ fontWeight: 700 }}>{app.jobTitle || 'N/A'}</td>
                  <td>{app.companyName || 'N/A'}</td>
                  <td>
                    <span className={`status-pill ${
                      app.status === 'Accepted' || app.status === 'Shortlisted'
                        ? 'status-open'
                        : app.status === 'Rejected'
                        ? 'status-closed'
                        : 'status-pending'
                    }`}>
                      {app.status || 'Pending'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ fontWeight: 600 }}>{app.seekerInfo?.name || 'N/A'}</td>
                  <td>
                    <div style={{ fontSize: '0.8rem' }}>{app.seekerInfo?.phone || '-'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{app.seekerInfo?.email || '-'}</div>
                  </td>
                  <td>{app.seekerInfo?.district || '-'}</td>
                  <td>{app.seekerInfo?.experience || 'Fresher'}</td>
                  <td>
                    <span style={{ fontSize: '0.8rem', maxWidth: '140px', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {app.seekerInfo?.skills || '-'}
                    </span>
                  </td>
                  <td>
                    {app.seekerInfo?.resumeUrl ? (
                      <a
                        href={app.seekerInfo.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#2563eb', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                      >
                        <FaFilePdf /> View
                      </a>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>None</span>
                    )}
                  </td>
                  <td>
                    <div className="table-action-btns">
                      <button
                        className="table-action-btn edit-btn"
                        onClick={() => handleOpenEdit(app)}
                        title="Update Status"
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        className="table-action-btn delete-btn"
                        onClick={() => handleDelete(app.id, app.seekerInfo?.name)}
                        title="Delete Application"
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

      {/* Edit Status Modal */}
      {editingApp && (
        <div className="modal-backdrop-overlay" onClick={() => setEditingApp(null)}>
          <div className="modal-content-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FaEdit style={{ color: '#2563eb', marginRight: '8px' }} /> Update Application Status</h3>
              <button className="modal-close-icon" onClick={() => setEditingApp(null)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSaveStatus} className="modal-form">
              <div style={{ fontSize: '0.9rem', color: '#475569' }}>
                <p style={{ margin: '0 0 4px 0' }}><strong>Candidate:</strong> {editingApp.seekerInfo?.name || 'N/A'}</p>
                <p style={{ margin: 0 }}><strong>Applied For:</strong> {editingApp.jobTitle}</p>
              </div>

              <div className="form-field-group">
                <label>Application Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Reviewed">Reviewed</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="modal-footer-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditingApp(null)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Updating...' : <><FaSave /> Save Status</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;
