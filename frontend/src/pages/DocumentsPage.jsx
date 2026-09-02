import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  FolderArchive,
  FileText,
  FileCode,
  HardDrive
} from 'lucide-react';
import {
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument
} from '../api/documentsApi';
import { getProjects } from '../api/projectsApi';
import { getUsers } from '../api/usersApi';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { DocumentFormModal } from '../components/documents/DocumentFormModal';
import { formatDate } from '../utils/formatters';
import { DOCUMENT_TYPES } from '../utils/constants';
import { useToast } from '../context/ToastContext';

export function DocumentsPage() {
  const { success, error: toastError } = useToast();

  const [documents, setDocuments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
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
      const [docList, projectList, userList] = await Promise.all([
        getDocuments(),
        getProjects(),
        getUsers()
      ]);
      setDocuments(docList || []);
      setProjects(projectList || []);
      setUsers(userList || []);
    } catch (err) {
      setError(err.message || 'Unable to load documents from backend.');
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

  const filteredDocuments = useMemo(() => {
    return documents.filter((d) => {
      const proj = projectMap[d.project_id];
      const officer = userMap[d.uploaded_by];

      const matchesSearch =
        !searchQuery.trim() ||
        d.document_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.file_path?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proj?.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proj?.project_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        officer?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = !selectedType || d.document_type === selectedType;
      const matchesProject = !selectedProject || String(d.project_id) === String(selectedProject);

      return matchesSearch && matchesType && matchesProject;
    });
  }, [documents, searchQuery, selectedType, selectedProject, projectMap, userMap]);

  const handleSaveDocument = async (payload, id) => {
    try {
      if (id) {
        await updateDocument(id, payload);
        success('Document metadata updated.');
      } else {
        await createDocument(payload);
        success('Document catalog entry registered.');
      }
      loadData();
    } catch (err) {
      toastError(err.message || 'Failed to save document record.');
      throw err;
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.item) return;
    try {
      setDeleteConfirm((prev) => ({ ...prev, loading: true }));
      await deleteDocument(deleteConfirm.item.document_id);
      success(`Document record "${deleteConfirm.item.document_name}" deleted.`);
      setDeleteConfirm({ isOpen: false, item: null, loading: false });
      loadData();
    } catch (err) {
      toastError(err.message || 'Failed to delete document record.');
      setDeleteConfirm((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="page-container">
      {/* Informative Repository Notice */}
      <div className="subtle-info-bar">
        <HardDrive size={15} className="text-primary" />
        <span>
          Document Metadata Registry: Tracks registered Detailed Project Reports (DPRs), architectural blueprints, and engineering certificates stored on official infrastructure servers.
        </span>
      </div>

      {/* Filter toolbar */}
      <div className="filter-toolbar">
        <div className="filter-search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search documents by title, file path or project..."
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
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            aria-label="Filter by classification"
          >
            <option value="">All Classifications</option>
            {DOCUMENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setModalState({ isOpen: true, item: null })}
          >
            <Plus size={15} /> Catalog Document
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading documentation registry..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : filteredDocuments.length === 0 ? (
        <EmptyState
          icon={FolderArchive}
          title="No documents found"
          description="No official records match your active search or classification filter."
          action={
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setModalState({ isOpen: true, item: null })}
            >
              Catalog Document
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
                  <th>Document Title</th>
                  <th>Classification</th>
                  <th>Associated Project</th>
                  <th>System File Storage Path</th>
                  <th>Cataloged By</th>
                  <th>Date Logged</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((d) => {
                  const proj = projectMap[d.project_id];
                  const officer = userMap[d.uploaded_by];
                  return (
                    <tr key={d.document_id}>
                      <td className="font-mono text-xs text-muted">#{d.document_id}</td>
                      <td>
                        <div className="font-medium text-primary flex-center-gap">
                          <FileText size={15} />
                          <span>{d.document_name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-secondary">{d.document_type}</span>
                      </td>
                      <td>
                        {proj ? (
                          <div>
                            <span className="font-mono text-xs text-primary font-medium">[{proj.project_code}]</span>
                            <div className="text-sm font-medium">{proj.project_name}</div>
                          </div>
                        ) : (
                          <span className="text-muted font-mono">Project #{d.project_id}</span>
                        )}
                      </td>
                      <td className="font-mono text-xs text-muted">
                        <code>{d.file_path}</code>
                      </td>
                      <td className="text-sm">
                        {officer ? (
                          <div>
                            <div className="font-medium">{officer.fullName}</div>
                            <div className="text-xs text-muted">{officer.designation}</div>
                          </div>
                        ) : (
                          <span className="text-muted">Officer #{d.uploaded_by}</span>
                        )}
                      </td>
                      <td className="font-mono text-xs text-muted">
                        {formatDate(d.uploaded_at)}
                      </td>
                      <td className="text-center">
                        <div className="table-actions">
                          <button
                            type="button"
                            className="btn-icon"
                            title="Edit Document Record"
                            onClick={() => setModalState({ isOpen: true, item: d })}
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            type="button"
                            className="btn-icon btn-icon-danger"
                            title="Delete Record"
                            onClick={() =>
                              setDeleteConfirm({
                                isOpen: true,
                                item: d,
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
              Showing {filteredDocuments.length} of {documents.length} cataloged documents
            </span>
          </div>
        </div>
      )}

      {/* Modal for Create / Edit */}
      {modalState.isOpen && (
        <DocumentFormModal
          isOpen={modalState.isOpen}
          onClose={() => setModalState({ isOpen: false, item: null })}
          document={modalState.item}
          projects={projects}
          users={users}
          onSave={handleSaveDocument}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm.isOpen && (
        <ConfirmDialog
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm({ isOpen: false, item: null, loading: false })}
          onConfirm={handleConfirmDelete}
          title={`Delete Document Entry #${deleteConfirm.item?.document_id}?`}
          message={`Are you sure you want to delete the record for "${deleteConfirm.item?.document_name}"?`}
          confirmText="Delete Entry"
          isDanger={true}
          loading={deleteConfirm.loading}
        />
      )}
    </div>
  );
}
