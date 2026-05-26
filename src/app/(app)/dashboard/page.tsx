import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { updateReviewStatus } from "@/app/(app)/students/actions";
import { ReviewStatusBadge } from "@/components/Badges";
import { getWeekStartMonday, formatHourlyFee } from "@/lib/date";
import {
  REVIEW_STATUSES,
  type ReviewStatus,
  type SessionLog,
  type Student,
} from "@/lib/types";

const NEXT_STATUS: Record<ReviewStatus, ReviewStatus | null> = {
  "Not Asked": "Asked",
  Asked: "Reviewed",
  Reviewed: null,
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const weekStart = getWeekStartMonday();

  const [{ data: studentsData }, { data: weekLogsData }] = await Promise.all([
    supabase.from("students").select("*").order("name", { ascending: true }),
    supabase
      .from("session_logs")
      .select("student_id")
      .gte("session_date", weekStart),
  ]);

  const students = (studentsData ?? []) as Student[];
  const weekLogs = (weekLogsData ?? []) as Pick<SessionLog, "student_id">[];

  // Sessions logged this week, per student.
  const loggedThisWeek = new Map<string, number>();
  for (const log of weekLogs) {
    loggedThisWeek.set(
      log.student_id,
      (loggedThisWeek.get(log.student_id) ?? 0) + 1,
    );
  }

  // Review-status counts.
  const reviewCounts: Record<ReviewStatus, number> = {
    "Not Asked": 0,
    Asked: 0,
    Reviewed: 0,
  };
  for (const s of students) reviewCounts[s.review_status] += 1;

  const followUps = students.filter((s) => s.review_status !== "Reviewed");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Follow-ups, weekly lessons, and your full roster at a glance.
        </p>
      </div>

      {/* Widget 1 — Preply Review Tracker */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Preply Review Tracker
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Keep your follow-ups moving from request to review.
        </p>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {REVIEW_STATUSES.map((status) => (
            <div
              key={status}
              className="rounded-lg border border-slate-200 p-3 text-center"
            >
              <div className="text-2xl font-semibold text-slate-900">
                {reviewCounts[status]}
              </div>
              <div className="mt-1 text-xs text-slate-500">{status}</div>
            </div>
          ))}
        </div>

        <div className="mt-5">
          {followUps.length === 0 ? (
            <p className="text-sm text-slate-500">
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
                            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
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

      {/* Widget 2 — Lessons Per Week tracker */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Lessons Per Week
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Sessions logged this week vs. each student&apos;s plan (week of{" "}
          {weekStart}).
        </p>

        <div className="mt-5 space-y-4">
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
                        complete ? "bg-emerald-500" : "bg-indigo-500"
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

      {/* Widget 3 — Master Roster Table */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Master Roster</h2>
        <p className="mt-1 text-sm text-slate-500">
          Every student you&apos;re currently working with.
        </p>

        <div className="mt-4 overflow-x-auto">
          {students.length === 0 ? (
            <p className="text-sm text-slate-500">
              No students yet.{" "}
              <Link href="/students/new" className="text-indigo-600 hover:underline">
                Add your first student
              </Link>
              .
            </p>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
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
