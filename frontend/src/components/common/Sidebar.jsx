import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  HardHat,
  Milestone,
  FileClock,
  AlertTriangle,
  FolderArchive,
  Users,
  Building2,
  ShieldCheck,
  ChevronLeft,
  X
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/projects', label: 'Projects', icon: HardHat },
  { path: '/milestones', label: 'Milestones', icon: Milestone },
  { path: '/project-updates', label: 'Project Updates', icon: FileClock },
  { path: '/alerts', label: 'Alerts', icon: AlertTriangle },
  { path: '/documents', label: 'Documents', icon: FolderArchive },
  { path: '/users', label: 'Users', icon: Users },
];

export function Sidebar({ isOpen, isCollapsed, onToggleCollapse, onCloseMobile }) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`app-sidebar ${isOpen ? 'sidebar-open' : ''} ${
          isCollapsed ? 'sidebar-collapsed' : ''
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="sidebar-brand">
          <div className="brand-logo-container">
            <Building2 className="brand-icon" size={22} />
          </div>
          <div className="brand-text-container">
            <span className="brand-title">INFRAMON</span>
            <span className="brand-subtitle">Project Control Center</span>
          </div>

          <button
            type="button"
            className="sidebar-close-mobile"
            onClick={onCloseMobile}
            aria-label="Close Sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sidebar Nav links */}
        <nav className="sidebar-nav" aria-label="Main Navigation">
          <div className="nav-section-title">Navigation</div>
          <ul className="nav-list">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path} className="nav-item">
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `nav-link ${isActive ? 'active' : ''}`
                    }
                    onClick={onCloseMobile}
                    end={item.path === '/'}
                  >
                    <Icon size={19} className="nav-icon" />
                    <span className="nav-label">{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer User Profile */}
        <div className="sidebar-footer">
          <div className="system-guard">
            <ShieldCheck size={16} className="text-emerald" />
            <div className="system-guard-info">
              <span className="system-status-title">System Verified</span>
              <span className="system-status-desc">Spring Boot {'\u2022'} Live</span>
            </div>
          </div>

          <button
            type="button"
            className="sidebar-collapse-toggle"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <ChevronLeft size={16} className={`collapse-arrow ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </aside>
    </>
  );
}
