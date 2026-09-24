import api from "../lib/axios";

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

export const loginUser = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(
    "/auth/login",
    credentials
  );

  return response.data;
};

export const logoutUser = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
};

export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  return Boolean(localStorage.getItem("token"));
};