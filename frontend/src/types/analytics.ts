export type CountryMetric = {
  countryId: number;
  country: string;
  currencyCode: string;
  payPeriod: string;
  min: string;
  max: string;
  average: string;
  employeeCount: number;
};

export type JobTitleMetric = {
  jobTitle: string;
  currencyCode: string;
  payPeriod: string;
  average: string;
  employeeCount: number;
};
