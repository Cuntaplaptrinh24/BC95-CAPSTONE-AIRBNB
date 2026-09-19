'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminRoomSchema, type AdminRoomFormValues } from '@/lib/validations/admin-schema';
import { createRoom, updateRoom, uploadRoomImage } from '@/services/room-service';
import { buildAuthHeaders } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { showToast } from '@/components/common/toast';
import { normalizeApiError } from '@/lib/api-error';
import ImageUploadField from '@/components/admin/image-upload-field';
import { ROOM_AMENITY_FIELDS, type Room } from '@/types/room';
import type { Location } from '@/types';

interface RoomFormModalProps {
  room: Room | null;
  locations: Location[];
  onClose: () => void;
  onSaved: () => void;
  onImageUploaded: () => void;
}

// Hộp form thêm mới và sửa phòng thuê, form dài nhất trong khu quản trị.
// Giống vị trí, phần chọn ảnh chỉ hiện khi đang sửa vì API tải ảnh cần mã phòng.
export default function RoomFormModal({
  room,
  locations,
  onClose,
  onSaved,
  onImageUploaded,
}: RoomFormModalProps) {
  const accessToken = useAuthStore((s) => s.accessToken);
  // room để trống nghĩa là đang thêm mới.
  const isEditMode = room !== null;
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminRoomFormValues>({
    resolver: zodResolver(adminRoomSchema),
    // Sửa thì đổ toàn bộ thông tin phòng cũ vào form.
    // Thêm mới thì đặt giá trị mặc định hợp lý: chọn sẵn vị trí đầu danh sách,
    // một khách, một phòng ngủ, và mọi tiện nghi đều chưa tích.
    defaultValues: isEditMode
      ? {
          tenPhong: room.tenPhong,
          maViTri: room.maViTri,
          khach: room.khach,
          phongNgu: room.phongNgu,
          giuong: room.giuong,
          phongTam: room.phongTam,
          giaTien: room.giaTien,
          moTa: room.moTa,
          mayGiat: room.mayGiat,
          banLa: room.banLa,
          tivi: room.tivi,
          dieuHoa: room.dieuHoa,
          wifi: room.wifi,
          bep: room.bep,
          doXe: room.doXe,
          hoBoi: room.hoBoi,
          banUi: room.banUi,
        }
      : {
          tenPhong: '',
          maViTri: locations[0]?.id ?? 0,
          khach: 1,
          phongNgu: 1,
          giuong: 1,
          phongTam: 1,
          giaTien: 0,
          moTa: '',
          mayGiat: false,
          banLa: false,
          tivi: false,
          dieuHoa: false,
          wifi: false,
          bep: false,
          doXe: false,
          hoBoi: false,
          banUi: false,
        },
  });

  // Chạy khi bấm Lưu và các ô đã hợp lệ.
  const onSubmit = async (values: AdminRoomFormValues) => {
    if (!accessToken) {
      return;
    }

    const authHeader = buildAuthHeaders(accessToken);

    try {
      if (isEditMode) {
        await updateRoom(
          room.id,
          { id: room.id, ...values, hinhAnh: room.hinhAnh },
          authHeader,
        );
        showToast('success', 'Đã cập nhật phòng.');
      } else {
        await createRoom({ id: 0, ...values, hinhAnh: '' }, authHeader);
        showToast('success', 'Đã tạo phòng mới.');
      }
      onSaved();
    } catch (error) {
      showToast('error', normalizeApiError(error).message);
    }
  };

  // Ảnh phòng gửi lên ngay khi chọn xong, bằng một API riêng.
  async function handleImageSelected(file: File) {
    if (!accessToken || !isEditMode) {
      return;
    }

    setIsUploadingImage(true);
    try {
      await uploadRoomImage(room.id, file, accessToken);
      showToast('success', 'Đã cập nhật hình ảnh phòng.');
      onImageUploaded();
    } catch (error) {
      showToast('error', normalizeApiError(error).message);
    } finally {
      setIsUploadingImage(false);
    }
  }

  return (
    // Lớp nền đen mờ phủ kín màn hình, hộp form nằm giữa.
    // max-h-[90vh] cùng overflow-y-auto để form dài vẫn cuộn được trong hộp.
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {isEditMode ? 'Chỉnh sửa phòng' : 'Thêm phòng'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-8 w-8 items-center justify-center rounded-full text-secondary hover:bg-surface"
          >
            ✕
          </button>
        </div>

        {isEditMode && (
          <div className="mt-4">
            <ImageUploadField
              label="Hình ảnh"
              currentImageUrl={room.hinhAnh}
              fallbackSrc="/placeholder-room.svg"
              onFileSelected={handleImageSelected}
              isUploading={isUploadingImage}
            />
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4">
          <div>
            <label htmlFor="room-ten" className="mb-1 block text-sm font-medium text-foreground">
              Tên phòng
            </label>
            <input
              id="room-ten"
              type="text"
              {...register('tenPhong')}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
            {errors.tenPhong && (
              <p className="mt-1 text-xs text-red-600">{errors.tenPhong.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="room-vitri"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Vị trí
            </label>
            {/* valueAsNumber bảo form đổi chữ trong ô thành số trước khi kiểm tra,
                vì mọi ô nhập của trình duyệt đều trả về chữ */}
            <select
              id="room-vitri"
              {...register('maViTri', { valueAsNumber: true })}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.tenViTri}, {loc.tinhThanh}
                </option>
              ))}
            </select>
            {errors.maViTri && (
              <p className="mt-1 text-xs text-red-600">{errors.maViTri.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <label htmlFor="room-khach" className="mb-1 block text-sm font-medium text-foreground">
                Khách
              </label>
              <input
                id="room-khach"
                type="number"
                {...register('khach', { valueAsNumber: true })}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
            <div>
              <label htmlFor="room-phongngu" className="mb-1 block text-sm font-medium text-foreground">
                Phòng ngủ
              </label>
              <input
                id="room-phongngu"
                type="number"
                {...register('phongNgu', { valueAsNumber: true })}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
            <div>
              <label htmlFor="room-giuong" className="mb-1 block text-sm font-medium text-foreground">
                Giường
              </label>
              <input
                id="room-giuong"
                type="number"
                {...register('giuong', { valueAsNumber: true })}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
            <div>
              <label htmlFor="room-phongtam" className="mb-1 block text-sm font-medium text-foreground">
                Phòng tắm
              </label>
              <input
                id="room-phongtam"
                type="number"
                {...register('phongTam', { valueAsNumber: true })}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
          </div>
          {(errors.khach || errors.phongNgu || errors.giuong || errors.phongTam) && (
            <p className="-mt-2 text-xs text-red-600">Vui lòng kiểm tra lại các số liệu phòng.</p>
          )}

          <div>
            <label htmlFor="room-gia" className="mb-1 block text-sm font-medium text-foreground">
              Giá tiền (USD/đêm)
            </label>
            <input
              id="room-gia"
              type="number"
              {...register('giaTien', { valueAsNumber: true })}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
            {errors.giaTien && (
              <p className="mt-1 text-xs text-red-600">{errors.giaTien.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="room-mota" className="mb-1 block text-sm font-medium text-foreground">
              Mô tả
            </label>
            <textarea
              id="room-mota"
              rows={3}
              {...register('moTa')}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
            {errors.moTa && <p className="mt-1 text-xs text-red-600">{errors.moTa.message}</p>}
          </div>

          <div>
            <span className="mb-1 block text-sm font-medium text-foreground">Tiện nghi</span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {/* Chín tiện nghi đều là có hoặc không, nên khai báo thành một danh sách
                  rồi vẽ ra chín ô tích giống nhau, khỏi viết tay chín lần */}
              {ROOM_AMENITY_FIELDS.map((amenity) => (
                <label
                  key={amenity.key}
                  className="flex items-center gap-2 text-sm text-foreground"
                >
                  <input type="checkbox" {...register(amenity.key)} />
                  {amenity.label}
                </label>
              ))}
            </div>
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
