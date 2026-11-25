export const formatMoney = (value: string | number, currencyCode?: string) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return String(value);

  return new Intl.NumberFormat(undefined, {
    style: currencyCode ? "currency" : "decimal",
    currency: currencyCode || undefined,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
