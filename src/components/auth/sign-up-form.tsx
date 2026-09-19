'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpSchema, type SignUpFormValues } from '@/lib/validations/auth-schema';
import { signUp } from '@/services/auth-service';
import { normalizeApiError } from '@/lib/api-error';
import { showToast } from '@/components/common/toast';

// Form đăng ký tài khoản mới, nằm trong cùng cửa sổ với form đăng nhập.

interface SignUpFormProps {
  onSwitchToSignIn: () => void;
}

export default function SignUpForm({ onSwitchToSignIn }: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      birthday: '',
      gender: true,
    },
  });

  // Chạy khi bấm Đăng ký và các ô đã hợp lệ.
  const onSubmit = async (values: SignUpFormValues) => {
    try {
      // id để 0 vì server tự sinh, role cố định là USER: người tự đăng ký
      // không thể tự cho mình quyền quản trị.
      await signUp({ id: 0, role: 'USER', ...values });
      showToast('success', 'Đăng ký thành công. Vui lòng đăng nhập.');
      // Đăng ký xong không tự đăng nhập luôn, mà chuyển sang form đăng nhập,
      // vì API đăng ký không trả về token.
      onSwitchToSignIn();
    } catch (error) {
      const apiError = normalizeApiError(error);
      showToast('error', apiError.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-gray-900">Đăng ký</h2>

      <div>
        <label htmlFor="signup-name" className="mb-1 block text-sm font-medium text-gray-700">
          Họ tên
        </label>
        <input
          id="signup-name"
          type="text"
          autoComplete="name"
          {...register('name')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FF385C] focus:outline-none focus:ring-1 focus:ring-[#FF385C]"
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="signup-email" className="mb-1 block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="signup-email"
          type="email"
          autoComplete="email"
          {...register('email')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FF385C] focus:outline-none focus:ring-1 focus:ring-[#FF385C]"
        />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="signup-password" className="mb-1 block text-sm font-medium text-gray-700">
          Mật khẩu
        </label>
        <div className="relative">
          <input
            id="signup-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
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

      <div>
        <label htmlFor="signup-phone" className="mb-1 block text-sm font-medium text-gray-700">
          Số điện thoại
        </label>
        <input
          id="signup-phone"
          type="tel"
          autoComplete="tel"
          {...register('phone')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FF385C] focus:outline-none focus:ring-1 focus:ring-[#FF385C]"
        />
        {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
      </div>

      <div>
        <label htmlFor="signup-birthday" className="mb-1 block text-sm font-medium text-gray-700">
          Ngày sinh
        </label>
        <input
          id="signup-birthday"
          type="date"
          {...register('birthday')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FF385C] focus:outline-none focus:ring-1 focus:ring-[#FF385C]"
        />
        {errors.birthday && (
          <p className="mt-1 text-xs text-red-600">{errors.birthday.message}</p>
        )}
      </div>

      <div>
        <span className="mb-1 block text-sm font-medium text-gray-700">Giới tính</span>
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name={field.name}
                  checked={field.value === true}
                  onChange={() => field.onChange(true)}
                  ref={field.ref}
                />
                Nam
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
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
        {errors.gender && <p className="mt-1 text-xs text-red-600">{errors.gender.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-[#FF385C] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#d90b3e] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Đang xử lý...' : 'Đăng ký'}
      </button>

      <p className="text-center text-sm text-gray-600">
        Đã có tài khoản?{' '}
        <button
          type="button"
          onClick={onSwitchToSignIn}
          className="font-medium text-[#FF385C] hover:underline"
        >
          Đăng nhập
        </button>
      </p>
    </form>
  );
}
