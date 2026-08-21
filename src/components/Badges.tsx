import type { ReviewStatus } from "@/lib/types";

const REVIEW_STYLES: Record<ReviewStatus, string> = {
  "Not Asked": "bg-slate-100 text-slate-700 ring-slate-200",
  Asked: "bg-amber-100 text-amber-800 ring-amber-300",
  Reviewed:
    "bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 ring-emerald-300",
};

const BASE =
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset";

export function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  return <span className={`${BASE} ${REVIEW_STYLES[status]}`}>{status}</span>;
}
