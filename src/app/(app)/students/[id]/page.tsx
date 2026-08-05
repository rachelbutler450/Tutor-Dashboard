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
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
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
            className="rounded-lg border border-red-200 bg-white/70 px-3 py-1.5 text-sm font-medium text-red-600 backdrop-blur transition hover:bg-red-50"
          >
            Delete student
          </button>
        </form>
      </div>

      {/* Estimated Monthly Income hero for this student */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-pink-500 p-6 text-white shadow-xl shadow-violet-500/25 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/75">
              Estimated Monthly Income · {student.name}
            </p>
            <p className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
              {formatCurrency(income.monthlyNet)}
            </p>
            <p className="mt-1 text-sm text-white/85">
              {formatHourlyFee(student.hourly_fee)} ·{" "}
              {student.lessons_per_week} lesson
              {student.lessons_per_week === 1 ? "" : "s"} / week
            </p>
          </div>
          <div className="hidden rounded-2xl bg-white/15 p-3 ring-1 ring-inset ring-white/25 backdrop-blur sm:block">
            <DollarIcon />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <BreakdownStat
            label="Gross"
            value={formatCurrencyPrecise(income.monthlyGross)}
          />
          <BreakdownStat
            label={`Preply cut (${commissionPct}%)`}
            value={`- ${formatCurrencyPrecise(income.commission)}`}
          />
          <BreakdownStat
            label={`Your take-home (${takeHomePct}%)`}
            value={formatCurrencyPrecise(income.monthlyNet)}
            highlight
          />
        </div>
      </section>

      {/* Editable details */}
      <section className="overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-sm backdrop-blur">
        <div className="border-b border-slate-100 bg-gradient-to-r from-violet-50 via-indigo-50 to-white px-6 py-4">
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

function BreakdownStat({
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
      className={`rounded-xl p-4 ring-1 ring-inset backdrop-blur ${
        highlight
          ? "bg-white/25 ring-white/40"
          : "bg-white/10 ring-white/20"
      }`}
    >
      <div className="text-xs font-semibold uppercase tracking-wide text-white/75">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold tabular-nums text-white">
        {value}
      </div>
    </div>
  );
}

function DollarIcon() {
  return (
    <svg
      className="h-6 w-6"
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
