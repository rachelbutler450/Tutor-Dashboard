import type { ReviewStatus } from "@/lib/types";

const REVIEW_STYLES: Record<ReviewStatus, string> = {
  "Not Asked": "bg-slate-100 text-slate-600 ring-slate-200",
  Asked: "bg-amber-50 text-amber-700 ring-amber-200",
  Reviewed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

const BASE =
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset";

export function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  return <span className={`${BASE} ${REVIEW_STYLES[status]}`}>{status}</span>;
}
