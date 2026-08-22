export default function Loading() {
  return (
    <div className="animate-pulse space-y-8">
      <div>
        <div className="h-4 w-20 rounded bg-slate-100" />
        <div className="mt-2 h-7 w-48 rounded bg-slate-200" />
        <div className="mt-2 h-4 w-64 rounded bg-slate-100" />
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="h-8 w-24 rounded bg-slate-200" />
        <div className="mt-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-4 rounded bg-slate-100" />
              <div className="h-1.5 w-full rounded-full bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
