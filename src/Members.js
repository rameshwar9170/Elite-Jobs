import React, { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';
import { db } from './firebase';

const Members = () => {
  const [members, setMembers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const membersRef = ref(db, 'members');
        const snapshot = await get(membersRef);
        if (snapshot.exists()) {
          setMembers(snapshot.val());
        } else {
          setError('No members found.');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load members.');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', marginTop: 30 }}>Loading...</div>;
  if (error) return <div style={{ textAlign: 'center', color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: '30px', background: '#f5f5f5', minHeight: '100vh' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
        👥 All Members
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {Object.entries(members).map(([id, member]) => (
          <div key={id} style={{
            background: '#fff',
            borderRadius: '10px',
            padding: '20px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            borderLeft: member.hasActiveSubscription ? '5px solid green' : '5px solid gray'
          }}>
            <h3 style={{ margin: '0 0 10px', color: '#007BFF' }}>{member.name || 'Unnamed'}</h3>
            <p style={{ margin: '5px 0' }}><strong>Email:</strong> {member.email || 'N/A'}</p>
            <p style={{ margin: '5px 0' }}><strong>Address:</strong> {member.address || 'N/A'}</p>
            <p style={{ margin: '10px 0', fontWeight: 'bold' }}>
              {member.hasActiveSubscription ? '🟢 Active Subscriber' : '⚪ No Subscription'}
            </p>

            {member.hasActiveSubscription && (
              <div style={{ fontSize: '14px', marginTop: '10px', background: '#f0f8ff', padding: '10px', borderRadius: '5px' }}>
                <p style={{ margin: '5px 0' }}><strong>Plan:</strong> {member.subscriptionPlan}</p>
                <p style={{ margin: '5px 0' }}><strong>Amount:</strong> ₹{member.subscriptionAmount}</p>
                <p style={{ margin: '5px 0' }}><strong>Payment ID:</strong> {member.subscriptionPaymentId}</p>
                <p style={{ margin: '5px 0' }}>
                  <strong>Expiry:</strong> {new Date(member.subscriptionExpiry).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Members;
