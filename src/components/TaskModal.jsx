import React from 'react';
import { 
  X, 
  Calendar, 
  User, 
  Tag as TagIcon, 
  Clock, 
  MessageSquare, 
  Paperclip, 
  ExternalLink,
  History,
  AlertCircle,
  CheckCircle2,
  Circle,
  Ban
} from 'lucide-react';
import Badge from './Badge';
import './TaskModal.css';

const PRIORITY_CONFIG = {
  High: { label: 'High', color: 'high', icon: AlertCircle },
  Medium: { label: 'Medium', color: 'medium', icon: Circle },
  Low: { label: 'Low', color: 'low', icon: CheckCircle2 },
};

const STATUS_CONFIG = {
  'Not Started': { color: 'muted', icon: Circle },
  'In Progress': { color: 'primary', icon: History },
  'Completed':   { color: 'low', icon: CheckCircle2 },
  'Blocked':     { color: 'high', icon: Ban },
};

function TaskModal({ task, onClose }) {
  if (!task) return null;

  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.Low;
  const status = STATUS_CONFIG[task.status] || STATUS_CONFIG['Not Started'];

  return (
    <div className="task-modal-overlay" onClick={onClose}>
      <div className="task-modal-content" onClick={e => e.stopPropagation()}>
        <header className="modal-header">
          <div className="modal-title-area">
            <span className="modal-task-id">#{task.id}</span>
            <div className="modal-badges">
              <Badge color={priority.color} tone="soft" icon={priority.icon}>{priority.label}</Badge>
              <Badge color={status.color} tone="solid" icon={status.icon}>{task.status}</Badge>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        <div className="modal-body">
          <div className="modal-main">
            <h2 className="modal-task-name">{task.taskName}</h2>
            
            <div className="modal-section">
              <h4 className="section-title"><TagIcon size={14} /> Description</h4>
              <p className="modal-description">
                {task.description || "No description provided for this task."}
              </p>
            </div>

            {task.notes && (
              <div className="modal-section">
                <h4 className="section-title"><Paperclip size={14} /> Attachments</h4>
                <div className="modal-attachment">
                  <div className="attachment-info">
                    <span className="file-name">{task.notes.fileName}</span>
                    <a href={task.notes.downloadUrl} target="_blank" rel="noopener noreferrer" className="download-link">
                      <ExternalLink size={14} /> View File
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          <aside className="modal-sidebar">
            <div className="sidebar-group">
              <label>Assignee</label>
              <div className="sidebar-user">
                <div className="user-avatar-md">{task.assignedTo?.name?.charAt(0)}</div>
                <div className="user-info">
                  <span className="user-name">{task.assignedTo?.name || 'Unassigned'}</span>
                  <span className="user-role">{task.assignedTo?.role || 'Member'}</span>
                </div>
              </div>
            </div>

            <div className="sidebar-group">
              <label>Project</label>
              <div className="sidebar-project">
                {task.project ? (
                  <Badge color="muted" tone="soft">{task.project.name}</Badge>
                ) : (
                  <span className="none-text">No Project</span>
                )}
              </div>
            </div>

            <div className="sidebar-group">
              <label>Dates</label>
              <div className="date-item">
                <Calendar size={14} />
                <span>Due {new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="date-item muted">
                <Clock size={14} />
                <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="sidebar-group">
              <label>Tags</label>
              <div className="sidebar-tags">
                {task.tags?.map(tag => (
                  <Badge key={tag} color="primary" tone="outline">{tag}</Badge>
                )) || <span className="none-text">No tags</span>}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default TaskModal;
