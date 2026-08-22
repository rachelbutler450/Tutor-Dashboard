import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";
import { ReviewStatusBadge } from "@/components/Badges";
import { formatHourlyFee, formatCurrencyPrecise } from "@/lib/format";
import { calculateStudentIncome } from "@/lib/income";
import type { Student } from "@/lib/types";

export default async function StudentsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("students")
    .select("*")
    .is("deleted_at", null)
    .order("name", { ascending: true });

  const students = (data ?? []) as Student[];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Master Roster"
        description="Every student you're currently working with."
        action={
          <div className="flex items-center gap-2">
            <Link
              href="/students/deleted"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              View recently deleted
            </Link>
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
    </div>
  );
}
