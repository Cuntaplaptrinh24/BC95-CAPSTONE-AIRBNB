'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/admin/data-table';
import ConfirmDialog from '@/components/admin/confirm-dialog';
import BookingFormModal from './booking-form-modal';
import { deleteBooking } from '@/services/booking-service';
import { buildAuthHeaders } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { showToast } from '@/components/common/toast';
import { normalizeApiError } from '@/lib/api-error';
import type { Booking } from '@/types';

interface BookingsPanelProps {
  bookings: Booking[];
  roomNameByCode: Record<number, string>;
  roomCapacityByCode: Record<number, number>;
  userNameByCode: Record<number, string>;
}

// Đổi ngày từ dạng API trả về sang dạng quen mắt của người Việt, ví dụ 25/12/2026.
// Gặp ngày không đọc được thì trả lại nguyên chuỗi gốc thay vì để trang vỡ.
function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('vi-VN');
}

// Phần tương tác của trang Đặt phòng: vẽ bảng, sửa ngày và số khách, xóa lượt đặt.
// Không có nút thêm mới, vì lượt đặt phòng chỉ phát sinh khi người dùng tự đặt.
export default function BookingsPanel({
  bookings,
  roomNameByCode,
  roomCapacityByCode,
  userNameByCode,
}: BookingsPanelProps) {
  // Dùng để bảo Next.js tải lại dữ liệu của trang sau khi thêm, sửa hoặc xóa xong.
  const router = useRouter();

  // Token của người đang đăng nhập. Các thao tác ghi dữ liệu đều phải kèm token này.
  const accessToken = useAuthStore((s) => s.accessToken);

  // editingBooking: lượt đặt đang mở form sửa. deleteTarget: lượt đặt đang chờ xác nhận xóa.
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Booking | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function handleFormSaved() {
    setEditingBooking(null);
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
      await deleteBooking(deleteTarget.id, buildAuthHeaders(accessToken));
      // Xóa xong thì báo một câu, đóng hộp xác nhận, rồi bảo trang tải lại danh sách.
      showToast('success', 'Đã xóa đặt phòng.');
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
      <DataTable
        columns={[
          {
            key: 'room',
            header: 'Phòng',
            render: (row) => roomNameByCode[row.maPhong] ?? `Mã phòng ${row.maPhong}`,
          },
          {
            key: 'dates',
            header: 'Ngày đến - đi',
            render: (row) => `${formatDate(row.ngayDen)} → ${formatDate(row.ngayDi)}`,
          },
          {
            key: 'khach',
            header: 'Số khách',
            render: (row) => row.soLuongKhach,
          },
          {
            key: 'nguoiDung',
            header: 'Mã người dùng',
            // Có tên thì hiện tên, không lấy được thì hiện lại mã như cũ.
            render: (row) =>
              userNameByCode[row.maNguoiDung] ??
              `Mã người dùng ${row.maNguoiDung}`,
          },
          {
            key: 'actions',
            header: '',
            className: 'text-right',
            render: (row) => (
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBooking(row)}
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
        data={bookings}
        rowKey={(row) => row.id}
        emptyMessage="Chưa có đặt phòng nào."
      />

      {editingBooking && (
        <BookingFormModal
          booking={editingBooking}
          roomName={roomNameByCode[editingBooking.maPhong] ?? `Mã phòng ${editingBooking.maPhong}`}
          roomCapacity={roomCapacityByCode[editingBooking.maPhong]}
          onClose={() => setEditingBooking(null)}
          onSaved={handleFormSaved}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Xóa đặt phòng này?"
        description="Hành động này không thể hoàn tác."
        confirmLabel="Xóa"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
