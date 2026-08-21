import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  restoreStudent,
  updateReviewStatus,
} from "@/app/(app)/students/actions";
import { ReviewStatusBadge } from "@/components/Badges";
import { formatCurrency, formatCurrencyPrecise, formatHourlyFee } from "@/lib/format";
import {
  PREPLY_COMMISSION_RATE,
  calculateStudentIncome,
  calculateTotalIncome,
} from "@/lib/income";
import { REVIEW_STATUSES, type ReviewStatus, type Student } from "@/lib/types";

const NEXT_STATUS: Record<ReviewStatus, ReviewStatus | null> = {
  "Not Asked": "Asked",
  Asked: "Reviewed",
  Reviewed: null,
};

const REVIEW_TONE: Record<ReviewStatus, string> = {
  "Not Asked": "from-slate-400 to-slate-500",
  Asked: "from-amber-400 to-orange-500",
  Reviewed: "from-emerald-400 to-teal-500",
};

function parseStatusFilter(raw: string | undefined): ReviewStatus | null {
  if (!raw) return null;
  return REVIEW_STATUSES.includes(raw as ReviewStatus)
    ? (raw as ReviewStatus)
    : null;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const statusFilter = parseStatusFilter(status);

  const supabase = await createClient();

  // Two independent lists: active students power the dashboard, deleted ones
  // populate the "Recently deleted" history section.
  const [{ data: activeData }, { data: deletedData }] = await Promise.all([
    supabase
      .from("students")
      .select("*")
      .is("deleted_at", null)
      .order("name", { ascending: true }),
    supabase
      .from("students")
      .select("*")
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false }),
  ]);

  const students = (activeData ?? []) as Student[];
  const deletedStudents = (deletedData ?? []) as Student[];

  const totalLessonsPerWeek = students.reduce(
    (sum, s) => sum + (s.lessons_per_week || 0),
    0,
  );

  const income = calculateTotalIncome(students);

  const reviewCounts: Record<ReviewStatus, number> = {
    "Not Asked": 0,
    Asked: 0,
    Reviewed: 0,
  };
  for (const s of students) reviewCounts[s.review_status] += 1;

  // Follow-ups: when a filter is picked, show every student with that status;
  // otherwise default to the non-Reviewed follow-up queue.
  const trackerList = statusFilter
    ? students.filter((s) => s.review_status === statusFilter)
    : students.filter((s) => s.review_status !== "Reviewed");

  const commissionPct = Math.round(PREPLY_COMMISSION_RATE * 100);
  const takeHomePct = 100 - commissionPct;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Follow-ups, weekly load, and your projected monthly income at a glance.
        </p>
      </div>

      {/* ---- KPI strip ---- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Active students"
          value={String(students.length)}
          tone="from-sky-500 to-blue-600"
          icon={
            <path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          }
        />
        <KpiCard
          label="Weekly lessons"
          value={String(totalLessonsPerWeek)}
          sub="across your roster"
          tone="from-violet-500 to-fuchsia-600"
          icon={
            <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          }
        />
        <KpiCard
          label="Est. monthly gross"
          value={formatCurrency(income.monthlyGross)}
          sub="before Preply commission"
          tone="from-emerald-500 to-teal-600"
          icon={
            <path d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
          }
        />
        <KpiCard
          label="Your take-home"
          value={formatCurrency(income.monthlyNet)}
          sub={`after ${commissionPct}% commission`}
          tone="from-pink-500 via-rose-500 to-orange-500"
          icon={
            <path d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ---- Estimated Monthly Income (hero, spans 2 cols) ---- */}
        <section className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-xl">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-pink-400/20 blur-3xl" />

          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Estimated Monthly Income</h2>
                <p className="mt-1 text-sm text-white/70">
                  Assumes every planned lesson happens (~4.33 weeks / month).
                </p>
              </div>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90 ring-1 ring-inset ring-white/25">
                Preply {commissionPct}% commission
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <IncomeStat
                label="Gross"
                value={formatCurrencyPrecise(income.monthlyGross)}
                caption="Before commission"
                emphasis="soft"
              />
              <IncomeStat
                label={`Preply cut (${commissionPct}%)`}
                value={`−${formatCurrencyPrecise(income.commission)}`}
                caption="Deducted"
                emphasis="soft"
              />
              <IncomeStat
                label={`Your take-home (${takeHomePct}%)`}
                value={formatCurrencyPrecise(income.monthlyNet)}
                caption="What you receive"
                emphasis="strong"
              />
            </div>

            {/* Visual gross → net bar */}
            <div className="mt-6">
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-white/15">
                <div
                  className="bg-gradient-to-r from-emerald-300 to-emerald-400"
                  style={{ width: `${takeHomePct}%` }}
                  title={`Take-home ${takeHomePct}%`}
                />
                <div
                  className="bg-gradient-to-r from-rose-300 to-rose-400"
                  style={{ width: `${commissionPct}%` }}
                  title={`Preply commission ${commissionPct}%`}
                />
              </div>
              <div className="mt-1 flex justify-between text-xs text-white/70">
                <span>Your {takeHomePct}%</span>
                <span>Preply {commissionPct}%</span>
              </div>
            </div>

            {students.length > 0 && (
              <div className="mt-6 overflow-hidden rounded-xl bg-white/10 ring-1 ring-inset ring-white/15">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-white/60">
                      <th className="px-4 py-2 font-medium">Student</th>
                      <th className="px-4 py-2 font-medium">Rate</th>
                      <th className="px-4 py-2 font-medium">Lessons/wk</th>
                      <th className="px-4 py-2 text-right font-medium">
                        Monthly take-home
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {students.map((student) => {
                      const bd = calculateStudentIncome(
                        student.hourly_fee,
                        student.lessons_per_week,
                      );
                      return (
                        <tr key={student.id} className="hover:bg-white/5">
                          <td className="px-4 py-2 font-medium">
                            <Link
                              href={`/students/${student.id}`}
                              className="hover:underline"
                            >
                              {student.name}
                            </Link>
                          </td>
                          <td className="px-4 py-2 tabular-nums text-white/80">
                            {formatHourlyFee(student.hourly_fee)}
                          </td>
                          <td className="px-4 py-2 tabular-nums text-white/80">
                            {student.lessons_per_week}
                          </td>
                          <td className="px-4 py-2 text-right tabular-nums font-semibold">
                            {formatCurrencyPrecise(bd.monthlyNet)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* ---- Preply Review Tracker ---- */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Preply Review Tracker
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Click a tile to filter the list below.
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {REVIEW_STATUSES.map((s) => {
              const selected = statusFilter === s;
              // Clicking the selected tile again clears the filter.
              const href = selected
                ? "/dashboard"
                : `/dashboard?status=${encodeURIComponent(s)}#preply-tracker`;
              return (
                <Link
                  key={s}
                  href={href}
                  aria-pressed={selected}
                  className={`group relative rounded-xl bg-gradient-to-br p-3 text-center text-white shadow-sm transition ${REVIEW_TONE[s]} ${
                    selected
                      ? "ring-2 ring-white ring-offset-2 ring-offset-white brightness-110"
                      : "hover:brightness-110"
                  }`}
                >
                  <div className="text-2xl font-bold">{reviewCounts[s]}</div>
                  <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-white/90">
                    {s}
                  </div>
                  {selected && (
                    <span className="absolute -top-1.5 -right-1.5 grid h-5 w-5 place-items-center rounded-full bg-white text-[10px] font-bold text-slate-700 shadow ring-1 ring-slate-200">
                      ✓
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div id="preply-tracker" className="mt-4 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              {statusFilter
                ? `Showing ${trackerList.length} “${statusFilter}” student${trackerList.length === 1 ? "" : "s"}`
                : `Showing ${trackerList.length} follow-up${trackerList.length === 1 ? "" : "s"} (Not Asked + Asked)`}
            </span>
            {statusFilter && (
              <Link
                href="/dashboard#preply-tracker"
                className="font-medium text-indigo-600 hover:underline"
              >
                Clear filter
              </Link>
            )}
          </div>

          <div className="mt-3">
            {trackerList.length === 0 ? (
              <p className="rounded-lg bg-emerald-50 px-3 py-3 text-sm text-emerald-700 ring-1 ring-inset ring-emerald-100">
                {statusFilter === "Reviewed"
                  ? "No reviews yet — keep asking!"
                  : statusFilter
                    ? `No students with “${statusFilter}”.`
                    : "All caught up — every student has been reviewed. ✨"}
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {trackerList.map((student) => {
                  const next = NEXT_STATUS[student.review_status];
                  return (
                    <li
                      key={student.id}
                      className="flex flex-wrap items-center justify-between gap-3 py-3"
                    >
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/students/${student.id}`}
                          className="text-sm font-medium text-slate-900 hover:text-indigo-600"
                        >
                          {student.name}
                        </Link>
                        <ReviewStatusBadge status={student.review_status} />
                      </div>
                      <div className="flex items-center gap-3">
                        {student.preply_link && (
                          <a
                            href={student.preply_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-indigo-600 hover:underline"
                          >
                            Preply ↗
                          </a>
                        )}
                        {next && (
                          <form action={updateReviewStatus}>
                            <input type="hidden" name="id" value={student.id} />
                            <input type="hidden" name="status" value={next} />
                            <button
                              type="submit"
                              className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:shadow-md hover:brightness-110"
                            >
                              Mark {next}
                            </button>
                          </form>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>

      {/* ---- Master Roster ---- */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Master Roster
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Every student you&apos;re currently working with.
            </p>
          </div>
          <Link
            href="/students/new"
            className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md hover:brightness-110"
          >
            + Add student
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          {students.length === 0 ? (
            <p className="rounded-lg bg-slate-50 px-3 py-6 text-center text-sm text-slate-500">
              No students yet.{" "}
              <Link
                href="/students/new"
                className="font-medium text-indigo-600 hover:underline"
              >
                Add your first student
              </Link>
              .
            </p>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-4 font-semibold">Name</th>
                  <th className="py-2 pr-4 font-semibold">Grade / Year</th>
                  <th className="py-2 pr-4 font-semibold">Curriculum</th>
                  <th className="py-2 pr-4 font-semibold">Lessons / wk</th>
                  <th className="py-2 pr-4 font-semibold">Rate</th>
                  <th className="py-2 pr-4 text-right font-semibold">
                    Take-home / mo
                  </th>
                  <th className="py-2 pr-4 font-semibold">Review</th>
                  <th className="py-2 font-semibold">Preply</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const bd = calculateStudentIncome(
                    student.hourly_fee,
                    student.lessons_per_week,
                  );
                  return (
                    <tr
                      key={student.id}
                      className="border-b border-slate-100 last:border-0 transition hover:bg-indigo-50/40"
                    >
                      <td className="py-2.5 pr-4">
                        <Link
                          href={`/students/${student.id}`}
                          className="font-medium text-slate-900 hover:text-indigo-600"
                        >
                          {student.name}
                        </Link>
                      </td>
                      <td className="py-2.5 pr-4 text-slate-600">
                        {student.grade_year ?? "—"}
                      </td>
                      <td className="py-2.5 pr-4 text-slate-600">
                        {student.curriculum ?? "—"}
                      </td>
                      <td className="py-2.5 pr-4 tabular-nums text-slate-600">
                        {student.lessons_per_week}
                      </td>
                      <td className="py-2.5 pr-4 tabular-nums text-slate-600">
                        {formatHourlyFee(student.hourly_fee)}
                      </td>
                      <td className="py-2.5 pr-4 text-right tabular-nums font-semibold text-emerald-700">
                        {formatCurrencyPrecise(bd.monthlyNet)}
                      </td>
                      <td className="py-2.5 pr-4">
                        <ReviewStatusBadge status={student.review_status} />
                      </td>
                      <td className="py-2.5">
                        {student.preply_link ? (
                          <a
                            href={student.preply_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:underline"
                          >
                            Link
                          </a>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* ---- Recently deleted (history) ---- */}
      {deletedStudents.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Recently deleted
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Deleted students don&apos;t count toward your roster or income.
                Restore any time.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {deletedStudents.length} in history
            </span>
          </div>

          <ul className="mt-4 divide-y divide-slate-100">
            {deletedStudents.map((student) => (
              <li
                key={student.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-900">
                    {student.name}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    Deleted{" "}
                    {student.deleted_at
                      ? new Date(student.deleted_at).toLocaleDateString()
                      : "—"}
                    {student.curriculum ? ` · ${student.curriculum}` : ""}
                  </div>
                </div>
                <form action={restoreStudent}>
                  <input type="hidden" name="id" value={student.id} />
                  <button
                    type="submit"
                    className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:shadow-md hover:brightness-110"
                  >
                    Restore
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

// ---------- presentational bits ----------

function KpiCard({
  label,
  value,
  sub,
  tone,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  tone: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${tone} p-5 text-white shadow-lg`}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-white/80">
            {label}
          </div>
          <div className="mt-2 text-3xl font-bold tabular-nums">{value}</div>
          {sub && <div className="mt-1 text-xs text-white/80">{sub}</div>}
        </div>
        <div className="rounded-lg bg-white/15 p-2 ring-1 ring-inset ring-white/20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.6}
            stroke="currentColor"
            className="h-5 w-5"
          >
            {icon}
          </svg>
        </div>
      </div>
    </div>
  );
}

function IncomeStat({
  label,
  value,
  caption,
  emphasis,
}: {
  label: string;
  value: string;
  caption: string;
  emphasis: "soft" | "strong";
}) {
  const container =
    emphasis === "strong"
      ? "bg-white text-slate-900 shadow-lg"
      : "bg-white/10 text-white ring-1 ring-inset ring-white/20";
  const labelClass =
    emphasis === "strong" ? "text-slate-500" : "text-white/70";
  const captionClass =
    emphasis === "strong" ? "text-slate-500" : "text-white/60";
  return (
    <div className={`rounded-xl px-4 py-3 ${container}`}>
      <div
        className={`text-[11px] font-semibold uppercase tracking-wide ${labelClass}`}
      >
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold tabular-nums">{value}</div>
      <div className={`text-xs ${captionClass}`}>{caption}</div>
    </div>
  );
}
