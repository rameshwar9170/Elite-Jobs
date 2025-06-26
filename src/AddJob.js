import React, { useState } from 'react';
import { getDatabase, ref, push, set } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useParams } from 'react-router-dom';
import './AddJob.css'; // optional CSS styling

const AddJob = () => {
  const { providerId } = useParams(); // or use props if passed directly
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    type: 'Full-Time',
    vacancy: '',
    salary: '',
    location: '',
    experience: '',
    qualification: '',
    company: '',
    website: '',
    email: '',
    phone: '',
    address: '',
    skills: '',
    status: 'Open',
    workDay: '',
    workTime: '',
    designation: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const db = getDatabase();
  const storage = getStorage();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const jobsRef = ref(db, 'jobs');
      const newJobRef = push(jobsRef);
      const jobId = newJobRef.key;

      let imageUrl = '';
      if (imageFile) {
        const imageRef = storageRef(storage, `job_images/${jobId}/image.jpg`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      const timestamp = Date.now();

      const jobData = {
        ...formData,
        jobId,
        id: jobId,
        providerId,
        createdAt: timestamp,
        updatedAt: timestamp,
        postingDate: '', // can be filled with formatted date if needed
        imageUrl,
      };

      await set(newJobRef, jobData);
      alert('Job posted successfully!');
      setFormData({
        title: '',
        description: '',
        category: '',
        type: 'Full-Time',
        vacancy: '',
        salary: '',
        location: '',
        experience: '',
        qualification: '',
        company: '',
        website: '',
        email: '',
        phone: '',
        address: '',
        skills: '',
        status: 'Open',
        workDay: '',
        workTime: '',
        designation: '',
      });
      setImageFile(null);
    } catch (error) {
      console.error('Error posting job:', error);
      alert('Failed to post job.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-job-container">
      <h2>Add New Job</h2>
      <form onSubmit={handleSubmit} className="add-job-form">
        {[
          ['title', 'Job Title'],
          ['description', 'Job Description'],
          ['category', 'Category'],
          ['vacancy', 'Vacancy'],
          ['salary', 'Salary'],
          ['location', 'Location'],
          ['experience', 'Experience'],
          ['qualification', 'Qualification'],
          ['company', 'Company'],
          ['website', 'Website'],
          ['email', 'Email'],
          ['phone', 'Phone'],
          ['address', 'Address'],
          ['skills', 'Skills'],
          ['workDay', 'Work Days'],
          ['workTime', 'Work Time'],
          ['designation', 'Designation'],
        ].map(([name, label]) => (
          <div className="form-group" key={name}>
            <label>{label}</label>
            <input
              type="text"
              name={name}
              value={formData[name]}
              onChange={handleChange}
              required
            />
          </div>
        ))}

        <div className="form-group">
          <label>Job Type</label>
          <select name="type" value={formData.type} onChange={handleChange}>
            <option value="Full-Time">Full-Time</option>
            <option value="Part-Time">Part-Time</option>
            <option value="Internship">Internship</option>
            <option value="Freelance">Freelance</option>
          </select>
        </div>

        <div className="form-group">
          <label>Status</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div className="form-group">
          <label>Upload Job Image</label>
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Posting...' : 'Post Job'}
        </button>
      </form>
    </div>
  );
};

export default AddJob;
