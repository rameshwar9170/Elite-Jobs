import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { ref, get } from 'firebase/database';
import { FaBriefcase, FaMapMarkerAlt, FaBuilding, FaMoneyBillWave, FaClock, FaList, FaUserTie } from 'react-icons/fa';
import './Jobs.css';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');

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

  // Dynamic status color class
  const statusClass = (status) => {
    switch (status.toLowerCase()) {
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

  return (
    <div className="jobs-container">
      {error && <p className="jobs-error">{error}</p>}
      {jobs.length > 0 ? (
        <div className="jobs-grid">
          {jobs.map((job) => (
            <div key={job.id} className="job-card">
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
