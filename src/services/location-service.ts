import { apiClient, buildAuthHeaders, type AuthHeader } from '@/lib/api-client';
import type {
  CyberSoftEnvelope,
  PaginatedContent,
  PaginationParams,
  Location,
  CreateLocationPayload,
  UpdateLocationPayload,
} from '@/types';

const RESOURCE = '/vi-tri';

export async function getLocations(): Promise<Location[]> {
  const { data } = await apiClient.get<CyberSoftEnvelope<Location[]>>(RESOURCE);
  return data.content;
}

export async function getLocationsPaged(
  params: PaginationParams,
): Promise<PaginatedContent<Location>> {
  const { data } = await apiClient.get<CyberSoftEnvelope<PaginatedContent<Location>>>(
    `${RESOURCE}/phan-trang-tim-kiem`,
    { params },
  );
  return data.content;
}

export async function getLocationById(id: number): Promise<Location> {
  const { data } = await apiClient.get<CyberSoftEnvelope<Location>>(
    `${RESOURCE}/${encodeURIComponent(id)}`,
  );
  return data.content;
}

// Tạo vị trí mới (Admin)
export async function createLocation(
  payload: CreateLocationPayload,
  authHeader: AuthHeader,
): Promise<Location> {
  const { data } = await apiClient.post<CyberSoftEnvelope<Location>>(RESOURCE, payload, {
    headers: authHeader,
  });
  return data.content;
}

// Cập nhật vị trí (Admin)
export async function updateLocation(
  id: number,
  payload: UpdateLocationPayload,
  authHeader: AuthHeader,
): Promise<Location> {
  const { data } = await apiClient.put<CyberSoftEnvelope<Location>>(
    `${RESOURCE}/${encodeURIComponent(id)}`,
    { ...payload, id },
    { headers: authHeader },
  );
  return data.content;
}

// Xóa vị trí (Admin)
export async function deleteLocation(id: number, authHeader: AuthHeader): Promise<void> {
  await apiClient.delete(`${RESOURCE}/${encodeURIComponent(id)}`, {
    headers: authHeader,
  });
}

// Upload hình ảnh vị trí (Admin)
export async function uploadLocationImage(
  maViTri: number,
  file: File,
  accessToken: string,
): Promise<Location> {
  const formData = new FormData();
  formData.append('formFile', file);

  const { data } = await apiClient.post<CyberSoftEnvelope<Location>>(
    `${RESOURCE}/upload-hinh-vitri`,
    formData,
    {
      params: { maViTri },
      headers: buildAuthHeaders(accessToken),
    },
  );
  return data.content;
}
