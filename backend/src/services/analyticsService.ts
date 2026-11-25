import AppError from "../utils/AppError";
import analyticsRepository from "../repositories/analyticsRepository";

const toMoney = (value: number | string) => {
  const num = Number(value);
  return Number.isFinite(num) ? num.toFixed(2) : "0.00";
};

const toCount = (value: number | bigint) => Number(value);

const metricsByCountry = async (query: {
  countryId?: string;
  currencyCode?: string;
  payPeriod?: string;
}) => {
  const countryId =
    query.countryId !== undefined ? Number(query.countryId) : undefined;

  if (query.countryId !== undefined && Number.isNaN(countryId)) {
    throw new AppError("countryId must be a number", 400);
  }

  if (
    query.payPeriod &&
    !["monthly", "annual"].includes(query.payPeriod)
  ) {
    throw new AppError("payPeriod must be monthly or annual", 400);
  }

  const rows = await analyticsRepository.byCountry({
    countryId,
    currencyCode: query.currencyCode?.trim().toUpperCase() || undefined,
    payPeriod: query.payPeriod,
  });

  return rows.map((row) => ({
    countryId: Number(row.countryId),
    country: row.country,
    currencyCode: row.currencyCode,
    payPeriod: row.payPeriod,
    min: toMoney(row.minAmount),
    max: toMoney(row.maxAmount),
    average: toMoney(row.avgAmount),
    employeeCount: toCount(row.employeeCount),
  }));
};

const metricsByJobTitle = async (query: {
  countryId?: string;
  jobTitle?: string;
  currencyCode?: string;
  payPeriod?: string;
}) => {
  const countryId =
    query.countryId !== undefined ? Number(query.countryId) : undefined;

  if (query.countryId !== undefined && Number.isNaN(countryId)) {
    throw new AppError("countryId must be a number", 400);
  }

  if (
    query.payPeriod &&
    !["monthly", "annual"].includes(query.payPeriod)
  ) {
    throw new AppError("payPeriod must be monthly or annual", 400);
  }

  const rows = await analyticsRepository.byJobTitle({
    countryId,
    jobTitle: query.jobTitle?.trim() || undefined,
    currencyCode: query.currencyCode?.trim().toUpperCase() || undefined,
    payPeriod: query.payPeriod,
  });

  return rows.map((row) => ({
    jobTitle: row.jobTitle,
    currencyCode: row.currencyCode,
    payPeriod: row.payPeriod,
    average: toMoney(row.avgAmount),
    employeeCount: toCount(row.employeeCount),
  }));
};

export default {
  metricsByCountry,
  metricsByJobTitle,
};
