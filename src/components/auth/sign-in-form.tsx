'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInSchema, type SignInFormValues } from '@/lib/validations/auth-schema';
import { signIn } from '@/services/auth-service';
import { normalizeApiError } from '@/lib/api-error';
import { useAuthStore } from '@/store/auth-store';
import { showToast } from '@/components/common/toast';

interface SignInFormProps {
  onSuccess: () => void;
  onSwitchToSignUp: () => void;
}

export default function SignInForm({ onSuccess, onSwitchToSignUp }: SignInFormProps) {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  // Khi tài khoản đăng nhập có quyền Admin, hiển thị màn hình cho chọn
  // vào với tư cách User hay chuyển sang khu vực quản trị.
  const [askAdminChoice, setAskAdminChoice] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: SignInFormValues) => {
    try {
      const result = await signIn(values);
      setAuth(result.user, result.token);
      showToast('success', 'Đăng nhập thành công.');

      if (result.user.role === 'ADMIN') {
        setAskAdminChoice(true);
        return;
      }

      onSuccess();
    } catch (error) {
      const apiError = normalizeApiError(error);
      showToast('error', apiError.message);
    }
  };

  function continueAsUser() {
    onSuccess();
  }

  function continueAsAdmin() {
    onSuccess();
    router.push('/admin');
  }

  if (askAdminChoice) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Đăng nhập thành công</h2>
        <p className="text-sm text-gray-600">
          Tài khoản này có quyền quản trị. Bạn muốn tiếp tục với tư cách nào?
        </p>

        <button
          type="button"
          onClick={continueAsUser}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
        >
          Tiếp tục với tư cách User
        </button>

        <button
          type="button"
          onClick={continueAsAdmin}
          className="rounded-lg bg-[#FF385C] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#d90b3e]"
        >
          Vào khu vực quản trị
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-gray-900">Đăng nhập</h2>

      <div>
        <label htmlFor="signin-email" className="mb-1 block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="signin-email"
          type="email"
          autoComplete="email"
          {...register('email')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FF385C] focus:outline-none focus:ring-1 focus:ring-[#FF385C]"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="signin-password" className="mb-1 block text-sm font-medium text-gray-700">
          Mật khẩu
        </label>
        <div className="relative">
          <input
            id="signin-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            {...register('password')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-[#FF385C] focus:outline-none focus:ring-1 focus:ring-[#FF385C]"
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-sm text-gray-500"
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            {showPassword ? 'Ẩn' : 'Hiện'}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-[#FF385C] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#d90b3e] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
      </button>

      <p className="text-center text-sm text-gray-600">
        Chưa có tài khoản?{' '}
        <button
          type="button"
          onClick={onSwitchToSignUp}
          className="font-medium text-[#FF385C] hover:underline"
        >
          Đăng ký
        </button>
      </p>
    </form>
  );
}
