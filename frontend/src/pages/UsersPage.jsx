import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Users as UsersIcon,
  Mail,
  Building,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Briefcase
} from 'lucide-react';
import { getUsers } from '../api/usersApi';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { USER_ROLES } from '../utils/constants';

export function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  async function loadUsers() {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsers();
      setUsers(data || []);
    } catch (err) {
      setError(err.message || 'Unable to retrieve authorized user directory.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        !searchQuery.trim() ||
        u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.designation?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = !selectedRole || u.role === selectedRole;

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, selectedRole]);

  return (
    <div className="page-container">
      {/* Search & Filter Toolbar */}
      <div className="filter-toolbar">
        <div className="filter-search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search officers by name, email, department, or designation..."
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
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            aria-label="Filter by administrative role"
          >
            <option value="">All Administrative Roles</option>
            {USER_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading officer directory..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadUsers} />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="No officers match criteria"
          description="Try broadening your search term or selecting all roles."
        />
      ) : (
        <div className="table-card">
          <div className="table-responsive">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Officer Name & Contact</th>
                  <th>Administrative Role</th>
                  <th>Assigned Department</th>
                  <th>Official Designation</th>
                  <th>Account Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.userId}>
                    <td className="font-mono text-xs text-muted">#{u.userId}</td>
                    <td>
                      <div className="flex-center-gap">
                        <div className="officer-table-avatar">
                          {u.fullName?.split(' ').map((n) => n[0]).join('').substring(0, 2) || 'OF'}
                        </div>
                        <div>
                          <div className="font-medium text-primary">{u.fullName}</div>
                          <div className="text-xs text-muted flex-center-gap">
                            <Mail size={12} /> {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={u.role} type="role" size="small" />
                    </td>
                    <td>
                      <div className="text-sm font-medium flex-center-gap">
                        <Building size={13} className="text-muted" />
                        <span>{u.department || '—'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">{u.designation || '—'}</div>
                    </td>
                    <td>
                      <StatusBadge status={u.active} type="active" size="small" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            <span className="table-records-count">
              Total {filteredUsers.length} verified administrative officers
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
