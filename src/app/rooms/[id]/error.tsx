"use client";

export default function RoomDetailError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <div className="container-airbnb flex flex-col items-center justify-center py-24 text-center">
      <h2 className="text-lg font-medium text-foreground">
        Không thể tải thông tin chỗ ở.
      </h2>
      <p className="mt-2 text-sm text-secondary">
        Đã xảy ra lỗi. Vui lòng thử lại sau.
      </p>
      <button
        type="button"
        onClick={() => unstable_retry()}
        className="mt-4 rounded-full bg-brand px-6 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
      >
        Thử lại
      </button>
    </div>
  );
}
