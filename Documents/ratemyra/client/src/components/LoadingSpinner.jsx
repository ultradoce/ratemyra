import React from 'react';
import './LoadingSpinner.css';

function LoadingSpinner({ size = 'medium', fullScreen = false }) {
  const sizeClass = `spinner-${size}`;
  const className = fullScreen ? `loading-fullscreen ${sizeClass}` : sizeClass;

  return (
    <div className={className}>
      <div className="spinner"></div>
      {fullScreen && <p className="loading-text">Loading...</p>}
    </div>
  );
}

export default LoadingSpinner;
