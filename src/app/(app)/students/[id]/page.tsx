import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StudentForm from "@/components/StudentForm";
import { ReviewStatusBadge } from "@/components/Badges";
import { DeleteStudentDialog } from "@/components/DeleteStudentDialog";
import { updateStudent } from "@/app/(app)/students/actions";
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
            <h1 className="text-2xl font-semibold text-slate-900">
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
        <DeleteStudentDialog studentId={student.id} studentName={student.name} />
      </div>

      {/* ---- Per-student income card ---- */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Estimated Monthly Income
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {formatHourlyFee(student.hourly_fee)} ×{" "}
              {student.lessons_per_week} lessons/wk × ~4.33 weeks
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            Preply {commissionPct}% commission
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MiniStat
            label="Gross"
            value={formatCurrencyPrecise(income.monthlyGross)}
            caption="Before commission"
            tone="bg-slate-50 text-slate-900"
          />
          <MiniStat
            label={`Preply cut (${commissionPct}%)`}
            value={`−${formatCurrencyPrecise(income.commission)}`}
            caption="Deducted"
            tone="bg-rose-50 text-rose-700"
          />
          <MiniStat
            label={`Your take-home (${takeHomePct}%)`}
            value={formatCurrencyPrecise(income.monthlyNet)}
            caption="What you receive"
            tone="bg-emerald-50 text-emerald-700"
          />
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
