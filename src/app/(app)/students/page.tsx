import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";
import { ReviewStatusBadge } from "@/components/Badges";
import { formatHourlyFee, formatCurrencyPrecise } from "@/lib/format";
import { calculateStudentIncome } from "@/lib/income";
import type { Student } from "@/lib/types";

const FEE_FLOOR = 5;
const FEE_CEILING = 50;

function parseFeeParam(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(FEE_CEILING, Math.max(FEE_FLOOR, n));
}

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ minFee?: string; maxFee?: string }>;
}) {
  const { minFee: minFeeRaw, maxFee: maxFeeRaw } = await searchParams;
  let minFee = parseFeeParam(minFeeRaw, FEE_FLOOR);
  let maxFee = parseFeeParam(maxFeeRaw, FEE_CEILING);
  if (minFee > maxFee) {
    [minFee, maxFee] = [maxFee, minFee];
  }
  const feeFilterActive = minFee > FEE_FLOOR || maxFee < FEE_CEILING;

  const supabase = await createClient();

  const { data } = await supabase
    .from("students")
    .select("*")
    .is("deleted_at", null)
    .order("name", { ascending: true });

  const allStudents = (data ?? []) as Student[];

  const students = feeFilterActive
    ? allStudents.filter(
        (s) => s.hourly_fee !== null && s.hourly_fee >= minFee && s.hourly_fee <= maxFee,
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
        <form
          method="get"
          className="flex flex-wrap items-end gap-3 border-b border-slate-100 pb-5"
        >
          <label className="block w-24">
            <span className="mb-1 block text-xs font-medium text-slate-700">
              Min fee
            </span>
            <input
              type="number"
              name="minFee"
              step="0.01"
              min={FEE_FLOOR}
              max={FEE_CEILING}
              defaultValue={minFee}
              className="input"
            />
          </label>
          <span className="pb-2.5 text-slate-300">–</span>
          <label className="block w-24">
            <span className="mb-1 block text-xs font-medium text-slate-700">
              Max fee
            </span>
            <input
              type="number"
              name="maxFee"
              step="0.01"
              min={FEE_FLOOR}
              max={FEE_CEILING}
              defaultValue={maxFee}
              className="input"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Filter by fee
          </button>
          {feeFilterActive && (
            <Link
              href="/students"
              className="text-sm font-medium text-slate-500 hover:text-slate-700"
            >
              Reset
            </Link>
          )}
          <span className="ml-auto self-center text-xs text-slate-400">
            {feeFilterActive
              ? `Showing ${students.length} of ${allStudents.length} students ($${minFee}–$${maxFee}/hr)`
              : `${allStudents.length} student${allStudents.length === 1 ? "" : "s"} · fee range $${FEE_FLOOR}–$${FEE_CEILING}/hr`}
          </span>
        </form>

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
              No students in that fee range.{" "}
              <Link
                href="/students"
                className="font-medium text-indigo-600 hover:underline"
              >
                Reset
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
