import api from '@/services/api';
import { executeRequest } from '@/utils/request';
import type {
  CsvExportResult,
  CsvImportResult,
  PaginatedResult,
  SortOrder,
} from '@/types/api';
import type { UpdateUserPayload, User, UserListSortBy } from '@/types/user';

interface ListUsersParams {
  page?: number;
  limit?: number;
  sortOrder?: SortOrder;
  sortBy?: UserListSortBy;
}

export const getUserById = async (id: string): Promise<User> => {
  return executeRequest(() => api.get<User>(`/users/${id}`));
};

export const listUsers = async (
  params: ListUsersParams = {},
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

export const importUsersCsv = async (csvContent: string): Promise<CsvImportResult> => {
  return executeRequest(() =>
    api.post<CsvImportResult>('/users/import/csv', {
      csvContent,
    }),
  );
};

export const exportUsersCsv = async (): Promise<CsvExportResult> => {
  return executeRequest(() => api.get<CsvExportResult>('/users/export/csv'));
};
