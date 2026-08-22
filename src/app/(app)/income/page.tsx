import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";
import { formatCurrencyPrecise, formatHourlyFee } from "@/lib/format";
import {
  PREPLY_COMMISSION_RATE,
  calculateStudentIncome,
  calculateTotalIncome,
} from "@/lib/income";
import type { Student } from "@/lib/types";

export default async function IncomePage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("students")
    .select("id, name, hourly_fee, lessons_per_week")
    .is("deleted_at", null)
    .order("name", { ascending: true });

  const students = (data ?? []) as Pick<
    Student,
    "id" | "name" | "hourly_fee" | "lessons_per_week"
  >[];

  const income = calculateTotalIncome(students);
  const commissionPct = Math.round(PREPLY_COMMISSION_RATE * 100);
  const takeHomePct = 100 - commissionPct;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Income & Take-Home"
        description="Estimated monthly income after Preply's commission, assuming every planned lesson happens (~4.33 weeks / month)."
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-900">
            This month&apos;s estimate
          </h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            Preply {commissionPct}% commission
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <IncomeStat
            label="Gross"
            value={formatCurrencyPrecise(income.monthlyGross)}
            caption="Before commission"
            tone="bg-slate-50 text-slate-900"
          />
          <IncomeStat
            label={`Preply cut (${commissionPct}%)`}
            value={`−${formatCurrencyPrecise(income.commission)}`}
            caption="Deducted"
            tone="bg-rose-50 text-rose-700"
          />
          <IncomeStat
            label={`Your take-home (${takeHomePct}%)`}
            value={formatCurrencyPrecise(income.monthlyNet)}
            caption="What you receive"
            tone="bg-emerald-50 text-emerald-700"
          />
        </div>

        <div className="mt-5">
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="bg-emerald-400"
              style={{ width: `${takeHomePct}%` }}
              title={`Take-home ${takeHomePct}%`}
            />
            <div
              className="bg-rose-300"
              style={{ width: `${commissionPct}%` }}
              title={`Preply commission ${commissionPct}%`}
            />
          </div>
          <div className="mt-1 flex justify-between text-xs text-slate-500">
            <span>Your {takeHomePct}%</span>
            <span>Preply {commissionPct}%</span>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Per student</h2>
        <p className="mt-1 text-sm text-slate-500">
          Rate × lessons/week × ~4.33 weeks, minus commission.
        </p>

        <div className="mt-4 overflow-x-auto">
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
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-4 font-medium">Student</th>
                  <th className="py-2 pr-4 font-medium">Rate</th>
                  <th className="py-2 pr-4 font-medium">Lessons/wk</th>
                  <th className="py-2 text-right font-medium">
                    Monthly take-home
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => {
                  const bd = calculateStudentIncome(
                    student.hourly_fee,
                    student.lessons_per_week,
                  );
                  return (
                    <tr key={student.id} className="hover:bg-slate-50">
                      <td className="py-2 pr-4 font-medium text-slate-900">
                        <Link
                          href={`/students/${student.id}`}
                          className="hover:text-indigo-600 hover:underline"
                        >
                          {student.name}
                        </Link>
                      </td>
                      <td className="py-2 pr-4 tabular-nums text-slate-600">
                        {formatHourlyFee(student.hourly_fee)}
                      </td>
                      <td className="py-2 pr-4 tabular-nums text-slate-600">
                        {student.lessons_per_week}
                      </td>
                      <td className="py-2 text-right tabular-nums font-semibold text-emerald-700">
                        {formatCurrencyPrecise(bd.monthlyNet)}
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

function IncomeStat({
  label,
  value,
  caption,
  tone,
}: {
  label: string;
  value: string;
  caption: string;
  tone: string;
}) {
  return (
    <div className={`rounded-xl px-4 py-3 ${tone}`}>
      <div className="text-[11px] font-semibold uppercase tracking-wide opacity-70">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-xs opacity-70">{caption}</div>
    </div>
  );
}
