import { apiClient, buildAuthHeaders, type AuthHeader } from '@/lib/api-client';
import type {
  CyberSoftEnvelope,
  PaginatedContent,
  PaginationParams,
  User,
  UpdateUserPayload,
  CreateUserPayload,
} from '@/types';

const RESOURCE = '/users';

// Tìm kiếm + phân trang người dùng (dùng cho Admin)
export async function getUsersPaged(
  params: PaginationParams,
): Promise<PaginatedContent<User>> {
  const { data } = await apiClient.get<CyberSoftEnvelope<PaginatedContent<User>>>(
    `${RESOURCE}/phan-trang-tim-kiem`,
    { params },
  );
  return data.content;
}

export async function getUserById(id: number): Promise<User> {
  const { data } = await apiClient.get<CyberSoftEnvelope<User>>(
    `${RESOURCE}/${encodeURIComponent(id)}`,
  );
  return data.content;
}

// Tạo người dùng mới (Admin)
export async function createUser(
  payload: CreateUserPayload,
  authHeader: AuthHeader,
): Promise<User> {
  const { data } = await apiClient.post<CyberSoftEnvelope<User>>(RESOURCE, payload, {
    headers: authHeader,
  });
  return data.content;
}

// Xóa người dùng theo id (Admin). API nhận id qua query string.
export async function deleteUser(id: number, authHeader: AuthHeader): Promise<void> {
  await apiClient.delete(RESOURCE, {
    params: { id },
    headers: authHeader,
  });
}

export async function updateUser(
  id: number,
  payload: UpdateUserPayload,
  authHeader: AuthHeader,
): Promise<User> {
  const { data } = await apiClient.put<CyberSoftEnvelope<User>>(
    `${RESOURCE}/${encodeURIComponent(id)}`,
    { ...payload, id },
    { headers: authHeader },
  );
  return data.content;
}

export async function uploadAvatar(
  file: File,
  accessToken: string,
): Promise<User> {
  const formData = new FormData();
  formData.append('formFile', file);

  const { data } = await apiClient.post<CyberSoftEnvelope<User>>(
    `${RESOURCE}/upload-avatar`,
    formData,
    { headers: buildAuthHeaders(accessToken) },
  );
  return data.content;
}
