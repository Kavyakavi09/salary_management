import api from "./api";
import type { ApiSuccess } from "../types/api";
import type {
  Employee,
  EmployeeListResponse,
  EmployeePayload,
} from "../types/employee";

export type EmployeeListParams = {
  search?: string;
  countryId?: string;
  jobTitle?: string;
  departmentId?: string;
  page?: number;
  limit?: number;
};

export const fetchEmployees = async (params: EmployeeListParams = {}) => {
  const { data } = await api.get<EmployeeListResponse>("/api/employees", {
    params,
  });
  return data;
};

export const fetchEmployee = async (id: string) => {
  const { data } = await api.get<ApiSuccess<Employee>>(`/api/employees/${id}`);
  return data.data;
};

export const createEmployee = async (payload: EmployeePayload) => {
  const { data } = await api.post<ApiSuccess<Employee>>(
    "/api/employees",
    payload
  );
  return data.data;
};

export const updateEmployee = async (
  id: string,
  payload: Partial<EmployeePayload> & { status?: string }
) => {
  const { data } = await api.patch<ApiSuccess<Employee>>(
    `/api/employees/${id}`,
    payload
  );
  return data.data;
};

export const deleteEmployee = async (id: string) => {
  const { data } = await api.delete<ApiSuccess<{ id: string }>>(
    `/api/employees/${id}`
  );
  return data.data;
};
