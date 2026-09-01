import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";
import { ReviewStatusBadge } from "@/components/Badges";
import { formatHourlyFee, formatCurrencyPrecise } from "@/lib/format";
import { calculateStudentIncome } from "@/lib/income";
import type { Student } from "@/lib/types";

// Stable string identity for an hourly fee, used both as the checkbox
// `value` and as the comparison key — sidesteps any float-formatting
// mismatch between what's submitted and what's stored.
function feeKey(fee: number): string {
  return fee.toFixed(2);
}

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ fee?: string | string[] }>;
}) {
  const { fee: rawFee } = await searchParams;
  const selectedFeeKeys = new Set(
    rawFee === undefined ? [] : Array.isArray(rawFee) ? rawFee : [rawFee],
  );
  const feeFilterActive = selectedFeeKeys.size > 0;

  const supabase = await createClient();

  const { data } = await supabase
    .from("students")
    .select("*")
    .is("deleted_at", null)
    .order("name", { ascending: true });

  const allStudents = (data ?? []) as Student[];

  // Distinct hourly fees that actually exist across this tutor's students
  // (not a hardcoded range), sorted ascending.
  const feeOptions = Array.from(
    new Set(
      allStudents
        .map((s) => s.hourly_fee)
        .filter((f): f is number => f !== null),
    ),
  ).sort((a, b) => a - b);

  const students = feeFilterActive
    ? allStudents.filter(
        (s) => s.hourly_fee !== null && selectedFeeKeys.has(feeKey(s.hourly_fee)),
      )
    : allStudents;

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
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 pb-5">
          {feeOptions.length > 0 && (
            <details className="group relative">
              <summary className="flex list-none items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
                Filter by fee
                {feeFilterActive && (
                  <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-xs font-semibold text-indigo-700">
                    {selectedFeeKeys.size}
                  </span>
                )}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-3.5 w-3.5 text-slate-400 transition group-open:rotate-180"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </summary>

              <form
                method="get"
                className="absolute z-10 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-3 shadow-lg"
              >
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Hourly fee
                </p>
                <div className="max-h-56 space-y-1 overflow-y-auto">
                  {feeOptions.map((fee) => {
                    const key = feeKey(fee);
                    return (
                      <label
                        key={key}
                        className="flex items-center gap-2 rounded-md px-1.5 py-1 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <input
                          type="checkbox"
                          name="fee"
                          value={key}
                          defaultChecked={selectedFeeKeys.has(key)}
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        {formatHourlyFee(fee)}
                      </label>
                    );
                  })}
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                  <Link
                    href="/students"
                    className="text-xs font-medium text-slate-500 hover:text-slate-700"
                  >
                    Clear
                  </Link>
                  <button
                    type="submit"
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
                  >
                    Apply
                  </button>
                </div>
              </form>
            </details>
          )}

          {feeFilterActive && (
            <Link
              href="/students"
              className="text-sm font-medium text-slate-500 hover:text-slate-700"
            >
              Clear filter
            </Link>
          )}

          <span className="ml-auto text-xs text-slate-400">
            {feeFilterActive
              ? `Showing ${students.length} of ${allStudents.length} students`
              : `${allStudents.length} student${allStudents.length === 1 ? "" : "s"}`}
          </span>
        </div>

        <div className="mt-5 overflow-x-auto">
          {allStudents.length === 0 ? (
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
          ) : students.length === 0 ? (
            <p className="rounded-lg bg-slate-50 px-3 py-6 text-center text-sm text-slate-500">
              No students match the selected fee.{" "}
              <Link
                href="/students"
                className="font-medium text-indigo-600 hover:underline"
              >
                Clear filter
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
