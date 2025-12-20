import React, { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';
import { db } from './firebase';

const ReferralDashboard = () => {
  const [users, setUsers] = useState({});
  const [referralPairs, setReferralPairs] = useState([]);
  const [selectedReferrer, setSelectedReferrer] = useState(null);
  const [popupUsers, setPopupUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        const usersRef = ref(db, 'EliteJobs/users');
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
          const allUsers = snapshot.val();
          setUsers(allUsers);

          const referrers = Object.entries(allUsers).filter(
            ([_, user]) => user.referralCode
          );

          const matched = referrers.map(([referrerId, referrer]) => {
            const referredUsers = Object.entries(allUsers)
              .filter(
                ([_, user]) =>
                  user.referralInfo?.referralCode === referrer.referralCode
              )
              .map(([id, user]) => ({ id, ...user }));

            return referredUsers.length > 0
              ? {
                  referrerId,
                  referrer,
                  referredUsers
                }
              : null;
          }).filter(Boolean);

          setReferralPairs(matched);
        }
      } catch (error) {
        console.error('Error fetching referral data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReferralData();
  }, []);

  const openPopup = (referrer, users) => {
    setSelectedReferrer(referrer);
    setPopupUsers(users);
  };

  const closePopup = () => {
    setSelectedReferrer(null);
    setPopupUsers([]);
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🌟 Referral Dashboard</h2>

      {referralPairs.length === 0 ? (
        <p style={styles.noData}>No referrals found.</p>
      ) : (
        <div style={styles.grid}>
          {referralPairs.map(({ referrerId, referrer, referredUsers }) => (
            <div
              key={referrerId}
              onClick={() => openPopup(referrer, referredUsers)}
              style={styles.card}
            >
              <h3 style={styles.cardTitle}>{referrer.name}</h3>
              <p style={styles.sub}><strong>Email:</strong> {referrer.email}</p>
              <p style={styles.sub}><strong>Phone:</strong> {referrer.phone}</p>
              <p style={styles.code}>🔗 {referrer.referralCode}</p>
              <p style={styles.count}>👥 {referredUsers.length} referred</p>
            </div>
          ))}
        </div>
      )}

      {selectedReferrer && (
        <div style={styles.popupOverlay}>
          <div style={styles.popupContent}>
            <h3 style={styles.popupTitle}>👤 Referred by <span style={{ color: '#007bff' }}>{selectedReferrer.name}</span></h3>
            {popupUsers.map((user, idx) => (
              <div key={idx} style={styles.popupItem}>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Phone:</strong> {user.phone}</p>
                <p><strong>District:</strong> {user.district}</p>
                <p><strong>Industry:</strong> {user.industry}</p>
              </div>
            ))}
            <button onClick={closePopup} style={styles.closeButton}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: 'auto',
    fontFamily: "'Segoe UI', sans-serif",
  },
  title: {
    textAlign: 'center',
    fontSize: '30px',   
    marginBottom: '30px',
    color: '#333',
    fontWeight: '600'
  },
  noData: {
    textAlign: 'center',
    fontSize: '16px',
    color: '#777'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
  },
  card: {
    background: 'linear-gradient(135deg, #f0f4ff, #ffffff)',
    border: '1px solid #d3e0f0',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#1a1a1a',
  },
  sub: {
    fontSize: '14px',
    color: '#555',
    marginBottom: '5px'
  },
  code: {
    marginTop: '10px',
    fontSize: '14px',
    background: '#e7f3ff',
    padding: '4px 8px',
    borderRadius: '6px',
    display: 'inline-block',
    color: '#007bff',
    fontWeight: 'bold',
  },
  count: {
    marginTop: '8px',
    fontWeight: '500',
    color: '#333'
  },
  loading: {
    textAlign: 'center',
    fontSize: '18px',
    marginTop: '40px'
  },
  popupOverlay: {
    position: 'fixed',
    top: 0, left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999
  },
  popupContent: {
    background: '#fff',
    padding: '30px',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '550px',
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
  },
  popupTitle: {
    textAlign: 'center',
    fontSize: '22px',
    marginBottom: '20px',
  },
  popupItem: {
    padding: '12px',
    marginBottom: '10px',
    borderBottom: '1px solid #eee',
    fontSize: '15px',
  },
  closeButton: {
    marginTop: '20px',
    padding: '10px 16px',
    background: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '16px',
    cursor: 'pointer',
    width: '100%'
  }
};

export default ReferralDashboard;
