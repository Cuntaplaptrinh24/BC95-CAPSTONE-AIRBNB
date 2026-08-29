import { apiClient } from '@/lib/api-client';
import type { CyberSoftEnvelope, PaginatedContent, PaginationParams, Location } from '@/types';

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
