/**
 * Format a number as Indian Rupee currency.
 * e.g. 1543060 → "₹15,43,060"
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format currency with decimals for precision values like CMP.
 * e.g. 1700.15 → "₹1,700.15"
 */
export function formatCurrencyDecimal(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a percentage value.
 * e.g. 14.104 → "+14.10%"
 */
export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

/**
 * Format a number with Indian notation.
 * e.g. 1543060 → "15,43,060"
 */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-IN').format(value);
}

/**
 * Format a ratio (P/E etc).
 * e.g. 18.69 → "18.69"
 */
export function formatRatio(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return value.toFixed(2);
}

/**
 * Format a timestamp to readable time.
 */
export function formatTime(date: Date | string | null): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Get the color class based on gain/loss value.
 */
export function getGainLossColor(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'text-gray-400';
  if (value > 0) return 'text-emerald-400';
  if (value < 0) return 'text-red-400';
  return 'text-gray-400';
}

/**
 * Get the bg color class for gain/loss badges.
 */
export function getGainLossBg(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'bg-gray-800/50';
  if (value > 0) return 'bg-emerald-500/10 border-emerald-500/20';
  if (value < 0) return 'bg-red-500/10 border-red-500/20';
  return 'bg-gray-800/50';
}
