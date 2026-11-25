export const formatMoney = (
  value: string | number,
  currencyCode?: string,
  options?: { compact?: boolean }
) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return String(value);

  const isWhole = Number.isInteger(amount);
  const useCompact = Boolean(options?.compact) && Math.abs(amount) >= 1_000_000;

  return new Intl.NumberFormat(undefined, {
    style: currencyCode ? "currency" : "decimal",
    currency: currencyCode || undefined,
    notation: useCompact ? "compact" : "standard",
    compactDisplay: "short",
    minimumFractionDigits: useCompact ? 0 : isWhole ? 0 : 2,
    maximumFractionDigits: useCompact ? 1 : isWhole ? 0 : 2,
  }).format(amount);
};
