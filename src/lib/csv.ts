import type { Student } from "@/lib/types";

const COLUMNS: { key: keyof Student; header: string }[] = [
  { key: "id", header: "ID" },
  { key: "name", header: "Name" },
  { key: "grade_year", header: "Grade / Year" },
  { key: "timezone", header: "Timezone" },
  { key: "parent_contact", header: "Parent Contact" },
  { key: "curriculum", header: "Curriculum" },
  { key: "hourly_fee", header: "Hourly Fee" },
  { key: "lessons_per_week", header: "Lessons Per Week" },
  { key: "preply_link", header: "Preply Link" },
  { key: "review_status", header: "Review Status" },
  { key: "deleted_at", header: "Deleted At" },
  { key: "created_at", header: "Created At" },
  { key: "updated_at", header: "Updated At" },
];

function escapeCsvField(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  // Quote (and escape embedded quotes) whenever the raw value would
  // otherwise break the CSV grid.
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Serializes a full snapshot of students (active AND soft-deleted) to CSV.
 * "Deleted At" is included so a restored/deleted status is visible in the
 * export itself — this is a manual backup, not just the active roster.
 */
export function studentsToCsv(students: Student[]): string {
  const header = COLUMNS.map((c) => escapeCsvField(c.header)).join(",");
  const rows = students.map((s) =>
    COLUMNS.map((c) => escapeCsvField(s[c.key])).join(","),
  );
  return [header, ...rows].join("\r\n") + "\r\n";
}
