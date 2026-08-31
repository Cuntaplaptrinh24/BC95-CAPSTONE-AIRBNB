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

// Trang đăng nhập riêng cho khu vực Admin. Chỉ tài khoản có role ADMIN
// mới được cấp phiên đăng nhập; tài khoản User bị từ chối ngay tại đây.
export default function AdminLoginPage() {
  const { isAuthenticated, user, hasHydrated, setAuth } = useAuthStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (hasHydrated && isAuthenticated && user?.role === 'ADMIN') {
      router.replace('/admin');
    }
  }, [hasHydrated, isAuthenticated, user, router]);

  const onSubmit = async (values: SignInFormValues) => {
    try {
      const result = await signIn(values);

      if (result.user.role !== 'ADMIN') {
        showToast('error', 'Tài khoản này không có quyền quản trị.');
        return;
      }

      setAuth(result.user, result.token);
      showToast('success', 'Đăng nhập quản trị thành công.');
      router.replace('/admin');
    } catch (error) {
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
