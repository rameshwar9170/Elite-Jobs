import React, { useEffect, useState } from 'react';
import { ref, get, update } from 'firebase/database';
import { db } from './firebase';

const MemberSub = () => {
  const [plan, setPlan] = useState({
    title: '',
    description: '',
    price: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const planRef = ref(db, 'subscriptionPlans/EliteMembersPlan');
        const snapshot = await get(planRef);
        if (snapshot.exists()) {
          setPlan(snapshot.val());
        } else {
          setMessage('Plan not found.');
        }
      } catch (error) {
        console.error('Error fetching plan:', error);
        setMessage('Failed to load plan.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPlan(prev => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
     const planRef = ref(db, 'subscriptionPlans/EliteMembersPlan'); // ✅ save to the same path
     await update(planRef, plan);
      setMessage('✅ Plan updated successfully.');
    } catch (error) {
      console.error('Error updating plan:', error);
      setMessage('❌ Error saving plan.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>;

  return (
    <div style={{
      maxWidth: '600px',
      margin: '40px auto',
      padding: '30px',
      border: '1px solid #ddd',
      borderRadius: '10px',
      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
      background: '#f9f9f9'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
        ✨ Edit Elite Member Subscription Plan
      </h2>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Title:</label>
        <input
          type="text"
          name="title"
          value={plan.title}
          onChange={handleChange}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            outlineColor: '#007BFF'
          }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Description:</label>
        <textarea
          name="description"
          value={plan.description}
          onChange={handleChange}
          rows={4}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            outlineColor: '#007BFF'
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Price (₹):</label>
        <input
          type="number"
          name="price"
          value={plan.price}
          onChange={handleChange}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            outlineColor: '#007BFF'
          }}
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: saving ? '#ccc' : '#007BFF',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: saving ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
          transition: 'background-color 0.3s ease'
        }}
      >
        {saving ? 'Saving...' : '💾 Save Changes'}
      </button>

      {message && (
        <p style={{
          marginTop: '15px',
          textAlign: 'center',
          color: message.includes('✅') ? 'green' : 'red',
          fontWeight: 'bold'
        }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default MemberSub;
