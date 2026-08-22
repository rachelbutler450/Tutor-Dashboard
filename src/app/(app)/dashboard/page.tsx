import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/format";
import { calculateTotalIncome, PREPLY_COMMISSION_RATE } from "@/lib/income";
import type { Profile, ReviewStatus, Student } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: activeData }, { data: profile }] = await Promise.all([
    supabase
      .from("students")
      .select("id, lessons_per_week, hourly_fee, review_status")
      .is("deleted_at", null),
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user?.id ?? "")
      .maybeSingle<Profile>(),
  ]);

  const students = (activeData ?? []) as Pick<
    Student,
    "id" | "lessons_per_week" | "hourly_fee" | "review_status"
  >[];

  const totalLessonsPerWeek = students.reduce(
    (sum, s) => sum + (s.lessons_per_week || 0),
    0,
  );
  const income = calculateTotalIncome(students);
  const commissionPct = Math.round(PREPLY_COMMISSION_RATE * 100);

  const reviewCounts: Record<ReviewStatus, number> = {
    "Not Asked": 0,
    Asked: 0,
    Reviewed: 0,
  };
  for (const s of students) reviewCounts[s.review_status] += 1;
  const pendingReviews = reviewCounts["Not Asked"] + reviewCounts.Asked;

  const firstName = (profile?.full_name || "").trim().split(/\s+/)[0];
  const greeting = firstName ? `Welcome back, ${firstName}` : "Welcome back";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{greeting}</h1>
        <p className="mt-1 text-sm text-slate-500">
          A quick snapshot of your tutoring business. Tap a card to see the
          full details.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <KpiCard
          href="/students"
          label="Active Students"
          value={String(students.length)}
          tone="text-sky-700"
          chip="bg-sky-50"
          icon={
            <path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          }
        />
        <KpiCard
          href="/lessons"
          label="Weekly Lessons"
          value={String(totalLessonsPerWeek)}
          sub="across your roster"
          tone="text-violet-700"
          chip="bg-violet-50"
          icon={
            <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          }
        />
        <KpiCard
          href="/income"
          label="Est. Monthly Gross"
          value={formatCurrency(income.monthlyGross)}
          sub="before Preply commission"
          tone="text-emerald-700"
          chip="bg-emerald-50"
          icon={
            <path d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
          }
        />
        <KpiCard
          href="/income"
          label="Your Take-Home"
          value={formatCurrency(income.monthlyNet)}
          sub={`after ${commissionPct}% commission`}
          tone="text-rose-700"
          chip="bg-rose-50"
          icon={
            <path d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
          }
        />
      </div>

      <Link
        href="/reviews"
        className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
      >
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-amber-50 p-2.5 text-amber-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.6}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Preply Review Tracker
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {pendingReviews === 0
                ? "All caught up — every student has been reviewed."
                : `${pendingReviews} follow-up${pendingReviews === 1 ? "" : "s"} pending`}
            </p>
          </div>
        </div>
        <span className="flex items-center gap-1 text-sm font-medium text-indigo-600 transition group-hover:gap-2">
          View tracker
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3"
            />
          </svg>
        </span>
      </Link>
    </div>
  );
}

function KpiCard({
  href,
  label,
  value,
  sub,
  tone,
  chip,
  icon,
}: {
  href: string;
  label: string;
  value: string;
  sub?: string;
  tone: string;
  chip: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </div>
          <div className={`mt-2 text-3xl font-bold tabular-nums ${tone}`}>
            {value}
          </div>
          {sub && <div className="mt-1 text-xs text-slate-400">{sub}</div>}
        </div>
        <div className={`rounded-lg p-2 ${chip} ${tone}`}>
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
    </Link>
  );
}
