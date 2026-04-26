import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Edit2, 
  Trash2, 
  Send,
  Users,
  Check,
  AlertCircle,
  Calendar,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import Badge from '../components/Badge';
import Sidebar from '../components/Sidebar';
import './Timesheet.css';

const API_BASE = import.meta.env.VITE_API_URL || '';

const getMonday = (d) => {
  const date = new Date(d);
  const day = date.getDay(), diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

const getSunday = (monday) => {
  const date = new Date(monday);
  date.setDate(date.getDate() + 6);
  date.setHours(23, 59, 59, 999);
  return date;
};

const formatDate = (date) => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatISO = (date) => date.toISOString().split('T')[0];

const formatDuration = (seconds) => {
  if (!seconds || seconds === 0) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const STATUS_CONFIG = {
  submitted: { color: 'warning', icon: Clock, label: 'Pending Review' },
  approved:  { color: 'low', icon: CheckCircle2, label: 'Approved' },
  rejected:  { color: 'high', icon: XCircle, label: 'Rejected' },
};

export default function Timesheet() {
  const { token, user } = useAuth();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('me');

  const [weekSubmission, setWeekSubmission] = useState(null); 
  const [pendingSubmissions, setPendingSubmissions] = useState([]); 
  const [submitLoading, setSubmitLoading] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const [rejectingId, setRejectingId] = useState(null);
  const [projects, setProjects] = useState([]);

  const [editingEntry, setEditingEntry] = useState(null);
  const [editFormData, setEditFormData] = useState({
    startTime: '',
    endTime: '',
    description: '',
    billable: false
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [allTasks, setAllTasks] = useState([]); 

  const monday = useMemo(() => getMonday(currentDate), [currentDate]);
  const sunday = useMemo(() => getSunday(monday), [monday]);

  const authHeader = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (user?.role === 'admin') {
      axios.get(`${API_BASE}/api/users`, { headers: authHeader })
        .then(res => setUsers(res.data))
        .catch(err => console.error(err));
    }
    axios.get(`${API_BASE}/api/projects`, { headers: authHeader })
      .then(res => setProjects(res.data))
      .catch(err => console.error(err));
  }, [user, token]);

  const fetchTimesheet = useCallback(async () => {
    setLoading(true);
    try {
      const url = `${API_BASE}/api/time-entries?from=${formatISO(monday)}&to=${formatISO(sunday)}&user=${selectedUser}`;
      const res = await axios.get(url, { headers: authHeader });
      setEntries(res.data);
    } catch (error) {
      console.error('Failed to load timesheet', error);
    } finally {
      setLoading(false);
    }
  }, [monday, sunday, selectedUser, token]);

  const fetchSubmissionStatus = useCallback(async () => {
    try {
      let queryUrl = `${API_BASE}/api/timesheets`;
      if (user?.role === 'admin') {
        queryUrl += `?userId=${selectedUser === 'me' ? user.id : selectedUser}`;
      }
      
      const res = await axios.get(queryUrl, { headers: authHeader });
      const weekStart = formatISO(monday);
      const match = res.data.find(ts => formatISO(new Date(ts.weekStart)) === weekStart);
      setWeekSubmission(match || null);
    } catch (err) {
      console.error('Failed to fetch submission status', err);
    }
  }, [monday, selectedUser, user, token]);

  const fetchPendingSubmissions = useCallback(async () => {
    if (user?.role !== 'admin') return;
    try {
      const res = await axios.get(`${API_BASE}/api/timesheets?status=submitted`, { headers: authHeader });
      setPendingSubmissions(res.data);
    } catch (err) {
      console.error('Failed to fetch pending submissions', err);
    }
  }, [user, token]);

  const fetchAllTasks = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/tasks`, { headers: authHeader });
      setAllTasks(res.data);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchTimesheet();
      fetchSubmissionStatus();
      fetchPendingSubmissions();
      fetchAllTasks();
    }
  }, [fetchTimesheet, fetchSubmissionStatus, fetchPendingSubmissions, fetchAllTasks, token]);

  const handleSubmit = async () => {
    setSubmitLoading(true);
    try {
      await axios.post(`${API_BASE}/api/timesheets/submit`, {
        weekStart: monday.toISOString(),
        weekEnd: sunday.toISOString()
      }, { headers: authHeader });
      await fetchSubmissionStatus();
    } catch (err) {
      console.error('Submit failed', err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.patch(`${API_BASE}/api/timesheets/${id}/approve`, {}, { headers: authHeader });
      await fetchPendingSubmissions();
    } catch (err) {
      console.error('Approve failed', err);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.patch(`${API_BASE}/api/timesheets/${id}/reject`, { adminNote: rejectNote }, { headers: authHeader });
      setRejectingId(null);
      setRejectNote('');
      await fetchPendingSubmissions();
    } catch (err) {
      console.error('Reject failed', err);
    }
  };

  const handlePrevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const handleEditClick = (entry) => {
    const formatForInput = (isoStr) => {
      if (!isoStr) return '';
      const date = new Date(isoStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    setEditingEntry(entry);
    setEditFormData({
      taskId: entry.task?.id || entry.task?._id || entry.task || '',
      startTime: formatForInput(entry.startTime),
      endTime: formatForInput(entry.endTime),
      description: entry.description || '',
      billable: entry.billable || false
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      await axios.put(`${API_BASE}/api/time-entries/${editingEntry.id}`, editFormData, { headers: authHeader });
      setIsEditModalOpen(false);
      fetchTimesheet();
    } catch (err) {
      console.error('Edit failed', err);
      alert(err.response?.data?.message || 'Failed to update time entry');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteEntry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this time entry?')) return;
    try {
      await axios.delete(`${API_BASE}/api/time-entries/${id}`, { headers: authHeader });
      fetchTimesheet();
    } catch (err) {
      console.error('Delete failed', err);
      alert('Failed to delete time entry');
    }
  };

  const aggregatedData = useMemo(() => {
    const taskMap = {};
    const dayTotals = [0, 0, 0, 0, 0, 0, 0];
    let grandTotal = 0;

    entries.forEach(entry => {
      if (!entry.task) return;
      const taskId = entry.task.id || entry.task._id || entry.task;
      const taskName = entry.task.taskName || 'Unknown Task';

      if (!taskMap[taskId]) {
        taskMap[taskId] = { taskName, days: [0, 0, 0, 0, 0, 0, 0], totalRow: 0 };
      }

      const entryDate = new Date(entry.startTime);
      let dayIndex = entryDate.getDay() - 1;
      if (dayIndex === -1) dayIndex = 6;

      if (entryDate >= monday && entryDate <= sunday) {
        const dur = entry.duration || 0;
        taskMap[taskId].days[dayIndex] += dur;
        taskMap[taskId].totalRow += dur;
        dayTotals[dayIndex] += dur;
        grandTotal += dur;
      }
    });

    return { rows: Object.values(taskMap), dayTotals, grandTotal };
  }, [entries, monday, sunday]);

  const currentStatus = weekSubmission ? STATUS_CONFIG[weekSubmission.status] : null;

  return (
    <div className="app-wrapper">
      <Navbar />
      <div className="dashboard-layout-container">
        <Sidebar projects={projects} user={user} onProjectSelect={() => {}} />
        <main className="main-content">
          <div className="timesheet-container">

          <div className="timesheet-header">
            <div className="week-nav">
              <button className="nav-btn" onClick={handlePrevWeek}><ChevronLeft size={16} /></button>
              <div className="date-range">
                <Calendar size={16} />
                <span>{formatDate(monday)} &ndash; {formatDate(sunday)}</span>
              </div>
              <button className="nav-btn" onClick={handleNextWeek}><ChevronRight size={16} /></button>
            </div>

            <div className="timesheet-actions">
              {user?.role === 'admin' && (
                <div className="user-switcher-v2">
                  <Users size={16} />
                  <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
                    <option value="me">My Timesheet</option>
                    <optgroup label="Team Members">
                      {users.map(u => (
                        <option key={u._id || u.id} value={u._id || u.id}>{u.name}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              )}

              {currentStatus && (
                <Badge color={currentStatus.color} tone="soft" icon={currentStatus.icon}>
                  {currentStatus.label}
                  {weekSubmission.status === 'rejected' && weekSubmission.adminNote && (
                    <span className="reject-note"> : {weekSubmission.adminNote}</span>
                  )}
                </Badge>
              )}

              {(user?.role !== 'admin' || selectedUser === 'me') && (
                <button
                  className="submit-v2-btn"
                  onClick={handleSubmit}
                  disabled={submitLoading || weekSubmission?.status === 'submitted' || weekSubmission?.status === 'approved'}
                >
                  {submitLoading ? <RefreshCw size={14} className="spin" /> : <Send size={14} />}
                  {weekSubmission?.status === 'approved' ? 'Approved' :
                   weekSubmission?.status === 'submitted' ? 'Submitted' :
                   weekSubmission?.status === 'rejected' ? 'Resubmit' : 'Submit Week'}
                </button>
              )}
            </div>
          </div>

          <div className="timesheet-card">
            <div className="timesheet-table-wrapper">
              <table className="timesheet-table">
                <thead>
                  <tr>
                    <th className="task-col">Task Name</th>
                    {DAYS.map(d => <th key={d}>{d}</th>)}
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="loading-td">
                        <LoadingSpinner />
                      </td>
                    </tr>
                  ) : aggregatedData.rows.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="empty-td">
                        <div className="empty-state-mini">
                          <Clock size={32} strokeWidth={1} />
                          <p>No time logged this week.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <>
                      {aggregatedData.rows.map((row, idx) => (
                        <tr key={idx}>
                          <td className="task-col">{row.taskName}</td>
                          {row.days.map((seconds, i) => (
                            <td key={i} className={seconds === 0 ? 'empty-cell' : 'active-cell'}>
                              {formatDuration(seconds)}
                            </td>
                          ))}
                          <td className="row-total">{formatDuration(row.totalRow)}</td>
                        </tr>
                      ))}
                      <tr className="total-row">
                        <td className="task-col">Weekly Total</td>
                        {aggregatedData.dayTotals.map((seconds, i) => (
                          <td key={i} className={seconds === 0 ? 'empty-cell' : ''}>
                            {formatDuration(seconds)}
                          </td>
                        ))}
                        <td className="grand-total">{formatDuration(aggregatedData.grandTotal)}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="time-entries-details">
            <div className="section-header">
              <h3><Clock size={18} /> Entry Details</h3>
            </div>
            <div className="entries-card">
              <table className="entries-list-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Task</th>
                    <th>Description</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Duration</th>
                    <th style={{ textAlign: 'center' }}>Billable</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="empty-td">No individual entries found.</td>
                    </tr>
                  ) : (
                    entries.map(entry => {
                      const entryUserId = entry.user?.id || entry.user?._id || entry.user;
                      const isOwner = user && String(entryUserId) === String(user.id);
                      const isLocked = weekSubmission?.status === 'approved';
                      const canModify = isOwner && !isLocked;

                      return (
                        <tr key={entry.id}>
                          <td>{new Date(entry.startTime).toLocaleDateString()}</td>
                          <td className="task-name-cell">{entry.task?.taskName || 'Unknown Task'}</td>
                          <td className="desc-cell" title={entry.description}>{entry.description || '—'}</td>
                          <td className="time-cell">{new Date(entry.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                          <td className="time-cell">{entry.endTime ? new Date(entry.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Running...'}</td>
                          <td className="duration-cell">{formatDuration(entry.duration)}</td>
                          <td style={{ textAlign: 'center' }}>
                            {entry.billable ? <Check size={16} className="billable-icon" /> : <span className="muted-dash">—</span>}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div className="actions-cell">
                              <button 
                                className="action-btn edit" 
                                onClick={() => handleEditClick(entry)}
                                disabled={!canModify}
                                title={isLocked ? "Locked" : "Edit"}
                              >
                                <Edit2 size={14} />
                              </button>
                              <button 
                                className="action-btn delete" 
                                onClick={() => handleDeleteEntry(entry.id)}
                                disabled={!canModify}
                                title={isLocked ? "Locked" : "Delete"}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {isEditModalOpen && (
            <div className="modal-overlay">
              <div className="edit-modal">
                <div className="modal-header">
                  <h3>Edit Time Entry</h3>
                  <button className="close-modal" onClick={() => setIsEditModalOpen(false)}><X size={20} /></button>
                </div>
                <form onSubmit={handleEditSubmit}>
                  <div className="form-group">
                    <label>Task</label>
                    <select 
                      required
                      value={editFormData.taskId}
                      onChange={e => setEditFormData({...editFormData, taskId: e.target.value})}
                    >
                      <option value="">Select a task</option>
                      {allTasks.map(t => (
                        <option key={t.id} value={t.id}>{t.taskName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Start</label>
                      <input 
                        type="datetime-local" 
                        required 
                        value={editFormData.startTime}
                        onChange={e => setEditFormData({...editFormData, startTime: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>End</label>
                      <input 
                        type="datetime-local" 
                        required
                        value={editFormData.endTime}
                        onChange={e => setEditFormData({...editFormData, endTime: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea 
                      placeholder="What did you work on?"
                      value={editFormData.description}
                      onChange={e => setEditFormData({...editFormData, description: e.target.value})}
                    />
                  </div>
                  <div className="form-group billable-toggle">
                    <label className="checkbox-container">
                      <input 
                        type="checkbox" 
                        checked={editFormData.billable}
                        onChange={e => setEditFormData({...editFormData, billable: e.target.checked})}
                      />
                      <span className="checkmark"></span>
                      Billable Task
                    </label>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="cancel-btn" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                    <button type="submit" className="save-btn" disabled={editLoading}>
                      {editLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {user?.role === 'admin' && pendingSubmissions.length > 0 && (
            <div className="approval-queue">
              <div className="section-header">
                <h3><Users size={18} /> Pending Approvals ({pendingSubmissions.length})</h3>
              </div>
              <div className="approval-grid">
                {pendingSubmissions.map(ts => (
                  <div key={ts.id} className="approval-card-v2">
                    <div className="approval-user-info">
                      <div className="user-avatar-small">
                        {ts.user?.name?.charAt(0)}
                      </div>
                      <div className="user-text">
                        <div className="name">{ts.user?.name}</div>
                        <div className="date">{formatDate(new Date(ts.weekStart))} – {formatDate(new Date(ts.weekEnd))}</div>
                      </div>
                    </div>

                    <div className="approval-actions-v2">
                      <button className="approve-v2-btn" onClick={() => handleApprove(ts.id)}>
                        <Check size={14} /> Approve
                      </button>
                      {rejectingId === ts.id ? (
                        <div className="reject-form-v2">
                          <input
                            type="text"
                            placeholder="Reason..."
                            value={rejectNote}
                            onChange={e => setRejectNote(e.target.value)}
                          />
                          <button className="confirm-btn" onClick={() => handleReject(ts.id)}>Reject</button>
                          <button className="cancel-mini-btn" onClick={() => setRejectingId(null)}>Cancel</button>
                        </div>
                      ) : (
                        <button className="reject-v2-btn" onClick={() => setRejectingId(ts.id)}>
                          <AlertCircle size={14} /> Reject
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  </div>
);
}

