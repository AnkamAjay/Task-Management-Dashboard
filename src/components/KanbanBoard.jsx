import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Circle, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Plus,
  Calendar,
  Ban,
  Lock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Badge from './Badge';
import './KanbanBoard.css';

const STATUS_COLUMNS = ['Not Started', 'In Progress', 'Completed', 'Blocked'];

const STATUS_CONFIG = {
  'Not Started': { icon: Circle, color: 'muted' },
  'In Progress': { icon: RefreshCw, color: 'primary' },
  'Completed': { icon: CheckCircle2, color: 'low' },
  'Blocked': { icon: AlertCircle, color: 'high' },
};

const PRIORITY_CONFIG = {
  High: { color: 'high', icon: AlertCircle },
  Medium: { color: 'medium', icon: Circle },
  Low: { color: 'low', icon: CheckCircle2 },
};

function isOverdue(deadlineStr) {
  if (!deadlineStr) return false;
  return new Date(deadlineStr) < new Date();
}

function getTimeRemaining(deadlineStr) {
  const total = Date.parse(deadlineStr) - Date.parse(new Date());
  if (total <= 0) return null;
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  return { total, days, hours, minutes };
}

function KanbanCard({ task, onStatusChange, highlighted }) {
  const { token, user } = useAuth();
  const [localStatus, setLocalStatus] = useState(task.status);
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining(task.deadline));
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.Low;
  const overdue = isOverdue(task.deadline);
  const isDueSoon = timeRemaining && timeRemaining.total < 86400000;
  const isEffectivelyOverdue = overdue && task.status !== 'Completed';

  useEffect(() => {
    if (overdue || task.status === 'Completed') return;
    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining(task.deadline));
    }, 60000);
    return () => clearInterval(interval);
  }, [task.deadline, overdue, task.status]);

  const assignedUserId = typeof task.assignedTo === 'object' && task.assignedTo !== null
    ? (task.assignedTo.id || task.assignedTo._id)
    : task.assignedTo;
  const isOwner = assignedUserId && user && String(assignedUserId) === String(user.id);
  const canUpdateStatus = (isOwner || user?.role === 'admin') && !isEffectivelyOverdue;

  const handleStatusChange = async (e) => {
    if (!canUpdateStatus) return;
    const newStatus = e.target.value;
    const oldStatus = localStatus;
    setLocalStatus(newStatus);

    try {
      const API_BASE = import.meta.env.VITE_API_URL || '';
      await axios.patch(
        `${API_BASE}/api/tasks/${task.id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onStatusChange();
    } catch (err) {
      console.error(err);
      setLocalStatus(oldStatus);
      alert('Failed to update status');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div 
      id={`task-${task.id}`}
      className={`kanban-card priority-border-${task.priority.toLowerCase()} ${overdue && localStatus !== 'Completed' ? 'overdue' : ''} ${isDueSoon && localStatus !== 'Completed' ? 'due-soon' : ''} ${highlighted ? 'highlight-glow' : ''}`}
    >
      <div className="kanban-card-header">
        <div className="kanban-header-left">
          {task.project && (
            <Badge color="muted" tone="soft" size="sm">
              {task.project.name}
            </Badge>
          )}
        </div>
        <Badge color={priority.color} tone="soft" icon={priority.icon} size="sm">
          {task.priority}
        </Badge>
      </div>

      <div className="kanban-task-body">
        <h4 className="kanban-task-name">{task.taskName}</h4>
        <div className="kanban-task-badges">
          {task.isBillable && (
            <Badge color="low" tone="soft" size="sm" title="Billable Task">$</Badge>
          )}
          {task.tags?.map(tag => (
            <Badge key={tag} color="primary" tone="outline" size="sm">{tag}</Badge>
          ))}
        </div>
      </div>

      <div className="kanban-card-footer">
        {isDueSoon && localStatus !== 'Completed' && (
          <Badge color="warning" tone="soft" size="sm" className="pulse kanban-due-badge">
            Due in {timeRemaining.days > 0 ? `${timeRemaining.days}d ` : ''}{timeRemaining.hours}h {timeRemaining.minutes}m
          </Badge>
        )}
        {overdue && localStatus !== 'Completed' && (
          <Badge color="high" tone="solid" size="sm" className="kanban-due-badge">Overdue</Badge>
        )}
        
        <div className="kanban-footer-row">
          <div className="kanban-assignee">
            <div className="kanban-avatar-circle" title={task.assignedTo?.name}>
              {task.assignedTo?.name?.charAt(0) || '?'}
            </div>
            <span className="kanban-assignee-name">{task.assignedTo?.name?.split(' ')[0] || 'Unassigned'}</span>
          </div>
          <div className={`kanban-deadline-group ${overdue && localStatus !== 'Completed' ? 'overdue' : ''}`}>
            <Calendar size={12} />
            <span>{formatDate(task.deadline)}</span>
          </div>
        </div>
      </div>

      <div className="kanban-card-actions">
        <div className="kanban-status-wrapper">
          <select
            className={`kanban-status-v2-select color-${STATUS_CONFIG[localStatus]?.color}`}
            value={localStatus}
            onChange={handleStatusChange}
            disabled={!canUpdateStatus}
          >
            {STATUS_COLUMNS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <div className="kanban-status-icon">
            {isEffectivelyOverdue ? <Lock size={10} /> : React.createElement(STATUS_CONFIG[localStatus]?.icon || Circle, { size: 10 })}
          </div>
        </div>
      </div>
    </div>
  );
}

function KanbanBoard({ tasks, onRefresh, highlightedTaskId }) {
  const tasksByStatus = STATUS_COLUMNS.reduce((acc, status) => {
    acc[status] = tasks.filter(t => t.status === status);
    return acc;
  }, {});

  return (
    <div className="kanban-container">
      <div className="kanban-board">
        {STATUS_COLUMNS.map(status => (
          <div key={status} className="kanban-column">
            <div className="kanban-column-header">
              <div className={`column-status-icon color-${STATUS_CONFIG[status].color}`}>
                {React.createElement(STATUS_CONFIG[status].icon, { size: 14 })}
              </div>
              <h3>{status}</h3>
              <span className="column-count-badge">{tasksByStatus[status].length}</span>
            </div>
            <div className="kanban-column-content">
              {tasksByStatus[status].length === 0 ? (
                <div className="kanban-empty-column">No tasks</div>
              ) : (
                tasksByStatus[status].map(task => (
                  <KanbanCard 
                    key={task.id} 
                    task={task} 
                    onStatusChange={onRefresh} 
                    highlighted={String(task.id) === String(highlightedTaskId)} 
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default KanbanBoard;

