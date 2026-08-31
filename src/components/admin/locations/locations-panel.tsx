'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/admin/data-table';
import ConfirmDialog from '@/components/admin/confirm-dialog';
import SafeImage from '@/components/common/safe-image';
import LocationFormModal from './location-form-modal';
import { deleteLocation } from '@/services/location-service';
import { buildAuthHeaders } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { showToast } from '@/components/common/toast';
import { normalizeApiError } from '@/lib/api-error';
import type { Location } from '@/types';

interface LocationsPanelProps {
  locations: Location[];
}

// Phần tương tác của trang Vị trí: bảng dữ liệu + thêm/sửa/xóa.
export default function LocationsPanel({ locations }: LocationsPanelProps) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);

  const [formOpen, setFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Location | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function openCreateForm() {
    setEditingLocation(null);
    setFormOpen(true);
  }

  function openEditForm(target: Location) {
    setEditingLocation(target);
    setFormOpen(true);
  }

  function handleFormSaved() {
    setFormOpen(false);
    setEditingLocation(null);
    router.refresh();
  }

  async function handleConfirmDelete() {
    if (!deleteTarget || !accessToken) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteLocation(deleteTarget.id, buildAuthHeaders(accessToken));
      showToast('success', 'Đã xóa vị trí.');
      setDeleteTarget(null);
      router.refresh();
    } catch (error) {
      showToast('error', normalizeApiError(error).message);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={openCreateForm}
          className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          + Thêm vị trí
        </button>
      </div>

      <div className="mt-4">
        <DataTable
          columns={[
            {
              key: 'location',
              header: 'Vị trí',
              render: (row) => (
                <div className="flex items-center gap-3">
                  <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-surface">
                    <SafeImage
                      src={row.hinhAnh}
                      alt={row.tenViTri}
                      fallbackSrc="/placeholder-location.svg"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <p className="font-medium text-foreground">{row.tenViTri}</p>
                </div>
              ),
            },
            {
              key: 'tinhThanh',
              header: 'Tỉnh/Thành',
              render: (row) => row.tinhThanh,
            },
            {
              key: 'quocGia',
              header: 'Quốc gia',
              render: (row) => row.quocGia,
            },
            {
              key: 'actions',
              header: '',
              className: 'text-right',
              render: (row) => (
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openEditForm(row)}
                    className="rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground transition hover:bg-surface"
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(row)}
                    className="rounded-full border border-border px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Xóa
                  </button>
                </div>
              ),
            },
          ]}
          data={locations}
          rowKey={(row) => row.id}
          emptyMessage="Chưa có vị trí nào."
        />
      </div>

      {formOpen && (
        <LocationFormModal
          location={editingLocation}
          onClose={() => setFormOpen(false)}
          onSaved={handleFormSaved}
          onImageUploaded={() => router.refresh()}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title={`Xóa vị trí "${deleteTarget?.tenViTri ?? ''}"?`}
        description="Các phòng thuộc vị trí này có thể bị ảnh hưởng. Hành động này không thể hoàn tác."
        confirmLabel="Xóa"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
