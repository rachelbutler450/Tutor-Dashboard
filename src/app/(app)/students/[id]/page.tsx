import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StudentForm from "@/components/StudentForm";
import { ReviewStatusBadge } from "@/components/Badges";
import {
  updateStudent,
  deleteStudent,
} from "@/app/(app)/students/actions";
import { formatCurrencyPrecise, formatHourlyFee } from "@/lib/format";
import {
  PREPLY_COMMISSION_RATE,
  calculateStudentIncome,
} from "@/lib/income";
import type { Student } from "@/lib/types";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: student } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle<Student>();

  if (!student) {
    notFound();
  }

  const income = calculateStudentIncome(
    student.hourly_fee,
    student.lessons_per_week,
  );
  const commissionPct = Math.round(PREPLY_COMMISSION_RATE * 100);
  const takeHomePct = 100 - commissionPct;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            ← Back to dashboard
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
              {student.name}
            </h1>
            <ReviewStatusBadge status={student.review_status} />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {[student.grade_year, student.curriculum]
              .filter(Boolean)
              .join(" · ") || "No grade or curriculum set yet"}
          </p>
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

      {/* ---- Per-student income card ---- */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-pink-400/20 blur-3xl" />

        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold">Estimated Monthly Income</h2>
              <p className="mt-1 text-sm text-white/70">
                {formatHourlyFee(student.hourly_fee)} ×{" "}
                {student.lessons_per_week} lessons/wk × ~4.33 weeks
              </p>
            </div>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90 ring-1 ring-inset ring-white/25">
              Preply {commissionPct}% commission
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <MiniStat
              label="Gross"
              value={formatCurrencyPrecise(income.monthlyGross)}
              caption="Before commission"
              emphasis="soft"
            />
            <MiniStat
              label={`Preply cut (${commissionPct}%)`}
              value={`−${formatCurrencyPrecise(income.commission)}`}
              caption="Deducted"
              emphasis="soft"
            />
            <MiniStat
              label={`Your take-home (${takeHomePct}%)`}
              value={formatCurrencyPrecise(income.monthlyNet)}
              caption="What you receive"
              emphasis="strong"
            />
          </div>
        </div>
      </section>

      {/* ---- Editable details ---- */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Student details
        </h2>
        <StudentForm
          action={updateStudent}
          student={student}
          submitLabel="Save changes"
        />
      </section>
    </div>
  );
}

function MiniStat({
  label,
  value,
  caption,
  emphasis,
}: {
  label: string;
  value: string;
  caption: string;
  emphasis: "soft" | "strong";
}) {
  const container =
    emphasis === "strong"
      ? "bg-white text-slate-900 shadow-lg"
      : "bg-white/10 text-white ring-1 ring-inset ring-white/20";
  const labelClass =
    emphasis === "strong" ? "text-slate-500" : "text-white/70";
  const captionClass =
    emphasis === "strong" ? "text-slate-500" : "text-white/60";
  return (
    <div className={`rounded-xl px-4 py-3 ${container}`}>
      <div
        className={`text-[11px] font-semibold uppercase tracking-wide ${labelClass}`}
      >
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold tabular-nums">{value}</div>
      <div className={`text-xs ${captionClass}`}>{caption}</div>
    </div>
  );
}
