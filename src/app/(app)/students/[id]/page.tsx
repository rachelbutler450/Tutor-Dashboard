import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StudentForm from "@/components/StudentForm";
import SessionLogger from "@/components/SessionLogger";
import ParentReport from "@/components/ParentReport";
import { PerformanceBadge } from "@/components/Badges";
import {
  updateStudent,
  deleteStudent,
  deleteSessionLog,
} from "@/app/(app)/students/actions";
import { formatDate } from "@/lib/date";
import type { Profile, SessionLog, Student } from "@/lib/types";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: studentData }, { data: sessionsData }, { data: profile }] =
    await Promise.all([
      supabase.from("students").select("*").eq("id", id).maybeSingle<Student>(),
      supabase
        .from("session_logs")
        .select("*")
        .eq("student_id", id)
        .order("session_date", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id ?? "")
        .maybeSingle<Profile>(),
    ]);

  if (!studentData) {
    notFound();
  }

  const student = studentData;
  const sessions = (sessionsData ?? []) as SessionLog[];
  const tutorName =
    profile?.full_name || profile?.email || user?.email || "Your tutor";

  return (
    <div className="space-y-8">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            ← Back to dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            {student.name}
          </h1>
        </div>
        <form action={deleteStudent}>
          <input type="hidden" name="id" value={student.id} />
          <button
            type="submit"
            className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            Delete student
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Editable details */}
        <section className="no-print rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Student details
          </h2>
          <StudentForm
            action={updateStudent}
            student={student}
            submitLabel="Save changes"
          />
        </section>

        {/* Session logger */}
        <section className="no-print rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Log a session
          </h2>
          <SessionLogger studentId={student.id} />
        </section>
      </div>

      {/* Session history */}
      <section className="no-print rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Session history
        </h2>
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
                    <p className="mt-1 text-sm text-slate-600">{s.tutor_notes}</p>
                  )}
                </div>
                <form action={deleteSessionLog}>
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="student_id" value={student.id} />
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
      </section>

      {/* Parent report generator */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="no-print mb-4 text-lg font-semibold text-slate-900">
          Parent Report Generator
        </h2>
        <ParentReport
          student={student}
          sessions={sessions}
          tutorName={tutorName}
        />
      </section>
    </div>
  );
}
