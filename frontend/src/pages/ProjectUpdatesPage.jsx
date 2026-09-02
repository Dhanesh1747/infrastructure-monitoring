import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  FileClock,
  Clock,
  ArrowUpDown
} from 'lucide-react';
import {
  getProjectUpdates,
  createProjectUpdate,
  updateProjectUpdate,
  deleteProjectUpdate
} from '../api/projectUpdatesApi';
import { getProjects } from '../api/projectsApi';
import { getUsers } from '../api/usersApi';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { UpdateFormModal } from '../components/updates/UpdateFormModal';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useToast } from '../context/ToastContext';

export function ProjectUpdatesPage() {
  const { success, error: toastError } = useToast();

  const [updates, setUpdates] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
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
      const [updateList, projectList, userList] = await Promise.all([
        getProjectUpdates(),
        getProjects(),
        getUsers()
      ]);
      setUpdates(updateList || []);
      setProjects(projectList || []);
      setUsers(userList || []);
    } catch (err) {
      setError(err.message || 'Unable to load progress updates from backend.');
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

  const userMap = useMemo(() => {
    const map = {};
    users.forEach((u) => {
      map[u.userId] = u;
    });
    return map;
  }, [users]);

  const filteredUpdates = useMemo(() => {
    return updates.filter((u) => {
      const proj = projectMap[u.project_id];
      const officer = userMap[u.submitted_by];

      const matchesSearch =
        !searchQuery.trim() ||
        u.remarks?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proj?.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proj?.project_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        officer?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesProject = !selectedProject || String(u.project_id) === String(selectedProject);

      return matchesSearch && matchesProject;
    });
  }, [updates, searchQuery, selectedProject, projectMap, userMap]);

  const handleSaveUpdate = async (payload, id) => {
    try {
      if (id) {
        await updateProjectUpdate(id, payload);
        success('Progress log updated successfully.');
      } else {
        await createProjectUpdate(payload);
        success('Progress log submitted successfully.');
      }
      loadData();
    } catch (err) {
      toastError(err.message || 'Failed to record progress update.');
      throw err;
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.item) return;
    try {
      setDeleteConfirm((prev) => ({ ...prev, loading: true }));
      await deleteProjectUpdate(deleteConfirm.item.update_id);
      success(`Progress update #${deleteConfirm.item.update_id} deleted.`);
      setDeleteConfirm({ isOpen: false, item: null, loading: false });
      loadData();
    } catch (err) {
      toastError(err.message || 'Failed to delete update record.');
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
            placeholder="Search progress logs by remarks, project or officer..."
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
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            aria-label="Filter by project"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.project_id} value={p.project_id}>
                [{p.project_code}] {p.project_name}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setModalState({ isOpen: true, item: null })}
          >
            <Plus size={15} /> Submit Progress Log
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading field progress and expenditure updates..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : filteredUpdates.length === 0 ? (
        <EmptyState
          icon={FileClock}
          title="No progress updates found"
          description="No progress updates match your current search or project filter."
          action={
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setModalState({ isOpen: true, item: null })}
            >
              Submit First Log
            </button>
          }
        />
      ) : (
        <div className="table-card">
          <div className="table-responsive">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>Log ID</th>
                  <th>Inspection Date</th>
                  <th>Associated Project</th>
                  <th>Physical Progress</th>
                  <th>Cumulative Expenditure</th>
                  <th>Site Observations / Remarks</th>
                  <th>Reporting Officer</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUpdates.map((u) => {
                  const proj = projectMap[u.project_id];
                  const officer = userMap[u.submitted_by];
                  return (
                    <tr key={u.update_id}>
                      <td className="font-mono text-xs text-muted">#{u.update_id}</td>
                      <td className="font-mono font-medium text-sm">{formatDate(u.update_date)}</td>
                      <td>
                        {proj ? (
                          <div>
                            <span className="font-mono text-xs text-primary font-medium">[{proj.project_code}]</span>
                            <div className="text-sm font-medium">{proj.project_name}</div>
                          </div>
                        ) : (
                          <span className="text-muted font-mono">Project #{u.project_id}</span>
                        )}
                      </td>
                      <td className="font-mono font-medium">
                        <span className="badge badge-primary">{u.physical_progress}%</span>
                      </td>
                      <td className="font-mono font-medium text-sm">
                        {formatCurrency(u.expenditure)}
                      </td>
                      <td className="text-sm max-w-xs">
                        <p className="line-clamp-2">{u.remarks}</p>
                      </td>
                      <td className="text-sm">
                        {officer ? (
                          <div>
                            <div className="font-medium">{officer.fullName}</div>
                            <div className="text-xs text-muted">{officer.designation}</div>
                          </div>
                        ) : (
                          <span className="text-muted">Officer #{u.submitted_by}</span>
                        )}
                      </td>
                      <td className="text-center">
                        <div className="table-actions">
                          <button
                            type="button"
                            className="btn-icon"
                            title="Edit Update"
                            onClick={() => setModalState({ isOpen: true, item: u })}
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            type="button"
                            className="btn-icon btn-icon-danger"
                            title="Delete Update"
                            onClick={() =>
                              setDeleteConfirm({
                                isOpen: true,
                                item: u,
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
              Showing {filteredUpdates.length} of {updates.length} progress updates
            </span>
          </div>
        </div>
      )}

      {/* Modal for Create / Edit */}
      {modalState.isOpen && (
        <UpdateFormModal
          isOpen={modalState.isOpen}
          onClose={() => setModalState({ isOpen: false, item: null })}
          update={modalState.item}
          projects={projects}
          users={users}
          onSave={handleSaveUpdate}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm.isOpen && (
        <ConfirmDialog
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm({ isOpen: false, item: null, loading: false })}
          onConfirm={handleConfirmDelete}
          title={`Delete Progress Log #${deleteConfirm.item?.update_id}?`}
          message={`Are you sure you want to delete this progress submission recorded on ${formatDate(deleteConfirm.item?.update_date)}?`}
          confirmText="Delete Record"
          isDanger={true}
          loading={deleteConfirm.loading}
        />
      )}
    </div>
  );
}
