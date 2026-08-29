"use client";

export default function RoomsError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <div className="container-airbnb py-16 text-center">
      <h2 className="text-lg font-medium text-foreground">Đã xảy ra lỗi khi tải dữ liệu.</h2>
      <p className="mt-2 text-sm text-secondary">
        Vui lòng thử lại hoặc quay về trang chủ.
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
