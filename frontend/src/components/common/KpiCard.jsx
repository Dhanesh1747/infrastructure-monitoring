import React from 'react';

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  onClick,
  badge
}) {
  return (
    <div
      className={`kpi-card kpi-${variant} ${onClick ? 'kpi-clickable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="kpi-header">
        <span className="kpi-title">{title}</span>
        {Icon && (
          <div className="kpi-icon-wrapper">
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="kpi-body">
        <div className="kpi-value font-mono">
          {value !== undefined && value !== null ? value : '—'}
        </div>
        {badge && <span className="kpi-badge">{badge}</span>}
      </div>

      {subtitle && <div className="kpi-subtitle">{subtitle}</div>}
    </div>
  );
}
