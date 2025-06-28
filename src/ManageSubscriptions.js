import React, { useEffect, useState } from 'react';
import { getDatabase, ref, get, update } from 'firebase/database';

const ManageSubscriptions = () => {
  const [plans, setPlans] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const db = getDatabase();
    const plansRef = ref(db, 'EliteJobs/subscriptionPlans');

    get(plansRef)
      .then(snapshot => {
        if (snapshot.exists()) {
          setPlans(snapshot.val());
        } else {
          setError('No subscription plans found.');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load plans.');
        setLoading(false);
      });
  }, []);

  const handleInputChange = (planType, field, value) => {
    setPlans(prev => ({
      ...prev,
      [planType]: {
        ...prev[planType],
        [field]: value,
      },
    }));
  };

  const handleSave = (planType) => {
    const db = getDatabase();
    const planRef = ref(db, `EliteJobs/subscriptionPlans/${planType}`);
    const { price, duration } = plans[planType];

    if (price <= 0 || duration <= 0) {
      alert("Price and duration must be greater than 0");
      return;
    }

    setUpdating(true);
    update(planRef, {
      price: parseInt(price),
      duration: parseInt(duration),
    })
      .then(() => {
        alert(`${planType} plan updated successfully.`);
      })
      .catch((err) => {
        console.error(err);
        alert('Failed to update plan.');
      })
      .finally(() => setUpdating(false));
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📦 Manage Subscription Plans</h2>
      {loading ? (
        <p style={styles.loading}>Loading...</p>
      ) : error ? (
        <p style={styles.error}>{error}</p>
      ) : (
        Object.keys(plans).map((planType) => (
          <div key={planType} style={styles.card}>
            <h3 style={styles.cardTitle}>{planType} Plan</h3>

            <div style={styles.formGroup}>
              <label style={styles.label}>Price (₹)</label>
              <input
                type="number"
                value={plans[planType].price}
                onChange={(e) => handleInputChange(planType, 'price', e.target.value)}
                min="1"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Duration (months)</label>
              <input
                type="number"
                value={plans[planType].duration}
                onChange={(e) => handleInputChange(planType, 'duration', e.target.value)}
                min="1"
                style={styles.input}
              />
            </div>

            <button
              onClick={() => handleSave(planType)}
              disabled={updating}
              style={styles.button}
            >
              {updating ? 'Saving...' : '💾 Save Changes'}
            </button>
          </div>
        ))
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '700px',
    margin: '40px auto',
    padding: '20px',
    fontFamily: '"Segoe UI", sans-serif',
    backgroundColor: '#f5f9fc',
  },
  title: {
    fontSize: '26px',
    color: '#1d3557',
    marginBottom: '30px',
    borderBottom: '2px solid #457b9d',
    paddingBottom: '10px',
  },
  loading: {
    fontSize: '18px',
    color: '#888',
  },
  error: {
    color: 'red',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    marginBottom: '25px',
    borderLeft: '6px solid #2196f3',
    transition: 'transform 0.2s',
  },
  cardTitle: {
    fontSize: '20px',
    marginBottom: '16px',
    color: '#333',
  },
  formGroup: {
    marginBottom: '14px',
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontWeight: '600',
    color: '#444',
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '16px',
    outline: 'none',
  },
  button: {
    marginTop: '10px',
    padding: '10px 20px',
    backgroundColor: '#1976d2',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '16px',
    transition: 'background 0.3s',
  },
};

export default ManageSubscriptions;
