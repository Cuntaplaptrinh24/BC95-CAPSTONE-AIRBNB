import { apiClient, buildAuthHeaders, type AuthHeader } from '@/lib/api-client';
import type {
  CyberSoftEnvelope,
  PaginatedContent,
  PaginationParams,
  Room,
  CreateRoomPayload,
  UpdateRoomPayload,
} from '@/types';

const RESOURCE = '/phong-thue';

export async function getRooms(): Promise<Room[]> {
  const { data } = await apiClient.get<CyberSoftEnvelope<Room[]>>(RESOURCE);
  return data.content;
}

export async function getRoomsByLocation(maViTri: number): Promise<Room[]> {
  const { data } = await apiClient.get<CyberSoftEnvelope<Room[]>>(
    `${RESOURCE}/lay-phong-theo-vi-tri`,
    { params: { maViTri } },
  );
  return data.content;
}

export async function getRoomsPaged(
  params: PaginationParams,
): Promise<PaginatedContent<Room>> {
  const { data } = await apiClient.get<CyberSoftEnvelope<PaginatedContent<Room>>>(
    `${RESOURCE}/phan-trang-tim-kiem`,
    { params },
  );
  return data.content;
}

export async function getRoomById(id: number): Promise<Room> {
  const { data } = await apiClient.get<CyberSoftEnvelope<Room>>(
    `${RESOURCE}/${encodeURIComponent(id)}`,
  );
  return data.content;
}

// Tạo phòng mới (Admin)
export async function createRoom(
  payload: CreateRoomPayload,
  authHeader: AuthHeader,
): Promise<Room> {
  const { data } = await apiClient.post<CyberSoftEnvelope<Room>>(RESOURCE, payload, {
    headers: authHeader,
  });
  return data.content;
}

// Cập nhật phòng (Admin)
export async function updateRoom(
  id: number,
  payload: UpdateRoomPayload,
  authHeader: AuthHeader,
): Promise<Room> {
  const { data } = await apiClient.put<CyberSoftEnvelope<Room>>(
    `${RESOURCE}/${encodeURIComponent(id)}`,
    { ...payload, id },
    { headers: authHeader },
  );
  return data.content;
}

// Xóa phòng (Admin)
export async function deleteRoom(id: number, authHeader: AuthHeader): Promise<void> {
  await apiClient.delete(`${RESOURCE}/${encodeURIComponent(id)}`, {
    headers: authHeader,
  });
}

// Upload hình ảnh phòng (Admin)
export async function uploadRoomImage(
  maPhong: number,
  file: File,
  accessToken: string,
): Promise<Room> {
  const formData = new FormData();
  formData.append('formFile', file);

  const { data } = await apiClient.post<CyberSoftEnvelope<Room>>(
    `${RESOURCE}/upload-hinh-phong`,
    formData,
    {
      params: { maPhong },
      headers: buildAuthHeaders(accessToken),
    },
  );
  return data.content;
}
