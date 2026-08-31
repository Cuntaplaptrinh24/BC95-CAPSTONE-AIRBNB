'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  adminLocationSchema,
  type AdminLocationFormValues,
} from '@/lib/validations/admin-schema';
import {
  createLocation,
  updateLocation,
  uploadLocationImage,
} from '@/services/location-service';
import { buildAuthHeaders } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { showToast } from '@/components/common/toast';
import { normalizeApiError } from '@/lib/api-error';
import ImageUploadField from '@/components/admin/image-upload-field';
import type { Location } from '@/types';

interface LocationFormModalProps {
  location: Location | null;
  onClose: () => void;
  onSaved: () => void;
  onImageUploaded: () => void;
}

// Modal thêm mới / chỉnh sửa vị trí. Ảnh vị trí chỉ có thể tải lên sau khi
// vị trí đã tồn tại (cần mã vị trí cho API upload), nên chỉ hiện ở chế độ sửa.
export default function LocationFormModal({
  location,
  onClose,
  onSaved,
  onImageUploaded,
}: LocationFormModalProps) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const isEditMode = location !== null;
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLocationFormValues>({
    resolver: zodResolver(adminLocationSchema),
    defaultValues: isEditMode
      ? {
          tenViTri: location.tenViTri,
          tinhThanh: location.tinhThanh,
          quocGia: location.quocGia,
        }
      : {
          tenViTri: '',
          tinhThanh: '',
          quocGia: '',
        },
  });

  const onSubmit = async (values: AdminLocationFormValues) => {
    if (!accessToken) {
      return;
    }

    const authHeader = buildAuthHeaders(accessToken);

    try {
      if (isEditMode) {
        await updateLocation(
          location.id,
          { id: location.id, ...values, hinhAnh: location.hinhAnh },
          authHeader,
        );
        showToast('success', 'Đã cập nhật vị trí.');
      } else {
        await createLocation({ id: 0, ...values, hinhAnh: '' }, authHeader);
        showToast('success', 'Đã tạo vị trí mới.');
      }
      onSaved();
    } catch (error) {
      showToast('error', normalizeApiError(error).message);
    }
  };

  async function handleImageSelected(file: File) {
    if (!accessToken || !isEditMode) {
      return;
    }

    setIsUploadingImage(true);
    try {
      await uploadLocationImage(location.id, file, accessToken);
      showToast('success', 'Đã cập nhật hình ảnh vị trí.');
      onImageUploaded();
    } catch (error) {
      showToast('error', normalizeApiError(error).message);
    } finally {
      setIsUploadingImage(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {isEditMode ? 'Chỉnh sửa vị trí' : 'Thêm vị trí'}
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
              currentImageUrl={location.hinhAnh}
              fallbackSrc="/placeholder-location.svg"
              onFileSelected={handleImageSelected}
              isUploading={isUploadingImage}
            />
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4">
          <div>
            <label
              htmlFor="location-ten"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Tên vị trí
            </label>
            <input
              id="location-ten"
              type="text"
              {...register('tenViTri')}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
            {errors.tenViTri && (
              <p className="mt-1 text-xs text-red-600">{errors.tenViTri.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="location-tinh"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Tỉnh/Thành
            </label>
            <input
              id="location-tinh"
              type="text"
              {...register('tinhThanh')}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
            {errors.tinhThanh && (
              <p className="mt-1 text-xs text-red-600">{errors.tinhThanh.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="location-quocgia"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Quốc gia
            </label>
            <input
              id="location-quocgia"
              type="text"
              {...register('quocGia')}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
            {errors.quocGia && (
              <p className="mt-1 text-xs text-red-600">{errors.quocGia.message}</p>
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
