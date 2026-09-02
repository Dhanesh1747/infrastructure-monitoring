import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { PROJECT_STATUSES } from '../../utils/constants';

export function UpdateProgressModal({
  isOpen,
  onClose,
  project,
  onSuccess,
  apiCall
}) {
  const [actualProgress, setActualProgress] = useState(0);
  const [status, setStatus] = useState('IN_PROGRESS');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (project) {
      setActualProgress(project.actual_progress !== undefined ? project.actual_progress : 0);
      setStatus(project.status || 'IN_PROGRESS');
      setError(null);
    }
  }, [project, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const progressNum = parseFloat(actualProgress);
    if (isNaN(progressNum) || progressNum < 0 || progressNum > 100) {
      setError('Progress must be a valid number between 0 and 100%');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await apiCall(project.project_id, {
        actualProgress: progressNum,
        status: status
      });
      onSuccess('Project progress and status updated successfully.');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update project progress.');
    } finally {
      setLoading(false);
    }
  };

  if (!project) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Project Progress"
      subtitle={`${project.project_code} — ${project.project_name}`}
      maxWidth="500px"
    >
      <form onSubmit={handleSubmit} className="form-stack">
        {error && (
          <div className="alert-banner alert-banner-danger">
            <span>{error}</span>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="actualProgress" className="form-label">
            Actual Physical Progress (%) <span className="required">*</span>
          </label>
          <div className="input-group">
            <input
              id="actualProgress"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={actualProgress}
              onChange={(e) => setActualProgress(e.target.value)}
              className="form-control font-mono"
              required
            />
            <span className="input-suffix">%</span>
          </div>
          <span className="form-help">
            Target planned progress: {project.planned_progress}%
          </span>
        </div>

        <div className="form-group">
          <label htmlFor="projectStatus" className="form-label">
            Execution Status <span className="required">*</span>
          </label>
          <select
            id="projectStatus"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="form-select"
            required
          >
            {PROJECT_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving Changes...' : 'Save Progress Update'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
