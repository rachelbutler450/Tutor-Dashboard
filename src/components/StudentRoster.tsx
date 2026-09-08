"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ReviewStatusBadge } from "@/components/Badges";
import { formatHourlyFee, formatCurrencyPrecise } from "@/lib/format";
import { calculateStudentIncome } from "@/lib/income";
import type { Student } from "@/lib/types";

const FEE_FLOOR = 5;
const FEE_CEILING = 50;

function clampFeeParam(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const n = Math.round(Number(raw));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(FEE_CEILING, Math.max(FEE_FLOOR, n));
}

function pct(v: number): number {
  return ((v - FEE_FLOOR) / (FEE_CEILING - FEE_FLOOR)) * 100;
}

export function StudentRoster({
  students,
  initialMinFee,
  initialMaxFee,
  initialQuery,
}: {
  students: Student[];
  initialMinFee?: string;
  initialMaxFee?: string;
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery ?? "");
  const [minVal, setMinVal] = useState(() => {
    const min = clampFeeParam(initialMinFee, FEE_FLOOR);
    const max = clampFeeParam(initialMaxFee, FEE_CEILING);
    return Math.min(min, max);
  });
  const [maxVal, setMaxVal] = useState(() => {
    const min = clampFeeParam(initialMinFee, FEE_FLOOR);
    const max = clampFeeParam(initialMaxFee, FEE_CEILING);
    return Math.max(min, max);
  });

  const feeFilterActive = minVal > FEE_FLOOR || maxVal < FEE_CEILING;
  const trimmedQuery = query.trim();
  const searchActive = trimmedQuery.length > 0;

  // Keep the URL shareable/bookmarkable without triggering a Next.js
  // navigation (which would re-run the Server Component's Supabase fetch
  // on every drag tick). history.replaceState is a raw browser API that
  // Next's router never sees, so this is purely a side-effect.
  useEffect(() => {
    const params = new URLSearchParams();
    if (minVal > FEE_FLOOR) params.set("minFee", String(minVal));
    if (maxVal < FEE_CEILING) params.set("maxFee", String(maxVal));
    if (trimmedQuery) params.set("q", trimmedQuery);
    const qs = params.toString();
    const url = qs
      ? `${window.location.pathname}?${qs}`
      : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [minVal, maxVal, trimmedQuery]);

  const filteredStudents = useMemo(() => {
    const lowerQuery = trimmedQuery.toLowerCase();
    return students.filter((s) => {
      if (lowerQuery && !s.name.toLowerCase().includes(lowerQuery)) {
        return false;
      }
      if (feeFilterActive) {
        if (s.hourly_fee === null) return false;
        // Inclusive bounds; compares the student's real (possibly
        // decimal) fee against the whole-dollar slider bounds.
        if (s.hourly_fee < minVal || s.hourly_fee > maxVal) return false;
      }
      return true;
    });
  }, [students, trimmedQuery, feeFilterActive, minVal, maxVal]);

  const anyFilterActive = feeFilterActive || searchActive;

  function resetFilters() {
    setQuery("");
    setMinVal(FEE_FLOOR);
    setMaxVal(FEE_CEILING);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 pb-5">
        <label className="relative block w-56">
          <span className="sr-only">Search students by name</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name…"
            className="input pl-8"
          />
        </label>

        <details className="group relative">
          <summary className="flex list-none items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
            Filter by fee
            {feeFilterActive && (
              <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-xs font-semibold text-indigo-700">
                ${minVal}–${maxVal}
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

          <div className="absolute z-10 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Hourly fee
            </p>

            <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
              <span>${minVal}</span>
              <span>${maxVal}</span>
            </div>

            <div className="relative mt-2 h-4">
              <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-slate-100" />
              <div
                className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-indigo-500"
                style={{
                  left: `${pct(minVal)}%`,
                  right: `${100 - pct(maxVal)}%`,
                }}
              />
              <input
                type="range"
                min={FEE_FLOOR}
                max={FEE_CEILING}
                step={1}
                value={minVal}
                onChange={(e) => {
                  const v = Math.min(Number(e.target.value), maxVal);
                  setMinVal(v);
                }}
                aria-label="Minimum hourly fee"
                className="range-thumb absolute inset-0 h-4 w-full"
              />
              <input
                type="range"
                min={FEE_FLOOR}
                max={FEE_CEILING}
                step={1}
                value={maxVal}
                onChange={(e) => {
                  const v = Math.max(Number(e.target.value), minVal);
                  setMaxVal(v);
                }}
                aria-label="Maximum hourly fee"
                className="range-thumb absolute inset-0 h-4 w-full"
              />
            </div>

            <div className="mt-2 flex justify-between text-[11px] text-slate-400">
              <span>${FEE_FLOOR}</span>
              <span>${FEE_CEILING}</span>
            </div>

            {feeFilterActive && (
              <button
                type="button"
                onClick={() => {
                  setMinVal(FEE_FLOOR);
                  setMaxVal(FEE_CEILING);
                }}
                className="mt-3 text-xs font-medium text-slate-500 hover:text-slate-700"
              >
                Reset fee range
              </button>
            )}
          </div>
        </details>

        {anyFilterActive && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            Reset filters
          </button>
        )}

        <span className="ml-auto text-xs text-slate-400">
          {anyFilterActive
            ? `Showing ${filteredStudents.length} of ${students.length} students`
            : `${students.length} student${students.length === 1 ? "" : "s"}`}
        </span>
      </div>

      <div className="mt-5 overflow-x-auto">
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
        ) : filteredStudents.length === 0 ? (
          <p className="rounded-lg bg-slate-50 px-3 py-6 text-center text-sm text-slate-500">
            No students match your search or fee filter.{" "}
            <button
              type="button"
              onClick={resetFilters}
              className="font-medium text-indigo-600 hover:underline"
            >
              Reset filters
            </button>
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
              {filteredStudents.map((student) => {
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
  );
}
