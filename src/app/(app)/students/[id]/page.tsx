import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StudentForm from "@/components/StudentForm";
import { ReviewStatusBadge } from "@/components/Badges";
import {
  updateStudent,
  deleteStudent,
} from "@/app/(app)/students/actions";
import {
  calculateStudentIncome,
  PREPLY_COMMISSION_RATE,
} from "@/lib/income";
import {
  formatCurrency,
  formatCurrencyPrecise,
  formatHourlyFee,
} from "@/lib/format";
import type { Student } from "@/lib/types";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: studentData } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .maybeSingle<Student>();

  if (!studentData) {
    notFound();
  }

  const student = studentData;
  const income = calculateStudentIncome(
    student.hourly_fee,
    student.lessons_per_week,
  );
  const commissionPct = Math.round(PREPLY_COMMISSION_RATE * 100);
  const takeHomePct = 100 - commissionPct;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            ← Back to dashboard
          </Link>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="gradient-title">{student.name}</span>
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
            {student.grade_year && <span>{student.grade_year}</span>}
            {student.grade_year && student.curriculum && (
              <span className="text-slate-300">·</span>
            )}
            {student.curriculum && <span>{student.curriculum}</span>}
            {(student.grade_year || student.curriculum) && (
              <span className="text-slate-300">·</span>
            )}
            <ReviewStatusBadge status={student.review_status} />
          </div>
        </div>
        <form action={deleteStudent}>
          <input type="hidden" name="id" value={student.id} />
          <button
            type="submit"
            className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            Delete student
          </button>
        </form>
      </div>

      {/* Estimated Monthly Income — emerald, distinct */}
      <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50/60 shadow-sm">
        <div className="flex items-center gap-4 border-b border-emerald-100 px-6 py-5">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <DollarIcon />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Estimated Monthly Income · {student.name}
            </p>
            <p className="mt-0.5 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
              {formatCurrency(income.monthlyNet)}
            </p>
            <p className="mt-1 text-xs text-emerald-800/80">
              {formatHourlyFee(student.hourly_fee)} ·{" "}
              {student.lessons_per_week} lesson
              {student.lessons_per_week === 1 ? "" : "s"} / week
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 p-6 sm:grid-cols-3">
          <IncomeStat
            label="Gross"
            value={formatCurrencyPrecise(income.monthlyGross)}
          />
          <IncomeStat
            label={`Preply cut (${commissionPct}%)`}
            value={`- ${formatCurrencyPrecise(income.commission)}`}
          />
          <IncomeStat
            label={`Your take-home (${takeHomePct}%)`}
            value={formatCurrencyPrecise(income.monthlyNet)}
            highlight
          />
        </div>
      </section>

      {/* Editable details */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Student details
          </h2>
          <p className="text-xs text-slate-500">
            Update plan, contact info, and Preply link.
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
    </div>
  );
}

function IncomeStat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        highlight
          ? "rounded-xl bg-emerald-600 p-4 text-white shadow-sm"
          : "rounded-xl border border-emerald-100 bg-white p-4"
      }
    >
      <div
        className={`text-xs font-semibold uppercase tracking-wide ${
          highlight ? "text-emerald-50" : "text-emerald-700"
        }`}
      >
        {label}
      </div>
      <div
        className={`mt-1 text-2xl font-bold tabular-nums ${
          highlight ? "text-white" : "text-slate-900"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function DollarIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.75}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v12m4-9.5c0-1.24-1.79-2.25-4-2.25s-4 1.01-4 2.25 1.79 2.25 4 2.25 4 1.01 4 2.25-1.79 2.25-4 2.25-4-1.01-4-2.25"
      />
    </svg>
  );
}
