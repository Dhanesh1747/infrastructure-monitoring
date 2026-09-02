import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HardHat,
  Milestone,
  AlertTriangle,
  FolderArchive,
  Users,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertOctagon,
  FileClock,
  Layers
} from 'lucide-react';
import { getDashboardSummary } from '../api/dashboardApi';
import { getProjects } from '../api/projectsApi';
import { getMilestones } from '../api/milestonesApi';
import { getAlerts, resolveAlert } from '../api/alertsApi';
import { getProjectUpdates } from '../api/projectUpdatesApi';
import { KpiCard } from '../components/common/KpiCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { ProgressBar } from '../components/common/ProgressBar';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { formatCurrency, formatDate, formatText } from '../utils/formatters';
import { useToast } from '../context/ToastContext';

export function DashboardPage() {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [summary, setSummary] = useState(null);
  const [projects, setProjects] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [updates, setUpdates] = useState([]);

  async function loadDashboardData() {
    try {
      setLoading(true);
      setError(null);

      const [summaryRes, projectsRes, milestonesRes, alertsRes, updatesRes] = await Promise.all([
        getDashboardSummary(),
        getProjects(),
        getMilestones(),
        getAlerts(),
        getProjectUpdates()
      ]);

      setSummary(summaryRes);
      setProjects(projectsRes || []);
      setMilestones(milestonesRes || []);
      setAlerts(alertsRes || []);
      setUpdates(updatesRes || []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics from backend.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Quick Resolve Handler
  const handleToggleResolve = async (alertItem) => {
    try {
      const newStatus = !alertItem.is_resolved;
      await resolveAlert(alertItem.alert_id, alertItem, newStatus);
      success(newStatus ? 'Alert marked as resolved.' : 'Alert marked as active.');
      // Refresh local state
      setAlerts((prev) =>
        prev.map((a) =>
          a.alert_id === alertItem.alert_id ? { ...a, is_resolved: newStatus } : a
        )
      );
    } catch (err) {
      toastError(err.message || 'Failed to update alert resolution.');
    }
  };

  // Derived Analytics
  const projectMap = useMemo(() => {
    const map = {};
    projects.forEach((p) => {
      map[p.project_id] = p;
    });
    return map;
  }, [projects]);

  const {
    totalBudget,
    totalExpenditure,
    overallProgress,
    statusCounts,
    sectorBreakdown
  } = useMemo(() => {
    let budget = 0;
    let exp = 0;
    let progSum = 0;
    const sCounts = { IN_PROGRESS: 0, DELAYED: 0, COMPLETED: 0, PLANNED: 0, ON_HOLD: 0 };
    const secCounts = {};

    projects.forEach((p) => {
      budget += Number(p.approved_budget) || 0;
      exp += Number(p.current_expenditure) || 0;
      progSum += Number(p.actual_progress) || 0;

      const st = p.status || 'PLANNED';
      sCounts[st] = (sCounts[st] || 0) + 1;

      const sec = p.sector || 'OTHER';
      secCounts[sec] = (secCounts[sec] || 0) + 1;
    });

    const avgProg = projects.length > 0 ? progSum / projects.length : 0;

    return {
      totalBudget: budget,
      totalExpenditure: exp,
      overallProgress: avgProg,
      statusCounts: sCounts,
      sectorBreakdown: secCounts
    };
  }, [projects]);

  const activeAlerts = useMemo(() => {
    return alerts.filter((a) => !a.is_resolved);
  }, [alerts]);

  const criticalAlertsCount = useMemo(() => {
    return activeAlerts.filter((a) => a.severity === 'CRITICAL').length;
  }, [activeAlerts]);

  if (loading) {
    return <LoadingState message="Retrieving infrastructure monitoring dashboard..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadDashboardData} />;
  }

  return (
    <div className="dashboard-container">
      {/* KPI Top Cards */}
      <div className="kpi-grid">
        <KpiCard
          title="Total Projects"
          value={summary?.projects || 0}
          subtitle={`${statusCounts.IN_PROGRESS || 0} Active \u2022 ${statusCounts.DELAYED || 0} Delayed`}
          icon={HardHat}
          variant="primary"
          onClick={() => navigate('/projects')}
        />
        <KpiCard
          title="Total Milestones"
          value={summary?.milestones || 0}
          subtitle={`${milestones.filter(m => m.status === 'COMPLETED').length} Completed deliverables`}
          icon={Milestone}
          onClick={() => navigate('/milestones')}
        />
        <KpiCard
          title="Active Alerts"
          value={activeAlerts.length}
          subtitle={criticalAlertsCount > 0 ? `${criticalAlertsCount} Critical attention required` : 'All alerts managed'}
          icon={AlertTriangle}
          variant={criticalAlertsCount > 0 ? 'danger' : 'warning'}
          badge={criticalAlertsCount > 0 ? `${criticalAlertsCount} CRITICAL` : null}
          onClick={() => navigate('/alerts')}
        />
        <KpiCard
          title="Official Documents"
          value={summary?.documents || 0}
          subtitle="DPRs, plans & clearance records"
          icon={FolderArchive}
          onClick={() => navigate('/documents')}
        />
        <KpiCard
          title="Authorized Personnel"
          value={summary?.users || 0}
          subtitle="Project directors & site officers"
          icon={Users}
          onClick={() => navigate('/users')}
        />
      </div>

      {/* Financial and Progress High-Level Banner */}
      <div className="metrics-banner-card">
        <div className="metrics-banner-item">
          <span className="banner-label">Approved Capital Allocation</span>
          <span className="banner-value font-mono">{formatCurrency(totalBudget)}</span>
          <span className="banner-subtext">Across {projects.length} monitored infrastructure works</span>
        </div>
        <div className="metrics-banner-divider" />
        <div className="metrics-banner-item">
          <span className="banner-label">Cumulative Recorded Expenditure</span>
          <span className="banner-value font-mono">{formatCurrency(totalExpenditure)}</span>
          <span className="banner-subtext">
            {totalBudget > 0 ? `${((totalExpenditure / totalBudget) * 100).toFixed(1)}% fiscal utilization` : '0%'}
          </span>
        </div>
        <div className="metrics-banner-divider" />
        <div className="metrics-banner-item">
          <span className="banner-label">Average Physical Progress</span>
          <span className="banner-value font-mono">{overallProgress.toFixed(1)}%</span>
          <div className="banner-progress-bar">
            <div className="banner-progress-fill" style={{ width: `${overallProgress}%` }} />
          </div>
        </div>
      </div>

      {/* Grid: Status Distribution & Sector Breakdown */}
      <div className="dashboard-grid-2">
        {/* Project Status Breakdown */}
        <div className="panel-card">
          <div className="panel-header">
            <div className="panel-title-group">
              <h3 className="panel-title">Project Execution Status</h3>
              <p className="panel-subtitle">Portfolio distribution by current operational status</p>
            </div>
          </div>

          <div className="status-bars-container">
            {[
              { key: 'IN_PROGRESS', label: 'In Progress', color: 'var(--color-primary-600)', count: statusCounts.IN_PROGRESS || 0 },
              { key: 'DELAYED', label: 'Delayed', color: 'var(--color-danger-600)', count: statusCounts.DELAYED || 0 },
              { key: 'COMPLETED', label: 'Completed', color: 'var(--color-success-600)', count: statusCounts.COMPLETED || 0 },
              { key: 'PLANNED', label: 'Planned / Pending', color: 'var(--color-warning-600)', count: statusCounts.PLANNED || 0 },
            ].map((stat) => {
              const pct = projects.length > 0 ? (stat.count / projects.length) * 100 : 0;
              return (
                <div key={stat.key} className="status-bar-row">
                  <div className="status-bar-labels">
                    <span className="status-bar-name">{stat.label}</span>
                    <span className="status-bar-count font-mono">{stat.count} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="status-bar-track">
                    <div
                      className="status-bar-fill"
                      style={{ width: `${pct}%`, backgroundColor: stat.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="panel-footer-action">
            <button
              type="button"
              className="btn btn-link btn-sm"
              onClick={() => navigate('/projects')}
            >
              View all {projects.length} projects <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Sector Allocation Breakdown */}
        <div className="panel-card">
          <div className="panel-header">
            <div className="panel-title-group">
              <h3 className="panel-title">Sector Allocation Breakdown</h3>
              <p className="panel-subtitle">Infrastructure domains represented in current system</p>
            </div>
          </div>

          <div className="sector-tags-container">
            {Object.keys(sectorBreakdown).length === 0 ? (
              <EmptyState title="No sectors recorded" />
            ) : (
              Object.entries(sectorBreakdown).map(([sector, count]) => (
                <div key={sector} className="sector-stat-chip">
                  <span className="sector-chip-name">{formatText(sector)}</span>
                  <span className="sector-chip-count font-mono">{count}</span>
                </div>
              ))
            )}
          </div>

          <div className="panel-footer-action">
            <button
              type="button"
              className="btn btn-link btn-sm"
              onClick={() => navigate('/milestones')}
            >
              Inspect milestone schedules <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Priority Alerts & Recent Progress Updates */}
      <div className="dashboard-grid-2">
        {/* Priority Alerts */}
        <div className="panel-card">
          <div className="panel-header">
            <div className="panel-title-group">
              <h3 className="panel-title">Active System Alerts</h3>
              <p className="panel-subtitle">Requires supervisory oversight and mitigation</p>
            </div>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => navigate('/alerts')}
            >
              All Alerts ({alerts.length})
            </button>
          </div>

          {activeAlerts.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="No active alerts"
              description="All identified risks and variance alerts have been resolved."
            />
          ) : (
            <div className="compact-list">
              {activeAlerts.slice(0, 5).map((a) => {
                const proj = projectMap[a.project_id];
                return (
                  <div key={a.alert_id} className={`compact-alert-item alert-border-${a.severity.toLowerCase()}`}>
                    <div className="compact-alert-main">
                      <div className="compact-alert-top">
                        <StatusBadge status={a.severity} type="severity" size="small" />
                        <span className="compact-alert-type">{formatText(a.alert_type)}</span>
                        {proj && (
                          <span className="compact-alert-proj text-muted">
                            {'\u2022'} {proj.project_code}
                          </span>
                        )}
                        <span className="compact-alert-date text-muted">
                          {formatDate(a.created_at)}
                        </span>
                      </div>
                      <h5 className="compact-alert-title">{a.title}</h5>
                      <p className="compact-alert-msg">{a.message}</p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline btn-xs"
                      onClick={() => handleToggleResolve(a)}
                      title="Mark as Resolved"
                    >
                      Resolve
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Updates */}
        <div className="panel-card">
          <div className="panel-header">
            <div className="panel-title-group">
              <h3 className="panel-title">Recent Progress Logs</h3>
              <p className="panel-subtitle">Field submissions, inspection remarks and fiscal claims</p>
            </div>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => navigate('/project-updates')}
            >
              All Updates ({updates.length})
            </button>
          </div>

          {updates.length === 0 ? (
            <EmptyState
              icon={FileClock}
              title="No updates recorded"
              description="No physical progress or expenditure updates have been submitted yet."
            />
          ) : (
            <div className="compact-list">
              {updates.slice(0, 5).map((u) => {
                const proj = projectMap[u.project_id];
                return (
                  <div key={u.update_id} className="compact-update-item">
                    <div className="update-marker">
                      <Clock size={16} />
                    </div>
                    <div className="update-body">
                      <div className="update-top">
                        <span className="update-date font-mono">{formatDate(u.update_date)}</span>
                        {proj && (
                          <span className="update-proj-link font-medium">
                            {proj.project_code}: {proj.project_name}
                          </span>
                        )}
                      </div>
                      <div className="update-figures">
                        <span className="figure-item">
                          Progress: <strong className="font-mono">{u.physical_progress}%</strong>
                        </span>
                        <span className="figure-divider">{'\u2022'}</span>
                        <span className="figure-item">
                          Expenditure: <strong className="font-mono">{formatCurrency(u.expenditure)}</strong>
                        </span>
                      </div>
                      <p className="update-remarks">{u.remarks}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
