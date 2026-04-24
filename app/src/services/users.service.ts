import api from '@/services/api';
import { executeRequest } from '@/utils/request';
import type { PaginatedResult, PaginationQueryParams } from '@/types/api';
import type { UpdateUserPayload, User } from '@/types/user';

export const getUserById = async (id: string): Promise<User> => {
  return executeRequest(() => api.get<User>(`/users/${id}`));
};

export const listUsers = async (
  params: PaginationQueryParams = {},
): Promise<PaginatedResult<User>> => {
  return executeRequest(() =>
    api.get<PaginatedResult<User>>('/users/all', {
      params,
    }),
  );
};

export const updateUserById = async (
  id: string,
  payload: UpdateUserPayload,
): Promise<User> => {
  return executeRequest(() => api.patch<User>(`/users/${id}`, payload));
};

export const deleteUserById = async (id: string): Promise<void> => {
  await executeRequest(() => api.delete<void>(`/users/${id}`));
};
