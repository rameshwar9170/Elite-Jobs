import React, { useState } from 'react';
import { getDatabase, ref as dbRef, set } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import './AddProviders.css'; // reuse same CSS

const AddSeeker = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    district: '',
    designation: '',
    experience: 'Fresher',
    profileVisibility: 'Public',
    role: 'seeker',
    isOnline: false,
    lastActive: Date.now(),
    skills: '',
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const db = getDatabase();
  const storage = getStorage();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const userId = uuidv4();
    const userRef = dbRef(db, `EliteJobs/users/${userId}`);

    try {
      const resumeUrl = resumeFile ? await uploadFile(resumeFile, 'resumes') : '';
      const profilePicUrl = profilePicFile ? await uploadFile(profilePicFile, 'profilePics') : '';

      const userData = {
        ...formData,
        resumeUrl,
        profilePicUrl,
        InsDate: new Date().toISOString(),
        skills: formData.skills ? [formData.skills] : [],
      };

      await set(userRef, userData);
      alert('Seeker added successfully!');

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        district: '',
        designation: '',
        experience: 'Fresher',
        profileVisibility: 'Public',
        role: 'seeker',
        isOnline: false,
        lastActive: Date.now(),
        skills: '',
      });
      setResumeFile(null);
      setProfilePicFile(null);
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to add seeker.');
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file, path) => {
    const fileRef = storageRef(storage, `${path}/${uuidv4()}_${file.name}`);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  };

  return (
    <div className="add-provider-container">
      <h2 className="form-title">Add New Seeker</h2>
      <form onSubmit={handleSubmit} className="form">
        {[ 
          { label: 'Full Name', name: 'name' },
          { label: 'Email', name: 'email', type: 'email' },
          { label: 'Phone Number', name: 'phone', type: 'tel' },
          { label: 'District', name: 'district' },
          { label: 'Designation', name: 'designation' },
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
          <label>Experience</label>
          <select name="experience" value={formData.experience} onChange={handleChange}>
            <option value="Fresher">Fresher</option>
            <option value="1-3 Years">1-3 Years</option>
            <option value="3-5 Years">3-5 Years</option>
            <option value="5+ Years">5+ Years</option>
          </select>
        </div>

        <div className="form-group">
          <label>Skills (comma or newline separated)</label>
          <textarea
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            placeholder="e.g. Good communication, Teamwork"
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
          <label>Resume (PDF only)</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setResumeFile(e.target.files[0])}
          />
        </div>

        <div className="form-group">
          <label>Profile Visibility</label>
          <select name="profileVisibility" value={formData.profileVisibility} onChange={handleChange}>
            <option value="Public">Public</option>
            <option value="Private">Private</option>
          </select>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Saving...' : 'Add Seeker'}
        </button>
      </form>
    </div>
  );
};

export default AddSeeker;
