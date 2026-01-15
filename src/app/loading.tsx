export default function Loading() {
  return (
    <div className="container pt-10 space-y-8">
      <div className="h-48 rounded-3xl bg-stone-100 animate-pulse" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-[#0001] bg-white p-4">
            <div className="h-40 rounded-xl bg-stone-100 animate-pulse" />
            <div className="mt-3 h-4 w-2/3 bg-stone-100 rounded animate-pulse" />
            <div className="mt-2 h-4 w-1/3 bg-stone-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
