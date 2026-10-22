import React, { useEffect, useState, useMemo } from 'react';
import { db } from './firebase';
import { ref, get, update, remove } from 'firebase/database';
import {
  FaBriefcase,
  FaMapMarkerAlt,
  FaBuilding,
  FaMoneyBillWave,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaSearch,
} from 'react-icons/fa';
import './Jobs.css';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [editingJob, setEditingJob] = useState(null);
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
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const statusClass = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'open':
        return 'status-open';
      case 'closed':
        return 'status-closed';
      case 'pending':
        return 'status-pending';
      default:
        return 'status-default';
    }
  };

  const handleDelete = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      try {
        await remove(ref(db, `jobs/${jobId}`));
        setJobs(jobs.filter((job) => job.id !== jobId));
      } catch (err) {
        alert('Delete failed: ' + err.message);
      }
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setFormData({ ...job });
  };

  const handleCancel = () => {
    setEditingJob(null);
    setFormData({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    if (e) e.preventDefault();
    if (!editingJob) return;

    try {
      await update(ref(db, `jobs/${editingJob.id}`), formData);
      setJobs(
        jobs.map((job) => (job.id === editingJob.id ? { ...formData, id: editingJob.id } : job))
      );
      setEditingJob(null);
      setFormData({});
      alert('Job updated successfully.');
    } catch (err) {
      alert('Update failed: ' + err.message);
    }
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const title = (job.title || '').toLowerCase();
      const company = (job.company || '').toLowerCase();
      const loc = (job.location || '').toLowerCase();
      const query = searchTerm.toLowerCase();

      const matchesSearch =
        !searchTerm || title.includes(query) || company.includes(query) || loc.includes(query);

      if (!matchesSearch) return false;

      if (statusFilter !== 'All') {
        const curStatus = (job.status || 'open').toLowerCase();
        if (curStatus !== statusFilter.toLowerCase()) return false;
      }

      return true;
    });
  }, [jobs, searchTerm, statusFilter]);

  return (
    <div className="jobs-page animate-fade-in">
      {/* Header Search & Filter Bar */}
      <div className="jobs-header-controls">
        <div className="jobs-search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search job title, company name, location..."
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

        {/* Status Filters */}
        <div className="filter-chips-scroll">
          {['All', 'Open', 'Closed', 'Pending'].map((status) => {
            const count =
              status === 'All'
                ? jobs.length
                : jobs.filter((j) => (j.status || 'open').toLowerCase() === status.toLowerCase()).length;
            return (
              <button
                key={status}
                className={`chip ${statusFilter === status ? 'active' : ''}`}
                onClick={() => setStatusFilter(status)}
              >
                {status} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {error && <div className="jobs-error-banner">{error}</div>}

      {loading ? (
        <div className="jobs-loading-state">
          <div className="app-spinner"></div>
          <p>Loading active job listings...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="jobs-empty-card">
          <div className="empty-icon-wrap">
            <FaBriefcase className="empty-icon" />
          </div>
          <h3>No Jobs Found</h3>
          <p>Try searching for a different keyword or selecting a different status.</p>
          {searchTerm && (
            <button className="reset-filter-btn" onClick={() => setSearchTerm('')}>
              Clear Search
            </button>
          )}
        </div>
      ) : (
        /* Table Format */
        <div className="table-responsive-container">
          <table className="modern-data-table jobs-data-table">
            <thead>
              <tr>
                <th className="col-job-title">Job Title</th>
                <th className="col-company">Company</th>
                <th className="col-location">Location</th>
                <th className="col-salary">Salary</th>
                <th className="col-type">Type / Days</th>
                <th className="col-skills">Skills & Exp</th>
                <th className="col-status">Status</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => (
                <tr key={job.id} className="data-table-row">
                  <td className="col-job-title">
                    <div className="table-title-cell">
                      <div className="table-job-icon">
                        <FaBriefcase />
                      </div>
                      <span className="table-job-title">{job.title || 'Untitled Job'}</span>
                    </div>
                  </td>
                  <td className="col-company">
                    <span className="table-company-cell">
                      <FaBuilding className="cell-inline-icon" /> {job.company || '-'}
                    </span>
                  </td>
                  <td className="col-location">
                    {job.location ? (
                      <span className="table-location-cell">
                        <FaMapMarkerAlt className="cell-inline-icon" /> {job.location}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="col-salary">
                    {job.salary ? (
                      <span className="table-salary-tag">
                        <FaMoneyBillWave className="cell-inline-icon" /> ₹{job.salary}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="col-type">
                    <div className="table-sub-info">
                      <span>{job.type || 'Full-Time'}</span>
                      {job.workDay && <small className="text-muted-xs">• {job.workDay}</small>}
                    </div>
                  </td>
                  <td className="col-skills">
                    <div className="table-sub-info">
                      <span className="table-skills-line">{job.skills || 'General'}</span>
                      {job.experience && (
                        <small className="text-muted-xs">Exp: {job.experience}</small>
                      )}
                    </div>
                  </td>
                  <td className="col-status">
                    <span className={`status-pill ${statusClass(job.status)}`}>
                      {job.status || 'Open'}
                    </span>
                  </td>
                  <td className="col-actions">
                    <div className="table-action-btns">
                      <button
                        type="button"
                        onClick={() => handleEdit(job)}
                        className="table-action-btn edit-btn"
                        title="Edit Job"
                      >
                        <FaEdit />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(job.id)}
                        className="table-action-btn delete-btn"
                        title="Delete Job"
                      >
                        <FaTrash />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Job Modal */}
      {editingJob && (
        <div className="modal-backdrop-overlay" onClick={handleCancel}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-title">
                <FaEdit className="modal-title-icon" />
                <h3>Edit Job Posting</h3>
              </div>
              <button className="modal-close-btn" onClick={handleCancel}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="modal-form">
              <div className="form-group">
                <label>Job Title</label>
                <input
                  name="title"
                  value={formData.title || ''}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Company Name</label>
                <input
                  name="company"
                  value={formData.company || ''}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Location</label>
                  <input
                    name="location"
                    value={formData.location || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Salary (₹)</label>
                  <input
                    name="salary"
                    value={formData.salary || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Job Type</label>
                  <input
                    name="type"
                    value={formData.type || ''}
                    onChange={handleChange}
                    placeholder="e.g. Full-Time"
                  />
                </div>
                <div className="form-group">
                  <label>Work Days</label>
                  <input
                    name="workDay"
                    value={formData.workDay || ''}
                    onChange={handleChange}
                    placeholder="e.g. Mon-Sat"
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Experience Required</label>
                  <input
                    name="experience"
                    value={formData.experience || ''}
                    onChange={handleChange}
                    placeholder="e.g. 2+ Years"
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select name="status" value={formData.status || 'Open'} onChange={handleChange}>
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Skills Required</label>
                <input
                  name="skills"
                  value={formData.skills || ''}
                  onChange={handleChange}
                  placeholder="e.g. Cooking, Tandoor, Hindi"
                />
              </div>

              <div className="form-group">
                <label>Job Description</label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <div className="modal-actions-bar">
                <button type="submit" className="modal-btn submit-btn">
                  <FaSave /> Save Changes
                </button>
                <button type="button" onClick={handleCancel} className="modal-btn cancel-btn">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;

