import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Building,
  MapPin,
  User,
  DollarSign,
  TrendingUp,
  Edit3,
  Plus,
  Trash2,
  CheckCircle2,
  FileText,
  AlertTriangle,
  FileClock,
  Milestone as MilestoneIcon,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { getProjectById, updateProjectProgress } from '../api/projectsApi';
import { getMilestones, createMilestone, updateMilestone, deleteMilestone } from '../api/milestonesApi';
import { getProjectUpdates, createProjectUpdate, updateProjectUpdate, deleteProjectUpdate } from '../api/projectUpdatesApi';
import { getAlerts, createAlert, updateAlert, resolveAlert, deleteAlert } from '../api/alertsApi';
import { getDocuments, createDocument, updateDocument, deleteDocument } from '../api/documentsApi';
import { getUsers } from '../api/usersApi';

import { StatusBadge } from '../components/common/StatusBadge';
import { ProgressBar } from '../components/common/ProgressBar';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { UpdateProgressModal } from '../components/projects/UpdateProgressModal';
import { MilestoneFormModal } from '../components/milestones/MilestoneFormModal';
import { UpdateFormModal } from '../components/updates/UpdateFormModal';
import { AlertFormModal } from '../components/alerts/AlertFormModal';
import { DocumentFormModal } from '../components/documents/DocumentFormModal';

import { formatCurrency, formatDate, formatPercent, formatText } from '../utils/formatters';
import { useToast } from '../context/ToastContext';

