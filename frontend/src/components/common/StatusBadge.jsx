import React from 'react';

export function StatusBadge({ status, type = 'status', size = 'medium' }) {
  if (!status && status !== false) return <span className="badge badge-secondary">—</span>;

  let badgeClass = 'badge-secondary';
  let label = String(status);

  if (type === 'project' || type === 'milestone') {
    const s = String(status).toUpperCase();
    if (s === 'COMPLETED') {
      badgeClass = 'badge-success';
      label = 'Completed';
    } else if (s === 'IN_PROGRESS') {
      badgeClass = 'badge-primary';
      label = 'In Progress';
    } else if (s === 'DELAYED') {
      badgeClass = 'badge-danger';
      label = 'Delayed';
    } else if (s === 'PENDING' || s === 'PLANNED') {
      badgeClass = 'badge-warning';
      label = s === 'PENDING' ? 'Pending' : 'Planned';
    } else if (s === 'ON_HOLD') {
      badgeClass = 'badge-secondary';
      label = 'On Hold';
    }
  } else if (type === 'severity') {
    const s = String(status).toUpperCase();
    if (s === 'CRITICAL') {
      badgeClass = 'badge-danger';
      label = 'Critical';
    } else if (s === 'HIGH') {
      badgeClass = 'badge-warning-dark';
      label = 'High';
    } else if (s === 'MEDIUM') {
      badgeClass = 'badge-warning';
      label = 'Medium';
    } else if (s === 'LOW') {
      badgeClass = 'badge-info';
      label = 'Low';
    }
  } else if (type === 'resolved') {
    if (status === true || status === 'true') {
      badgeClass = 'badge-success';
      label = 'Resolved';
    } else {
      badgeClass = 'badge-danger';
      label = 'Active';
    }
  } else if (type === 'role') {
    const s = String(status).toUpperCase();
    if (s === 'ADMIN') {
      badgeClass = 'badge-role-admin';
      label = 'Admin';
    } else if (s === 'OFFICER') {
      badgeClass = 'badge-role-officer';
      label = 'Officer';
    } else {
      badgeClass = 'badge-role-supervisor';
      label = 'Supervisor';
    }
  } else if (type === 'active') {
    if (status === true || status === 'true') {
      badgeClass = 'badge-success';
      label = 'Active';
    } else {
      badgeClass = 'badge-secondary';
      label = 'Inactive';
    }
  }

  return (
    <span className={`badge ${badgeClass} badge-${size}`}>
      <span className="badge-dot"></span>
      {label}
    </span>
  );
}
