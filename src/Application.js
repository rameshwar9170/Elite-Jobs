import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { useNavigate } from 'react-router-dom'; // ✅ import useNavigate
import './Application.css';

const Application = () => {
  const [providers, setProviders] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate(); // ✅ initialize navigate

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
      .catch((error) =>
        setError('Failed to load providers: ' + error.message)
      );
  }, []);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // ✅ Handler to go to applications page
  const handleProviderClick = (providerId) => {
    navigate(`/Applications/${providerId}`);
  };

  return (
    <div className="providers-container">
      <h2 className="section-title">Registered Providers</h2>
      {error && <p className="providers-error">{error}</p>}

      {providers.length > 0 ? (
        <div className="providers-grid">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="provider-card"
              onClick={() => handleProviderClick(provider.id)} // ✅ Use navigate
            >
              <h3>{provider.name || 'Unnamed'}</h3>
              <p><strong>Email:</strong> {provider.email || 'N/A'}</p>
              <p><strong>Phone:</strong> {provider.phone || 'N/A'}</p>
              <p><strong>Last Active:</strong> {formatTimestamp(provider.lastActive)}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="providers-empty">No providers found.</p>
      )}
    </div>
  );
};

export default Application;
