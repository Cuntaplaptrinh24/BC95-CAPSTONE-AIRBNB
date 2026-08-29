export default function HomeLoading() {
  return (
    <div className="flex flex-col gap-6 py-8 sm:py-10">
      <div className="container-airbnb flex flex-col gap-4">
        <div className="h-7 w-2/3 animate-pulse rounded bg-skeleton" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg p-2">
              <div className="h-20 w-20 shrink-0 animate-pulse rounded-lg bg-skeleton sm:h-24 sm:w-24" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-skeleton" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-skeleton" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="container-airbnb flex flex-col gap-4">
        <div className="h-7 w-1/3 animate-pulse rounded bg-skeleton" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="aspect-square animate-pulse rounded-xl bg-skeleton" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-skeleton" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-skeleton" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
