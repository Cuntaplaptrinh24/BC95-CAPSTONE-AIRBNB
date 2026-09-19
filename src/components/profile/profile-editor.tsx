"use client";

// Phần sửa thông tin cá nhân trong trang hồ sơ: họ tên, email, số điện thoại,
// ngày sinh, giới tính, và đổi ảnh đại diện.

import { useRef, useState, type ChangeEvent } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  profileSchema,
  type ProfileFormValues,
} from "@/lib/validations/profile-schema";
import { buildAuthHeaders } from "@/lib/api-client";
import { normalizeApiError } from "@/lib/api-error";
import {
  updateUser,
  uploadAvatar,
} from "@/services/user-service";
import { showToast } from "@/components/common/toast";
import type { User } from "@/types/user";

// Giới hạn ảnh đại diện 5 MB và chỉ nhận vài định dạng ảnh thông dụng.
// Chặn ngay ở trình duyệt để khỏi tải lên rồi mới bị server từ chối.
const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

const ACCEPTED_AVATAR_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

interface ProfileEditorProps {
  user: User;
  accessToken: string;
  onUpdated: (user: User) => void;
}

// Ngày từ API có kèm giờ, ô chọn ngày của trình duyệt chỉ nhận phần ngày,
// nên cắt lấy 10 ký tự đầu.
function toDateInput(value: string): string {
  const match = value?.match(/^\d{4}-\d{2}-\d{2}/);
  return match?.[0] ?? "";
}

// Đổ thông tin hiện tại của người dùng vào form.
function getDefaultValues(user: User): ProfileFormValues {
  return {
    name: user.name,
    email: user.email,
    phone: user.phone,
    birthday: toDateInput(user.birthday),
    gender: user.gender,
  };
}

export default function ProfileEditor({
  user,
  accessToken,
  onUpdated,
}: ProfileEditorProps) {
  // editing quyết định đang ở chế độ xem hay chế độ sửa.
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: getDefaultValues(user),
  });

  // Bấm hủy: thoát chế độ sửa và trả các ô về giá trị ban đầu.
  const handleCancel = () => {
    reset(getDefaultValues(user));
    setEditing(false);
  };

  // Lưu thông tin: gọi API cập nhật rồi báo lên trang cha để cập nhật màn hình.
  const handleProfileSubmit = async (
    values: ProfileFormValues,
  ) => {
    try {
      const updated = await updateUser(
        user.id,
        {
          id: user.id,
          ...values,
          role: user.role,
        },
        buildAuthHeaders(accessToken),
      );

      const mergedUser = {
        ...user,
        ...updated,
      };

      onUpdated(mergedUser);
      reset(getDefaultValues(mergedUser));
      setEditing(false);

      showToast(
        "success",
        "Cập nhật hồ sơ thành công.",
      );
    } catch (error: unknown) {
      showToast(
        "error",
        normalizeApiError(error).message,
      );
    }
  };

  // Đổi ảnh đại diện. Ảnh gửi lên bằng API riêng và gửi ngay khi chọn xong,
  // không chờ bấm lưu, nên phải kiểm tra dung lượng và định dạng trước.
  const handleAvatarChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!ACCEPTED_AVATAR_TYPES.has(file.type)) {
      showToast(
        "error",
        "Ảnh đại diện phải là tệp JPEG, PNG hoặc WebP.",
      );

      event.target.value = "";
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      showToast(
        "error",
        "Ảnh đại diện không được vượt quá 5 MB.",
      );

      event.target.value = "";
      return;
    }

    setUploading(true);

    try {
      const updated = await uploadAvatar(
        file,
        accessToken,
      );

      onUpdated({
        ...user,
        ...updated,
      });

      showToast(
        "success",
        "Cập nhật ảnh đại diện thành công.",
      );
    } catch (error: unknown) {
      showToast(
        "error",
        normalizeApiError(error).message,
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const inputClassName =
    "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand";

  return (
    <div className="w-full max-w-2xl">
      <div className="flex flex-wrap gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleAvatarChange}
          className="sr-only"
          aria-label="Chọn ảnh đại diện"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || isSubmitting}
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading
            ? "Đang tải ảnh..."
            : "Đổi ảnh đại diện"}
        </button>

        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            disabled={uploading}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            Chỉnh sửa hồ sơ
          </button>
        )}
      </div>

      {editing && (
        <form
          onSubmit={handleSubmit(handleProfileSubmit)}
          className="mt-5 grid grid-cols-1 gap-4 rounded-xl border border-border p-4 sm:grid-cols-2 sm:p-6"
        >
          <div>
            <label
              htmlFor="profile-name"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Họ tên
            </label>

            <input
              id="profile-name"
              type="text"
              autoComplete="name"
              {...register("name")}
              className={inputClassName}
            />

            {errors.name && (
              <p className="mt-1 text-xs text-red-600">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="profile-email"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Email
            </label>

            <input
              id="profile-email"
              type="email"
              autoComplete="email"
              {...register("email")}
              className={inputClassName}
            />

            {errors.email && (
              <p className="mt-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="profile-phone"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Số điện thoại
            </label>

            <input
              id="profile-phone"
              type="tel"
              autoComplete="tel"
              {...register("phone")}
              className={inputClassName}
            />

            {errors.phone && (
              <p className="mt-1 text-xs text-red-600">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="profile-birthday"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Ngày sinh
            </label>

            <input
              id="profile-birthday"
              type="date"
              {...register("birthday")}
              className={inputClassName}
            />

            {errors.birthday && (
              <p className="mt-1 text-xs text-red-600">
                {errors.birthday.message}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <span className="mb-1 block text-sm font-medium text-foreground">
              Giới tính
            </span>

            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="radio"
                      name={field.name}
                      checked={field.value === true}
                      onChange={() =>
                        field.onChange(true)
                      }
                      ref={field.ref}
                    />
                    Nam
                  </label>

                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="radio"
                      name={field.name}
                      checked={field.value === false}
                      onChange={() =>
                        field.onChange(false)
                      }
                      ref={field.ref}
                    />
                    Nữ
                  </label>
                </div>
              )}
            />

            {errors.gender && (
              <p className="mt-1 text-xs text-red-600">
                {errors.gender.message}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting || uploading}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Đang lưu..."
                : "Lưu thay đổi"}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
            >
              Hủy
            </button>
          </div>
        </form>
      )}
    </div>
  );
}