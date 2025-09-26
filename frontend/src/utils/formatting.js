// Shared formatting utilities for numbers, percents and USD values.
// Centralizes logic previously duplicated across components (e.g., RebalancingView)

export function formatPercent(value, { decimals = 2, trimZeros = false, sign = false } = {}) {
  const num = Number(value) || 0;
  const fixed = num.toFixed(decimals);
  let out = fixed;
  if (trimZeros) {
    out = parseFloat(fixed).toString();
  }
  if (sign && num > 0) out = '+' + out;
  return out + '%';
}

export function formatUsd(value, { decimals = 2, sign = false } = {}) {
  const num = Number(value) || 0;
  const abs = Math.abs(num);
  const formatted = abs.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const prefix = num < 0 ? '-$' : '$';
  return (sign && num > 0 ? '+' : '') + prefix + formatted;
}

export function safeNumber(value) {
  const n = Number(value);
  return isFinite(n) ? n : 0;
}
