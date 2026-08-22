import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";
import { RestoreStudentButton } from "@/components/RestoreStudentButton";
import type { Student } from "@/lib/types";

export default async function DeletedStudentsPage() {
  const supabase = await createClient();

  // Fetch every student for this tutor (RLS-scoped), then filter to
  // soft-deleted ones in plain JS — a boolean check on the actual value
  // returned, with no dependence on how a query-string filter translates.
  const { data } = await supabase
    .from("students")
    .select("*")
    .order("deleted_at", { ascending: false });

  const deletedStudents = ((data ?? []) as Student[]).filter(
    (s) => s.deleted_at !== null,
  );

  return (
    <div className="space-y-8">
      <div>
        <PageHeader
          title="Recently Deleted"
          description="Soft-deleted students only. Restoring brings back everything exactly as it was — nothing is regenerated or approximated."
          backHref="/students"
          backLabel="Students"
        />
        <Link
          href="/dashboard"
          className="mt-1 inline-block text-xs text-slate-400 hover:text-slate-600"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {deletedStudents.length === 0 ? (
          <p className="rounded-lg bg-slate-50 px-3 py-6 text-center text-sm text-slate-500">
            No deleted students right now.{" "}
            <Link
              href="/students"
              className="font-medium text-indigo-600 hover:underline"
            >
              Back to the roster
            </Link>
            .
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
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
                <RestoreStudentButton studentId={student.id} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
