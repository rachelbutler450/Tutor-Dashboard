import Link from "next/link";
import StudentForm from "@/components/StudentForm";
import { createStudent } from "@/app/(app)/students/actions";

export default function NewStudentPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          ← Back to dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
            Add student
          </span>
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Set up their plan, contact info, and Preply link.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />
        <div className="p-6">
          <StudentForm action={createStudent} submitLabel="Add student" />
        </div>
      </div>
    </div>
  );
}
