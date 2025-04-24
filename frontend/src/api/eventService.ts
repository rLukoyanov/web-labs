import { axiosInstance } from './axiosInstance';

export const fetchEvents = async (showDeleted = false) => {
  const response = await axiosInstance.get('/events', {
    params: { showDeleted }
  });

  return response.data;
};