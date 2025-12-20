import React, { useEffect, useState } from "react";
import { getDatabase, ref, get } from "firebase/database";
import { useParams } from "react-router-dom"; // Assuming react-router-dom is used for routing

const Applications = () => {
  // Get providerId from the URL parameters
  const { id: providerId } = useParams();
  // State to store the fetched applications
  const [applications, setApplications] = useState([]);
  // State to manage the loading status
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /**
     * Fetches application data from Firebase Realtime Database.
     * It filters applications by providerId and then fetches seeker details for each application.
     */
    const fetchApplications = async () => {
      try {
        // Initialize Firebase Database instance
        const db = getDatabase();
        // Fetch all applications from the 'applications' node
        const appsSnap = await get(ref(db, 'applications'));
        const appsData = appsSnap.val();
        const filtered = [];

        // Process fetched applications if data exists
        if (appsData) {
          // Iterate through each application
          for (const appId in appsData) {
            const app = appsData[appId];

            // Check if the application belongs to the current provider
            if (app.providerId === providerId) {
              // Fetch the seeker details using seekerId from the 'EliteJobs/users' node
              const seekerSnap = await get(ref(db, `EliteJobs/users/${app.seekerId}`));
              // Get seeker data if it exists, otherwise an empty object
              const seekerData = seekerSnap.exists() ? seekerSnap.val() : {};

              // Add the application with seeker information to the filtered list
              filtered.push({
                ...app,
                seekerInfo: seekerData,
              });
            }
          }
        }

        // Update the applications state and set loading to false
        setApplications(filtered);
        setLoading(false);
      } catch (error) {
        // Log any errors during data fetching
        console.error("Error fetching applications:", error);
        // Set loading to false even if there's an error
        setLoading(false);
      }
    };

    // Call the fetchApplications function when the component mounts or providerId changes
    fetchApplications();
  }, [providerId]); // Dependency array: re-run effect if providerId changes

  // Display a loading spinner while data is being fetched
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Loading applications...</p>
      </div>
    );
  }

  // Render the applications table or a "No applications found" message
  return (
    <div className="applications-container">
      <h2>Applications for Your Posted Jobs</h2>

      {applications.length === 0 ? (
        <p className="no-applications">No applications found.</p>
      ) : (
        <div className="table-wrapper">
          <table className="applications-table">
            <thead>
              <tr>
                {/* <th>#</th> */}
                <th>Job Title</th>
                <th>Company</th>
                <th>Status</th>
                <th>Applied On</th>
                <th>Seeker Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>District</th>
                <th>Experience</th>
                <th>Skills</th>
                <th>Resume</th>
                {/* <th>Profile</th> */}
              </tr>
            </thead>
            <tbody>
              {applications.map((app, index) => (
                <tr key={index} className="table-row">
                  {/* <td>{index + 1}</td> */}
                  <td>{app.jobTitle}</td>
                  <td>{app.companyName}</td>
                  <td>
                    <span className={`status-badge status-${app.status?.toLowerCase()}`}>
                      {app.status}
                    </span>
                  </td>
                  <td>{new Date(app.appliedDate).toLocaleString()}</td>
                  <td>{app.seekerInfo?.name || 'N/A'}</td>
                  <td>{app.seekerInfo?.email || 'N/A'}</td>
                  <td>{app.seekerInfo?.phone || 'N/A'}</td>
                  <td>{app.seekerInfo?.district || 'N/A'}</td>
                  <td>{app.seekerInfo?.experience || 'N/A'}</td>
                  <td>{app.seekerInfo?.skills || 'N/A'}</td>
                  <td>
                    {app.seekerInfo?.resumeUrl ? (
                      <a href={app.seekerInfo.resumeUrl} target="_blank" rel="noopener noreferrer" className="resume-link">
                        View
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  {/* <td>
                    {app.seekerInfo?.profilePicUrl ? (
                      <img
                        src={app.seekerInfo.profilePicUrl}
                        alt="Profile"
                        className="profile-img"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/50x50/cccccc/333333?text=N/A'; }} // Fallback for broken images
                      />
                    ) : (
                      'N/A'
                    )}
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* CSS Styles for the component */}
      <style jsx>{`
        /* General Body and Container Styling */
        body {
          font-family: 'Inter', sans-serif;
          background-color: #f0f2f5;
          margin: 0;
          padding: 0;
          color: #333;
        }

        .applications-container {
          max-width: 1200px;
          margin: 40px auto;
          padding: 30px;
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
          animation: fadeIn 0.8s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        h2 {
          text-align: center;
          color: #2c3e50;
          margin-bottom: 30px;
          font-size: 2.2em;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        /* Loading State Styling */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
          margin: 40px auto;
          padding: 20px;
          max-width: 600px;
        }

        .spinner {
          border: 6px solid #f3f3f3;
          border-top: 6px solid #3498db;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-text {
          font-size: 1.2em;
          color: #555;
        }

        /* No Applications Message */
        .no-applications {
          text-align: center;
          font-size: 1.3em;
          color: #777;
          padding: 50px;
          background-color: #f9f9f9;
          border-radius: 8px;
          border: 1px dashed #ddd;
          margin-top: 30px;
        }

        /* Table Styling */
        .table-wrapper {
          overflow-x: auto; /* Enables horizontal scrolling for small screens */
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          background-color: #fff;
        }

        .applications-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          min-width: 900px; /* Ensures table doesn't shrink too much on small screens */
        }

        .applications-table th,
        .applications-table td {
          padding: 15px 20px;
          text-align: left;
          border-bottom: 1px solid #e0e0e0;
          white-space: nowrap; /* Prevents text wrapping in cells */
        }

        .applications-table th {
          background-color: #4a90e2;
          color: #ffffff;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.9em;
          letter-spacing: 0.5px;
        }

        .applications-table tbody tr:nth-child(even) {
          background-color: #f8fbfd;
        }

        .applications-table tbody tr:hover {
          background-color: #eaf3ff;
          transition: background-color 0.2s ease;
        }

        /* Status Badges */
        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.85em;
          font-weight: 600;
          text-transform: capitalize;
          color: #fff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .status-badge.status-pending {
          background-color: #ffc107; /* Amber */
          color: #333;
        }
          .status-badge.status-applied {
          background-color: #17a2b8; /* Teal */
          }

        .status-badge.status-accepted {
          background-color: #28a745; /* Green */
        }

        .status-badge.status-rejected {
          background-color: #dc3545; /* Red */
        }

        .status-badge.status-interview {
          background-color: #007bff; /* Blue */
        }

        /* Resume Link */
        .resume-link {
          color: #4a90e2;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .resume-link:hover {
          color: #2e6bb8;
          text-decoration: underline;
        }

        /* Profile Image */
        .profile-img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #ddd;
          transition: transform 0.2s ease;
        }

        .profile-img:hover {
          transform: scale(1.1);
        }

        /* Responsive Adjustments */
        @media (max-width: 992px) {
          .applications-container {
            margin: 20px;
            padding: 20px;
          }

          h2 {
            font-size: 1.8em;
          }

          .applications-table th,
          .applications-table td {
            padding: 12px 15px;
            font-size: 0.9em;
          }
        }

        @media (max-width: 768px) {
          .applications-container {
            margin: 15px;
            padding: 15px;
          }

          h2 {
            font-size: 1.6em;
            margin-bottom: 20px;
          }

          .applications-table {
            min-width: 700px; /* Adjust minimum width for smaller tablets */
          }

          .applications-table th,
          .applications-table td {
            font-size: 0.85em;
          }

          .status-badge {
            padding: 5px 10px;
            font-size: 0.8em;
          }

          .profile-img {
            width: 35px;
            height: 35px;
          }
        }

        @media (max-width: 576px) {
          .applications-container {
            margin: 10px;
            padding: 10px;
          }

          h2 {
            font-size: 1.4em;
            margin-bottom: 15px;
          }

          .table-wrapper {
            border-radius: 8px;
          }

          .applications-table {
            min-width: 600px; /* Further adjust for mobile */
          }

          .applications-table th,
          .applications-table td {
            padding: 10px 12px;
            font-size: 0.8em;
          }

          .loading-container {
            margin: 20px;
            padding: 15px;
          }

          .spinner {
            width: 40px;
            height: 40px;
            border-width: 5px;
          }

          .loading-text {
            font-size: 1em;
          }

          .no-applications {
            padding: 30px;
            font-size: 1.1em;
          }
        }
      `}</style>
    </div>
  );
};

export default Applications;
