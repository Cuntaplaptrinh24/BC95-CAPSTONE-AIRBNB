// Hộp thoại hỏi lại trước khi làm việc không lùi được, chủ yếu là xóa.
// Bản thân nó không biết đang xóa cái gì: màn hình gọi nó truyền vào tiêu đề,
// mô tả, và hai hàm xử lý khi người dùng bấm xác nhận hoặc bấm hủy.
interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Đang đóng thì không vẽ gì cả.
  if (!open) {
    return null;
  }

  return (
    // Lớp nền đen mờ phủ kín màn hình, hộp thoại nằm giữa.
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <p className="text-lg font-semibold text-foreground">{title}</p>

        {description && (
          <p className="mt-2 text-sm text-secondary">{description}</p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-surface disabled:opacity-50"
          >
            {cancelLabel}
          </button>

          {/* Nút xác nhận để màu đỏ, nhắc người dùng đây là việc không lùi được */}
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? 'Đang xử lý...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
