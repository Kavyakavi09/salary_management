import api from "./api";
import type { ApiSuccess } from "../types/api";
import type { AuthUser } from "../store/slices/authSlice";

type LoginResponse = ApiSuccess<AuthUser> & {
  token: string;
};

export const loginRequest = async (email: string, password: string) => {
  const { data } = await api.post<LoginResponse>("/api/auth/login", {
    email,
    password,
  });
  return data;
};

export const registerRequest = async (
  name: string,
  email: string,
  password: string
) => {
  const { data } = await api.post<ApiSuccess<AuthUser>>("/api/auth/register", {
    name,
    email,
    password,
  });
  return data;
};

export const currentUserRequest = async () => {
  const { data } = await api.get<ApiSuccess<AuthUser>>("/api/auth/current-user");
  return data;
};
