import api from "./api";
import type { ApiSuccess } from "../types/api";
import type { Country } from "../types/lookups";
import { fetchDepartments } from "./departmentService";

export { fetchDepartments };

export const fetchCountries = async () => {
  const { data } = await api.get<ApiSuccess<Country[]>>("/api/countries");
  return data.data;
};
