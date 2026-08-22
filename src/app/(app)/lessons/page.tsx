import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";
import type { Student } from "@/lib/types";

export default async function LessonsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("students")
    .select("id, name, curriculum, lessons_per_week")
    .is("deleted_at", null)
    .order("lessons_per_week", { ascending: false })
    .order("name", { ascending: true });

  const students = (data ?? []) as Pick<
    Student,
    "id" | "name" | "curriculum" | "lessons_per_week"
  >[];

  const total = students.reduce((sum, s) => sum + (s.lessons_per_week || 0), 0);
  const maxLessons = Math.max(1, ...students.map((s) => s.lessons_per_week || 0));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Weekly Lessons"
        description="How many lessons per week each student is booked for."
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold tabular-nums text-violet-700">
            {total}
          </span>
          <span className="pb-1 text-sm text-slate-500">
            lesson{total === 1 ? "" : "s"} / week across your roster
          </span>
        </div>

        <div className="mt-6">
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
            <ul className="divide-y divide-slate-100">
              {students.map((student) => {
                const pct = Math.round(
                  ((student.lessons_per_week || 0) / maxLessons) * 100,
                );
                return (
                  <li key={student.id} className="py-3">
                    <div className="flex items-center justify-between text-sm">
                      <Link
                        href={`/students/${student.id}`}
                        className="font-medium text-slate-900 hover:text-indigo-600"
                      >
                        {student.name}
                      </Link>
                      <span className="tabular-nums text-slate-600">
                        {student.lessons_per_week} / wk
                      </span>
                    </div>
                    {student.curriculum && (
                      <div className="text-xs text-slate-400">
                        {student.curriculum}
                      </div>
                    )}
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-violet-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
