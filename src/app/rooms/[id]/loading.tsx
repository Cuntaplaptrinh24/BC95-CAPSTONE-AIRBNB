// Màn hình chờ của trang chi tiết phòng, dựng theo đúng bố cục trang thật:
// ảnh lớn ở trên, thông tin bên trái, khung đặt phòng bên phải.

export default function RoomDetailLoading() {
  return (
    <div className="container-airbnb py-8 sm:py-10">
      <div className="aspect-[16/9] w-full animate-pulse rounded-2xl bg-skeleton sm:aspect-[21/9]" />
      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="h-8 w-2/3 animate-pulse rounded bg-skeleton" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-skeleton" />
          <div className="flex gap-6 border-b border-border pb-6">
            <div className="h-4 w-20 animate-pulse rounded bg-skeleton" />
            <div className="h-4 w-20 animate-pulse rounded bg-skeleton" />
            <div className="h-4 w-20 animate-pulse rounded bg-skeleton" />
            <div className="h-4 w-20 animate-pulse rounded bg-skeleton" />
          </div>
          <div className="space-y-3">
            <div className="h-5 w-1/3 animate-pulse rounded bg-skeleton" />
            <div className="h-4 w-full animate-pulse rounded bg-skeleton" />
            <div className="h-4 w-full animate-pulse rounded bg-skeleton" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-skeleton" />
          </div>
          <div className="space-y-3 pt-4">
            <div className="h-5 w-1/4 animate-pulse rounded bg-skeleton" />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-6 w-32 animate-pulse rounded bg-skeleton" />
              ))}
            </div>
          </div>
          <div className="space-y-4 pt-4">
            <div className="h-5 w-1/3 animate-pulse rounded bg-skeleton" />
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-skeleton" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/4 animate-pulse rounded bg-skeleton" />
                  <div className="h-3 w-full animate-pulse rounded bg-skeleton" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="hidden lg:block">
          <div className="sticky top-24 space-y-4 rounded-xl border border-border p-6">
            <div className="h-7 w-1/2 animate-pulse rounded bg-skeleton" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-skeleton" />
            <div className="h-12 w-full animate-pulse rounded-lg bg-skeleton" />
          </div>
        </div>
      </div>
    </div>
  );
}
