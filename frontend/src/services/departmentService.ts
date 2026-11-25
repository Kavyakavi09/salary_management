import api from "./api";
import type { ApiSuccess } from "../types/api";
import type { Department } from "../types/lookups";

export const fetchDepartments = async () => {
  const { data } = await api.get<ApiSuccess<Department[]>>("/api/departments");
  return data.data;
};

export const createDepartment = async (name: string) => {
  const { data } = await api.post<ApiSuccess<Department>>("/api/departments", {
    name,
  });
  return data.data;
};

export const updateDepartment = async (id: number, name: string) => {
  const { data } = await api.patch<ApiSuccess<Department>>(
    `/api/departments/${id}`,
    { name }
  );
  return data.data;
};

export const deleteDepartment = async (id: number) => {
  const { data } = await api.delete<ApiSuccess<{ id: number }>>(
    `/api/departments/${id}`
  );
  return data.data;
};
