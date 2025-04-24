
import axiosInstance from './axios';

type User = any;

export const updateUserProfile = async (userData: Partial<User>): Promise<User> => {
  const response = await axiosInstance.put(`/auth/update`, userData);
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await axiosInstance.get('/auth/check-auth');
  return response.data;
};

export const login = async (userData: any) => {
  const response = await axiosInstance.post('/auth/login', userData);
  return response.data;
};

export const register = async (userData: any) => {
  const response = await axiosInstance.post('/auth/register', userData);
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}; 