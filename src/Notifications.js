import React, { useState } from "react";
import { FaBell, FaPaperPlane, FaUserGraduate, FaBuilding } from "react-icons/fa";
import "./Notifications.css";

const Notifications = () => {
  const [topic, setTopic] = useState("Seeker");
  const [title, setTitle] = useState("New Job Opportunity Available");
  const [body, setBody] = useState("A top employer has posted a vacancy matching your profile. Apply now!");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const sendNotification = async () => {
    if (!title.trim() || !body.trim()) {
      alert("Please fill in both title and body.");
      return;
    }

    setLoading(true);
    setStatusMsg(null);

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
            senderId: "XWyMfbA83aUoeC4cKMdtzFNj4Y12",
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setStatusMsg({ type: "success", text: `Broadcast successfully pushed to all ${topic}s!` });
      } else {
        setStatusMsg({ type: "error", text: `Failed: ${data.error || 'Server error'}` });
      }
    } catch (error) {
      setStatusMsg({ type: "error", text: "Network error sending notification." });
    }

    setLoading(false);
  };

  return (
    <div className="notifications-page animate-fade-in">
      <div className="notif-wrapper">
        <div className="notif-composer-card">
          <div className="notif-header">
            <div className="notif-icon-badge">
              <FaBell />
            </div>
            <div>
              <h3 className="notif-title">Push Notification Broadcast</h3>
              <p className="notif-subtitle">Send instant alerts to mobile app users</p>
            </div>
          </div>

          {statusMsg && (
            <div className={`notif-status-banner ${statusMsg.type}`}>
              {statusMsg.text}
            </div>
          )}

          {/* Target Audience Tabs */}
          <div className="target-topic-group">
            <label className="field-label">Target Audience</label>
            <div className="topic-pill-tabs">
              <button
                type="button"
                className={`topic-tab ${topic === 'Seeker' ? 'active' : ''}`}
                onClick={() => setTopic('Seeker')}
              >
                <FaUserGraduate /> All Seekers
              </button>
              <button
                type="button"
                className={`topic-tab ${topic === 'Provider' ? 'active' : ''}`}
                onClick={() => setTopic('Provider')}
              >
                <FaBuilding /> All Providers
              </button>
            </div>
          </div>

          <div className="form-group-field">
            <label className="field-label">Notification Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="notif-input"
              placeholder="e.g. New Job Alert"
            />
          </div>

          <div className="form-group-field">
            <label className="field-label">Message Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="notif-textarea"
              placeholder="Type your push notification message..."
              rows="3"
            />
          </div>

          {/* Live Mobile Push Notification Preview */}
          <div className="mobile-push-preview-box">
            <span className="preview-label">Live Mobile Lockscreen Preview</span>
            <div className="preview-bubble">
              <div className="preview-top">
                <span className="preview-app-name">EliteJobs • Now</span>
              </div>
              <div className="preview-title">{title || 'Notification Title'}</div>
              <div className="preview-body">{body || 'Notification message preview will appear here.'}</div>
            </div>
          </div>

          <button
            onClick={sendNotification}
            className="notif-send-btn"
            disabled={loading || !title.trim() || !body.trim()}
          >
            {loading ? (
              <span>Broadcasting...</span>
            ) : (
              <>
                <FaPaperPlane />
                <span>Send Broadcast to {topic}s</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notifications;

