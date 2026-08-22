export default function Loading() {
  return (
    <div className="animate-pulse space-y-8">
      <div>
        <div className="h-4 w-20 rounded bg-slate-100" />
        <div className="mt-2 h-7 w-56 rounded bg-slate-200" />
        <div className="mt-2 h-4 w-72 rounded bg-slate-100" />
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
      <div className="h-40 rounded-2xl border border-slate-200 bg-white" />
    </div>
  );
}
