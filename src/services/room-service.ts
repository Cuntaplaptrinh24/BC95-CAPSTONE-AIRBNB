import { apiClient } from '@/lib/api-client';
import type { CyberSoftEnvelope, PaginatedContent, PaginationParams, Room } from '@/types';

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
