import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const API_BASE = import.meta.env.VITE_API_URL || '';

function NotificationDropdown({ notifications, onNotificationUpdate, onClose }) {
  const { token } = useAuth();
  const markAsRead = async (id) => {
    try {
      await axios.patch(`${API_BASE}/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onNotificationUpdate();
    } catch (err) {
      console.error('Mark as read error:', err);
    }
  };
  const getIcon = (type) => {
    switch (type) {
      case 'task_assigned': return '📌';
      case 'timesheet_approved': return '✅';
      case 'timesheet_rejected': return '❌';
      case 'deadline_approaching': return '⏰';
      default: return '📢';
    }
  };
  return (
    <div className="notification-dropdown">
      <div className="dropdown-header">
        <h3>Notifications</h3>
        <button className="close-dropdown" onClick={onClose}>✕</button>
      </div>
      <div className="notification-list">
        {notifications.length === 0 ? (
          <div className="empty-notifications">No new notifications</div>
        ) : (
          notifications.map(notification => (
            <div key={notification.id} className={`notification-item ${notification.read ? 'read' : 'unread'}`} onClick={() => !notification.read && markAsRead(notification.id)}>
              <div className="notification-icon">{getIcon(notification.type)}</div>
              <div className="notification-content">
                <p className="notification-message">{notification.message}</p>
                <span className="notification-time">{new Date(notification.createdAt).toLocaleString()}</span>
              </div>
              {!notification.read && <div className="unread-dot"></div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default NotificationDropdown;
