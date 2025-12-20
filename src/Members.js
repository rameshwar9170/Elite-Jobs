import React, { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';
import { db } from './firebase';
import './Hotels.css'; // Use external CSS for clarity

const Hotels = () => {
  const [hotels, setHotels] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
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

    fetchHotels();
  }, []);

  const openPopup = (hotel) => {
    setSelectedHotel(hotel);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedHotel(null);
  };

  if (loading) return <div className="loading">Loading hotels...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <>
      <div className="hotels-container">
        <h2 className="hotels-title">🏨 Hotels List</h2>

        <div className="hotels-grid">
          {Object.entries(hotels).map(([hotelId, hotel]) => (
            <div
              key={hotelId}
              className="hotel-card"
              onClick={() => openPopup(hotel)}
              title="Click to view menu items"
            >
              {hotel.logoUrl && (
                <img
                  src={hotel.logoUrl}
                  alt={hotel.name}
                  className="hotel-logo"
                />
              )}
              <h3 className="hotel-name">{hotel.name}</h3>
              <p className="hotel-rating"><strong>Rating:</strong> {hotel.rating} ⭐</p>
              <p className="hotel-address">{hotel.address}</p>
            </div>
          ))}
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
