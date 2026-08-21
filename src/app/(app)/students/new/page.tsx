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
        <h1 className="mt-2 bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
          Add student
        </h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <StudentForm action={createStudent} submitLabel="Add student" />
      </div>
    </div>
  );
}
