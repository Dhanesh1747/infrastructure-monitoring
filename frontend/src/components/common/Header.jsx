import React, { useState, useEffect } from 'react';
import { Menu, RefreshCw, Server, CheckCircle2, AlertCircle } from 'lucide-react';
import { checkBackendHealth } from '../../api/healthApi';

export function Header({
  title,
  subtitle,
  onRefresh,
  refreshing = false,
  onToggleSidebar,
  onLogout
}) {
  const [backendOnline, setBackendOnline] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function checkHealth() {
      try {
        await checkBackendHealth();
        if (mounted) setBackendOnline(true);
      } catch {
        if (mounted) setBackendOnline(false);
      }
    }

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // every 30s
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="top-header">
      <div className="header-left">
        <button
          type="button"
          className="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        <div className="header-titles">
          <h1 className="header-page-title">{title}</h1>
          {subtitle && <p className="header-page-subtitle">{subtitle}</p>}
        </div>
      </div>

      <div className="header-right">
        {/* Backend health status pill */}
        <div
          className={`health-pill ${
            backendOnline === true
              ? 'health-online'
              : backendOnline === false
              ? 'health-offline'
              : 'health-checking'
          }`}
          title={
            backendOnline === true
              ? 'Spring Boot Backend Connected (localhost:8080)'
              : backendOnline === false
              ? 'Backend Unreachable'
              : 'Checking Backend...'
          }
        >
          <span className="health-dot" />
          <span className="health-text">
            {backendOnline === true ? 'Backend Online' : backendOnline === false ? 'Backend Offline' : 'Connecting...'}
          </span>
        </div>

        {/* Refresh Action */}
        {onRefresh && (
          <button
            type="button"
            className="btn btn-outline btn-sm header-refresh-btn"
            onClick={onRefresh}
            disabled={refreshing}
            title="Refresh current page data"
          >
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
            <span className="btn-text">Refresh</span>
          </button>
        )}

        {/* Officer badge */}
        <div className="officer-badge-header">
          <div className="officer-avatar">OD</div>
          <div className="officer-info">
            <span className="officer-name">Monitoring Portal</span>
            <span className="officer-dept">Govt. of
India</span>
</div>
</div>

<button
  type="button"
  className="btn btn-outline btn-sm header-logout-btn"
  onClick={onLogout}
  title="Sign out"
>
  Sign Out
</button>

</div>
</header>
  );
}
