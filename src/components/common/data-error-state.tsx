interface DataErrorStateProps {
  title?: string;
  message?: string;
}

export default function DataErrorState({
  title = 'Không thể tải dữ liệu.',
  message = 'Đã xảy ra lỗi. Vui lòng thử lại sau.',
}: DataErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 py-16 text-center">
      <p className="text-lg font-medium text-foreground">{title}</p>
      <p className="text-sm text-secondary">{message}</p>
    </div>
  );
}
