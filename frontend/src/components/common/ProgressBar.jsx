import React from 'react';

export function ProgressBar({
  actual = 0,
  planned = null,
  showLabel = true,
  height = '8px',
  compact = false
}) {
  const actualNum = Math.min(100, Math.max(0, Number(actual) || 0));
  const plannedNum = planned !== null && planned !== undefined ? Math.min(100, Math.max(0, Number(planned) || 0)) : null;

  // Determine status color
  let progressColor = 'var(--color-primary-600)';
  if (plannedNum !== null) {
    if (actualNum < plannedNum - 5) {
      progressColor = 'var(--color-danger-600)'; // Behind
    } else if (actualNum >= plannedNum) {
      progressColor = 'var(--color-success-600)'; // On track / ahead
    } else {
      progressColor = 'var(--color-warning-600)';
    }
  }

  return (
    <div className={`progress-container ${compact ? 'progress-compact' : ''}`}>
      {showLabel && (
        <div className="progress-labels">
          <div className="progress-label-main">
            <span className="progress-value font-mono">{actualNum.toFixed(1)}%</span>
            {plannedNum !== null && (
              <span className="progress-planned text-muted">
                (Target: {plannedNum.toFixed(1)}%)
              </span>
            )}
          </div>
          {plannedNum !== null && (
            <span
              className={`progress-variance ${
                actualNum >= plannedNum
                  ? 'text-success'
                  : actualNum >= plannedNum - 5
                  ? 'text-warning'
                  : 'text-danger'
              }`}
            >
              {actualNum >= plannedNum ? 'On Track' : `${(plannedNum - actualNum).toFixed(1)}% Behind`}
            </span>
          )}
        </div>
      )}
      <div className="progress-track" style={{ height }}>
        {plannedNum !== null && (
          <div
            className="progress-marker"
            style={{ left: `${plannedNum}%` }}
            title={`Target Planned: ${plannedNum}%`}
          />
        )}
        <div
          className="progress-fill"
          style={{
            width: `${actualNum}%`,
            backgroundColor: progressColor,
            height: '100%'
          }}
        />
      </div>
    </div>
  );
}
