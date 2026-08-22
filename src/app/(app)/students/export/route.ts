import { createClient } from "@/lib/supabase/server";
import { studentsToCsv } from "@/lib/csv";
import type { Student } from "@/lib/types";

/**
 * Manual backup export: a full CSV snapshot of every student belonging to
 * the signed-in tutor, including soft-deleted ones (their "Deleted At"
 * column is populated). RLS scopes the query to this tutor's own rows.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { data, error } = await supabase
    .from("students")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    return new Response(`Failed to export data: ${error.message}`, {
      status: 500,
    });
  }

  const csv = studentsToCsv((data ?? []) as Student[]);
  const timestamp = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="tutor-dashboard-students-${timestamp}.csv"`,
    },
  });
}
