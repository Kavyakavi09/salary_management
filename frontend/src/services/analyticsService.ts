import api from "./api";
import type { ApiSuccess } from "../types/api";
import type { CountryMetric, JobTitleMetric } from "../types/analytics";

export const fetchMetricsByCountry = async () => {
  const { data } = await api.get<ApiSuccess<CountryMetric[]>>(
    "/api/analytics/by-country"
  );
  return data.data;
};

export const fetchMetricsByJobTitle = async () => {
  const { data } = await api.get<ApiSuccess<JobTitleMetric[]>>(
    "/api/analytics/by-job-title"
  );
  return data.data;
};
