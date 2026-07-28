import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { updateReviewStatus } from "@/app/(app)/students/actions";
import { ReviewStatusBadge } from "@/components/Badges";
import {
  getWeekStartMonday,
  getMonthStart,
  formatHourlyFee,
  formatMoney,
  formatMoneyPrecise,
} from "@/lib/date";
import {
  REVIEW_STATUSES,
  type ReviewStatus,
  type SessionLog,
  type Student,
} from "@/lib/types";

const WEEKS_PER_MONTH = 4.33;

const NEXT_STATUS: Record<ReviewStatus, ReviewStatus | null> = {
  "Not Asked": "Asked",
  Asked: "Reviewed",
  Reviewed: null,
};

const REVIEW_TILE: Record<ReviewStatus, string> = {
  "Not Asked": "border-slate-200 bg-slate-50 text-slate-700",
  Asked: "border-amber-200 bg-amber-50 text-amber-700",
  Reviewed: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const weekStart = getWeekStartMonday();
  const monthStart = getMonthStart();

  const [
    { data: studentsData },
    { data: weekLogsData },
    { data: monthLogsData },
  ] = await Promise.all([
    supabase.from("students").select("*").order("name", { ascending: true }),
    supabase
      .from("session_logs")
      .select("student_id")
      .gte("session_date", weekStart),
    supabase
      .from("session_logs")
      .select("student_id")
      .gte("session_date", monthStart),
  ]);

  const students = (studentsData ?? []) as Student[];
  const weekLogs = (weekLogsData ?? []) as Pick<SessionLog, "student_id">[];
  const monthLogs = (monthLogsData ?? []) as Pick<SessionLog, "student_id">[];

  const loggedThisWeek = new Map<string, number>();
  for (const log of weekLogs) {
    loggedThisWeek.set(
      log.student_id,
      (loggedThisWeek.get(log.student_id) ?? 0) + 1,
    );
  }

  const loggedThisMonth = new Map<string, number>();
  for (const log of monthLogs) {
    loggedThisMonth.set(
      log.student_id,
      (loggedThisMonth.get(log.student_id) ?? 0) + 1,
    );
  }

  const reviewCounts: Record<ReviewStatus, number> = {
    "Not Asked": 0,
    Asked: 0,
    Reviewed: 0,
  };
  for (const s of students) reviewCounts[s.review_status] += 1;
  const followUps = students.filter((s) => s.review_status !== "Reviewed");

  // Revenue — projected assumes each student's planned lessons happen every
  // week (≈ 4.33 weeks per month). Logged uses this month's real sessions.
  const revenueRows = students.map((s) => {
    const fee = s.hourly_fee ?? 0;
    const monthCount = loggedThisMonth.get(s.id) ?? 0;
    return {
      student: s,
      fee,
      projected: fee * s.lessons_per_week * WEEKS_PER_MONTH,
      logged: fee * monthCount,
      monthCount,
    };
  });
  const totalProjected = revenueRows.reduce((a, r) => a + r.projected, 0);
  const totalLogged = revenueRows.reduce((a, r) => a + r.logged, 0);
  const monthLabel = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/70">
              Dashboard · {monthLabel}
            </p>
            <h1 className="mt-1 text-3xl font-semibold">Welcome back</h1>
            <p className="mt-1 text-sm text-white/80">
              Follow-ups, weekly lessons, revenue, and your roster — all in one
              view.
            </p>
          </div>
          <Link
            href="/students/new"
            className="rounded-lg bg-white/15 px-4 py-2 text-sm font-medium text-white ring-1 ring-inset ring-white/25 backdrop-blur transition hover:bg-white/25"
          >
            + Add student
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <HeroStat label="Students" value={students.length.toString()} />
          <HeroStat label="This week" value={`${weekLogs.length} sessions`} />
          <HeroStat label="This month" value={`${monthLogs.length} sessions`} />
          <HeroStat
            label="Projected / mo"
            value={formatMoney(totalProjected)}
          />
        </div>
      </section>

      {/* Widget 1 — Preply Review Tracker */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <WidgetHeader
          gradient="from-amber-50"
          iconBg="bg-amber-500/10"
          iconColor="text-amber-600"
          title="Preply Review Tracker"
          subtitle="Keep your follow-ups moving from request to review."
          icon={<ChatIcon />}
        />
        <div className="p-6">
          <div className="grid grid-cols-3 gap-3">
            {REVIEW_STATUSES.map((status) => (
              <div
                key={status}
                className={`rounded-xl border p-4 text-center ${REVIEW_TILE[status]}`}
              >
                <div className="text-3xl font-semibold">
                  {reviewCounts[status]}
                </div>
                <div className="mt-1 text-xs font-medium">{status}</div>
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
                            className="text-sm text-indigo-600 hover:underline"
                          >
                            Preply link
                          </a>
                        )}
                        {next && (
                          <form action={updateReviewStatus}>
                            <input type="hidden" name="id" value={student.id} />
                            <input type="hidden" name="status" value={next} />
                            <button
                              type="submit"
                              className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-600"
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
        </div>
      </section>

      {/* Widget 2 — Lessons Per Week */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <WidgetHeader
          gradient="from-indigo-50"
          iconBg="bg-indigo-500/10"
          iconColor="text-indigo-600"
          title="Lessons Per Week"
          subtitle={`Sessions logged vs. plan · week of ${weekStart}`}
          icon={<CalendarIcon />}
        />
        <div className="space-y-4 p-6">
          {students.length === 0 ? (
            <p className="text-sm text-slate-500">No students yet.</p>
          ) : (
            students.map((student) => {
              const logged = loggedThisWeek.get(student.id) ?? 0;
              const planned = student.lessons_per_week;
              const pct =
                planned > 0
                  ? Math.min(100, Math.round((logged / planned) * 100))
                  : logged > 0
                    ? 100
                    : 0;
              const complete = planned > 0 && logged >= planned;
              return (
                <div key={student.id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <Link
                      href={`/students/${student.id}`}
                      className="font-medium text-slate-900 hover:text-indigo-600"
                    >
                      {student.name}
                    </Link>
                    <span className="tabular-nums text-slate-500">
                      {logged} / {planned} logged
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${
                        complete
                          ? "bg-gradient-to-r from-emerald-400 to-teal-500"
                          : "bg-gradient-to-r from-indigo-400 to-violet-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Widget 3 — Monthly Revenue */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <WidgetHeader
          gradient="from-emerald-50"
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-600"
          title="Monthly Revenue"
          subtitle={`Projected from each student's fee × lessons/week · ${monthLabel}`}
          icon={<DollarIcon />}
        />
        <div className="p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <RevenueStat
              label="Projected / month"
              value={formatMoney(totalProjected)}
              tone="emerald"
            />
            <RevenueStat
              label="Logged this month"
              value={formatMoney(totalLogged)}
              tone="indigo"
            />
            <RevenueStat
              label="Sessions this month"
              value={monthLogs.length.toString()}
              tone="sky"
            />
          </div>

          {students.length > 0 && (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-2 pr-4 font-medium">Student</th>
                    <th className="py-2 pr-4 font-medium">Rate</th>
                    <th className="py-2 pr-4 font-medium">Lessons / wk</th>
                    <th className="py-2 pr-4 font-medium">Sessions this mo</th>
                    <th className="py-2 pr-4 font-medium">Projected / mo</th>
                    <th className="py-2 font-medium">Logged this mo</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueRows.map((row) => (
                    <tr
                      key={row.student.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="py-2.5 pr-4">
                        <Link
                          href={`/students/${row.student.id}`}
                          className="font-medium text-slate-900 hover:text-indigo-600"
                        >
                          {row.student.name}
                        </Link>
                      </td>
                      <td className="py-2.5 pr-4 tabular-nums text-slate-600">
                        {formatHourlyFee(row.student.hourly_fee)}
                      </td>
                      <td className="py-2.5 pr-4 tabular-nums text-slate-600">
                        {row.student.lessons_per_week}
                      </td>
                      <td className="py-2.5 pr-4 tabular-nums text-slate-600">
                        {row.monthCount}
                      </td>
                      <td className="py-2.5 pr-4 tabular-nums font-semibold text-emerald-700">
                        {formatMoneyPrecise(row.projected)}
                      </td>
                      <td className="py-2.5 tabular-nums font-semibold text-indigo-700">
                        {formatMoneyPrecise(row.logged)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200">
                    <td
                      colSpan={4}
                      className="py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >
                      Total
                    </td>
                    <td className="py-2.5 pr-4 tabular-nums font-bold text-emerald-700">
                      {formatMoneyPrecise(totalProjected)}
                    </td>
                    <td className="py-2.5 tabular-nums font-bold text-indigo-700">
                      {formatMoneyPrecise(totalLogged)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          <p className="mt-4 text-xs text-slate-400">
            Projected uses ≈ 4.33 weeks per month. Logged is actual sessions ×
            hourly fee.
          </p>
        </div>
      </section>

      {/* Widget 4 — Master Roster */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <WidgetHeader
          gradient="from-sky-50"
          iconBg="bg-sky-500/10"
          iconColor="text-sky-600"
          title="Master Roster"
          subtitle="Every student you're currently working with."
          icon={<UsersIcon />}
        />
        <div className="overflow-x-auto p-6 pt-4">
          {students.length === 0 ? (
            <p className="text-sm text-slate-500">
              No students yet.{" "}
              <Link
                href="/students/new"
                className="text-indigo-600 hover:underline"
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
                  <th className="py-2 font-medium">Preply</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b border-slate-100 last:border-0"
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
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

/* ---------- helpers ---------- */

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/15 p-3 ring-1 ring-inset ring-white/20 backdrop-blur">
      <div className="text-xs text-white/70">{label}</div>
      <div className="mt-1 text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}

const REVENUE_STAT_TONE = {
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
  indigo: "border-indigo-200 bg-indigo-50 text-indigo-800",
  sky: "border-sky-200 bg-sky-50 text-sky-800",
} as const;

function RevenueStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: keyof typeof REVENUE_STAT_TONE;
}) {
  return (
    <div className={`rounded-xl border p-4 ${REVENUE_STAT_TONE[tone]}`}>
      <div className="text-xs font-medium uppercase tracking-wide opacity-70">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function WidgetHeader({
  gradient,
  iconBg,
  iconColor,
  title,
  subtitle,
  icon,
}: {
  gradient: string;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className={`flex items-start gap-3 border-b border-slate-100 bg-gradient-to-r ${gradient} to-white px-6 py-4`}
    >
      <div className={`rounded-lg ${iconBg} p-2 ${iconColor}`}>{icon}</div>
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

/* ---------- inline icons ---------- */

function ChatIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.75}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 10h.01M12 10h.01M16 10h.01M21 12a8.96 8.96 0 01-3.28 6.9L16 22l-1.79-2.36A9 9 0 1121 12z"
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
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 8.25h18M4.5 21h15a1.5 1.5 0 001.5-1.5V6.75a1.5 1.5 0 00-1.5-1.5h-15a1.5 1.5 0 00-1.5 1.5v12.75A1.5 1.5 0 004.5 21z"
      />
    </svg>
  );
}

function DollarIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.75}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v12m4-9.5c0-1.24-1.79-2.25-4-2.25s-4 1.01-4 2.25 1.79 2.25 4 2.25 4 1.01 4 2.25-1.79 2.25-4 2.25-4-1.01-4-2.25"
      />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.75}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
      />
    </svg>
  );
}
