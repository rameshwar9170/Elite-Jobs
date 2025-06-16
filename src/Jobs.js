import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { ref, get, update, remove } from 'firebase/database';
import {
  FaBriefcase, FaMapMarkerAlt, FaBuilding, FaMoneyBillWave,
  FaClock, FaList, FaUserTie, FaEdit, FaTrash, FaSave, FaTimes
} from 'react-icons/fa';
import './Jobs.css';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');
  const [editingJobId, setEditingJobId] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const snapshot = await get(ref(db, 'jobs'));
        const data = snapshot.val() || {};
        const jobsArray = Object.entries(data).map(([id, job]) => ({
          id,
          ...job,
        }));
        setJobs(jobsArray);
      } catch (err) {
        setError('Failed to load jobs: ' + err.message);
      }
    };

    fetchJobs();
  }, []);

  const statusClass = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'open': return 'status-open';
      case 'closed': return 'status-closed';
      case 'pending': return 'status-pending';
      default: return 'status-default';
    }
  };

  const handleDelete = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await remove(ref(db, `jobs/${jobId}`));
        setJobs(jobs.filter(job => job.id !== jobId));
        alert('Job deleted successfully.');
      } catch (err) {
        alert('Delete failed: ' + err.message);
      }
    }
  };

  const handleEdit = (job) => {
    setEditingJobId(job.id);
    setFormData(job);
  };

  const handleCancel = () => {
    setEditingJobId(null);
    setFormData({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      await update(ref(db, `jobs/${editingJobId}`), formData);
      setJobs(jobs.map(job => (job.id === editingJobId ? { ...formData, id: editingJobId } : job)));
      alert('Job updated successfully.');
      setEditingJobId(null);
      setFormData({});
    } catch (err) {
      alert('Update failed: ' + err.message);
    }
  };

  return (
    <div className="jobs-container">
      {error && <p className="jobs-error">{error}</p>}
      {jobs.length > 0 ? (
        <div className="jobs-grid">
          {jobs.map((job) => (
            <div key={job.id} className="job-card">
              {editingJobId === job.id ? (
             <div className="job-form">
  <div className="form-group">
    <label>Job Title</label>
    <input name="title" value={formData.title || ''} onChange={handleChange} />
  </div>

  <div className="form-group">
    <label>Company</label>
    <input name="company" value={formData.company || ''} onChange={handleChange} />
  </div>

  <div className="form-group">
    <label>Location</label>
    <input name="location" value={formData.location || ''} onChange={handleChange} />
  </div>

  <div className="form-group">
    <label>Salary</label>
    <input name="salary" value={formData.salary || ''} onChange={handleChange} />
  </div>

  <div className="form-group">
    <label>Type (e.g., Full-time)</label>
    <input name="type" value={formData.type || ''} onChange={handleChange} />
  </div>

  <div className="form-group">
    <label>Work Days</label>
    <input name="workDay" value={formData.workDay || ''} onChange={handleChange} />
  </div>

  <div className="form-group">
    <label>Skills</label>
    <input name="skills" value={formData.skills || ''} onChange={handleChange} />
  </div>

  <div className="form-group">
    <label>Experience</label>
    <input name="experience" value={formData.experience || ''} onChange={handleChange} />
  </div>

  <div className="form-group">
    <label>Status</label>
    <select name="status" value={formData.status || ''} onChange={handleChange}>
      <option value="">-- Select Status --</option>
      <option value="Open">Open</option>
      <option value="Closed">Closed</option>
      <option value="Pending">Pending</option>
    </select>
  </div>

  <div className="form-group">
    <label>Description</label>
    <textarea name="description" value={formData.description || ''} onChange={handleChange} rows="3" />
  </div>

  <div className="job-actions">
    <button onClick={handleUpdate} className="update-button"><FaSave /> Save</button>
    <button onClick={handleCancel} className="cancel-button"><FaTimes /> Cancel</button>
  </div>
</div>

              ) : (
                <>
                  <div className="job-header">
                    <h4><FaBriefcase /> {job.title}</h4>
                    <p><FaBuilding /> {job.company}</p>
                  </div>
                  <div className="job-body">
                    <p><FaMapMarkerAlt /> {job.location}</p>
                    <p><FaMoneyBillWave /> ₹ {job.salary}</p>
                    <p><FaClock /> {job.type} | {job.workDay}</p>
                    <p><FaList /> Skills: {job.skills}</p>
                    <p><FaUserTie /> Experience: {job.experience}</p>
                  </div>
                  <div className="job-footer">
                    <p className="job-description">{job.description}</p>
                    <span className={`job-status ${statusClass(job.status)}`}>{job.status}</span>
                  </div>
                  <div className="job-actions">
                    <button onClick={() => handleEdit(job)} className="edit-button"><FaEdit /> Edit</button>
                    <button onClick={() => handleDelete(job.id)} className="delete-button"><FaTrash /> Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="jobs-empty">No jobs available in the database.</p>
      )}
    </div>
  );
};

export default Jobs;
