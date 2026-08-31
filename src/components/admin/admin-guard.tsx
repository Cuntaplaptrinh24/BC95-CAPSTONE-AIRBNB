'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { showToast } from '@/components/common/toast';

interface AdminGuardProps {
  children: React.ReactNode;
}

// Chặn người không phải Admin khỏi toàn bộ khu vực /admin.
export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, isAuthenticated, hasHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isAuthenticated) {
      router.replace('/admin/login');
      return;
    }

    if (user?.role !== 'ADMIN') {
      showToast('error', 'Bạn không có quyền truy cập khu vực quản trị.');
      router.replace('/');
    }
  }, [hasHydrated, isAuthenticated, user, router]);

  if (!hasHydrated || !isAuthenticated || user?.role !== 'ADMIN') {
    return null;
  }

  return <>{children}</>;
}
