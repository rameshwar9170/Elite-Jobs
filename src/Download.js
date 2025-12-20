import React from 'react';

const Download = () => {
  const handleDownload = () => {
    // Replace with the actual URL to your hosted APK file
    const apkUrl = 'https://firebasestorage.googleapis.com/v0/b/vite-contact-a592b.firebasestorage.app/o/EliteJobs.apk?alt=media&token=c31a1dae-eac3-4789-93d7-b1b17ed22b68'; // Update with actual URL
    const a = document.createElement('a');
    a.href = apkUrl;
    a.download = 'https://firebasestorage.googleapis.com/v0/b/vite-contact-a592b.firebasestorage.app/o/EliteJobs.apk?alt=media&token=c31a1dae-eac3-4789-93d7-b1b17ed22b68';
    a.click();
  };

  // Array of five different image URLs
  const screenshotUrls = [
    'https://firebasestorage.googleapis.com/v0/b/vite-contact-a592b.firebasestorage.app/o/IMG-20250601-WA0021.jpg?alt=media&token=0b44fc6a-e993-4fa5-96f5-4141b743396f',
    'https://firebasestorage.googleapis.com/v0/b/vite-contact-a592b.firebasestorage.app/o/IMG-20250601-WA0022.jpg?alt=media&token=0b44fc6a-e993-4fa5-96f5-4141b743396f',
    'https://firebasestorage.googleapis.com/v0/b/vite-contact-a592b.firebasestorage.app/o/IMG-20250601-WA0023.jpg?alt=media&token=0b44fc6a-e993-4fa5-96f5-4141b743396f',
    'https://firebasestorage.googleapis.com/v0/b/vite-contact-a592b.firebasestorage.app/o/IMG-20250601-WA0024.jpg?alt=media&token=0b44fc6a-e993-4fa5-96f5-4141b743396f',
    'https://firebasestorage.googleapis.com/v0/b/vite-contact-a592b.firebasestorage.app/o/IMG-20250601-WA0025.jpg?alt=media&token=0b44fc6a-e993-4fa5-96f5-4141b743396f',
  ];

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img
              src="https://firebasestorage.googleapis.com/v0/b/vite-contact-a592b.firebasestorage.app/o/logofsdfsd.jpg?alt=media&token=25a2dc56-9f1c-4821-807f-05ccc2616374"
              alt="EliteJobs Icon"
              style={{
                width: '6rem',
                height: '6rem',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
            />
            <div>
              <h1 style={{ fontSize: '1.875rem', fontWeight: '700' }}>
                EliteJobs
              </h1>
              <p style={{ fontSize: '1.125rem' }}>Find Your Dream Job</p>
              <p style={{ fontSize: '0.875rem', opacity: '0.75' }}>
                Version 1.0.0
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Download Section */}
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
            marginBottom: '2rem',
          }}
        >
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1rem',
            }}
          >
            Download EliteJobs
          </h2>
          <p
            style={{
              color: '#4b5563',
              marginBottom: '1rem',
            }}
          >
            EliteJobs helps you discover top job opportunities tailored to your
            skills. Download now and start your career journey!
          </p>
          <button
            onClick={handleDownload}
            style={{
              backgroundColor: '#22c55e',
              color: '#ffffff',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
            }}
            onMouseOver={(e) =>
              (e.target.style.backgroundColor = '#16a34a')
            }
            onMouseOut={(e) =>
              (e.target.style.backgroundColor = '#22c55e')
            }
          >
            Download APK
          </button>
        </div>

        {/* Screenshots Section */}
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
            Screenshots
          </h2>
          <div
            style={{
              display: 'flex',
              overflowX: 'auto',
              gap: '1rem',
              paddingBottom: '1rem',
            }}
          >
            {screenshotUrls.map((url, index) => (
              <img
                key={index + 1}
                src={url}
                alt={`Screenshot ${index + 1}`}
                style={{
                  width: '12rem',
                  height: '24rem',
                  objectFit: 'cover',
                  borderRadius: '0.5rem',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                }}
              />
            ))}
          </div>
        </div>

        {/* App Details Section */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            padding: '1.5rem',
            marginTop: '2rem',
          }}
        >
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1rem',
            }}
          >
            About EliteJobs
          </h2>
          <p style={{ color: '#4b5563' }}>
            EliteJobs is your one-stop platform for finding high-quality job
            listings. With personalized recommendations and an intuitive
            interface, we make job searching effortless and effective.
          </p>
          <ul
            style={{
              marginTop: '1rem',
              color: '#4b5563',
              listStyleType: 'disc',
              paddingLeft: '1.5rem',
            }}
          >
            <li>Personalized job matches</li>
            <li>Real-time notifications</li>
            <li>Easy application process</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Download;