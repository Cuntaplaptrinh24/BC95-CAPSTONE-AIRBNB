'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/admin/data-table';
import ConfirmDialog from '@/components/admin/confirm-dialog';
import SafeImage from '@/components/common/safe-image';
import RoomFormModal from './room-form-modal';
import { deleteRoom } from '@/services/room-service';
import { buildAuthHeaders } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { showToast } from '@/components/common/toast';
import { normalizeApiError } from '@/lib/api-error';
import type { Room } from '@/types/room';
import type { Location } from '@/types';

interface RoomsPanelProps {
  rooms: Room[];
  locations: Location[];
}

// Phần tương tác của trang Phòng thuê: vẽ bảng và xử lý thêm, sửa, xóa.
// Nhận thêm danh sách vị trí để hiện tên vị trí trong bảng và cho form chọn.
export default function RoomsPanel({ rooms, locations }: RoomsPanelProps) {
  // Dùng để bảo Next.js tải lại dữ liệu của trang sau khi thêm, sửa hoặc xóa xong.
  const router = useRouter();

  // Token của người đang đăng nhập. Các thao tác ghi dữ liệu đều phải kèm token này.
  const accessToken = useAuthStore((s) => s.accessToken);

  // editingRoom để trống nghĩa là đang thêm mới, có dữ liệu nghĩa là đang sửa.
  const [formOpen, setFormOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Room | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Mỗi phòng chỉ lưu mã vị trí. Dựng bảng tra cứu từ mã sang tên vị trí
  // để bảng hiện tên cho người đọc thay vì hiện con số.
  const locationNameByCode = new Map(locations.map((loc) => [loc.id, loc.tenViTri]));

  function openCreateForm() {
    setEditingRoom(null);
    setFormOpen(true);
  }

  function openEditForm(target: Room) {
    setEditingRoom(target);
    setFormOpen(true);
  }

  function handleFormSaved() {
    setFormOpen(false);
    setEditingRoom(null);
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
      await deleteRoom(deleteTarget.id, buildAuthHeaders(accessToken));
      // Xóa xong thì báo một câu, đóng hộp xác nhận, rồi bảo trang tải lại danh sách.
      showToast('success', 'Đã xóa phòng.');
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
          + Thêm phòng
        </button>
      </div>

      <div className="mt-4">
        <DataTable
          columns={[
            {
              key: 'room',
              header: 'Phòng',
              render: (row) => (
                <div className="flex items-center gap-3">
                  <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-surface">
                    <SafeImage
                      src={row.hinhAnh}
                      alt={row.tenPhong}
                      fallbackSrc="/placeholder-room.svg"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{row.tenPhong}</p>
                    <p className="truncate text-xs text-secondary">
                      {locationNameByCode.get(row.maViTri) ?? `Mã vị trí ${row.maViTri}`}
                    </p>
                  </div>
                </div>
              ),
            },
            {
              key: 'capacity',
              header: 'Sức chứa',
              render: (row) => `${row.khach} khách · ${row.phongNgu} PN`,
            },
            {
              key: 'gia',
              header: 'Giá/đêm',
              render: (row) => `$${row.giaTien}`,
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
          data={rooms}
          rowKey={(row) => row.id}
          emptyMessage="Chưa có phòng nào."
        />
      </div>

      {formOpen && (
        <RoomFormModal
          room={editingRoom}
          locations={locations}
          onClose={() => setFormOpen(false)}
          onSaved={handleFormSaved}
          onImageUploaded={() => router.refresh()}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title={`Xóa phòng "${deleteTarget?.tenPhong ?? ''}"?`}
        description="Hành động này không thể hoàn tác."
        confirmLabel="Xóa"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
