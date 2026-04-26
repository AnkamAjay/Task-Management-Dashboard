import { useNavigate } from 'react-router-dom';
import { 
  ClipboardCheck, 
  Search, 
  LayoutDashboard, 
  Clock, 
  BarChart3, 
  HelpCircle, 
  Settings, 
  Sun, 
  Moon, 
  LogOut,
  X,
  Maximize2,
  Minimize2,
  Filter
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import NotificationBell from './NotificationBell';
import './Navbar.css';

function Navbar({ 
  searchTerm, 
  onSearchChange, 
  priorityFilter, 
  onPriorityChange, 
  lastUpdated, 
  taskCount, 
  onNavigateToTask,
  density,
  onDensityChange
}) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const formattedTime = lastUpdated
    ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Fetching...';

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <div className="brand-icon">
          <ClipboardCheck size={24} color="var(--accent)" strokeWidth={2.5} />
        </div>
        <div className="brand-text">
          <h1>Task Dashboard</h1>
          <span className="brand-subtitle">{user?.role === 'admin' ? 'Admin View' : 'My Tasks'}</span>
        </div>
      </div>

      <div className="navbar-controls">
        {onSearchChange && user?.role !== 'admin' && (
          <div className="search-wrapper-v2">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              className="search-input-v2"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-btn" onClick={() => onSearchChange('')}>
                <X size={12} />
              </button>
            )}
          </div>
        )}

        {onPriorityChange && (
          <div className="priority-pill-v2">
            <Filter size={14} />
            <select
              value={priorityFilter}
              onChange={(e) => onPriorityChange(e.target.value)}
            >
              <option value="All">All</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        )}

        {onDensityChange && (
          <button 
            className="density-toggle-btn" 
            onClick={() => onDensityChange(density === 'comfortable' ? 'compact' : 'comfortable')}
            title={density === 'comfortable' ? 'Switch to Compact View' : 'Switch to Comfortable View'}
          >
            {density === 'comfortable' ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        )}
      </div>

      <div className="navbar-meta">
        {taskCount !== undefined && (
          <div className="task-count">
            <span className="count-badge">{taskCount}</span>
            <span className="task-count-text">tasks</span>
          </div>
        )}
        {taskCount !== undefined && (
          <div className="refresh-info">
            <span className="pulse-dot" style={{ display: lastUpdated ? 'inline-block' : 'none' }}></span>
            <span>{lastUpdated ? `Updated ${formattedTime}` : 'Not Polling'}</span>
          </div>
        )}

        <button className="admin-link-btn" onClick={() => navigate('/')}>
          <LayoutDashboard size={14} /> Dashboard
        </button>
        <button className="admin-link-btn" onClick={() => navigate('/timesheet')}>
          <Clock size={14} /> Timesheet
        </button>
        <button className="admin-link-btn" onClick={() => navigate('/analytics')}>
          <BarChart3 size={14} /> Reports
        </button>
        <button className="admin-link-btn" onClick={() => navigate('/help')}>
          <HelpCircle size={14} /> Help
        </button>

        {user?.role === 'admin' && (
          <a href="/admin/" className="admin-link-btn">
            <Settings size={14} /> Admin Panel
          </a>
        )}
        <button 
          className="bell-btn" 
          onClick={toggleTheme} 
          title="Toggle Theme"
          style={{ marginRight: '8px' }}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <NotificationBell onNavigateToTask={onNavigateToTask} />
        <div className="user-section">
          <div className="user-avatar">{user?.name?.charAt(0)?.toUpperCase()}</div>
          <span className="user-name">{user?.name}</span>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
