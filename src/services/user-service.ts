import { apiClient, buildAuthHeaders, type AuthHeader } from '@/lib/api-client';
import type { CyberSoftEnvelope, User, UpdateUserPayload } from '@/types';

const RESOURCE = '/users';

export async function getUserById(id: number): Promise<User> {
  const { data } = await apiClient.get<CyberSoftEnvelope<User>>(
    `${RESOURCE}/${encodeURIComponent(id)}`,
  );
  return data.content;
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
