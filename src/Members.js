import React, { useEffect, useState } from 'react';
import { ref, get, remove } from 'firebase/database';
import { db } from './firebase';
import { FaTrashAlt, FaEye } from 'react-icons/fa';
import './Hotels.css';

const Hotels = () => {
  const [hotels, setHotels] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const hotelsRef = ref(db, 'EliteJobs/hotels');
      const snapshot = await get(hotelsRef);
      if (snapshot.exists()) {
        setHotels(snapshot.val());
      } else {
        setError('No hotels found.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load hotels.');
    } finally {
      setLoading(false);
    }
  };

  const openPopup = (hotel) => {
    setSelectedHotel(hotel);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedHotel(null);
  };

  const handleDeleteHotel = async (hotelId, hotelName) => {
    if (window.confirm(`Are you sure you want to delete "${hotelName || 'this hotel'}"?`)) {
      try {
        await remove(ref(db, `EliteJobs/hotels/${hotelId}`));
        setHotels((prev) => {
          const next = { ...prev };
          delete next[hotelId];
          return next;
        });
      } catch (err) {
        alert('Failed to delete hotel: ' + err.message);
      }
    }
  };

  if (loading) return <div className="loading">Loading hotels...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <>
      <div className="hotels-container">
        <h2 className="hotels-title">🏨 Hotels List</h2>

        <div className="table-responsive-container">
          <table className="modern-data-table">
            <thead>
              <tr>
                <th>Hotel</th>
                <th>Rating</th>
                <th>Address</th>
                <th>Menu Items</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(hotels).map(([hotelId, hotel]) => {
                const menuCount = hotel.menu ? Object.keys(hotel.menu).length : 0;
                return (
                  <tr key={hotelId} className="table-row-hover">
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {hotel.logoUrl ? (
                          <img
                            src={hotel.logoUrl}
                            alt={hotel.name}
                            style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            🏨
                          </div>
                        )}
                        <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{hotel.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="status-pill status-open">{hotel.rating || 'N/A'} ⭐</span>
                    </td>
                    <td>{hotel.address || '-'}</td>
                    <td>
                      <span className="badge-light">{menuCount} items</span>
                    </td>
                    <td>
                      <div className="table-action-btns">
                        <button
                          className="table-action-btn view-btn"
                          onClick={() => openPopup(hotel)}
                          title="View Menu"
                        >
                          <FaEye /> Menu
                        </button>
                        <button
                          className="table-action-btn delete-btn"
                          onClick={() => handleDeleteHotel(hotelId, hotel.name)}
                          title="Delete Hotel"
                        >
                          <FaTrashAlt /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showPopup && selectedHotel && (
        <div className="popup-overlay" onClick={closePopup}>
          <div
            className="popup-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="popup-close" onClick={closePopup}>×</button>
            <h2>{selectedHotel.name} - Menu</h2>
            <p className="popup-address"><strong>Address:</strong> {selectedHotel.address}</p>

            {selectedHotel.menu && Object.values(selectedHotel.menu).length > 0 ? (
              <div className="menu-grid">
                {Object.entries(selectedHotel.menu).map(([menuId, item]) => (
                  <div key={menuId} className="menu-item">
                    <img src={item.imageUrl} alt={item.name} className="menu-img" />
                    <h4>{item.name}</h4>
                    <p>₹{item.price}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No menu items available.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Hotels;
