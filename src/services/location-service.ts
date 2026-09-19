import { apiClient, buildAuthHeaders, type AuthHeader } from '@/lib/api-client';
import type {
  CyberSoftEnvelope,
  PaginatedContent,
  PaginationParams,
  Location,
  CreateLocationPayload,
  UpdateLocationPayload,
} from '@/types';

// Các lời gọi API về vị trí.
// Hàm nào có authHeader là việc của quản trị, phải kèm token người đăng nhập.

const RESOURCE = '/vi-tri';

// Lấy toàn bộ vị trí, dùng cho trang chủ và cho ô chọn vị trí trong form thêm phòng.
export async function getLocations(): Promise<Location[]> {
  const { data } = await apiClient.get<CyberSoftEnvelope<Location[]>>(RESOURCE);
  return data.content;
}

// Lấy một trang vị trí kèm từ khóa tìm kiếm, dùng cho trang quản lý Vị trí.
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

// Tải ảnh vị trí lên. Cần mã vị trí nên chỉ gọi được khi vị trí đã tồn tại,
// đó là lý do form thêm mới chưa cho chọn ảnh.
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
