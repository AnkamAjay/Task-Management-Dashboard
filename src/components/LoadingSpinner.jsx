import './LoadingSpinner.css';

function LoadingSpinner() {
  return (
    <div className="spinner-container">
      <div className="skeleton-rows">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton-row" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="skeleton-cell sm"></div>
            <div className="skeleton-cell lg"></div>
            <div className="skeleton-cell md"></div>
            <div className="skeleton-cell md"></div>
            <div className="skeleton-cell md"></div>
            <div className="skeleton-cell sm"></div>
            <div className="skeleton-cell sm"></div>
            <div className="skeleton-cell md"></div>
          </div>
        ))}
      </div>
      <p className="spinner-label">Loading tasks from server...</p>
    </div>
  );
}

export default LoadingSpinner;
