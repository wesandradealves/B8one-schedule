import api from '@/services/api';
import { executeRequest } from '@/utils/request';
import type { UpdateUserPayload, User } from '@/types/user';

export const getUserById = async (id: string): Promise<User> => {
  return executeRequest(() => api.get<User>(`/users/${id}`));
};

export const updateUserById = async (
  id: string,
  payload: UpdateUserPayload,
): Promise<User> => {
  return executeRequest(() => api.patch<User>(`/users/${id}`, payload));
};
