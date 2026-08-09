"use client";

import Link from "next/link";
import { useState } from "react";
import { ReviewStatusBadge } from "@/components/Badges";
import { updateReviewStatus } from "@/app/(app)/students/actions";
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

type TabId = "review" | "income" | "roster";

const TABS: {
  id: TabId;
  label: string;
  hint: string;
  icon: React.ReactNode;
  activeBg: string;
  inactiveIcon: string;
}[] = [
  {
    id: "review",
    label: "Preply Review Tracker",
    hint: "Follow-ups",
    icon: <ChatIcon />,
    activeBg: "bg-amber-500",
    inactiveIcon: "bg-amber-50 text-amber-600",
  },
  {
    id: "income",
    label: "Estimated Monthly Income",
    hint: "Earnings",
    icon: <DollarIcon />,
    activeBg: "bg-emerald-600",
    inactiveIcon: "bg-emerald-50 text-emerald-600",
  },
  {
    id: "roster",
    label: "Master Roster",
    hint: "All students",
    icon: <UsersIcon />,
    activeBg: "bg-indigo-600",
    inactiveIcon: "bg-indigo-50 text-indigo-600",
  },
];

export default function DashboardTabs({ students }: { students: Student[] }) {
  const [tab, setTab] = useState<TabId | null>(null);

  return (
    <div>
      {/* Icon-based tab strip */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-pressed={active}
              className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                active
                  ? "border-slate-900 bg-white shadow-sm ring-1 ring-slate-900"
                  : "border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white"
              }`}
            >
              <span
                className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                  active ? `${t.activeBg} text-white shadow-sm` : t.inactiveIcon
                }`}
              >
                {t.icon}
              </span>
              <span className="min-w-0">
                <span
                  className={`block truncate text-sm font-semibold ${
                    active ? "text-slate-900" : "text-slate-700"
                  }`}
                >
                  {t.label}
                </span>
                <span className="text-xs text-slate-500">{t.hint}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected panel — nothing renders until a tab is clicked */}
      <div className="mt-8">
        {tab === null && <EmptyState />}
        {tab === "review" && <ReviewPanel students={students} />}
        {tab === "income" && <IncomePanel students={students} />}
        {tab === "roster" && <RosterPanel students={students} />}
      </div>
    </div>
  );
}

/* ---------- Empty state ---------- */

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
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
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5a2 2 0 002 2h2a2 2 0 002-2"
          />
        </svg>
      </div>
      <p className="mt-4 text-sm font-medium text-slate-700">
        Pick a section above to view its details.
      </p>
      <p className="mt-1 text-xs text-slate-500">
        Nothing renders until you choose a tab.
      </p>
    </div>
  );
}

/* ---------- Review Tracker panel ---------- */

const NEXT_STATUS: Record<ReviewStatus, ReviewStatus | null> = {
  "Not Asked": "Asked",
  Asked: "Reviewed",
  Reviewed: null,
};

const REVIEW_TILE: Record<ReviewStatus, string> = {
  "Not Asked":
    "border-slate-200 bg-slate-50 text-slate-700",
  Asked: "border-amber-200 bg-amber-50 text-amber-800",
  Reviewed: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

function ReviewPanel({ students }: { students: Student[] }) {
  const reviewCounts: Record<ReviewStatus, number> = {
    "Not Asked": 0,
    Asked: 0,
    Reviewed: 0,
  };
  for (const s of students) reviewCounts[s.review_status] += 1;
  const followUps = students.filter((s) => s.review_status !== "Reviewed");

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
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

      <div className="p-6">
        <div className="grid grid-cols-3 gap-3">
          {REVIEW_STATUSES.map((status) => (
            <div
              key={status}
              className={`rounded-xl border p-4 text-center ${REVIEW_TILE[status]}`}
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
                          <button type="submit" className="btn-amber-sm">
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
  );
}

/* ---------- Estimated Monthly Income panel (emerald — distinct) ---------- */

function IncomePanel({ students }: { students: Student[] }) {
  const totalIncome = calculateTotalIncome(students);
  const commissionPct = Math.round(PREPLY_COMMISSION_RATE * 100);
  const takeHomePct = 100 - commissionPct;

  return (
    <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50/60 shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-emerald-100 px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <DollarIcon />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Estimated Monthly Income
            </p>
            <p className="mt-0.5 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
              {formatCurrency(totalIncome.monthlyNet)}
            </p>
            <p className="mt-1 text-xs text-emerald-800/80">
              Your take-home after Preply&apos;s {commissionPct}% cut · based
              on each student&apos;s fee × lessons/week.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <IncomeStat
            label="Gross"
            value={formatCurrencyPrecise(totalIncome.monthlyGross)}
          />
          <IncomeStat
            label={`Preply cut (${commissionPct}%)`}
            value={`- ${formatCurrencyPrecise(totalIncome.commission)}`}
          />
          <IncomeStat
            label={`Your take-home (${takeHomePct}%)`}
            value={formatCurrencyPrecise(totalIncome.monthlyNet)}
            highlight
          />
        </div>

        {students.length > 0 && (
          <div className="mt-6 overflow-x-auto rounded-xl border border-emerald-100 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-emerald-100 text-left text-xs font-semibold uppercase tracking-wide text-emerald-700">
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
                      className="border-b border-emerald-50 last:border-0"
                    >
                      <td className="px-4 py-2.5">
                        <Link
                          href={`/students/${s.id}`}
                          className="font-medium text-slate-900 hover:text-emerald-700"
                        >
                          {s.name}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 tabular-nums text-slate-600">
                        {formatHourlyFee(s.hourly_fee)}
                      </td>
                      <td className="px-4 py-2.5 tabular-nums text-slate-600">
                        {s.lessons_per_week}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-slate-700">
                        {formatCurrencyPrecise(inc.monthlyGross)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-slate-500">
                        - {formatCurrencyPrecise(inc.commission)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-emerald-700">
                        {formatCurrencyPrecise(inc.monthlyNet)}
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
  );
}

function IncomeStat({
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
      className={
        highlight
          ? "rounded-xl bg-emerald-600 p-4 text-white shadow-sm"
          : "rounded-xl border border-emerald-100 bg-white p-4"
      }
    >
      <div
        className={`text-xs font-semibold uppercase tracking-wide ${
          highlight ? "text-emerald-50" : "text-emerald-700"
        }`}
      >
        {label}
      </div>
      <div
        className={`mt-1 text-2xl font-bold tabular-nums ${
          highlight ? "text-white" : "text-slate-900"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

/* ---------- Master Roster panel ---------- */

function RosterPanel({ students }: { students: Student[] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
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
                    <td className="py-2.5 pr-4">
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
  );
}

/* ---------- Inline icons ---------- */

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

function DollarIcon() {
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
