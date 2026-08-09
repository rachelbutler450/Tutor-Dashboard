import { createClient } from "@/lib/supabase/server";
import DashboardTabs from "@/components/DashboardTabs";
import type { Student } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: studentsData } = await supabase
    .from("students")
    .select("*")
    .order("name", { ascending: true });
  const students = (studentsData ?? []) as Student[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          <span className="gradient-title">Dashboard</span>
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Pick a section below to view.
        </p>
      </div>
      <DashboardTabs students={students} />
    </div>
  );
}
