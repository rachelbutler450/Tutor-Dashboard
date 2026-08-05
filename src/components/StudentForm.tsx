"use client";

import { useActionState } from "react";
import type { FormState } from "@/app/(app)/students/actions";
import { REVIEW_STATUSES, type Student } from "@/lib/types";

type Action = (
  prevState: FormState,
  formData: FormData,
) => Promise<FormState>;

export default function StudentForm({
  action,
  student,
  submitLabel,
}: {
  action: Action;
  student?: Student;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    {},
  );

  return (
    <form action={formAction} className="space-y-5">
      {student && <input type="hidden" name="id" value={student.id} />}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={student?.name ?? ""}
            className="input"
            placeholder="Student name"
          />
        </div>

        <div>
          <label htmlFor="grade_year" className="mb-1 block text-sm font-medium text-slate-700">
            Grade / Year
          </label>
          <input
            id="grade_year"
            name="grade_year"
            type="text"
            defaultValue={student?.grade_year ?? ""}
            className="input"
            placeholder="e.g. Year 10"
          />
        </div>

        <div>
          <label htmlFor="timezone" className="mb-1 block text-sm font-medium text-slate-700">
            Timezone
          </label>
          <input
            id="timezone"
            name="timezone"
            type="text"
            defaultValue={student?.timezone ?? ""}
            className="input"
            placeholder="e.g. Europe/London"
          />
        </div>

        <div>
          <label htmlFor="parent_contact" className="mb-1 block text-sm font-medium text-slate-700">
            Parent contact
          </label>
          <input
            id="parent_contact"
            name="parent_contact"
            type="text"
            defaultValue={student?.parent_contact ?? ""}
            className="input"
            placeholder="Email or phone"
          />
        </div>

        <div>
          <label htmlFor="curriculum" className="mb-1 block text-sm font-medium text-slate-700">
            Curriculum
          </label>
          <input
            id="curriculum"
            name="curriculum"
            type="text"
            defaultValue={student?.curriculum ?? ""}
            className="input"
            placeholder="e.g. GCSE Maths"
          />
        </div>

        <div>
          <label htmlFor="hourly_fee" className="mb-1 block text-sm font-medium text-slate-700">
            Hourly fee
          </label>
          <input
            id="hourly_fee"
            name="hourly_fee"
            type="number"
            step="0.01"
            min="0"
            defaultValue={student?.hourly_fee ?? ""}
            className="input"
            placeholder="40.00"
          />
        </div>

        <div>
          <label htmlFor="lessons_per_week" className="mb-1 block text-sm font-medium text-slate-700">
            Lessons per week
          </label>
          <input
            id="lessons_per_week"
            name="lessons_per_week"
            type="number"
            min="0"
            step="1"
            defaultValue={student?.lessons_per_week ?? 1}
            className="input"
          />
        </div>

        <div>
          <label htmlFor="review_status" className="mb-1 block text-sm font-medium text-slate-700">
            Review status
          </label>
          <select
            id="review_status"
            name="review_status"
            defaultValue={student?.review_status ?? "Not Asked"}
            className="input"
          >
            {REVIEW_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="preply_link" className="mb-1 block text-sm font-medium text-slate-700">
            Preply link
          </label>
          <input
            id="preply_link"
            name="preply_link"
            type="url"
            defaultValue={student?.preply_link ?? ""}
            className="input"
            placeholder="https://preply.com/..."
          />
        </div>
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Saved.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn-primary"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
