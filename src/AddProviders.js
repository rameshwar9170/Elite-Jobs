import React, { useState } from 'react';
import { getDatabase, ref as dbRef, set } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import './AddProviders.css';

const AddProviders = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    district: '',
    email: '',
    industry: '',
    location: '',
    name: '',
    phone: '',
    profileVisibility: 'Public',
    role: 'provider',
    isOnline: true,
    lastActive: Date.now(),
    isActive: 'Yes',
    subscriptionType: 'Basic',
    subscriptionPrice: 3999,
    subscriptionDuration: '6 months',
  });

  const [companyLogoFile, setCompanyLogoFile] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const db = getDatabase();
  const storage = getStorage();

const handleChange = (e) => {
  const { name, value } = e.target;
  const updatedData = { ...formData, [name]: value };

  if (name === 'subscriptionType') {
    if (value === 'Basic') {
      updatedData.subscriptionPrice = 3999;
      updatedData.subscriptionDuration = '6 months';
    } else if (value === 'Elite') {
      updatedData.subscriptionPrice = 6999;
      updatedData.subscriptionDuration = '12 months';
    } else {
      updatedData.subscriptionPrice = '';
      updatedData.subscriptionDuration = '';
    }
  }

  setFormData(updatedData);
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  const userId = uuidv4();
  const userRef = dbRef(db, `EliteJobs/users/${userId}`);

  try {
    const companyLogoUrl = companyLogoFile
      ? await uploadImage(companyLogoFile, 'companyLogos')
      : '';
    const profilePicUrl = profilePicFile
      ? await uploadImage(profilePicFile, 'profilePics')
      : '';

    // ➕ Calculate expiry date only if subscription type is not None
    let expiryDateString = '';
    if (formData.subscriptionType === 'Basic') {
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + 6);
      expiryDateString = expiry.toISOString();
    } else if (formData.subscriptionType === 'Elite') {
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + 12);
      expiryDateString = expiry.toISOString();
    }

    const userData = {
      ...formData,
      companyLogoUrl,
      profilePicUrl,
    };

    if (expiryDateString) {
      userData.expiryDate = expiryDateString;
    }

    await set(userRef, userData);

    alert('Provider added successfully!');
    setFormData({
      companyName: '',
      contactPerson: '',
      district: '',
      email: '',
      industry: '',
      location: '',
      name: '',
      phone: '',
      profileVisibility: 'Public',
      role: 'provider',
      isOnline: true,
      lastActive: Date.now(),
      isActive: 'Yes',
      subscriptionType: 'Basic',
      subscriptionPrice: 3999,
      subscriptionDuration: '6 months',
    });
    setCompanyLogoFile(null);
    setProfilePicFile(null);
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to add provider.');
  } finally {
    setLoading(false);
  }
};


  const uploadImage = async (file, path) => {
    const fileRef = storageRef(storage, `${path}/${uuidv4()}_${file.name}`);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  };


  return (
    <div className="add-provider-container">
      <h2 className="form-title">Add New Provider</h2>
      <form onSubmit={handleSubmit} className="form">
        {[
          { label: 'Company Name', name: 'companyName' },
          { label: 'Provider Name', name: 'contactPerson' },
          { label: 'District', name: 'district' },
          { label: 'Email', name: 'email', type: 'email' },
          { label: 'Industry', name: 'industry' },
          { label: 'Location', name: 'location' },
          { label: 'Full Name', name: 'name' },
          { label: 'Phone Number', name: 'phone', type: 'tel' },
        ].map((field) => (
          <div className="form-group" key={field.name}>
            <label>{field.label}</label>
            <input
              type={field.type || 'text'}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              required
            />
          </div>
        ))}

        <div className="form-group">
          <label>Company Logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCompanyLogoFile(e.target.files[0])}
          />
        </div>

        <div className="form-group">
          <label>Profile Picture</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setProfilePicFile(e.target.files[0])}
          />
        </div>

        <div className="form-group">
          <label>Profile Visibility</label>
          <select name="profileVisibility" value={formData.profileVisibility} onChange={handleChange}>
            <option value="Public">Public</option>
            <option value="Private">Private</option>
          </select>
        </div>

        <div className="form-group">
          <label>Is Active?</label>
          <select name="isActive" value={formData.isActive} onChange={handleChange}>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        <div className="form-group">
          <label>Subscription Type</label>
        <select name="subscriptionType" value={formData.subscriptionType} onChange={handleChange}>
  <option value="None">None</option>
  <option value="Basic">Basic - ₹3999 (6 months)</option>
  <option value="Elite">Elite - ₹6999 (12 months)</option>
</select>

        </div>

   <div className="form-row">
  <div className="form-group">
    <label>Price (₹)</label>
    <input
      type="number"
      name="subscriptionPrice"
      value={formData.subscriptionPrice}
      onChange={handleChange}
      required
    />
  </div>
  <div className="form-group">
    <label>Duration</label>
    <input
      type="text"
      value={formData.subscriptionDuration}
      readOnly
    />
  </div>
</div>


        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Saving...' : 'Add Provider'}
        </button>
      </form>
    </div>
  );
};

export default AddProviders;
