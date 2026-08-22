import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";
import { ReviewStatusBadge } from "@/components/Badges";
import { updateReviewStatus } from "@/app/(app)/students/actions";
import { REVIEW_STATUSES, type ReviewStatus, type Student } from "@/lib/types";

const NEXT_STATUS: Record<ReviewStatus, ReviewStatus | null> = {
  "Not Asked": "Asked",
  Asked: "Reviewed",
  Reviewed: null,
};

const TAB_TONE: Record<ReviewStatus, string> = {
  "Not Asked": "bg-slate-100 text-slate-700",
  Asked: "bg-amber-100 text-amber-800",
  Reviewed: "bg-emerald-100 text-emerald-800",
};

function parseTab(raw: string | undefined): ReviewStatus {
  return REVIEW_STATUSES.includes(raw as ReviewStatus)
    ? (raw as ReviewStatus)
    : "Not Asked";
}

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeTab = parseTab(status);

  const supabase = await createClient();
  const { data } = await supabase
    .from("students")
    .select("id, name, review_status, preply_link")
    .is("deleted_at", null)
    .order("name", { ascending: true });

  const students = (data ?? []) as Pick<
    Student,
    "id" | "name" | "review_status" | "preply_link"
  >[];

  const counts: Record<ReviewStatus, number> = {
    "Not Asked": 0,
    Asked: 0,
    Reviewed: 0,
  };
  for (const s of students) counts[s.review_status] += 1;

  // Only the students matching the selected tab — never merged with others.
  const visible = students.filter((s) => s.review_status === activeTab);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Preply Review Tracker"
        description="Track review requests and follow-ups, one status at a time."
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-3 gap-3">
          {REVIEW_STATUSES.map((s) => {
            const selected = activeTab === s;
            return (
              <Link
                key={s}
                href={`/reviews?status=${encodeURIComponent(s)}`}
                aria-pressed={selected}
                className={`rounded-xl p-3 text-center transition ${TAB_TONE[s]} ${
                  selected
                    ? "ring-2 ring-indigo-500 ring-offset-2"
                    : "hover:brightness-95"
                }`}
              >
                <div className="text-2xl font-bold">{counts[s]}</div>
                <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide">
                  {s}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-5">
          {visible.length === 0 ? (
            <p className="rounded-lg bg-slate-50 px-3 py-6 text-center text-sm text-slate-500">
              No students with &ldquo;{activeTab}&rdquo;.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {visible.map((student) => {
                const next = NEXT_STATUS[student.review_status];
                return (
                  <li
                    key={student.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/students/${student.id}`}
                        className="text-sm font-medium text-slate-900 hover:text-indigo-600"
                      >
                        {student.name}
                      </Link>
                      <ReviewStatusBadge status={student.review_status} />
                    </div>
                    <div className="flex items-center gap-3">
                      {student.preply_link && (
                        <a
                          href={student.preply_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-indigo-600 hover:underline"
                        >
                          Preply ↗
                        </a>
                      )}
                      {next && (
                        <form action={updateReviewStatus}>
                          <input type="hidden" name="id" value={student.id} />
                          <input type="hidden" name="status" value={next} />
                          <button
                            type="submit"
                            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
                          >
                            Mark {next}
                          </button>
                        </form>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
