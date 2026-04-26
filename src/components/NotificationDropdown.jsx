import { useState, useEffect } from 'react';
import { 
  Pin, 
  CheckCircle2, 
  XCircle, 
  Mail, 
  Clock, 
  Bell, 
  Check, 
  X,
  Hourglass
} from 'lucide-react';
import './Navbar.css';

function getTimeRemaining(deadline) {
  const total = Date.parse(deadline) - Date.parse(new Date());
  if (total <= 0) return null;
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  return { total, hours, minutes };
}

function LiveTimer({ deadline }) {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(deadline));

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getTimeRemaining(deadline);
      setTimeLeft(remaining);
      if (!remaining) clearInterval(interval);
    }, 60000); 
    return () => clearInterval(interval);
  }, [deadline]);

  if (!timeLeft) return <span className="timer-expired">Expired</span>;
  return (
    <span className="live-timer-v2">
      <Hourglass size={12} /> {timeLeft.hours}h {timeLeft.minutes}m left
    </span>
  );
}

function NotificationDropdown({ notifications, onMarkAsRead, onMarkAllAsRead, onNotificationClick, onClose }) {
  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type) => {
    switch (type) {
      case 'task_assigned': return <Pin size={16} />;
      case 'timesheet_approved': return <CheckCircle2 size={16} className="text-low" />;
      case 'timesheet_rejected': return <XCircle size={16} className="text-high" />;
      case 'timesheet_submitted': return <Mail size={16} className="text-warning" />;
      case 'deadline_approaching': return <Clock size={16} className="text-warning" />;
      default: return <Bell size={16} />;
    }
  };

  const handleItemClick = (notification) => {
    if (notification.taskId) {
      const taskId = typeof notification.taskId === 'object' ? (notification.taskId.id || notification.taskId._id) : notification.taskId;
      if (taskId) onNotificationClick(taskId);
    }
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <div className="notification-dropdown">
      <div className="dropdown-header">
        <h3>Notifications</h3>
        <div className="header-actions">
          {unreadCount > 0 && (
            <button 
              className="mark-all-read-v2" 
              onClick={(e) => {
                e.stopPropagation();
                onMarkAllAsRead();
              }}
            >
              <Check size={14} /> Mark all read
            </button>
          )}
          <button className="close-dropdown-v2" onClick={onClose}><X size={16} /></button>
        </div>
      </div>
      <div className="notification-list">
        {notifications.length === 0 ? (
          <div className="empty-notifications">
            <Bell size={32} strokeWidth={1} />
            <p>No new notifications</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification-item-v2 ${notification.read ? 'read' : 'unread'}`} 
              onClick={() => handleItemClick(notification)}
            >
              <div className="notification-icon-wrapper">{getIcon(notification.type)}</div>
              <div className="notification-body">
                <p className="notification-msg">{notification.message}</p>
                {notification.type === 'deadline_approaching' && notification.taskId?.deadline && (
                  <div className="notification-timer-v2">
                    <LiveTimer deadline={notification.taskId.deadline} />
                  </div>
                )}
                <span className="notification-timestamp">{new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
              </div>
              {!notification.read && <div className="unread-indicator-dot"></div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default NotificationDropdown;

