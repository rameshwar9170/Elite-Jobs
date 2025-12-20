import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import './Seekers.css';

const Seekers = ({ onSeekerClick }) => {
  const [seekers, setSeekers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
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
      })
      .catch((error) => {
        console.error('Seekers error:', error);
        setError('Failed to load seekers: ' + error.message);
      });
  }, []);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString(); // Shows both date and time
  };

  // Fix for skills formatting
  const formatSkills = (skills) => {
    if (!skills) return 'N/A';
    if (Array.isArray(skills)) return skills.join(', ');
    if (typeof skills === 'string') return skills;
    return 'N/A';
  };

  return (
    <div className="seekers-container">
      {error && <p className="seekers-error">{error}</p>}
      {seekers.length > 0 ? (
        <div className="seekers-table-container">
          <table className="seekers-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>District</th>
                <th>Designation</th>
                <th>Experience</th>
                <th>Skills</th>
                <th>Resume</th>
                <th>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {seekers.map((seeker) => (
                <tr key={seeker.id} className="clickable-row" onClick={() => onSeekerClick(seeker.id)}>
                  <td>{seeker.name || 'N/A'}</td>
                  <td>{seeker.email || 'N/A'}</td>
                  <td>{seeker.phone || 'N/A'}</td>
                  <td>{seeker.district || 'N/A'}</td>
                  <td>{seeker.designation || 'N/A'}</td>
                  <td>{seeker.experience || 'N/A'}</td>
                  <td>{formatSkills(seeker.skills)}</td>
                  <td>
                    {seeker.resumeUrl ? (
                      <a href={seeker.resumeUrl} target="_blank" rel="noopener noreferrer">
                        View
                      </a>
                    ) : (
                      'No Resume'
                    )}
                  </td>
                  <td>{formatTimestamp(seeker.lastActive)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="seekers-empty">No seekers found.</p>
      )}
    </div>
  );
};

export default Seekers;
