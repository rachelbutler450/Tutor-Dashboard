import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";
import { StudentRoster } from "@/components/StudentRoster";
import type { Student } from "@/lib/types";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ minFee?: string; maxFee?: string; q?: string }>;
}) {
  const { minFee, maxFee, q } = await searchParams;

  const supabase = await createClient();

  const { data } = await supabase
    .from("students")
    .select("*")
    .is("deleted_at", null)
    .order("name", { ascending: true });

  const allStudents = (data ?? []) as Student[];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Master Roster"
        description="Every student you're currently working with."
        action={
          <div className="flex items-center gap-2">
            <Link
              href="/students/deleted"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              View recently deleted
            </Link>
            <a
              href="/students/export"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Export data
            </a>
            <Link
              href="/students/new"
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              + Add student
            </Link>
          </div>
        }
      />

      <StudentRoster
        students={allStudents}
        initialMinFee={minFee}
        initialMaxFee={maxFee}
        initialQuery={q}
      />
    </div>
  );
}
