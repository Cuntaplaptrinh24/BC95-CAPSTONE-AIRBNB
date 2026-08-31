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
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('vi-VN');
}

// Phần tương tác của trang Đặt phòng: bảng dữ liệu + sửa ngày/số khách + xóa.
// Không có form tạo mới vì đặt phòng luôn phát sinh từ hành động của User.
export default function BookingsPanel({ bookings, roomNameByCode }: BookingsPanelProps) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);

  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Booking | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function handleFormSaved() {
    setEditingBooking(null);
    router.refresh();
  }

  async function handleConfirmDelete() {
    if (!deleteTarget || !accessToken) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteBooking(deleteTarget.id, buildAuthHeaders(accessToken));
      showToast('success', 'Đã xóa đặt phòng.');
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
            render: (row) => row.maNguoiDung,
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
