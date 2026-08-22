export default function Loading() {
  return (
    <div className="animate-pulse space-y-8">
      <div>
        <div className="h-7 w-56 rounded bg-slate-200" />
        <div className="mt-2 h-4 w-72 rounded bg-slate-100" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className="h-3 w-24 rounded bg-slate-100" />
            <div className="mt-3 h-7 w-16 rounded bg-slate-200" />
          </div>
        ))}
      </div>
      <div className="h-20 rounded-2xl border border-slate-200 bg-white" />
    </div>
  );
}
