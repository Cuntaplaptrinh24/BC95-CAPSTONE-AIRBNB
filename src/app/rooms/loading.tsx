export default function RoomsLoading() {
  return (
    <div className="container-airbnb py-8 sm:py-10">
      <div className="h-7 w-2/3 animate-pulse rounded bg-skeleton" />
      <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-skeleton" />
      <div className="mt-4 h-4 w-1/3 animate-pulse rounded bg-skeleton" />
      <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-x-6 sm:gap-y-5 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="aspect-square animate-pulse rounded-xl bg-skeleton" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-skeleton" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-skeleton" />
          </div>
        ))}
      </div>
    </div>
  );
}
