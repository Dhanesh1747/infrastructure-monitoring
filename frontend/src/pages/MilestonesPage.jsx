import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Milestone as MilestoneIcon,
  ArrowUpDown
} from 'lucide-react';
import { getMilestones, createMilestone, updateMilestone, deleteMilestone } from '../api/milestonesApi';
import { getProjects } from '../api/projectsApi';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { MilestoneFormModal } from '../components/milestones/MilestoneFormModal';
import { formatDate } from '../utils/formatters';
import { MILESTONE_STATUSES } from '../utils/constants';
import { useToast } from '../context/ToastContext';

export function MilestonesPage() {
  const { success, error: toastError } = useToast();

  const [milestones, setMilestones] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedProject, setSelectedProject] = useState('');

  // Form modal & Delete Dialog
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
      const [milestoneList, projectList] = await Promise.all([
        getMilestones(),
        getProjects()
      ]);
      setMilestones(milestoneList || []);
      setProjects(projectList || []);
    } catch (err) {
      setError(err.message || 'Unable to load milestones from backend.');
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

  const filteredMilestones = useMemo(() => {
    return milestones.filter((m) => {
      const proj = projectMap[m.project_id];
      const matchesSearch =
        !searchQuery.trim() ||
        m.milestone_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proj?.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proj?.project_code?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = !selectedStatus || m.status === selectedStatus;
      const matchesProject = !selectedProject || String(m.project_id) === String(selectedProject);

      return matchesSearch && matchesStatus && matchesProject;
    });
  }, [milestones, searchQuery, selectedStatus, selectedProject, projectMap]);

  const handleSaveMilestone = async (payload, id) => {
    try {
      if (id) {
        await updateMilestone(id, payload);
        success('Milestone updated successfully.');
      } else {
        await createMilestone(payload);
        success('Milestone created successfully.');
      }
      loadData();
    } catch (err) {
      toastError(err.message || 'Failed to save milestone.');
      throw err;
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.item) return;
    try {
      setDeleteConfirm((prev) => ({ ...prev, loading: true }));
      await deleteMilestone(deleteConfirm.item.milestone_id);
      success(`Milestone "${deleteConfirm.item.milestone_name}" deleted.`);
      setDeleteConfirm({ isOpen: false, item: null, loading: false });
      loadData();
    } catch (err) {
      toastError(err.message || 'Failed to delete milestone.');
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
            placeholder="Search milestones or associated project name..."
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

          <select
            className="filter-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            aria-label="Filter by milestone status"
          >
            <option value="">All Statuses</option>
            {MILESTONE_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st.replace('_', ' ')}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setModalState({ isOpen: true, item: null })}
          >
            <Plus size={15} /> Create Milestone
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Retrieving milestone records..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : filteredMilestones.length === 0 ? (
        <EmptyState
          icon={MilestoneIcon}
          title="No milestones found"
          description="No milestone deliverables match your active search or filters."
          action={
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setModalState({ isOpen: true, item: null })}
            >
              Create Milestone
            </button>
          }
        />
      ) : (
        <div className="table-card">
          <div className="table-responsive">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Milestone Deliverable</th>
                  <th>Associated Project</th>
                  <th>Planned Target</th>
                  <th>Actual Completion</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMilestones.map((m) => {
                  const proj = projectMap[m.project_id];
                  return (
                    <tr key={m.milestone_id}>
                      <td className="font-mono text-xs text-muted">#{m.milestone_id}</td>
                      <td>
                        <div className="font-medium text-primary">{m.milestone_name}</div>
                        {m.description && <div className="text-xs text-muted">{m.description}</div>}
                      </td>
                      <td>
                        {proj ? (
                          <div>
                            <span className="font-mono text-xs text-primary font-medium">[{proj.project_code}]</span>
                            <div className="text-sm font-medium">{proj.project_name}</div>
                          </div>
                        ) : (
                          <span className="text-muted font-mono">Project #{m.project_id}</span>
                        )}
                      </td>
                      <td className="font-mono text-sm">{formatDate(m.planned_date)}</td>
                      <td className="font-mono text-sm">{formatDate(m.actual_date)}</td>
                      <td>
                        <StatusBadge status={m.status} type="milestone" size="small" />
                      </td>
                      <td className="text-center">
                        <div className="table-actions">
                          <button
                            type="button"
                            className="btn-icon"
                            title="Edit Milestone"
                            onClick={() => setModalState({ isOpen: true, item: m })}
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
                                item: m,
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
              Showing {filteredMilestones.length} of {milestones.length} milestones
            </span>
          </div>
        </div>
      )}

      {/* Modal for Create / Edit */}
      {modalState.isOpen && (
        <MilestoneFormModal
          isOpen={modalState.isOpen}
          onClose={() => setModalState({ isOpen: false, item: null })}
          milestone={modalState.item}
          projects={projects}
          onSave={handleSaveMilestone}
        />
      )}

      {/* Confirmation for Delete */}
      {deleteConfirm.isOpen && (
        <ConfirmDialog
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm({ isOpen: false, item: null, loading: false })}
          onConfirm={handleConfirmDelete}
          title={`Delete Milestone #${deleteConfirm.item?.milestone_id}?`}
          message={`Are you sure you want to delete "${deleteConfirm.item?.milestone_name}"? This operation cannot be reversed.`}
          confirmText="Delete Milestone"
          isDanger={true}
          loading={deleteConfirm.loading}
        />
      )}
    </div>
  );
}
