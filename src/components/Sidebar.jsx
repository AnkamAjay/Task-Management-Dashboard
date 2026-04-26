import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Inbox, 
  User, 
  Folder, 
  Settings, 
  BarChart3, 
  Clock, 
  HelpCircle,
  PlusCircle,
  Hash
} from 'lucide-react';
import './Sidebar.css';

function Sidebar({ projects, onProjectSelect, currentProject, user }) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'inbox', label: 'Inbox', icon: Inbox, path: '/' },
    { id: 'my-tasks', label: 'My Tasks', icon: User, path: '/' },
    { id: 'timesheet', label: 'Timesheet', icon: Clock, path: '/timesheet' },
    { id: 'reports', label: 'Reports', icon: BarChart3, path: '/analytics' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <div className="sidebar-label">Navigation</div>
        {navItems.map(item => (
          <div 
            key={item.id}
            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <item.icon size={16} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      <div className="sidebar-section">
        <div className="sidebar-label-row">
          <div className="sidebar-label">Projects</div>
          <PlusCircle size={14} className="add-icon" />
        </div>
        <div 
          className={`sidebar-item ${currentProject === 'all' ? 'active' : ''}`}
          onClick={() => onProjectSelect('all')}
        >
          <Hash size={16} />
          <span>All Projects</span>
        </div>
        {projects.map(p => (
          <div 
            key={p.id}
            className={`sidebar-item ${currentProject === p.id ? 'active' : ''}`}
            onClick={() => onProjectSelect(p.id)}
          >
            <div className="project-dot" style={{ backgroundColor: p.color || 'var(--accent)' }} />
            <span>{p.name}</span>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-item" onClick={() => navigate('/help')}>
          <HelpCircle size={16} />
          <span>Help & Feedback</span>
        </div>
        {user?.role === 'admin' && (
          <a href="/admin/" className="sidebar-item">
            <Settings size={16} />
            <span>Admin Settings</span>
          </a>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
