'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInSchema, type SignInFormValues } from '@/lib/validations/auth-schema';
import { signIn } from '@/services/auth-service';
import { normalizeApiError } from '@/lib/api-error';
import { useAuthStore } from '@/store/auth-store';
import { showToast } from '@/components/common/toast';

// Trang đăng nhập riêng cho khu vực quản trị.
// Tài khoản thường có nhập đúng mật khẩu cũng bị từ chối ngay tại đây.
export default function AdminLoginPage() {
  const { isAuthenticated, user, hasHydrated, setAuth } = useAuthStore();
  const router = useRouter();

  // Khai báo form. Phần resolver nối form với bản mô tả dữ liệu hợp lệ
  // trong auth-schema, nhờ vậy nhập sai email hay mật khẩu ngắn quá
  // là báo lỗi ngay dưới ô nhập, chưa cần gọi lên server.
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  // Đang là quản trị viên mà mở lại trang đăng nhập thì cho vào thẳng
  // trang tổng quan, khỏi bắt đăng nhập lại.
  useEffect(() => {
    if (hasHydrated && isAuthenticated && user?.role === 'ADMIN') {
      router.replace('/admin');
    }
  }, [hasHydrated, isAuthenticated, user, router]);

  // Chạy khi bấm nút Đăng nhập và dữ liệu nhập đã hợp lệ.
  const onSubmit = async (values: SignInFormValues) => {
    try {
      // Gọi API đăng nhập, server trả về thông tin người dùng kèm token.
      const result = await signIn(values);

      // Không phải quản trị viên thì dừng lại, không lưu phiên đăng nhập.
      if (result.user.role !== 'ADMIN') {
        showToast('error', 'Tài khoản này không có quyền quản trị.');
        return;
      }

      // Lưu phiên đăng nhập vào kho dữ liệu chung để các trang khác dùng lại.
      setAuth(result.user, result.token);
      showToast('success', 'Đăng nhập quản trị thành công.');
      router.replace('/admin');
    } catch (error) {
      // Sai mật khẩu, mất mạng, server lỗi đều rơi vào đây.
      // normalizeApiError lấy ra câu thông báo gọn để hiện lên.
      const apiError = normalizeApiError(error);
      showToast('error', apiError.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm rounded-2xl border border-border bg-white p-8 shadow-sm"
      >
        <h1 className="text-xl font-semibold text-foreground">
          Đăng nhập quản trị
        </h1>
        <p className="mt-1 text-sm text-secondary">
          Dành riêng cho quản trị viên hệ thống Airbnb.
        </p>

        <div className="mt-6">
          <label
            htmlFor="admin-email"
            className="mb-1 block text-sm font-medium text-foreground"
          >
            Email
          </label>
          <input
            id="admin-email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="mt-4">
          <label
            htmlFor="admin-password"
            className="mb-1 block text-sm font-medium text-foreground"
          >
            Mật khẩu
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 w-full rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  );
}
