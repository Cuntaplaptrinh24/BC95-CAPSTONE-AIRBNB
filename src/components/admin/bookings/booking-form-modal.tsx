'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  adminBookingSchema,
  type AdminBookingFormValues,
} from '@/lib/validations/admin-schema';
import { updateBooking } from '@/services/booking-service';
import { buildAuthHeaders } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { showToast } from '@/components/common/toast';
import { normalizeApiError } from '@/lib/api-error';
import type { Booking } from '@/types';

interface BookingFormModalProps {
  booking: Booking;
  roomName: string;
  onClose: () => void;
  onSaved: () => void;
}

// Hộp form sửa lượt đặt phòng. Chỉ có chế độ sửa, không có thêm mới.
// Quản trị chỉ đổi được ngày đến, ngày đi và số khách.
// Phòng và người đặt giữ nguyên vì đó là thông tin của lần đặt ban đầu.
export default function BookingFormModal({
  booking,
  roomName,
  onClose,
  onSaved,
}: BookingFormModalProps) {
  const accessToken = useAuthStore((s) => s.accessToken);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminBookingFormValues>({
    resolver: zodResolver(adminBookingSchema),
    // Ngày từ API có kèm cả giờ, ví dụ 2026-08-31T00:00:00. Ô chọn ngày của trình duyệt
    // chỉ nhận phần ngày, nên cắt lấy 10 ký tự đầu.
    defaultValues: {
      ngayDen: booking.ngayDen ? booking.ngayDen.slice(0, 10) : '',
      ngayDi: booking.ngayDi ? booking.ngayDi.slice(0, 10) : '',
      soLuongKhach: booking.soLuongKhach,
    },
  });

  // Chạy khi bấm Lưu và các ô đã hợp lệ.
  const onSubmit = async (values: AdminBookingFormValues) => {
    if (!accessToken) {
      return;
    }

    try {
      // API cập nhật đòi cả object, nên phải gửi kèm mã phòng và mã người đặt cũ,
      // dù hai thứ đó không đổi. Thiếu là server hiểu thành xóa mất.
      await updateBooking(
        booking.id,
        {
          id: booking.id,
          maPhong: booking.maPhong,
          maNguoiDung: booking.maNguoiDung,
          ...values,
        },
        buildAuthHeaders(accessToken),
      );
      showToast('success', 'Đã cập nhật đặt phòng.');
      onSaved();
    } catch (error) {
      showToast('error', normalizeApiError(error).message);
    }
  };

  return (
    // Lớp nền đen mờ phủ kín màn hình, hộp form nằm giữa.
    // max-h-[90vh] cùng overflow-y-auto để form dài vẫn cuộn được trong hộp.
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Chỉnh sửa đặt phòng</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-8 w-8 items-center justify-center rounded-full text-secondary hover:bg-surface"
          >
            ✕
          </button>
        </div>

        <p className="mt-2 text-sm text-secondary">
          Phòng: <span className="font-medium text-foreground">{roomName}</span>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4">
          <div>
            <label
              htmlFor="booking-ngayden"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Ngày đến
            </label>
            <input
              id="booking-ngayden"
              type="date"
              {...register('ngayDen')}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
            {errors.ngayDen && (
              <p className="mt-1 text-xs text-red-600">{errors.ngayDen.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="booking-ngaydi"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Ngày đi
            </label>
            <input
              id="booking-ngaydi"
              type="date"
              {...register('ngayDi')}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
            {errors.ngayDi && (
              <p className="mt-1 text-xs text-red-600">{errors.ngayDi.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="booking-khach"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Số lượng khách
            </label>
            <input
              id="booking-khach"
              type="number"
              {...register('soLuongKhach', { valueAsNumber: true })}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
            {errors.soLuongKhach && (
              <p className="mt-1 text-xs text-red-600">{errors.soLuongKhach.message}</p>
            )}
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-surface"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
