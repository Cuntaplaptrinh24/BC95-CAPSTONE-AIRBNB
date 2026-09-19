'use client';

import { useEffect, useState } from 'react';

// Ô thông báo nhỏ hiện ở góc phải trên màn hình rồi tự tắt.
// Gọi là toast vì nó bật lên như lát bánh mì trong máy nướng.
//
// Cách dùng: bất kỳ chỗ nào trong dự án chỉ cần gọi showToast(...).
// Component ToastContainer đặt một lần ở khung chung của trang sẽ nhận và vẽ ra.

export interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  message: string;
}

// Danh sách những chỗ đang chờ nghe thông báo. Thực tế chỉ có một, là ToastContainer.
let toastListeners: ((msg: ToastMessage) => void)[] = [];

// Phát một thông báo. id ghép từ thời điểm và một số ngẫu nhiên để hai thông báo
// bật lên cùng lúc không trùng mã.
export function showToast(type: ToastMessage['type'], message: string) {
  const msg: ToastMessage = {
    id: `${Date.now()}-${Math.random()}`,
    type,
    message,
  };
  toastListeners.forEach((fn) => fn(msg));
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Đăng ký nhận thông báo khi component xuất hiện, và hủy đăng ký khi bị gỡ đi.
  // Mỗi thông báo tự biến mất sau 4 giây.
  useEffect(() => {
    const handler = (msg: ToastMessage) => {
      setToasts((prev) => [...prev, msg]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== msg.id));
      }, 4000);
    };
    toastListeners = [...toastListeners, handler];
    return () => {
      toastListeners = toastListeners.filter((fn) => fn !== handler);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2"
      role="status"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`rounded-lg px-4 py-3 text-sm text-white shadow-lg ${
            t.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
