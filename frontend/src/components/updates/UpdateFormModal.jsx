import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { toDateInputValue } from '../../utils/formatters';

export function UpdateFormModal({
  isOpen,
  onClose,
  update, // if set -> edit mode, if null -> create mode
  projects = [],
  users = [],
  defaultProjectId = null,
  onSave
}) {
  const isEdit = Boolean(update);

  const [projectId, setProjectId] = useState('');
  const [updateDate, setUpdateDate] = useState('');
  const [physicalProgress, setPhysicalProgress] = useState(0);
  const [expenditure, setExpenditure] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submittedBy, setSubmittedBy] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (update) {
      setProjectId(update.project_id || '');
      setUpdateDate(toDateInputValue(update.update_date));
      setPhysicalProgress(update.physical_progress !== undefined ? update.physical_progress : 0);
      setExpenditure(update.expenditure !== undefined ? update.expenditure : '');
      setRemarks(update.remarks || '');
      setSubmittedBy(update.submitted_by || '');
    } else {
      setProjectId(defaultProjectId || (projects[0]?.project_id ? String(projects[0].project_id) : ''));
      setUpdateDate(new Date().toISOString().split('T')[0]);
      setPhysicalProgress(0);
      setExpenditure('');
      setRemarks('');
      setSubmittedBy(users[0]?.userId ? String(users[0].userId) : '');
    }
    setError(null);
  }, [update, defaultProjectId, projects, users, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!projectId) {
      setError('Please select an associated project.');
      return;
    }
    if (!updateDate) {
      setError('Update date is required.');
      return;
    }
    const progressNum = parseFloat(physicalProgress);
    if (isNaN(progressNum) || progressNum < 0 || progressNum > 100) {
      setError('Physical progress must be between 0 and 100%.');
      return;
    }
    const expNum = parseFloat(expenditure);
    if (isNaN(expNum) || expNum < 0) {
      setError('Expenditure amount must be a positive number.');
      return;
    }
    if (!submittedBy) {
      setError('Please select the reporting officer/supervisor.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        projectId: Number(projectId),
        updateDate,
        physicalProgress: progressNum,
        expenditure: expNum,
        remarks: remarks.trim(),
        submittedBy: Number(submittedBy)
      };

      await onSave(payload, update?.update_id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to record project update.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Progress Update' : 'Log Project Progress & Expenditure'}
      subtitle={isEdit ? `Modifying Progress Log #${update.update_id}` : 'Record verified on-site completion and fiscal utilization'}
      maxWidth="600px"
    >
      <form onSubmit={handleSubmit} className="form-stack">
        {error && (
          <div className="alert-banner alert-banner-danger">
            <span>{error}</span>
          </div>
        )}

        <div className="form-grid-2">
          <div className="form-group">
            <label htmlFor="u-project" className="form-label">
              Associated Project <span className="required">*</span>
            </label>
            <select
              id="u-project"
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

          <div className="form-group">
            <label htmlFor="u-date" className="form-label">
              Inspection / Log Date <span className="required">*</span>
            </label>
            <input
              id="u-date"
              type="date"
              className="form-control"
              value={updateDate}
              onChange={(e) => setUpdateDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label htmlFor="u-progress" className="form-label">
              Physical Progress Verified (%) <span className="required">*</span>
            </label>
            <div className="input-group">
              <input
                id="u-progress"
                type="number"
                min="0"
                max="100"
                step="0.1"
                className="form-control font-mono"
                value={physicalProgress}
                onChange={(e) => setPhysicalProgress(e.target.value)}
                required
              />
              <span className="input-suffix">%</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="u-expenditure" className="form-label">
              Cumulative Expenditure (₹ INR) <span className="required">*</span>
            </label>
            <div className="input-group">
              <span className="input-prefix">₹</span>
              <input
                id="u-expenditure"
                type="number"
                min="0"
                step="1000"
                className="form-control font-mono"
                placeholder="e.g. 15000000"
                value={expenditure}
                onChange={(e) => setExpenditure(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="u-officer" className="form-label">
            Submitted By (Officer / Supervisor) <span className="required">*</span>
          </label>
          <select
            id="u-officer"
            className="form-select"
            value={submittedBy}
            onChange={(e) => setSubmittedBy(e.target.value)}
            required
          >
            <option value="">-- Select Officer --</option>
            {users.map((u) => (
              <option key={u.userId} value={u.userId}>
                {u.fullName} ({u.designation} \u2022 {u.department})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="u-remarks" className="form-label">
            Site Observations & Remarks <span className="required">*</span>
          </label>
          <textarea
            id="u-remarks"
            className="form-textarea"
            rows={3}
            placeholder="Document structural progress, machinery deployment, resource bottlenecks, or quality assurance status..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            required
          />
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
            {loading ? 'Submitting...' : isEdit ? 'Save Update Changes' : 'Submit Progress Log'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
