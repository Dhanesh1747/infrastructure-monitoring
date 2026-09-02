import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { DOCUMENT_TYPES } from '../../utils/constants';

export function DocumentFormModal({
  isOpen,
  onClose,
  document, // if set -> edit mode, if null -> create mode
  projects = [],
  users = [],
  defaultProjectId = null,
  onSave
}) {
  const isEdit = Boolean(document);

  const [projectId, setProjectId] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState('DPR');
  const [filePath, setFilePath] = useState('');
  const [uploadedBy, setUploadedBy] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (document) {
      setProjectId(document.project_id || '');
      setDocumentName(document.document_name || '');
      setDocumentType(document.document_type || 'DPR');
      setFilePath(document.file_path || '');
      setUploadedBy(document.uploaded_by || '');
    } else {
      setProjectId(defaultProjectId || (projects[0]?.project_id ? String(projects[0].project_id) : ''));
      setDocumentName('');
      setDocumentType('DPR');
      setFilePath('/documents/');
      setUploadedBy(users[0]?.userId ? String(users[0].userId) : '');
    }
    setError(null);
  }, [document, defaultProjectId, projects, users, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!projectId) {
      setError('Please select an associated project.');
      return;
    }
    if (!documentName.trim()) {
      setError('Document title is required.');
      return;
    }
    if (!filePath.trim()) {
      setError('System file reference path is required.');
      return;
    }
    if (!uploadedBy) {
      setError('Please select the recording officer.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        projectId: Number(projectId),
        documentName: documentName.trim(),
        documentType,
        filePath: filePath.trim(),
        uploadedBy: Number(uploadedBy)
      };

      await onSave(payload, document?.document_id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to register document.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Document Record' : 'Register Project Document'}
      subtitle={isEdit ? `Modifying Document #${document.document_id}` : 'Catalog an official project DPR, technical drawing, or clearance certificate'}
      maxWidth="580px"
    >
      <form onSubmit={handleSubmit} className="form-stack">
        {error && (
          <div className="alert-banner alert-banner-danger">
            <span>{error}</span>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="d-project" className="form-label">
            Associated Project <span className="required">*</span>
          </label>
          <select
            id="d-project"
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
            <label htmlFor="d-name" className="form-label">
              Document Title <span className="required">*</span>
            </label>
            <input
              id="d-name"
              type="text"
              className="form-control"
              placeholder="e.g. Detailed Project Report (DPR) Rev 2"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="d-type" className="form-label">
              Document Classification <span className="required">*</span>
            </label>
            <select
              id="d-type"
              className="form-select"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              required
            >
              {DOCUMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="d-path" className="form-label">
            File Storage / Repository Path <span className="required">*</span>
          </label>
          <input
            id="d-path"
            type="text"
            className="form-control font-mono"
            placeholder="/documents/infra-001/dpr.pdf"
            value={filePath}
            onChange={(e) => setFilePath(e.target.value)}
            required
          />
          <span className="form-help">
            Enter the verified archive path stored in the backend repository.
          </span>
        </div>

        <div className="form-group">
          <label htmlFor="d-officer" className="form-label">
            Uploading Officer <span className="required">*</span>
          </label>
          <select
            id="d-officer"
            className="form-select"
            value={uploadedBy}
            onChange={(e) => setUploadedBy(e.target.value)}
            required
          >
            <option value="">-- Select Officer --</option>
            {users.map((u) => (
              <option key={u.userId} value={u.userId}>
                {u.fullName} ({u.designation})
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
            {loading ? 'Saving...' : isEdit ? 'Save Document Record' : 'Register Document'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
