import React, { useEffect, useState, useMemo } from 'react';
import { ref, get, remove } from 'firebase/database';
import { db } from './firebase';
import { FaTrashAlt, FaEye, FaSearch } from 'react-icons/fa';
import './Hotels.css';

const Hotels = () => {
  const [hotels, setHotels] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredHotels = useMemo(() => {
    const list = Object.entries(hotels);
    if (!searchTerm.trim()) return list;
    const query = searchTerm.toLowerCase().trim();
    const queryDigits = query.replace(/\D/g, '');

    return list.filter(([hotelId, hotel]) => {
      const name = (hotel.name || '').toLowerCase();
      const address = (hotel.address || '').toLowerCase();
      const rating = String(hotel.rating || '');

      const phoneRaw = String(hotel.phone || hotel.mobile || hotel.phoneNumber || hotel.contact || hotel.contactNumber || '');
      const phoneDigits = phoneRaw.replace(/\D/g, '');
      const matchesPhone = phoneRaw.toLowerCase().includes(query) || (queryDigits.length >= 3 && phoneDigits.includes(queryDigits));

      return (
        name.includes(query) ||
        address.includes(query) ||
        rating.includes(query) ||
        matchesPhone
      );
    });
  }, [hotels, searchTerm]);

  if (loading) return <div className="loading">Loading hotels...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <>
      <div className="hotels-container">
        <h2 className="hotels-title">🏨 Hotels List</h2>

        {/* Search Bar */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            background: '#ffffff',
            padding: '0.65rem 1rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <FaSearch style={{ color: '#94a3b8', fontSize: '1rem', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search by hotel name, mobile number, address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                width: '100%',
                fontSize: '0.95rem',
                color: '#1e293b',
                fontWeight: 500
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '0.8rem',
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {filteredHotels.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <p style={{ color: '#64748b', fontWeight: 600 }}>No hotels found matching "{searchTerm}".</p>
            <button
              onClick={() => setSearchTerm('')}
              style={{
                marginTop: '10px',
                padding: '6px 14px',
                borderRadius: '6px',
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Clear Search
            </button>
          </div>
        ) : (
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
                {filteredHotels.map(([hotelId, hotel]) => {
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
                        <div>
                          <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{hotel.name}</span>
                          {(hotel.phone || hotel.mobile || hotel.phoneNumber || hotel.contact || hotel.contactNumber) && (
                            <div style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 600, marginTop: '2px' }}>
                              📞 {hotel.phone || hotel.mobile || hotel.phoneNumber || hotel.contact || hotel.contactNumber}
                            </div>
                          )}
                        </div>
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
        )}
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
