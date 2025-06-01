import React, { useState } from 'react';
import { getDatabase, ref, push } from 'firebase/database';

const DeleteAccount = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!username.trim() || !email.trim()) {
      setError('Please fill in both username and email.');
      return;
    }

    const db = getDatabase();
    const deleteAccountRef = ref(db, 'EliteJobs/DeleteAccountData');

    push(deleteAccountRef, {
      username,
      email,
      timestamp: new Date().toISOString(),
    })
      .then(() => {
        setMessage('Your request has been submitted successfully.');
        setUsername('');
        setEmail('');
      })
      .catch((error) => {
        setError('Failed to submit request: ' + error.message);
      });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f3f4f6',
        fontFamily: "'Roboto', sans-serif",
      }}
    >
      {/* Hero Section */}
      <div
        style={{
          background: 'linear-gradient(to right, #3b82f6, #4f46e5)',
          color: '#ffffff',
          paddingTop: '4rem',
          paddingBottom: '2rem',
        }}
      >
        <div
          style={{
            maxWidth: '80rem',
            margin: '0 auto',
            padding: '0 1rem',
          }}
        >
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700' }}>
            Delete Account Request
          </h1>
          <p style={{ fontSize: '1.125rem' }}>
            Submit your details to request account deletion
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div
        style={{
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '2rem 1rem',
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            padding: '1.5rem',
          }}
        >
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1rem',
            }}
          >
            Account Deletion Form
          </h2>
          {message && (
            <p
              style={{
                color: '#22c55e',
                marginBottom: '1rem',
              }}
            >
              {message}
            </p>
          )}
          {error && (
            <p
              style={{
                color: '#ef4444',
                marginBottom: '1rem',
              }}
            >
              {error}
            </p>
          )}
          <form onSubmit={handleSubmit}>
            <div
              style={{
                marginBottom: '1rem',
              }}
            >
              <label
                htmlFor="username"
                style={{
                  display: 'block',
                  fontSize: '1rem',
                  fontWeight: '500',
                  color: '#4b5563',
                  marginBottom: '0.5rem',
                }}
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  color: '#4b5563',
                }}
                placeholder="Enter your username"
              />
            </div>
            <div
              style={{
                marginBottom: '1rem',
              }}
            >
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  fontSize: '1rem',
                  fontWeight: '500',
                  color: '#4b5563',
                  marginBottom: '0.5rem',
                }}
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  color: '#4b5563',
                }}
                placeholder="Enter your email"
              />
            </div>
            <button
              type="submit"
              style={{
                backgroundColor: '#22c55e',
                color: '#ffffff',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
                width: '100%',
                maxWidth: '200px',
                textAlign: 'center',
              }}
              onMouseOver={(e) =>
                (e.target.style.backgroundColor = '#16a34a')
              }
              onMouseOut={(e) =>
                (e.target.style.backgroundColor = '#22c55e')
              }
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccount;