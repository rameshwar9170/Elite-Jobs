import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import './Seekers.css'; // <-- Create this file for styles

const Seekers = () => {
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
              </tr>
            </thead>
            <tbody>
              {seekers.map((seeker) => (
                <tr key={seeker.id}>
                  <td>{seeker.name}</td>
                  <td>{seeker.email}</td>
                  <td>{seeker.phone}</td>
                  <td>{seeker.district}</td>
                  <td>{seeker.designation}</td>
                  <td>{seeker.experience}</td>
                  <td>{seeker.skills?.join(', ')}</td>
                  <td>
                    <a href={seeker.resumeUrl} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </td>
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
