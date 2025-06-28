import React, { useState } from "react";
import "./Notifications.css";

const Notifications = () => {
  const [topic, setTopic] = useState("Seeker");
  const [title, setTitle] = useState("Test Notification");
  const [body, setBody] = useState("This is a test notification sent to the topic.");
  const [loading, setLoading] = useState(false);

  const sendNotification = async () => {
    if (!title.trim() || !body.trim()) {
      alert("Please fill in both title and body.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://us-central1-vite-contact-a592b.cloudfunctions.net/sendNotificationToTopic",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic, // "Provider" or "Seeker"
            title,
            body,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        alert(`✅ Notification sent to "${topic}"`);
        console.log("Response:", data);
      } else {
        alert(`❌ Failed to send notification: ${data.error}`);
        console.error("Error:", data);
      }
    } catch (error) {
      alert("⚠️ An error occurred while sending the notification.");
      console.error("Error:", error);
    }

    setLoading(false);
  };

  return (
    <div className="notification-container">
      <h2 className="notification-heading">🔔 Send Push Notification</h2>

      <label className="notification-label">
        Select Topic:
        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="notification-select"
        >
          <option value="Seeker">Seeker</option>
          <option value="Provider">Provider</option>
        </select>
      </label>

      <label className="notification-label">
        Title:
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="notification-input"
          placeholder="Enter notification title"
        />
      </label>

      <label className="notification-label">
        Body:
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="notification-textarea"
          placeholder="Enter notification message"
        />
      </label>

      <button
        onClick={sendNotification}
        className="notification-button"
        disabled={loading}
      >
        {loading ? "Sending..." : "🚀 Send Notification"}
      </button>
    </div>
  );
};

export default Notifications;
