import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { ALERT_SEVERITIES, ALERT_TYPES } from '../../utils/constants';

export function AlertFormModal({
  isOpen,
  onClose,
  alert, // if set -> edit mode, if null -> create mode
  projects = [],
  defaultProjectId = null,
  onSave
}) {
  const isEdit = Boolean(alert);

  const [projectId, setProjectId] = useState('');
  const [alertType, setAlertType] = useState('PROGRESS_DELAY');
  const [severity, setSeverity] = useState('MEDIUM');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [resolved, setResolved] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (alert) {
      setProjectId(alert.project_id || '');
      setAlertType(alert.alert_type || 'OTHER');
      setSeverity(alert.severity || 'LOW');
      setTitle(alert.title || '');
      setMessage(alert.message || '');
      setResolved(Boolean(alert.is_resolved));
    } else {
      setProjectId(defaultProjectId || (projects[0]?.project_id ? String(projects[0].project_id) : ''));
      setAlertType('PROGRESS_DELAY');
      setSeverity('MEDIUM');
      setTitle('');
      setMessage('');
      setResolved(false);
    }
    setError(null);
  }, [alert, defaultProjectId, projects, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!projectId) {
      setError('Please select an associated project.');
      return;
    }
    if (!title.trim()) {
      setError('Alert title is required.');
      return;
    }
    if (!message.trim()) {
      setError('Alert description / message is required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        projectId: Number(projectId),
        alertType,
        severity,
        title: title.trim(),
        message: message.trim(),
        resolved: Boolean(resolved)
      };

      await onSave(payload, alert?.alert_id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save system alert.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit System Alert' : 'Issue Strategic Project Alert'}
      subtitle={isEdit ? `Modifying Alert #${alert.alert_id}` : 'Raise a risk, delay, or financial variance alert for immediate oversight'}
      maxWidth="580px"
    >
      <form onSubmit={handleSubmit} className="form-stack">
        {error && (
          <div className="alert-banner alert-banner-danger">
            <span>{error}</span>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="a-project" className="form-label">
            Associated Project <span className="required">*</span>
          </label>
          <select
            id="a-project"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="form-select"
            disabled={Boolean(defaultProjectId)}
            required
          >
            <option value="">-- Select Project --</option>
            {projects.map((p) => (
              <option key={p.project_id} value={p.project_id}>
                [{p.project_code}] {p.project_name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label htmlFor="a-type" className="form-label">
              Alert Category <span className="required">*</span>
            </label>
            <select
              id="a-type"
              className="form-select"
              value={alertType}
              onChange={(e) => setAlertType(e.target.value)}
              required
            >
              {ALERT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="a-severity" className="form-label">
              Severity Level <span className="required">*</span>
            </label>
            <select
              id="a-severity"
              className="form-select"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              required
            >
              {ALERT_SEVERITIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="a-title" className="form-label">
            Alert Summary / Headline <span className="required">*</span>
          </label>
          <input
            id="a-title"
            type="text"
            className="form-control"
            placeholder="e.g. Critical Milestone Delay on Pier Construction"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="a-msg" className="form-label">
            Detailed Issue & Action Required <span className="required">*</span>
          </label>
          <textarea
            id="a-msg"
            className="form-textarea"
            rows={3}
            placeholder="Describe the delay root cause, variance magnitude, and recommended intervention..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>

        {isEdit && (
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={resolved}
                onChange={(e) => setResolved(e.target.checked)}
              />
              <span>Mark this alert as Resolved</span>
            </label>
          </div>
        )}

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
            {loading ? 'Submitting...' : isEdit ? 'Save Alert' : 'Publish Alert'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
