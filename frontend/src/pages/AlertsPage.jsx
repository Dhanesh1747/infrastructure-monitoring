import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Info,
  Clock,
  Filter
} from 'lucide-react';
import {
  getAlerts,
  createAlert,
  updateAlert,
  resolveAlert,
  deleteAlert
} from '../api/alertsApi';
import { getProjects } from '../api/projectsApi';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { AlertFormModal } from '../components/alerts/AlertFormModal';
import { formatDate, formatDateTime, formatText } from '../utils/formatters';
import { ALERT_SEVERITIES, ALERT_TYPES } from '../utils/constants';
import { useToast } from '../context/ToastContext';

export function AlertsPage() {
  const { success, error: toastError } = useToast();

  const [alerts, setAlerts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, ACTIVE, RESOLVED
  const [selectedProject, setSelectedProject] = useState('');

  // Modals
  const [modalState, setModalState] = useState({ isOpen: false, item: null });
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    item: null,
    loading: false
  });

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [alertList, projectList] = await Promise.all([
        getAlerts(),
        getProjects()
      ]);
      setAlerts(alertList || []);
      setProjects(projectList || []);
    } catch (err) {
      setError(err.message || 'Unable to load system alerts from backend.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const projectMap = useMemo(() => {
    const map = {};
    projects.forEach((p) => {
      map[p.project_id] = p;
    });
    return map;
  }, [projects]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      const proj = projectMap[a.project_id];

      const matchesSearch =
        !searchQuery.trim() ||
        a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proj?.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proj?.project_code?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSeverity = !selectedSeverity || a.severity === selectedSeverity;
      const matchesType = !selectedType || a.alert_type === selectedType;
      const matchesProject = !selectedProject || String(a.project_id) === String(selectedProject);

      let matchesStatus = true;
      if (statusFilter === 'ACTIVE') matchesStatus = !a.is_resolved;
      if (statusFilter === 'RESOLVED') matchesStatus = Boolean(a.is_resolved);

      return matchesSearch && matchesSeverity && matchesType && matchesProject && matchesStatus;
    });
  }, [alerts, searchQuery, selectedSeverity, selectedType, statusFilter, selectedProject, projectMap]);

  const handleToggleResolve = async (alertItem) => {
    try {
      const newStatus = !alertItem.is_resolved;
      await resolveAlert(alertItem.alert_id, alertItem, newStatus);
      success(newStatus ? 'Alert marked as resolved.' : 'Alert marked as active.');
      loadData();
    } catch (err) {
      toastError(err.message || 'Failed to update alert resolution.');
    }
  };

  const handleSaveAlert = async (payload, id) => {
    try {
      if (id) {
        await updateAlert(id, payload);
        success('Alert updated successfully.');
      } else {
        await createAlert(payload);
        success('Alert issued successfully.');
      }
      loadData();
    } catch (err) {
      toastError(err.message || 'Failed to save alert.');
      throw err;
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.item) return;
    try {
      setDeleteConfirm((prev) => ({ ...prev, loading: true }));
      await deleteAlert(deleteConfirm.item.alert_id);
      success(`Alert "${deleteConfirm.item.title}" deleted.`);
      setDeleteConfirm({ isOpen: false, item: null, loading: false });
      loadData();
    } catch (err) {
      toastError(err.message || 'Failed to delete alert.');
      setDeleteConfirm((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="page-container">
      {/* Filter toolbar */}
      <div className="filter-toolbar">
        <div className="filter-search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search alerts by headline, message, or project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
            >
              {'\u2715'}
            </button>
          )}
        </div>

        <div className="filter-dropdowns">
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by resolution status"
          >
            <option value="ALL">All Status (Active & Resolved)</option>
            <option value="ACTIVE">Active Unresolved Only</option>
            <option value="RESOLVED">Resolved Only</option>
          </select>

          <select
            className="filter-select"
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            aria-label="Filter by severity"
          >
            <option value="">All Severities</option>
            {ALERT_SEVERITIES.map((sev) => (
              <option key={sev} value={sev}>
                {sev}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {ALERT_TYPES.map((t) => (
              <option key={t} value={t}>
                {formatText(t)}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setModalState({ isOpen: true, item: null })}
          >
            <Plus size={15} /> Issue New Alert
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading risk and operational alerts..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : filteredAlerts.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No alerts match criteria"
          description="There are no system or milestone alerts matching the selected filters."
          action={
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setModalState({ isOpen: true, item: null })}
            >
              Issue New Alert
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
                  <th>Associated Project</th>
                  <th>Alert Summary & Specifics</th>
                  <th>Status</th>
                  <th>Logged Date</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlerts.map((a) => {
                  const proj = projectMap[a.project_id];
                  return (
                    <tr
                      key={a.alert_id}
                      className={a.severity === 'CRITICAL' && !a.is_resolved ? 'table-row-critical' : ''}
                    >
                      <td>
                        <StatusBadge status={a.severity} type="severity" size="small" />
                      </td>
                      <td className="text-sm font-medium">{formatText(a.alert_type)}</td>
                      <td>
                        {proj ? (
                          <div>
                            <span className="font-mono text-xs text-primary font-medium">[{proj.project_code}]</span>
                            <div className="text-sm font-medium">{proj.project_name}</div>
                          </div>
                        ) : (
                          <span className="text-muted font-mono">Project #{a.project_id}</span>
                        )}
                      </td>
                      <td>
                        <div className="font-medium">{a.title}</div>
                        <div className="text-xs text-muted max-w-md">{a.message}</div>
                        {a.is_resolved && a.resolved_at && (
                          <div className="text-xs text-success font-mono mt-1">
                            Resolved on {formatDate(a.resolved_at)}
                          </div>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={a.is_resolved} type="resolved" size="small" />
                      </td>
                      <td className="font-mono text-xs text-muted">
                        {formatDate(a.created_at)}
                      </td>
                      <td className="text-center">
                        <div className="table-actions">
                          <button
                            type="button"
                            className="btn btn-outline btn-xs"
                            onClick={() => handleToggleResolve(a)}
                            title={a.is_resolved ? 'Mark Unresolved' : 'Mark Resolved'}
                          >
                            {a.is_resolved ? 'Reopen' : 'Resolve'}
                          </button>
                          <button
                            type="button"
                            className="btn-icon"
                            title="Edit Alert"
                            onClick={() => setModalState({ isOpen: true, item: a })}
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
                                item: a,
                                loading: false
                              })
                            }
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            <span className="table-records-count">
              Showing {filteredAlerts.length} of {alerts.length} system alerts
            </span>
          </div>
        </div>
      )}

      {/* Create / Edit Alert Modal */}
      {modalState.isOpen && (
        <AlertFormModal
          isOpen={modalState.isOpen}
          onClose={() => setModalState({ isOpen: false, item: null })}
          alert={modalState.item}
          projects={projects}
          onSave={handleSaveAlert}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm.isOpen && (
        <ConfirmDialog
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm({ isOpen: false, item: null, loading: false })}
          onConfirm={handleConfirmDelete}
          title={`Delete Alert #${deleteConfirm.item?.alert_id}?`}
          message={`Are you sure you want to permanently delete alert "${deleteConfirm.item?.title}"?`}
          confirmText="Delete Alert"
          isDanger={true}
          loading={deleteConfirm.loading}
        />
      )}
    </div>
  );
}
