import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";
import { ReviewStatusBadge } from "@/components/Badges";
import { RestoreStudentButton } from "@/components/RestoreStudentButton";
import { formatHourlyFee, formatCurrencyPrecise } from "@/lib/format";
import { calculateStudentIncome } from "@/lib/income";
import type { Student } from "@/lib/types";

export default async function StudentsPage() {
  const supabase = await createClient();

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

  return (
    <div className="space-y-8">
      <PageHeader
        title="Master Roster"
        description="Every student you're currently working with."
        action={
          <div className="flex items-center gap-2">
            <a
              href="/students/export"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Export data
            </a>
            <Link
              href="/students/new"
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              + Add student
            </Link>
          </div>
        }
      />

      {deletedStudents.length > 0 && (
        <Link
          href="#recently-deleted"
          className="inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200 transition hover:bg-amber-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
            className="h-3.5 w-3.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
            />
          </svg>
          {deletedStudents.length} recently deleted — view &amp; restore
        </Link>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
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
                      className="border-b border-slate-100 last:border-0 transition hover:bg-slate-50"
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

      {deletedStudents.length > 0 && (
        <section
          id="recently-deleted"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Recently deleted
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Deleted students don&apos;t count toward your roster, weekly
                lessons, income, or the Preply tracker. Restoring brings back
                everything exactly as it was.
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
                <RestoreStudentButton studentId={student.id} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
