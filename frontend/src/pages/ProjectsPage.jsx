import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Eye,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  HardHat,
  ArrowUpDown,
  RefreshCw,
  Edit3
} from 'lucide-react';
import { getProjects, updateProjectProgress } from '../api/projectsApi';
import { StatusBadge } from '../components/common/StatusBadge';
import { ProgressBar } from '../components/common/ProgressBar';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { UpdateProgressModal } from '../components/projects/UpdateProgressModal';
import { formatCurrency, formatText } from '../utils/formatters';
import { PROJECT_STATUSES, SECTORS } from '../utils/constants';
import { useToast } from '../context/ToastContext';

export function ProjectsPage() {
  const navigate = useNavigate();
  const { success } = useToast();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Sorting
  const [sortField, setSortField] = useState('project_id');
  const [sortOrder, setSortOrder] = useState('asc');

  // Quick Progress Modal
  const [activeProgressProject, setActiveProgressProject] = useState(null);

  async function loadProjects() {
    try {
      setLoading(true);
      setError(null);
      const data = await getProjects();
      setProjects(data || []);
    } catch (err) {
      setError(err.message || 'Unable to load projects from backend.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        const matchesSearch =
          !searchQuery.trim() ||
          p.project_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.project_manager?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.state?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.implementing_agency?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesSector = !selectedSector || p.sector === selectedSector;
        const matchesStatus = !selectedStatus || p.status === selectedStatus;

        return matchesSearch && matchesSector && matchesStatus;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [projects, searchQuery, selectedSector, selectedStatus, sortField, sortOrder]);

  return (
    <div className="page-container">
      {/* Search & Filter Toolbar */}
      <div className="filter-toolbar">
        <div className="filter-search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search projects by code, name, manager, location..."
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
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            aria-label="Filter by sector"
          >
            <option value="">All Sectors</option>
            {SECTORS.map((sec) => (
              <option key={sec} value={sec}>
                {formatText(sec)}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="">All Statuses</option>
            {PROJECT_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st.replace('_', ' ')}
              </option>
            ))}
          </select>

          {(searchQuery || selectedSector || selectedStatus) && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedSector('');
                setSelectedStatus('');
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Table Content */}
      {loading ? (
        <LoadingState message="Loading projects repository..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadProjects} />
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          icon={HardHat}
          title="No projects match criteria"
          description="Try modifying search keywords or removing selected filters."
        />
      ) : (
        <div className="table-card">
          <div className="table-responsive">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('project_code')} className="sortable-header">
                    <span>Code</span>
                    <ArrowUpDown size={13} />
                  </th>
                  <th onClick={() => handleSort('project_name')} className="sortable-header">
                    <span>Project Name & Implementing Agency</span>
                    <ArrowUpDown size={13} />
                  </th>
                  <th>Sector</th>
                  <th>Location</th>
                  <th onClick={() => handleSort('approved_budget')} className="sortable-header text-right">
                    <span>Budget (INR)</span>
                    <ArrowUpDown size={13} />
                  </th>
                  <th style={{ width: '180px' }}>Progress (Actual vs Target)</th>
                  <th>Status</th>
                  <th>Project Manager</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((p) => (
                  <tr key={p.project_id} className="table-row-clickable">
                    <td className="font-mono font-medium text-primary" onClick={() => navigate(`/projects/${p.project_id}`)}>
                      {p.project_code}
                    </td>
                    <td onClick={() => navigate(`/projects/${p.project_id}`)}>
                      <div className="table-cell-title">{p.project_name}</div>
                      <div className="table-cell-subtitle">{p.implementing_agency}</div>
                    </td>
                    <td>
                      <span className="sector-tag">{formatText(p.sector)}</span>
                    </td>
                    <td>
                      <div className="text-sm font-medium">{p.location}</div>
                      <div className="text-xs text-muted">{p.district ? `${p.district}, ` : ''}{p.state}</div>
                    </td>
                    <td className="text-right font-mono font-medium">
                      <div>{formatCurrency(p.approved_budget)}</div>
                      <div className="text-xs text-muted">Exp: {formatCurrency(p.current_expenditure)}</div>
                    </td>
                    <td>
                      <ProgressBar
                        actual={p.actual_progress}
                        planned={p.planned_progress}
                        height="6px"
                        compact={true}
                      />
                    </td>
                    <td>
                      <StatusBadge status={p.status} type="project" size="small" />
                    </td>
                    <td className="text-sm font-medium">
                      {p.project_manager || '—'}
                    </td>
                    <td className="text-center">
                      <div className="table-actions">
                        <button
                          type="button"
                          className="btn-icon"
                          title="View In-Depth Project Details"
                          onClick={() => navigate(`/projects/${p.project_id}`)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon"
                          title="Quick Update Progress"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveProgressProject(p);
                          }}
                        >
                          <Edit3 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            <span className="table-records-count">
              Showing {filteredProjects.length} of {projects.length} recorded projects
            </span>
          </div>
        </div>
      )}

      {/* Quick Progress Update Modal */}
      {activeProgressProject && (
        <UpdateProgressModal
          isOpen={Boolean(activeProgressProject)}
          onClose={() => setActiveProgressProject(null)}
          project={activeProgressProject}
          apiCall={updateProjectProgress}
          onSuccess={(msg) => {
            success(msg);
            loadProjects();
          }}
        />
      )}
    </div>
  );
}