export function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [project, setProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Modals state
  const [showProgressModal, setShowProgressModal] = useState(false);

  // Subsystem modals
  const [milestoneModal, setMilestoneModal] = useState({ isOpen: false, item: null });
  const [updateModal, setUpdateModal] = useState({ isOpen: false, item: null });
  const [alertModal, setAlertModal] = useState({ isOpen: false, item: null });
  const [docModal, setDocModal] = useState({ isOpen: false, item: null });

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    type: null,
    id: null,
    title: '',
    loading: false
  });

  async function loadProjectDetails() {
    try {
      setLoading(true);
      setError(null);

      const [projRes, usersRes, allMilestones, allUpdates, allAlerts, allDocs] = await Promise.all([
        getProjectById(projectId),
        getUsers(),
        getMilestones(),
        getProjectUpdates(),
        getAlerts(),
        getDocuments()
      ]);

      setProject(projRes);
      setUsers(usersRes || []);

      const pId = Number(projectId);
      setMilestones((allMilestones || []).filter((m) => Number(m.project_id) === pId));
      setUpdates((allUpdates || []).filter((u) => Number(u.project_id) === pId));
      setAlerts((allAlerts || []).filter((a) => Number(a.project_id) === pId));
      setDocuments((allDocs || []).filter((d) => Number(d.project_id) === pId));
    } catch (err) {
      setError(err.message || 'Unable to retrieve project details.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjectDetails();
  }, [projectId]);

  // User Map for display
  const userMap = React.useMemo(() => {
    const map = {};
    users.forEach((u) => {
      map[u.userId] = u.fullName;
    });
    return map;
  }, [users]);

  // Milestone actions
  const handleSaveMilestone = async (payload, id) => {
    if (id) {
      await updateMilestone(id, payload);
      success('Milestone updated successfully.');
    } else {
      await createMilestone(payload);
      success('Milestone created successfully.');
    }
    loadProjectDetails();
  };

  // Update actions
  const handleSaveUpdate = async (payload, id) => {
    if (id) {
      await updateProjectUpdate(id, payload);
      success('Progress log updated successfully.');
    } else {
      await createProjectUpdate(payload);
      success('Progress log submitted successfully.');
    }
    loadProjectDetails();
  };

  // Alert actions
  const handleSaveAlert = async (payload, id) => {
    if (id) {
      await updateAlert(id, payload);
      success('Alert updated successfully.');
    } else {
      await createAlert(payload);
      success('Alert created successfully.');
    }
    loadProjectDetails();
  };

  const handleToggleResolveAlert = async (alertItem) => {
    try {
      const newStatus = !alertItem.is_resolved;
      await resolveAlert(alertItem.alert_id, alertItem, newStatus);
      success(newStatus ? 'Alert resolved.' : 'Alert reopened.');
      loadProjectDetails();
    } catch (err) {
      toastError(err.message || 'Failed to update alert.');
    }
  };

  // Document actions
  const handleSaveDocument = async (payload, id) => {
    if (id) {
      await updateDocument(id, payload);
      success('Document catalog entry updated.');
    } else {
      await createDocument(payload);
      success('Document cataloged successfully.');
    }
    loadProjectDetails();
  };

  // Generic delete executor
  const handleConfirmDelete = async () => {
    try {
      setDeleteConfirm((prev) => ({ ...prev, loading: true }));
      const { type, id } = deleteConfirm;

      if (type === 'milestone') {
        await deleteMilestone(id);
        success('Milestone deleted successfully.');
      } else if (type === 'update') {
        await deleteProjectUpdate(id);
        success('Progress update deleted successfully.');
      } else if (type === 'alert') {
        await deleteAlert(id);
        success('Alert deleted successfully.');
      } else if (type === 'document') {
        await deleteDocument(id);
        success('Document record deleted successfully.');
      }

      setDeleteConfirm({ isOpen: false, type: null, id: null, title: '', loading: false });
      loadProjectDetails();
    } catch (err) {
      toastError(err.message || 'Failed to delete record.');
      setDeleteConfirm((prev) => ({ ...prev, loading: false }));
    }
  };

  if (loading) {
    return <LoadingState message="Loading in-depth project profile..." />;
  }

  if (error || !project) {
    return (
      <ErrorState
        title="Project Record Not Found"
        message={error || 'The requested infrastructure project could not be located.'}
        onRetry={loadProjectDetails}
      />
    );
  }

  // Budget calculations
  const approvedBudget = Number(project.approved_budget) || 0;
  const currentExpenditure = Number(project.current_expenditure) || 0;
  const budgetUtilization = approvedBudget > 0 ? (currentExpenditure / approvedBudget) * 100 : 0;
  const remainingBudget = Math.max(0, approvedBudget - currentExpenditure);

  return (
    <div className="page-container">
      {/* Back to list navigation */}
      <div className="project-detail-back">
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => navigate('/projects')}
        >
          <ArrowLeft size={15} /> Back to Projects Directory
        </button>
      </div>

      {/* Project Banner Header */}
      <div className="project-header-card">
        <div className="project-header-main">
          <div className="project-header-identifiers">
            <span className="project-code-badge font-mono">{project.project_code}</span>
            <span className="sector-tag">{formatText(project.sector)}</span>
            <StatusBadge status={project.status} type="project" />
          </div>

          <h2 className="project-header-name">{project.project_name}</h2>
          <p className="project-header-desc">{project.description}</p>

          <div className="project-header-meta">
            <span className="meta-item">
              <Building size={15} /> {project.implementing_agency}
            </span>
            <span className="meta-item">
              <MapPin size={15} /> {project.location}, {project.district ? `${project.district}, ` : ''}{project.state}
            </span>
            <span className="meta-item">
              <User size={15} /> Project Manager: {project.project_manager || 'Not Assigned'}
            </span>
          </div>
        </div>

        <div className="project-header-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowProgressModal(true)}
          >
            <Edit3 size={16} /> Update Progress & Status
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="project-metrics-grid">
        <div className="project-metric-box">
          <span className="metric-box-title">Physical Progress</span>
          <div className="metric-box-progress">
            <ProgressBar
              actual={project.actual_progress}
              planned={project.planned_progress}
              height="8px"
            />
          </div>
        </div>

        <div className="project-metric-box">
          <span className="metric-box-title">Approved Allocation</span>
          <span className="metric-box-val font-mono">{formatCurrency(approvedBudget)}</span>
          <span className="metric-box-sub">Sanctioned capital budget</span>
        </div>

        <div className="project-metric-box">
          <span className="metric-box-title">Disbursed Expenditure</span>
          <span className="metric-box-val font-mono">{formatCurrency(currentExpenditure)}</span>
          <span className="metric-box-sub font-mono">
            {budgetUtilization.toFixed(1)}% utilized \u2022 Bal: {formatCurrency(remainingBudget)}
          </span>
        </div>

        <div className="project-metric-box">
          <span className="metric-box-title">Target Schedule</span>
          <div className="metric-dates-list">
            <div className="metric-date-row">
              <span className="text-muted">Planned:</span>
              <span className="font-mono text-sm">{formatDate(project.planned_start_date)} {'\u2192'} {formatDate(project.planned_end_date)}</span>
            </div>
            <div className="metric-date-row">
              <span className="text-muted">Actual:</span>
              <span className="font-mono text-sm">
                {project.actual_start_date ? formatDate(project.actual_start_date) : 'Pending'} {'\u2192'}{' '}
                {project.actual_end_date ? formatDate(project.actual_end_date) : 'Ongoing'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="project-tabs">
        <button
          type="button"
          className={`project-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FileText size={16} /> Project Overview
        </button>
        <button
          type="button"
          className={`project-tab-btn ${activeTab === 'milestones' ? 'active' : ''}`}
          onClick={() => setActiveTab('milestones')}
        >
          <MilestoneIcon size={16} /> Milestones ({milestones.length})
        </button>
        <button
          type="button"
          className={`project-tab-btn ${activeTab === 'updates' ? 'active' : ''}`}
          onClick={() => setActiveTab('updates')}
        >
          <FileClock size={16} /> Progress Logs ({updates.length})
        </button>
        <button
          type="button"
          className={`project-tab-btn ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          <AlertTriangle size={16} /> System Alerts ({alerts.length})
        </button>
        <button
          type="button"
          className={`project-tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          <Briefcase size={16} /> Documents ({documents.length})
        </button>
      </div>

      {/* Tab Panels */}
      <div className="tab-content-container">
        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="overview-tab-stack">
            <div className="panel-card">
              <div className="panel-header">
                <h3 className="panel-title">Administrative & Engineering Specifications</h3>
              </div>
              <div className="spec-table-grid">
                <div className="spec-item">
                  <span className="spec-label">Project Code</span>
                  <span className="spec-value font-mono font-medium">{project.project_code}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Implementing Agency</span>
                  <span className="spec-value font-medium">{project.implementing_agency}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Sector Domain</span>
                  <span className="spec-value">{formatText(project.sector)}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Project Manager</span>
                  <span className="spec-value">{project.project_manager || '—'}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Geographic Location</span>
                  <span className="spec-value">{project.location}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">District & State</span>
                  <span className="spec-value">{project.district ? `${project.district}, ` : ''}{project.state}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Planned Start Date</span>
                  <span className="spec-value font-mono">{formatDate(project.planned_start_date)}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Planned Completion Date</span>
                  <span className="spec-value font-mono">{formatDate(project.planned_end_date)}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Actual Commencement</span>
                  <span className="spec-value font-mono">{formatDate(project.actual_start_date)}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Actual Completion</span>
                  <span className="spec-value font-mono">{formatDate(project.actual_end_date)}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">System Created At</span>
                  <span className="spec-value font-mono text-sm">{formatDate(project.created_at)}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Last Database Modification</span>
                  <span className="spec-value font-mono text-sm">{formatDate(project.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. MILESTONES TAB */}
        {activeTab === 'milestones' && (
          <div className="subsystem-tab-stack">
            <div className="tab-actions-header">
              <div>
                <h3 className="section-title">Project Execution Milestones</h3>
                <p className="section-subtitle">Deliverables and scheduled phases for this project</p>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setMilestoneModal({ isOpen: true, item: null })}
              >
                <Plus size={15} /> Add Milestone
              </button>
            </div>

            {milestones.length === 0 ? (
              <EmptyState
                icon={MilestoneIcon}
                title="No milestones registered for this project"
                description="Establish milestones to track deliverable timelines."
                action={
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setMilestoneModal({ isOpen: true, item: null })}
                  >
                    Create First Milestone
                  </button>
                }
              />
            ) : (
              <div className="table-card">
                <div className="table-responsive">
                  <table className="enterprise-table">
                    <thead>
                      <tr>
                        <th>Milestone Deliverable</th>
                        <th>Planned Target</th>
                        <th>Actual Date</th>
                        <th>Status</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {milestones.map((m) => (
                        <tr key={m.milestone_id}>
                          <td>
                            <div className="font-medium text-primary">{m.milestone_name}</div>
                            {m.description && <div className="text-xs text-muted">{m.description}</div>}
                          </td>
                          <td className="font-mono">{formatDate(m.planned_date)}</td>
                          <td className="font-mono">{formatDate(m.actual_date)}</td>
                          <td>
                            <StatusBadge status={m.status} type="milestone" size="small" />
                          </td>
                          <td className="text-center">
                            <div className="table-actions">
                              <button
                                type="button"
                                className="btn-icon"
                                title="Edit Milestone"
                                onClick={() => setMilestoneModal({ isOpen: true, item: m })}
                              >
                                <Edit3 size={15} />
                              </button>
                              <button
                                type="button"
                                className="btn-icon btn-icon-danger"
                                title="Delete Milestone"
                                onClick={() =>
                                  setDeleteConfirm({
                                    isOpen: true,
                                    type: 'milestone',
                                    id: m.milestone_id,
                                    title: `Delete Milestone "${m.milestone_name}"?`,
                                    loading: false
                                  })
                                }
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. UPDATES TAB */}
        {activeTab === 'updates' && (
          <div className="subsystem-tab-stack">
            <div className="tab-actions-header">
              <div>
                <h3 className="section-title">Site Progress & Expenditure Chronicle</h3>
                <p className="section-subtitle">Periodic submissions by site supervisors and project officers</p>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setUpdateModal({ isOpen: true, item: null })}
              >
                <Plus size={15} /> Submit Progress Log
              </button>
            </div>

            {updates.length === 0 ? (
              <EmptyState
                icon={FileClock}
                title="No progress updates logged"
                description="Field inspection reports and financial claims will appear here."
                action={
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setUpdateModal({ isOpen: true, item: null })}
                  >
                    Submit First Progress Update
                  </button>
                }
              />
            ) : (
              <div className="table-card">
                <div className="table-responsive">
                  <table className="enterprise-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Physical Progress</th>
                        <th>Expenditure</th>
                        <th>Field Remarks</th>
                        <th>Submitted By</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {updates.map((u) => (
                        <tr key={u.update_id}>
                          <td className="font-mono font-medium">{formatDate(u.update_date)}</td>
                          <td className="font-mono">{u.physical_progress}%</td>
                          <td className="font-mono font-medium">{formatCurrency(u.expenditure)}</td>
                          <td className="text-sm">{u.remarks}</td>
                          <td className="text-sm font-medium text-muted">
                            {userMap[u.submitted_by] || `Officer #${u.submitted_by}`}
                          </td>
                          <td className="text-center">
                            <div className="table-actions">
                              <button
                                type="button"
                                className="btn-icon"
                                title="Edit Update Log"
                                onClick={() => setUpdateModal({ isOpen: true, item: u })}
                              >
                                <Edit3 size={15} />
                              </button>
                              <button
                                type="button"
                                className="btn-icon btn-icon-danger"
                                title="Delete Log"
                                onClick={() =>
                                  setDeleteConfirm({
                                    isOpen: true,
                                    type: 'update',
                                    id: u.update_id,
                                    title: `Delete Progress Update recorded on ${formatDate(u.update_date)}?`,
                                    loading: false
                                  })
                                }
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. ALERTS TAB */}
        {activeTab === 'alerts' && (
          <div className="subsystem-tab-stack">
            <div className="tab-actions-header">
              <div>
                <h3 className="section-title">Project Risk & Variance Alerts</h3>
                <p className="section-subtitle">System and officer-reported alerts regarding timeline or cost slips</p>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setAlertModal({ isOpen: true, item: null })}
              >
                <Plus size={15} /> Issue Alert
              </button>
            </div>

            {alerts.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="No active or logged alerts"
                description="This project currently operates without registered risk alerts."
                action={
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setAlertModal({ isOpen: true, item: null })}
                  >
                    Log New Alert
                  </button>
                }
              />
            ) : (
              <div className="table-card">
                <div className="table-responsive">
                  <table className="enterprise-table">
                    <thead>
                      <tr>
                        <th>Severity</th>
                        <th>Category</th>
                        <th>Alert Headline & Details</th>
                        <th>Resolution Status</th>
                        <th>Logged Date</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alerts.map((a) => (
                        <tr key={a.alert_id}>
                          <td>
                            <StatusBadge status={a.severity} type="severity" size="small" />
                          </td>
                          <td className="text-sm font-medium">{formatText(a.alert_type)}</td>
                          <td>
                            <div className="font-medium">{a.title}</div>
                            <div className="text-xs text-muted">{a.message}</div>
                          </td>
                          <td>
                            <StatusBadge status={a.is_resolved} type="resolved" size="small" />
                          </td>
                          <td className="font-mono text-xs">{formatDate(a.created_at)}</td>
                          <td className="text-center">
                            <div className="table-actions">
                              <button
                                type="button"
                                className="btn btn-outline btn-xs"
                                onClick={() => handleToggleResolveAlert(a)}
                              >
                                {a.is_resolved ? 'Reopen' : 'Resolve'}
                              </button>
                              <button
                                type="button"
                                className="btn-icon"
                                title="Edit Alert"
                                onClick={() => setAlertModal({ isOpen: true, item: a })}
                              >
                                <Edit3 size={15} />
                              </button>
                              <button
                                type="button"
                                className="btn-icon btn-icon-danger"
                                title="Delete Alert"
                                onClick={() =>
                                  setDeleteConfirm({
                                    isOpen: true,
                                    type: 'alert',
                                    id: a.alert_id,
                                    title: `Delete Alert "${a.title}"?`,
                                    loading: false
                                  })
                                }
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. DOCUMENTS TAB */}
        {activeTab === 'documents' && (
          <div className="subsystem-tab-stack">
            <div className="tab-actions-header">
              <div>
                <h3 className="section-title">Official Project Documentation</h3>
                <p className="section-subtitle">Cataloged project deliverables, DPRs, drawings and legal records</p>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setDocModal({ isOpen: true, item: null })}
              >
                <Plus size={15} /> Catalog Document
              </button>
            </div>

            {documents.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="No documents cataloged for this project"
                description="Register DPRs, survey reports, or clearance files."
                action={
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setDocModal({ isOpen: true, item: null })}
                  >
                    Catalog First Document
                  </button>
                }
              />
            ) : (
              <div className="table-card">
                <div className="table-responsive">
                  <table className="enterprise-table">
                    <thead>
                      <tr>
                        <th>Document Title</th>
                        <th>Classification</th>
                        <th>File Storage Path</th>
                        <th>Registered By</th>
                        <th>Upload Date</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map((d) => (
                        <tr key={d.document_id}>
                          <td className="font-medium text-primary">{d.document_name}</td>
                          <td>
                            <span className="badge badge-secondary">{d.document_type}</span>
                          </td>
                          <td className="font-mono text-xs text-muted">{d.file_path}</td>
                          <td className="text-sm font-medium">
                            {userMap[d.uploaded_by] || `Officer #${d.uploaded_by}`}
                          </td>
                          <td className="font-mono text-xs">{formatDate(d.uploaded_at)}</td>
                          <td className="text-center">
                            <div className="table-actions">
                              <button
                                type="button"
                                className="btn-icon"
                                title="Edit Document Metadata"
                                onClick={() => setDocModal({ isOpen: true, item: d })}
                              >
                                <Edit3 size={15} />
                              </button>
                              <button
                                type="button"
                                className="btn-icon btn-icon-danger"
                                title="Delete Document Record"
                                onClick={() =>
                                  setDeleteConfirm({
                                    isOpen: true,
                                    type: 'document',
                                    id: d.document_id,
                                    title: `Delete record for "${d.document_name}"?`,
                                    loading: false
                                  })
                                }
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Update Progress Modal */}
      {showProgressModal && (
        <UpdateProgressModal
          isOpen={showProgressModal}
          onClose={() => setShowProgressModal(false)}
          project={project}
          apiCall={updateProjectProgress}
          onSuccess={(msg) => {
            success(msg);
            loadProjectDetails();
          }}
        />
      )}

      {/* Milestone Modal */}
      {milestoneModal.isOpen && (
        <MilestoneFormModal
          isOpen={milestoneModal.isOpen}
          onClose={() => setMilestoneModal({ isOpen: false, item: null })}
          milestone={milestoneModal.item}
          projects={[project]}
          defaultProjectId={project.project_id}
          onSave={handleSaveMilestone}
        />
      )}

      {/* Project Update Modal */}
      {updateModal.isOpen && (
        <UpdateFormModal
          isOpen={updateModal.isOpen}
          onClose={() => setUpdateModal({ isOpen: false, item: null })}
          update={updateModal.item}
          projects={[project]}
          users={users}
          defaultProjectId={project.project_id}
          onSave={handleSaveUpdate}
        />
      )}

      {/* Alert Modal */}
      {alertModal.isOpen && (
        <AlertFormModal
          isOpen={alertModal.isOpen}
          onClose={() => setAlertModal({ isOpen: false, item: null })}
          alert={alertModal.item}
          projects={[project]}
          defaultProjectId={project.project_id}
          onSave={handleSaveAlert}
        />
      )}

      {/* Document Modal */}
      {docModal.isOpen && (
        <DocumentFormModal
          isOpen={docModal.isOpen}
          onClose={() => setDocModal({ isOpen: false, item: null })}
          document={docModal.item}
          projects={[project]}
          users={users}
          defaultProjectId={project.project_id}
          onSave={handleSaveDocument}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm.isOpen && (
        <ConfirmDialog
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm({ isOpen: false, type: null, id: null, title: '', loading: false })}
          onConfirm={handleConfirmDelete}
          title={deleteConfirm.title}
          message="Are you sure you want to permanently remove this record from the database?"
          confirmText="Yes, Delete Record"
          isDanger={true}
          loading={deleteConfirm.loading}
        />
      )}
    </div>
  );
}
