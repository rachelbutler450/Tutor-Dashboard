"use client";

import { useMemo, useState } from "react";
import { formatDate, formatHourlyFee } from "@/lib/date";
import { PerformanceBadge } from "@/components/Badges";
import {
  SESSION_PERFORMANCES,
  type SessionLog,
  type SessionPerformance,
  type Student,
} from "@/lib/types";

export default function ParentReport({
  student,
  sessions,
  tutorName,
}: {
  student: Student;
  sessions: SessionLog[];
  tutorName: string;
}) {
  const [copied, setCopied] = useState(false);

  const today = formatDate(new Date().toISOString().slice(0, 10));

  const counts = useMemo(() => {
    const base: Record<SessionPerformance, number> = {
      Mastered: 0,
      "Needs Review": 0,
      Struggled: 0,
    };
    for (const s of sessions) base[s.performance] += 1;
    return base;
  }, [sessions]);

  const plainText = useMemo(() => {
    const lines: string[] = [];
    lines.push(`Progress Report — ${student.name}`);
    lines.push(`Prepared by ${tutorName} on ${today}`);
    lines.push("");
    if (student.grade_year) lines.push(`Grade / Year: ${student.grade_year}`);
    if (student.curriculum) lines.push(`Curriculum: ${student.curriculum}`);
    lines.push(`Lessons per week: ${student.lessons_per_week}`);
    lines.push("");
    lines.push("Performance summary:");
    for (const p of SESSION_PERFORMANCES) {
      lines.push(`  ${p}: ${counts[p]}`);
    }
    lines.push("");
    lines.push(`Sessions (${sessions.length}):`);
    if (sessions.length === 0) {
      lines.push("  No sessions logged yet.");
    } else {
      for (const s of sessions) {
        lines.push(
          `  ${formatDate(s.session_date)} — ${s.topic_name} [${s.performance}]`,
        );
        if (s.tutor_notes) lines.push(`      Notes: ${s.tutor_notes}`);
      }
    }
    return lines.join("\n");
  }, [student, sessions, counts, tutorName, today]);

  async function copyToClipboard() {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(plainText);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = plainText;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div>
      <div className="no-print mb-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={copyToClipboard}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          {copied ? "Copied!" : "Copy to Clipboard"}
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          Print to PDF
        </button>
      </div>

      <div className="report-document rounded-xl border border-slate-200 bg-white p-6 text-slate-900">
        <header className="mb-6 border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-semibold">Progress Report</h1>
          <p className="mt-1 text-sm text-slate-500">
            Prepared by {tutorName} · {today}
          </p>
        </header>

        <section className="mb-6">
          <h2 className="mb-2 text-lg font-semibold">{student.name}</h2>
          <dl className="grid grid-cols-1 gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
            {student.grade_year && (
              <div className="flex justify-between gap-4 sm:block">
                <dt className="text-slate-500">Grade / Year</dt>
                <dd className="font-medium">{student.grade_year}</dd>
              </div>
            )}
            {student.curriculum && (
              <div className="flex justify-between gap-4 sm:block">
                <dt className="text-slate-500">Curriculum</dt>
                <dd className="font-medium">{student.curriculum}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4 sm:block">
              <dt className="text-slate-500">Lessons / week</dt>
              <dd className="font-medium">{student.lessons_per_week}</dd>
            </div>
            <div className="flex justify-between gap-4 sm:block">
              <dt className="text-slate-500">Rate</dt>
              <dd className="font-medium">{formatHourlyFee(student.hourly_fee)}</dd>
            </div>
          </dl>
        </section>

        <section className="mb-6">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Performance summary
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {SESSION_PERFORMANCES.map((p) => (
              <div
                key={p}
                className="rounded-lg border border-slate-200 p-3 text-center"
              >
                <div className="text-2xl font-semibold">{counts[p]}</div>
                <div className="text-xs text-slate-500">{p}</div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Session details
          </h3>
          {sessions.length === 0 ? (
            <p className="text-sm text-slate-500">No sessions logged yet.</p>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="py-2 pr-3 font-medium">Date</th>
                  <th className="py-2 pr-3 font-medium">Topic</th>
                  <th className="py-2 pr-3 font-medium">Performance</th>
                  <th className="py-2 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 align-top">
                    <td className="py-2 pr-3 whitespace-nowrap">
                      {formatDate(s.session_date)}
                    </td>
                    <td className="py-2 pr-3">{s.topic_name}</td>
                    <td className="py-2 pr-3">
                      <PerformanceBadge performance={s.performance} />
                    </td>
                    <td className="py-2 text-slate-600">{s.tutor_notes ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}
