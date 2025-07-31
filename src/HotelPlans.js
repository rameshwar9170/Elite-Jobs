import React, { useEffect, useState } from 'react';
import { ref, get, update } from 'firebase/database';
import { db } from './firebase';

const HotelPlans = () => {
  const [plan, setPlan] = useState({
    title: '',
    description: '',
    price: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchHotelPlan = async () => {
      try {
        const planRef = ref(db, 'EliteJobs/hotelSubscriptionPlans/ManageHotelPlan');
        const snapshot = await get(planRef);
        if (snapshot.exists()) {
          setPlan(snapshot.val());
        } else {
          setMessage('Hotel plan not found.');
        }
      } catch (err) {
        console.error(err);
        setMessage('Error loading plan.');
      } finally {
        setLoading(false);
      }
    };

    fetchHotelPlan();
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
      const planRef = ref(db, 'EliteJobs/hotelSubscriptionPlans/ManageHotelPlan');
      await update(planRef, plan);
      setMessage('✅ Plan updated successfully.');
    } catch (error) {
      console.error(error);
      setMessage('❌ Failed to update plan.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: 30 }}>Loading...</div>;

  return (
    <div style={{
      maxWidth: '550px',
      margin: '40px auto',
      padding: '30px',
      border: '1px solid #ddd',
      borderRadius: '10px',
      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
      background: '#f9f9f9'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '25px', color: '#333' }}>
        ✏️ Edit Hotel Subscription Plan
      </h2>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 6 }}>Title:</label>
        <input
          type="text"
          name="title"
          value={plan.title}
          onChange={handleChange}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            outlineColor: '#007BFF'
          }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 6 }}>Description:</label>
        <textarea
          name="description"
          value={plan.description}
          onChange={handleChange}
          rows={4}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            outlineColor: '#007BFF'
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 6 }}>Price (₹):</label>
        <input
          type="number"
          name="price"
          value={plan.price}
          onChange={handleChange}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid #ccc',
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
          borderRadius: '6px',
          cursor: saving ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
          fontSize: '16px'
        }}
      >
        {saving ? 'Saving...' : '💾 Save Changes'}
      </button>

      {message && (
        <p style={{
          marginTop: '20px',
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

export default HotelPlans;
