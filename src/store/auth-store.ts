// Kho dữ liệu chung giữ thông tin ai đang đăng nhập.
// Mọi màn hình đọc từ đây thay vì mỗi nơi tự lưu một bản, nên đăng xuất ở một chỗ
// là cả trang biết ngay.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/user';

// Những thứ kho này giữ và những việc nó làm được.
interface AuthState {
  user: User | null;          // thông tin người đang đăng nhập
  accessToken: string | null; // token gửi kèm khi gọi API cần xác thực
  isAuthenticated: boolean;   // đã đăng nhập hay chưa
  hasHydrated: boolean;       // đã đọc xong dữ liệu cũ từ bộ nhớ trình duyệt hay chưa
  setAuth: (user: User, accessToken: string) => void; // lưu phiên sau khi đăng nhập
  logout: () => void;                                 // xóa phiên khi đăng xuất
  setHasHydrated: (value: boolean) => void;           // đánh dấu đã đọc xong bộ nhớ
}

// persist bọc bên ngoài để kho tự lưu xuống bộ nhớ trình duyệt,
// nhờ vậy tải lại trang vẫn còn đăng nhập.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      hasHydrated: false,
      setAuth: (user, accessToken) =>
        set({ user, accessToken, isAuthenticated: true }),
      logout: () =>
        set({ user: null, accessToken: null, isAuthenticated: false }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      // Tên chỗ lưu trong bộ nhớ trình duyệt. Mở phần Application của công cụ
      // dành cho lập trình viên sẽ thấy đúng tên này.
      name: 'airbnb-auth',
      // Chỉ lưu ba thứ cần thiết, không lưu hasHydrated vì cờ đó phải tính lại
      // mỗi lần mở trang.
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
      // Chạy ngay sau khi đọc xong dữ liệu cũ từ bộ nhớ trình duyệt.
      // Đây là chỗ bật cờ hasHydrated mà AdminGuard chờ đợi.
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
