import api from "./api";
import type { ApiSuccess } from "../types/api";

export type SalaryCalcResult = {
  employeeId?: string;
  salaryId?: string;
  countryId: number;
  country: string;
  currencyCode: string;
  payPeriod?: string;
  gross: string;
  tdsRate: string;
  deduction: string;
  net: string;
};

export const calculateByEmployeeId = async (employeeId: string) => {
  const { data } = await api.post<ApiSuccess<SalaryCalcResult>>(
    "/api/salary/calculate",
    { employeeId }
  );
  return data.data;
};
