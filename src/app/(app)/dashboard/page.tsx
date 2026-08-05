import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { updateReviewStatus } from "@/app/(app)/students/actions";
import { ReviewStatusBadge } from "@/components/Badges";
import {
  calculateStudentIncome,
  calculateTotalIncome,
  PREPLY_COMMISSION_RATE,
} from "@/lib/income";
import {
  formatCurrency,
  formatCurrencyPrecise,
  formatHourlyFee,
} from "@/lib/format";
import {
  REVIEW_STATUSES,
  type ReviewStatus,
  type Student,
} from "@/lib/types";

const NEXT_STATUS: Record<ReviewStatus, ReviewStatus | null> = {
  "Not Asked": "Asked",
  Asked: "Reviewed",
  Reviewed: null,
};

const REVIEW_TILE_GRADIENT: Record<ReviewStatus, string> = {
  "Not Asked":
    "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 ring-slate-200",
  Asked:
    "bg-gradient-to-br from-amber-100 to-amber-200 text-amber-800 ring-amber-200",
  Reviewed:
    "bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-800 ring-emerald-200",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: studentsData } = await supabase
    .from("students")
    .select("*")
    .order("name", { ascending: true });
  const students = (studentsData ?? []) as Student[];

  const reviewCounts: Record<ReviewStatus, number> = {
    "Not Asked": 0,
    Asked: 0,
    Reviewed: 0,
  };
  for (const s of students) reviewCounts[s.review_status] += 1;
  const followUps = students.filter((s) => s.review_status !== "Reviewed");

  const totalWeeklyLessons = students.reduce(
    (sum, s) => sum + s.lessons_per_week,
    0,
  );
  const totalIncome = calculateTotalIncome(students);
  const commissionPct = Math.round(PREPLY_COMMISSION_RATE * 100);
  const takeHomePct = 100 - commissionPct;

  return (
    <div className="space-y-8">
      {/* Page title */}
      <div>
        <h1 className="gradient-title text-3xl font-bold sm:text-4xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Follow-ups, income, and your roster at a glance.
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiTile
          label="Active students"
          value={students.length.toString()}
          gradient="from-sky-500 to-blue-600"
          shadow="shadow-sky-500/20"
          icon={<UsersIcon />}
        />
        <KpiTile
          label="Weekly lessons"
          value={totalWeeklyLessons.toString()}
          gradient="from-violet-500 to-fuchsia-600"
          shadow="shadow-violet-500/20"
          icon={<CalendarIcon />}
        />
        <KpiTile
          label="Est. monthly gross"
          value={formatCurrency(totalIncome.monthlyGross)}
          gradient="from-emerald-500 to-teal-600"
          shadow="shadow-emerald-500/20"
          icon={<TrendIcon />}
        />
        <KpiTile
          label="Your take-home"
          value={formatCurrency(totalIncome.monthlyNet)}
          gradient="from-pink-500 to-rose-600"
          shadow="shadow-pink-500/20"
          icon={<WalletIcon />}
        />
      </div>

      {/* Estimated Monthly Income hero */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-pink-500 p-6 text-white shadow-xl shadow-violet-500/25 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/75">
              Estimated Monthly Income
            </p>
            <p className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
              {formatCurrency(totalIncome.monthlyNet)}
            </p>
            <p className="mt-1 text-sm text-white/85">
              Your take-home after Preply&apos;s {commissionPct}% cut · based
              on each student&apos;s fee × lessons/week.
            </p>
          </div>
          <div className="hidden rounded-2xl bg-white/15 p-3 ring-1 ring-inset ring-white/25 backdrop-blur sm:block">
            <DollarIcon />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <BreakdownStat
            label="Gross"
            value={formatCurrencyPrecise(totalIncome.monthlyGross)}
          />
          <BreakdownStat
            label={`Preply cut (${commissionPct}%)`}
            value={`- ${formatCurrencyPrecise(totalIncome.commission)}`}
          />
          <BreakdownStat
            label={`Your take-home (${takeHomePct}%)`}
            value={formatCurrencyPrecise(totalIncome.monthlyNet)}
            highlight
          />
        </div>

        {students.length > 0 && (
          <div className="mt-6 overflow-x-auto rounded-2xl bg-white/10 ring-1 ring-inset ring-white/20 backdrop-blur">
            <table className="w-full text-sm text-white">
              <thead>
                <tr className="border-b border-white/20 text-left text-xs font-semibold uppercase tracking-wide text-white/70">
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Rate</th>
                  <th className="px-4 py-3">Lessons / wk</th>
                  <th className="px-4 py-3 text-right">Gross / mo</th>
                  <th className="px-4 py-3 text-right">Preply cut</th>
                  <th className="px-4 py-3 text-right">Take-home / mo</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const inc = calculateStudentIncome(
                    s.hourly_fee,
                    s.lessons_per_week,
                  );
                  return (
                    <tr
                      key={s.id}
                      className="border-b border-white/10 last:border-0"
                    >
                      <td className="px-4 py-2.5">
                        <Link
                          href={`/students/${s.id}`}
                          className="font-medium text-white hover:underline"
                        >
                          {s.name}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 tabular-nums text-white/85">
                        {formatHourlyFee(s.hourly_fee)}
                      </td>
                      <td className="px-4 py-2.5 tabular-nums text-white/85">
                        {s.lessons_per_week}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-white/85">
                        {formatCurrencyPrecise(inc.monthlyGross)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-white/70">
                        - {formatCurrencyPrecise(inc.commission)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-white">
                        {formatCurrencyPrecise(inc.monthlyNet)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Preply Review Tracker */}
      <section className="overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-sm backdrop-blur">
        <div className="border-b border-slate-100 bg-gradient-to-r from-amber-50 via-orange-50 to-white px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm">
              <ChatIcon />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Preply Review Tracker
              </h2>
              <p className="text-xs text-slate-500">
                Keep your follow-ups moving from request to review.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-3 gap-3">
            {REVIEW_STATUSES.map((status) => (
              <div
                key={status}
                className={`rounded-xl p-4 text-center ring-1 ring-inset ${REVIEW_TILE_GRADIENT[status]}`}
              >
                <div className="text-3xl font-bold tabular-nums">
                  {reviewCounts[status]}
                </div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-wide">
                  {status}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5">
            {followUps.length === 0 ? (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                All caught up — every student has been reviewed.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {followUps.map((student) => {
                  const next = NEXT_STATUS[student.review_status];
                  return (
                    <li
                      key={student.id}
                      className="flex flex-wrap items-center justify-between gap-3 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/students/${student.id}`}
                          className="text-sm font-medium text-slate-900 hover:text-violet-600"
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
                            className="text-sm text-violet-600 hover:underline"
                          >
                            Preply link
                          </a>
                        )}
                        {next && (
                          <form action={updateReviewStatus}>
                            <input
                              type="hidden"
                              name="id"
                              value={student.id}
                            />
                            <input type="hidden" name="status" value={next} />
                            <button type="submit" className="btn-primary-sm">
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
        </div>
      </section>

      {/* Master Roster */}
      <section className="overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-sm backdrop-blur">
        <div className="border-b border-slate-100 bg-gradient-to-r from-sky-50 via-indigo-50 to-white px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-sm">
              <UsersIcon />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Master Roster
              </h2>
              <p className="text-xs text-slate-500">
                Every student you&apos;re currently working with.
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto p-6 pt-4">
          {students.length === 0 ? (
            <p className="text-sm text-slate-500">
              No students yet.{" "}
              <Link
                href="/students/new"
                className="text-violet-600 hover:underline"
              >
                Add your first student
              </Link>
              .
            </p>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-4 font-medium">Name</th>
                  <th className="py-2 pr-4 font-medium">Grade / Year</th>
                  <th className="py-2 pr-4 font-medium">Curriculum</th>
                  <th className="py-2 pr-4 font-medium">Lessons / wk</th>
                  <th className="py-2 pr-4 font-medium">Rate</th>
                  <th className="py-2 pr-4 font-medium">Review</th>
                  <th className="py-2 pr-4 font-medium">Preply</th>
                  <th className="py-2 pr-2 text-right font-medium">
                    Take-home / mo
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const inc = calculateStudentIncome(
                    student.hourly_fee,
                    student.lessons_per_week,
                  );
                  return (
                    <tr
                      key={student.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="py-2.5 pr-4">
                        <Link
                          href={`/students/${student.id}`}
                          className="font-medium text-slate-900 hover:text-violet-600"
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
                      <td className="py-2.5 pr-4">
                        <ReviewStatusBadge status={student.review_status} />
                      </td>
                      <td className="py-2.5 pr-4">
                        {student.preply_link ? (
                          <a
                            href={student.preply_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-violet-600 hover:underline"
                          >
                            Link
                          </a>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-2.5 pr-2 text-right tabular-nums font-semibold text-emerald-700">
                        {formatCurrencyPrecise(inc.monthlyNet)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

/* ---------- helpers ---------- */

function KpiTile({
  label,
  value,
  gradient,
  shadow,
  icon,
}: {
  label: string;
  value: string;
  gradient: string;
  shadow: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-4 text-white shadow-lg ${shadow}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wider text-white/80">
            {label}
          </div>
          <div className="mt-1 truncate text-2xl font-bold tabular-nums">
            {value}
          </div>
        </div>
        <div className="shrink-0 rounded-xl bg-white/20 p-2 text-white ring-1 ring-inset ring-white/25 backdrop-blur">
          {icon}
        </div>
      </div>
    </div>
  );
}

function BreakdownStat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-4 ring-1 ring-inset backdrop-blur ${
        highlight
          ? "bg-white/25 ring-white/40"
          : "bg-white/10 ring-white/20"
      }`}
    >
      <div className="text-xs font-semibold uppercase tracking-wide text-white/75">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold tabular-nums text-white">
        {value}
      </div>
    </div>
  );
}

/* ---------- inline icons ---------- */

function UsersIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.75}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.75}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 8.25h18M4.5 21h15a1.5 1.5 0 001.5-1.5V6.75a1.5 1.5 0 00-1.5-1.5h-15a1.5 1.5 0 00-1.5 1.5v12.75A1.5 1.5 0 004.5 21z"
      />
    </svg>
  );
}

function TrendIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.75}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 18L9 11.25l4.5 4.5L21.75 6M21.75 6H15.75M21.75 6V12"
      />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.75}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3"
      />
    </svg>
  );
}

function DollarIcon() {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.75}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v12m4-9.5c0-1.24-1.79-2.25-4-2.25s-4 1.01-4 2.25 1.79 2.25 4 2.25 4 1.01 4 2.25-1.79 2.25-4 2.25-4-1.01-4-2.25"
      />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.75}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 10h.01M12 10h.01M16 10h.01M21 12a8.96 8.96 0 01-3.28 6.9L16 22l-1.79-2.36A9 9 0 1121 12z"
      />
    </svg>
  );
}
