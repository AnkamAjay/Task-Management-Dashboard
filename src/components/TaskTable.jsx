import React, { useState, useMemo } from 'react';
import axios from 'axios';
import {
  Inbox,
  Settings,
  ArrowUp,
  FolderOpen,
  Trash2,
  CheckCircle2,
  X
} from 'lucide-react';
import TaskCard from './TaskCard';
import { useAuth } from '../contexts/AuthContext';
import './TaskTable.css';

function TaskTable({ tasks, user, highlightedTaskId, density, onTaskClick, onRefresh }) {
  const { token } = useAuth();
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [busy, setBusy] = useState(false);

  const visibleIds = useMemo(() => tasks.map(t => String(t.id)), [tasks]);
  const allSelected = visibleIds.length > 0 && visibleIds.every(id => selectedIds.has(id));
  const someSelected = visibleIds.some(id => selectedIds.has(id));
  const isAdmin = user?.role === 'admin';

  const toggleOne = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      const key = String(id);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedIds(prev => {
      if (allSelected) return new Set();
      const next = new Set(prev);
      visibleIds.forEach(id => next.add(id));
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const runBulk = async (action, payload = {}) => {
    if (!isAdmin || selectedIds.size === 0) return;
    if (action === 'delete' && !window.confirm(`Delete ${selectedIds.size} task(s)? This cannot be undone.`)) return;
    setBusy(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || '';
      await axios.post(
        `${API_BASE}/api/tasks/bulk`,
        { taskIds: Array.from(selectedIds), action, payload },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      clearSelection();
      onRefresh && onRefresh();
    } catch (err) {
      console.error('Bulk action failed', err);
      alert(err?.response?.data?.message || 'Bulk action failed');
    } finally {
      setBusy(false);
    }
  };

  if (tasks.length === 0) {
    if (user?.role === 'admin') {
      return (
        <div className="empty-state">
          <div className="empty-icon-wrapper">
            <FolderOpen size={48} strokeWidth={1} />
          </div>
          <h2>No Tasks Found</h2>
          <p>No tasks match your filters or none have been created yet.</p>
          <a href="/admin/" className="empty-cta-btn">
            <Settings size={14} /> Go to Admin Panel
          </a>
        </div>
      );
    }
    return (
      <div className="empty-state">
        <div className="empty-icon-wrapper">
          <Inbox size={48} strokeWidth={1} />
        </div>
        <h2>All Caught Up!</h2>
        <p>You have no tasks assigned to you right now. Great job!</p>
      </div>
    );
  }

  return (
    <div className={`task-table-container density-${density}`}>
      <div className="table-header">
        <div className="col-select">
          <input
            type="checkbox"
            className="row-checkbox"
            checked={allSelected}
            ref={el => { if (el) el.indeterminate = !allSelected && someSelected; }}
            onChange={toggleAll}
            aria-label="Select all tasks"
          />
        </div>
        <div className="col-id">ID</div>
        <div className="col-name">Task</div>
        <div className="col-assigned">Assignee</div>
        <div className="col-deadline">
          Due <ArrowUp size={12} className="sort-icon-active" />
        </div>
        <div className="col-priority">Priority</div>
        <div className="col-status">Status</div>
        <div className="col-notes">Files</div>
      </div>
      <div className="table-body">
        {tasks.map((task, index) => (
          <div key={task.id} style={{ animationDelay: `${index * 0.05}s` }}>
            <TaskCard
              task={task}
              highlighted={String(task.id) === String(highlightedTaskId)}
              density={density}
              onClick={() => onTaskClick(task)}
              selected={selectedIds.has(String(task.id))}
              onToggleSelect={() => toggleOne(task.id)}
            />
          </div>
        ))}
      </div>

      {isAdmin && selectedIds.size > 0 && (
        <div className="bulk-action-bar-v2">
          <span className="bulk-info-v2">{selectedIds.size} selected</span>
          <button
            className="bulk-btn"
            disabled={busy}
            onClick={() => runBulk('status_change', { status: 'Completed' })}
          >
            <CheckCircle2 size={14} /> Mark Complete
          </button>
          <button
            className="bulk-btn bulk-btn-danger"
            disabled={busy}
            onClick={() => runBulk('delete')}
          >
            <Trash2 size={14} /> Delete
          </button>
          <button
            className="bulk-btn bulk-btn-ghost"
            onClick={clearSelection}
            title="Clear selection"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

export default TaskTable;

