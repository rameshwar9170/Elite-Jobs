import React from 'react';

const ContactUs = () => {
  const contactInfo = {
    lastUpdated: "24-06-2024 15:35:09",
    legalName: "RAMESHWAR NARAYAN SHINDE",
    address: "New Osman pura, Aurangabad, Maharashtra, PIN: 431005",
    phone: "9370329233",
    email: "ramshinde9370@gmail.com",
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Contact Us</h2>
      <p style={styles.updated}>Last updated on {contactInfo.lastUpdated}</p>
      <p style={styles.description}>You may contact us using the information below:</p>
      
      <div style={styles.infoBox}>
        <p><strong>Merchant Legal Entity Name:</strong> {contactInfo.legalName}</p>
        <p><strong>Registered Address:</strong> {contactInfo.address}</p>
        <p><strong>Operational Address:</strong> {contactInfo.address}</p>
        <p><strong>Telephone No:</strong> {contactInfo.phone}</p>
        <p><strong>E-Mail ID:</strong> <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a></p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '700px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    lineHeight: '1.6',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#333',
  },
  updated: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '20px',
  },
  description: {
    fontSize: '16px',
    marginBottom: '15px',
  },
  infoBox: {
    backgroundColor: '#fff',
    padding: '15px 20px',
    borderRadius: '6px',
    border: '1px solid #ddd'
  }
};

export default ContactUs;
