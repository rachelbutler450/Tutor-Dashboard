import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StudentForm from "@/components/StudentForm";
import SessionLogger from "@/components/SessionLogger";
import { PerformanceBadge, ReviewStatusBadge } from "@/components/Badges";
import {
  updateStudent,
  deleteStudent,
  deleteSessionLog,
} from "@/app/(app)/students/actions";
import { formatDate, formatHourlyFee } from "@/lib/date";
import type { SessionLog, Student } from "@/lib/types";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: studentData }, { data: sessionsData }] = await Promise.all([
    supabase.from("students").select("*").eq("id", id).maybeSingle<Student>(),
    supabase
      .from("session_logs")
      .select("*")
      .eq("student_id", id)
      .order("session_date", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  if (!studentData) {
    notFound();
  }

  const student = studentData;
  const sessions = (sessionsData ?? []) as SessionLog[];
  const initial = student.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="space-y-6">
      {/* Colorful header */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-lg">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold ring-1 ring-inset ring-white/25 backdrop-blur">
              {initial}
            </div>
            <div>
              <Link
                href="/dashboard"
                className="text-xs text-white/70 hover:text-white"
              >
                ← Back to dashboard
              </Link>
              <h1 className="mt-1 text-2xl font-semibold">{student.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/80">
                {student.grade_year && <span>{student.grade_year}</span>}
                {student.grade_year && student.curriculum && <span>·</span>}
                {student.curriculum && <span>{student.curriculum}</span>}
              </div>
            </div>
          </div>
          <form action={deleteStudent}>
            <input type="hidden" name="id" value={student.id} />
            <button
              type="submit"
              className="rounded-lg bg-white/15 px-3 py-1.5 text-sm font-medium text-white ring-1 ring-inset ring-white/25 backdrop-blur transition hover:bg-red-500/80 hover:ring-red-300"
            >
              Delete student
            </button>
          </form>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <HeaderStat label="Rate" value={formatHourlyFee(student.hourly_fee)} />
          <HeaderStat
            label="Lessons / wk"
            value={String(student.lessons_per_week)}
          />
          <HeaderStat label="Sessions" value={String(sessions.length)} />
          <div className="rounded-xl bg-white/15 p-3 ring-1 ring-inset ring-white/20 backdrop-blur">
            <div className="text-xs text-white/70">Review</div>
            <div className="mt-1.5">
              <ReviewStatusBadge status={student.review_status} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Editable details */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-gradient-to-r from-violet-50 to-white px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Student details
            </h2>
            <p className="text-xs text-slate-500">
              Update contact info, plan, and Preply link.
            </p>
          </div>
          <div className="p-6">
            <StudentForm
              action={updateStudent}
              student={student}
              submitLabel="Save changes"
            />
          </div>
        </section>

        {/* Session logger */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Log a session
            </h2>
            <p className="text-xs text-slate-500">
              Record what you covered today and how it went.
            </p>
          </div>
          <div className="p-6">
            <SessionLogger studentId={student.id} />
          </div>
        </section>
      </div>

      {/* Session history */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-r from-sky-50 to-white px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Session history
          </h2>
          <p className="text-xs text-slate-500">
            Most recent sessions first.
          </p>
        </div>
        <div className="p-6">
          {sessions.length === 0 ? (
            <p className="text-sm text-slate-500">No sessions logged yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {sessions.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-wrap items-start justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-slate-900">
                        {s.topic_name}
                      </span>
                      <PerformanceBadge performance={s.performance} />
                      <span className="text-xs text-slate-400">
                        {formatDate(s.session_date)}
                      </span>
                    </div>
                    {s.tutor_notes && (
                      <p className="mt-1 text-sm text-slate-600">
                        {s.tutor_notes}
                      </p>
                    )}
                  </div>
                  <form action={deleteSessionLog}>
                    <input type="hidden" name="id" value={s.id} />
                    <input
                      type="hidden"
                      name="student_id"
                      value={student.id}
                    />
                    <button
                      type="submit"
                      className="text-xs font-medium text-red-600 transition hover:underline"
                    >
                      Delete
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function HeaderStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/15 p-3 ring-1 ring-inset ring-white/20 backdrop-blur">
      <div className="text-xs text-white/70">{label}</div>
      <div className="mt-1 text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}
