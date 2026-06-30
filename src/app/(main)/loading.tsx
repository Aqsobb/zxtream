export default function Loading() {
  return (
    <div className="p-4 lg:p-6 space-y-8">
      <div className="h-[280px] sm:h-[360px] lg:h-[420px] bg-white/5 rounded-2xl animate-pulse" />
      <div className="flex gap-2 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-10 w-20 bg-white/5 rounded-xl animate-pulse flex-shrink-0" />
        ))}
      </div>
      {[1, 2, 3].map(s => (
        <div key={s} className="space-y-4">
          <div className="h-6 w-48 bg-white/5 rounded-lg animate-pulse" />
          <div className="flex gap-3 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-36 space-y-2">
                <div className="aspect-[3/4] rounded-lg bg-white/5 animate-pulse" />
                <div className="h-3 w-3/4 bg-white/5 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
