import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

export function ErrorState({
  title = 'Unable to load data',
  message = 'A system error occurred while retrieving records. Please try again.',
  onRetry = null
}) {
  return (
    <div className="error-state">
      <div className="error-state-icon">
        <AlertOctagon size={36} />
      </div>
      <h4 className="error-state-title">{title}</h4>
      <p className="error-state-description">{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>
          <RefreshCw size={14} className="mr-1" />
          Retry Request
        </button>
      )}
    </div>
  );
}
