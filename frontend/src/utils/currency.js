export function parseAmount(value) {
  if (value === '' || value === null || value === undefined) return 0;
  const num = Number(String(value).replace(/,/g, ''));
  return Number.isFinite(num) ? num : 0;
}

export function formatINR(value, options = {}) {
  const num = typeof value === 'number' ? value : parseAmount(value);
  const { decimals = 0, compact = false } = options;

  if (compact && Math.abs(num) >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (compact && Math.abs(num) >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatPercent(value, decimals = 1) {
  const num = typeof value === 'number' ? value : parseAmount(value);
  return `${num.toFixed(decimals)}%`;
}
