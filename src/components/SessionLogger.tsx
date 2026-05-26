"use client";

import { useActionState, useEffect, useRef } from "react";
import { createSessionLog, type FormState } from "@/app/(app)/students/actions";
import { SESSION_PERFORMANCES } from "@/lib/types";

export default function SessionLogger({ studentId }: { studentId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createSessionLog,
    {},
  );

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <input type="hidden" name="student_id" value={studentId} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="topic_name" className="mb-1 block text-sm font-medium text-slate-700">
            Topic <span className="text-red-500">*</span>
          </label>
          <input
            id="topic_name"
            name="topic_name"
            type="text"
            required
            className="input"
            placeholder="e.g. Quadratic equations"
          />
        </div>

        <div>
          <label htmlFor="performance" className="mb-1 block text-sm font-medium text-slate-700">
            Performance
          </label>
          <select
            id="performance"
            name="performance"
            defaultValue="Needs Review"
            className="input"
          >
            {SESSION_PERFORMANCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="session_date" className="mb-1 block text-sm font-medium text-slate-700">
            Session date
          </label>
          <input
            id="session_date"
            name="session_date"
            type="date"
            defaultValue={today}
            className="input"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="tutor_notes" className="mb-1 block text-sm font-medium text-slate-700">
            Notes
          </label>
          <textarea
            id="tutor_notes"
            name="tutor_notes"
            rows={3}
            className="input"
            placeholder="What did you cover? What needs follow-up?"
          />
        </div>
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
      >
        {pending ? "Logging…" : "Log session"}
      </button>
    </form>
  );
}
