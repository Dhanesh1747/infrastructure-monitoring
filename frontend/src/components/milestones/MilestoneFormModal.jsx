import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { MILESTONE_STATUSES } from '../../utils/constants';
import { toDateInputValue } from '../../utils/formatters';

export function MilestoneFormModal({
  isOpen,
  onClose,
  milestone, // if null -> Create mode, if set -> Edit mode
  projects = [],
  defaultProjectId = null,
  onSave
}) {
  const isEdit = Boolean(milestone);

  const [projectId, setProjectId] = useState('');
  const [milestoneName, setMilestoneName] = useState('');
  const [description, setDescription] = useState('');
  const [plannedDate, setPlannedDate] = useState('');
  const [actualDate, setActualDate] = useState('');
  const [status, setStatus] = useState('PENDING');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (milestone) {
      setProjectId(milestone.project_id || '');
      setMilestoneName(milestone.milestone_name || '');
      setDescription(milestone.description || '');
      setPlannedDate(toDateInputValue(milestone.planned_date));
      setActualDate(toDateInputValue(milestone.actual_date));
      setStatus(milestone.status || 'PENDING');
    } else {
      setProjectId(defaultProjectId || (projects[0]?.project_id ? String(projects[0].project_id) : ''));
      setMilestoneName('');
      setDescription('');
      setPlannedDate('');
      setActualDate('');
      setStatus('PENDING');
    }
    setError(null);
  }, [milestone, defaultProjectId, projects, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!milestoneName.trim()) {
      setError('Milestone title is required.');
      return;
    }
    if (!plannedDate) {
      setError('Planned completion date is required.');
      return;
    }
    if (!isEdit && !projectId) {
      setError('Please select an associated project.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        projectId: Number(projectId),
        milestoneName: milestoneName.trim(),
        description: description.trim(),
        plannedDate,
        actualDate: actualDate || null,
        status
      };

      await onSave(payload, milestone?.milestone_id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save milestone record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Milestone' : 'Create New Milestone'}
      subtitle={isEdit ? `Modifying Milestone #${milestone.milestone_id}` : 'Record a strategic milestone deliverable'}
      maxWidth="580px"
    >
      <form onSubmit={handleSubmit} className="form-stack">
        {error && (
          <div className="alert-banner alert-banner-danger">
            <span>{error}</span>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="m-project" className="form-label">
            Associated Project <span className="required">*</span>
          </label>
          <select
            id="m-project"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="form-select"
            disabled={isEdit || Boolean(defaultProjectId)}
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
          <label htmlFor="m-name" className="form-label">
            Milestone Title <span className="required">*</span>
          </label>
          <input
            id="m-name"
            type="text"
            className="form-control"
            placeholder="e.g., Foundation Laying & Excavation Phase"
            value={milestoneName}
            onChange={(e) => setMilestoneName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="m-desc" className="form-label">
            Description & Scope
          </label>
          <textarea
            id="m-desc"
            className="form-textarea"
            rows={3}
            placeholder="Detailed scope, deliverables, and engineering criteria..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label htmlFor="m-planned-date" className="form-label">
              Planned Date <span className="required">*</span>
            </label>
            <input
              id="m-planned-date"
              type="date"
              className="form-control"
              value={plannedDate}
              onChange={(e) => setPlannedDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="m-actual-date" className="form-label">
              Actual Completion Date
            </label>
            <input
              id="m-actual-date"
              type="date"
              className="form-control"
              value={actualDate}
              onChange={(e) => setActualDate(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="m-status" className="form-label">
            Milestone Status <span className="required">*</span>
          </label>
          <select
            id="m-status"
            className="form-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
          >
            {MILESTONE_STATUSES.map((st) => (
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
            {loading ? 'Saving...' : isEdit ? 'Save Milestone Changes' : 'Create Milestone'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
