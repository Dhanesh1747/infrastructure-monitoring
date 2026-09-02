import React from 'react';

export function LoadingState({ message = 'Loading system data...' }) {
  return (
    <div className="loading-state">
      <div className="spinner" />
      <span className="loading-message">{message}</span>
    </div>
  );
}
