export type ReviewStatus = "Not Asked" | "Asked" | "Reviewed";

export const REVIEW_STATUSES: ReviewStatus[] = [
  "Not Asked",
  "Asked",
  "Reviewed",
];

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  tutor_id: string;
  name: string;
  grade_year: string | null;
  timezone: string | null;
  parent_contact: string | null;
  curriculum: string | null;
  hourly_fee: number | null;
  lessons_per_week: number;
  preply_link: string | null;
  review_status: ReviewStatus;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}
