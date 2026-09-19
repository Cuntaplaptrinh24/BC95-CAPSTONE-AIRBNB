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

// Phần tương tác của trang Vị trí: vẽ bảng và xử lý thêm, sửa, xóa.
// Cấu trúc giống hệt panel Người dùng, chỉ khác cột hiển thị và API được gọi.
export default function LocationsPanel({ locations }: LocationsPanelProps) {
  // Dùng để bảo Next.js tải lại dữ liệu của trang sau khi thêm, sửa hoặc xóa xong.
  const router = useRouter();

  // Token của người đang đăng nhập. Các thao tác ghi dữ liệu đều phải kèm token này.
  const accessToken = useAuthStore((s) => s.accessToken);

  // editingLocation để trống nghĩa là đang thêm mới, có dữ liệu nghĩa là đang sửa.
  const [formOpen, setFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  // deleteTarget khác rỗng thì hộp xác nhận xóa hiện lên.
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

  // Chạy khi người dùng bấm Xóa trong hộp xác nhận.
  async function handleConfirmDelete() {
    // Không có dòng nào đang chọn, hoặc không có token đăng nhập thì bỏ qua.
    if (!deleteTarget || !accessToken) {
      return;
    }

    // Bật cờ đang xóa để nút chuyển sang chữ "Đang xử lý" và không bấm được hai lần.
    setIsDeleting(true);
    try {
      await deleteLocation(deleteTarget.id, buildAuthHeaders(accessToken));
      // Xóa xong thì báo một câu, đóng hộp xác nhận, rồi bảo trang tải lại danh sách.
      showToast('success', 'Đã xóa vị trí.');
      setDeleteTarget(null);
      router.refresh();
    } catch (error) {
      // Xóa hỏng thì hiện câu thông báo lấy từ lỗi server trả về.
      showToast('error', normalizeApiError(error).message);
    } finally {
      // Chạy dù thành công hay thất bại, để nút không kẹt ở trạng thái đang xử lý.
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
