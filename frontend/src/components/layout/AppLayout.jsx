import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../common/Sidebar';
import { Header } from '../common/Header';

const PAGE_METADATA = {
  '/': {
    title: 'Executive Infrastructure Dashboard',
    subtitle: 'High-level operational overview of active national and regional infrastructure portfolios'
  },
  '/projects': {
    title: 'Infrastructure Projects Repository',
    subtitle: 'Comprehensive inventory of ongoing, delayed, and completed civil infrastructure projects'
  },
  '/milestones': {
    title: 'Project Milestones & Deliverables',
    subtitle: 'Lifecycle milestones, schedule tracking, and execution phases across all projects'
  },
  '/project-updates': {
    title: 'Progress & Expenditure Updates',
    subtitle: 'Chronological site updates, physical completion logs, and cumulative expenditure ledger'
  },
  '/alerts': {
    title: 'System & Risk Alerts',
    subtitle: 'Real-time detection of milestone delays, cost escalations, and critical schedule variances'
  },
  '/documents': {
    title: 'Official Project Documentation',
    subtitle: 'Direct repository of Detailed Project Reports (DPR), engineering plans, and approval records'
  },
  '/users': {
    title: 'Authorized Project Officers & Supervisors',
    subtitle: 'Administrative personnel directory of project managers, directors, and field engineers'
  }
};

export function AppLayout({ onRefresh, refreshing, onLogout }) {
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Check if current path matches or starts with /projects/
  let currentMeta = PAGE_METADATA[location.pathname];
  if (!currentMeta && location.pathname.startsWith('/projects/')) {
    currentMeta = {
      title: 'Infrastructure Project Detail',
      subtitle: 'In-depth project metrics, milestones, progress history, alerts, and documentation'
    };
  }
  if (!currentMeta) {
    currentMeta = {
      title: 'Infrastructure Project Monitoring Portal',
      subtitle: 'Administrative monitoring and control system'
    };
  }

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'shell-sidebar-collapsed' : ''}`}>
      <Sidebar
        isOpen={mobileSidebarOpen}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="app-main-viewport">
        <Header
          title={currentMeta.title}
          subtitle={currentMeta.subtitle}
          onRefresh={onRefresh}
          refreshing={refreshing}
          onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          onLogout={onLogout}
        />

        <main className="main-content-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
