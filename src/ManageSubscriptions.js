import React, { useEffect, useState } from 'react';
import { getDatabase, ref, get, update } from 'firebase/database';

const ManageSubscriptions = () => {
  const [allPlans, setAllPlans] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  // Define which plans are considered "new"
  const newPlanTypes = ['Staff', 'Customers', 'Both', 'Trial'];

  useEffect(() => {
    const db = getDatabase();
    const plansRef = ref(db, 'EliteJobs/subscriptionPlans');

    get(plansRef)
      .then(snapshot => {
        if (snapshot.exists()) {
          setAllPlans(snapshot.val());
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

  // Separate plans into new and existing
  const newPlans = {};
  const existingPlans = {};

  Object.keys(allPlans).forEach(planType => {
    if (newPlanTypes.includes(planType)) {
      newPlans[planType] = allPlans[planType];
    } else {
      existingPlans[planType] = allPlans[planType];
    }
  });

  const handleInputChange = (planType, field, value) => {
    setAllPlans(prev => ({
      ...prev,
      [planType]: {
        ...prev[planType],
        [field]: value,
      },
    }));
  };

  const handleFeatureChange = (planType, index, value) => {
    const updatedFeatures = [...(allPlans[planType].features || [])];
    updatedFeatures[index] = value;
    setAllPlans(prev => ({
      ...prev,
      [planType]: {
        ...prev[planType],
        features: updatedFeatures,
      },
    }));
  };

  const addFeature = (planType) => {
    const updatedFeatures = [...(allPlans[planType].features || []), ''];
    setAllPlans(prev => ({
      ...prev,
      [planType]: {
        ...prev[planType],
        features: updatedFeatures,
      },
    }));
  };

  const removeFeature = (planType, index) => {
    const updatedFeatures = (allPlans[planType].features || []).filter((_, i) => i !== index);
    setAllPlans(prev => ({
      ...prev,
      [planType]: {
        ...prev[planType],
        features: updatedFeatures,
      },
    }));
  };

  const handleSave = (planType) => {
    const db = getDatabase();
    const planRef = ref(db, `EliteJobs/subscriptionPlans/${planType}`);
    const planData = allPlans[planType];

    if (!planData.price || planData.price <= 0 || !planData.duration || planData.duration <= 0) {
      alert("Price and duration must be greater than 0");
      return;
    }

    setUpdating(true);
    update(planRef, {
      price: parseInt(planData.price),
      duration: parseInt(planData.duration),
      description: planData.description || '',
      features: planData.features || [],
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

  const renderPlanCard = (planType, plan, isNewPlan = false) => (
    <div key={planType} style={isNewPlan ? styles.newPlanCard : styles.card}>
      <h3 style={styles.cardTitle}>{planType} Plan</h3>

      {/* Description */}
      <div style={styles.formGroup}>
        <label style={styles.label}>Description</label>
        <textarea
          value={plan.description || ''}
          onChange={(e) => handleInputChange(planType, 'description', e.target.value)}
          style={styles.textarea}
          rows="3"
          placeholder="Enter plan description..."
        />
      </div>

      {/* Price and Duration in a row */}
      <div style={styles.row}>
        <div style={styles.formGroupHalf}>
          <label style={styles.label}>Price (₹)</label>
          <input
            type="number"
            value={plan.price || ''}
            onChange={(e) => handleInputChange(planType, 'price', e.target.value)}
            min="1"
            style={styles.input}
            placeholder="0"
          />
        </div>

        <div style={styles.formGroupHalf}>
          <label style={styles.label}>Duration (months)</label>
          <input
            type="number"
            value={plan.duration || ''}
            onChange={(e) => handleInputChange(planType, 'duration', e.target.value)}
            min="1"
            style={styles.input}
            placeholder="0"
          />
        </div>
      </div>

      {/* Features */}
      <div style={styles.formGroup}>
        <label style={styles.label}>Features</label>
        {(plan.features || []).map((feature, index) => (
          <div key={index} style={styles.featureInputRow}>
            <input
              type="text"
              value={feature}
              onChange={(e) => handleFeatureChange(planType, index, e.target.value)}
              style={styles.featureInput}
              placeholder={`Feature ${index + 1}`}
            />
            <button
              onClick={() => removeFeature(planType, index)}
              style={styles.removeButton}
              type="button"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={() => addFeature(planType)}
          style={styles.addButton}
          type="button"
        >
          + Add Feature
        </button>
      </div>

      {/* Save Button */}
      <button
        onClick={() => handleSave(planType)}
        disabled={updating}
        style={styles.saveButton}
      >
        {updating ? 'Saving...' : '💾 Save Changes'}
      </button>
    </div>
  );

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📦 Manage Subscription Plans</h2>

      {loading ? (
        <p style={styles.loading}>Loading...</p>
      ) : error ? (
        <p style={styles.error}>{error}</p>
      ) : (
        <>
          {/* New Plans Section */}
          {Object.keys(newPlans).length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>✨ New Plans</h3>
              {Object.keys(newPlans).map((planType) =>
                renderPlanCard(planType, newPlans[planType], true)
              )}
            </div>
          )}

          {/* Existing Plans Section */}
          {Object.keys(existingPlans).length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>📋 Existing Plans</h3>
              {Object.keys(existingPlans).map((planType) =>
                renderPlanCard(planType, existingPlans[planType], false)
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '900px',
    margin: '20px auto',
    padding: '15px',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    backgroundColor: '#f5f9fc',
  },
  title: {
    fontSize: '24px',
    color: '#1d3557',
    marginBottom: '25px',
    borderBottom: '3px solid #457b9d',
    paddingBottom: '10px',
    textAlign: 'center',
  },
  section: {
    marginBottom: '35px',
  },
  sectionTitle: {
    fontSize: '20px',
    color: '#2c3e50',
    marginBottom: '18px',
    paddingBottom: '8px',
    borderBottom: '2px solid #e0e0e0',
    fontWeight: '600',
  },
  newPlanCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    marginBottom: '20px',
    borderLeft: '6px solid #4caf50',
    transition: 'transform 0.2s',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    marginBottom: '20px',
    borderLeft: '6px solid #2196f3',
    transition: 'transform 0.2s',
  },
  cardTitle: {
    fontSize: '20px',
    marginBottom: '18px',
    color: '#333',
    fontWeight: '600',
    borderBottom: '1px solid #eee',
    paddingBottom: '10px',
  },
  formGroup: {
    marginBottom: '18px',
  },
  formGroupHalf: {
    flex: '1',
    minWidth: '120px',
  },
  row: {
    display: 'flex',
    gap: '15px',
    marginBottom: '18px',
    flexWrap: 'wrap',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#444',
    fontSize: '14px',
  },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.3s',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.3s',
    fontFamily: 'inherit',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  featureInputRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px',
    alignItems: 'center',
  },
  featureInput: {
    flex: '1',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.3s',
  },
  removeButton: {
    padding: '8px 12px',
    backgroundColor: '#f44336',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'background 0.3s',
    minWidth: '40px',
  },
  addButton: {
    padding: '10px 16px',
    backgroundColor: '#4caf50',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'background 0.3s',
    marginTop: '8px',
    width: '100%',
  },
  saveButton: {
    marginTop: '15px',
    padding: '14px 24px',
    backgroundColor: '#1976d2',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '16px',
    transition: 'background 0.3s',
    width: '100%',
    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
  },
  loading: {
    fontSize: '18px',
    color: '#888',
    textAlign: 'center',
    padding: '40px 20px',
  },
  error: {
    color: '#f44336',
    fontWeight: 'bold',
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#ffebee',
    borderRadius: '8px',
    border: '1px solid #f44336',
  },
};

export default ManageSubscriptions;

