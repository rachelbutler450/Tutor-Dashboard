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
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
          <span className="gradient-title">Add student</span>
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Set up their plan, contact info, and Preply link.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-sm backdrop-blur">
        <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500" />
        <div className="p-6">
          <StudentForm action={createStudent} submitLabel="Add student" />
        </div>
      </div>
    </div>
  );
}
