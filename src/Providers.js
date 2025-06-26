import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import './Providers.css';

const Providers = ({ onProviderClick, onAddJobClick }) => {
  const [providers, setProviders] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const providersRef = query(
      ref(db, 'EliteJobs/users'),
      orderByChild('role'),
      equalTo('provider')
    );

    get(providersRef)
      .then((snapshot) => {
        const data = snapshot.val() || {};
        const providersArray = Object.entries(data).map(([id, user]) => ({
          id,
          ...user,
        }));
        setProviders(providersArray);
      })
      .catch((error) => setError('Failed to load providers: ' + error.message));
  }, []);

  return (
    <div className="providers-container">
      {error && <p className="providers-error">{error}</p>}

      {providers.length > 0 ? (
        <div className="providers-table-container">
          <table className="providers-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>District</th>
                <th>Company Name</th>
                <th>Industry</th>
                <th style={{ width: '150px' }}>Location</th> {/* Fixed Width */}
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((provider) => (
                <tr key={provider.id}>
                  <td onClick={() => onProviderClick(provider.id)}>{provider.name || '-'}</td>
                  <td onClick={() => onProviderClick(provider.id)}>{provider.email || '-'}</td>
                  <td onClick={() => onProviderClick(provider.id)}>{provider.phone || '-'}</td>
                  <td onClick={() => onProviderClick(provider.id)}>{provider.district || '-'}</td>
                  <td onClick={() => onProviderClick(provider.id)}>{provider.companyName || '-'}</td>
                  <td onClick={() => onProviderClick(provider.id)}>{provider.industry || '-'}</td>
                  <td onClick={() => onProviderClick(provider.id)}>{provider.location || '-'}</td>
                  <td>
                    <button
                      className="add-job-button"
                      onClick={() => onAddJobClick(provider.id)}
                    >
                      Add Job
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="providers-empty">No providers found.</p>
      )}
    </div>
  );
};

export default Providers;
