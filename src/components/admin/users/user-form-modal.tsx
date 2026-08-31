'use client';

import { Controller, useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  adminCreateUserSchema,
  adminUpdateUserSchema,
  type AdminCreateUserFormValues,
} from '@/lib/validations/admin-schema';
import { createUser, updateUser } from '@/services/user-service';
import { buildAuthHeaders } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { showToast } from '@/components/common/toast';
import { normalizeApiError } from '@/lib/api-error';
import { USER_ROLES, type User } from '@/types/user';

// Gộp chung 2 schema tạo mới/chỉnh sửa: mật khẩu chỉ bắt buộc khi tạo mới,
// nên khai báo là optional ở đây để dùng chung một form.
interface AdminUserFormValues {
  name: string;
  email: string;
  phone: string;
  birthday: string;
  gender: boolean;
  role: (typeof USER_ROLES)[number];
  password?: string;
}

interface UserFormModalProps {
  user: User | null;
  onClose: () => void;
  onSaved: () => void;
}

// Modal thêm mới / chỉnh sửa người dùng. Chế độ tạo mới yêu cầu thêm mật khẩu,
// chế độ chỉnh sửa thì không (API cập nhật người dùng không nhận mật khẩu).
export default function UserFormModal({ user, onClose, onSaved }: UserFormModalProps) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const currentUser = useAuthStore((s) => s.user);
  const isEditMode = user !== null;
  const isEditingSelf = isEditMode && user.id === currentUser?.id;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminUserFormValues>({
    resolver: zodResolver(
      isEditMode ? adminUpdateUserSchema : adminCreateUserSchema,
    ) as Resolver<AdminUserFormValues>,
    defaultValues: isEditMode
      ? {
          name: user.name,
          email: user.email,
          phone: user.phone,
          birthday: user.birthday ? user.birthday.slice(0, 10) : '',
          gender: user.gender,
          role: USER_ROLES.includes(user.role as (typeof USER_ROLES)[number])
            ? (user.role as (typeof USER_ROLES)[number])
            : 'USER',
        }
      : {
          name: '',
          email: '',
          phone: '',
          birthday: '',
          gender: true,
          role: 'USER',
          password: '',
        },
  });

  const onSubmit = async (values: AdminUserFormValues) => {
    if (!accessToken) {
      return;
    }

    const authHeader = buildAuthHeaders(accessToken);

    try {
      if (isEditMode) {
        await updateUser(user.id, { id: user.id, ...values }, authHeader);
        showToast('success', 'Đã cập nhật người dùng.');
      } else {
        const createValues = values as AdminCreateUserFormValues;
        await createUser({ id: 0, ...createValues }, authHeader);
        showToast('success', 'Đã tạo người dùng mới.');
      }
      onSaved();
    } catch (error) {
      showToast('error', normalizeApiError(error).message);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {isEditMode ? 'Chỉnh sửa người dùng' : 'Thêm người dùng'}
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

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4">
          <div>
            <label htmlFor="user-name" className="mb-1 block text-sm font-medium text-foreground">
              Họ tên
            </label>
            <input
              id="user-name"
              type="text"
              {...register('name')}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="user-email" className="mb-1 block text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="user-email"
              type="email"
              {...register('email')}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          {!isEditMode && (
            <div>
              <label
                htmlFor="user-password"
                className="mb-1 block text-sm font-medium text-foreground"
              >
                Mật khẩu
              </label>
              <input
                id="user-password"
                type="password"
                {...register('password')}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>
          )}

          <div>
            <label htmlFor="user-phone" className="mb-1 block text-sm font-medium text-foreground">
              Số điện thoại
            </label>
            <input
              id="user-phone"
              type="tel"
              {...register('phone')}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
          </div>

          <div>
            <label
              htmlFor="user-birthday"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Ngày sinh
            </label>
            <input
              id="user-birthday"
              type="date"
              {...register('birthday')}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
            {errors.birthday && (
              <p className="mt-1 text-xs text-red-600">{errors.birthday.message}</p>
            )}
          </div>

          <div>
            <span className="mb-1 block text-sm font-medium text-foreground">Giới tính</span>
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
                      onChange={() => field.onChange(true)}
                      ref={field.ref}
                    />
                    Nam
                  </label>
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="radio"
                      name={field.name}
                      checked={field.value === false}
                      onChange={() => field.onChange(false)}
                      ref={field.ref}
                    />
                    Nữ
                  </label>
                </div>
              )}
            />
          </div>

          <div>
            <label htmlFor="user-role" className="mb-1 block text-sm font-medium text-foreground">
              Vai trò
            </label>
            <select
              id="user-role"
              disabled={isEditingSelf}
              title={
                isEditingSelf
                  ? 'Không thể tự thay đổi vai trò của tài khoản đang đăng nhập.'
                  : undefined
              }
              {...register('role')}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand disabled:cursor-not-allowed disabled:bg-surface"
            >
              {USER_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
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
