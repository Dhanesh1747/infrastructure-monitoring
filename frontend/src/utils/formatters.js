/**
 * Currency, Date, and String formatters for Infrastructure Monitoring System
 */

export function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0.00';
  const val = Number(amount);
  
  if (Math.abs(val) >= 10000000) {
    const crores = val / 10000000;
    return `₹${crores.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Cr`;
  }
  if (Math.abs(val) >= 100000) {
    const lakhs = val / 100000;
    return `₹${lakhs.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L`;
  }
  
  return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatCurrencyExact(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0.00';
  const val = Number(amount);
  return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(dateString) {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return String(dateString);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return String(dateString);
  }
}

export function formatDateTime(dateString) {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return String(dateString);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return String(dateString);
  }
}

export function toDateInputValue(dateString) {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

export function formatPercent(value) {
  if (value === null || value === undefined || isNaN(value)) return '0.0%';
  const num = Number(value);
  return `${num.toFixed(1)}%`;
}

export function formatText(snakeOrConst) {
  if (!snakeOrConst) return '—';
  return String(snakeOrConst)
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
