"use client";

import { useActionState } from "react";
import { restoreStudent, type FormState } from "@/app/(app)/students/actions";

const initialState: FormState = {};

export function RestoreStudentButton({ studentId }: { studentId: string }) {
  const [state, formAction, pending] = useActionState(
    restoreStudent,
    initialState,
  );

  return (
    <div className="flex flex-col items-end gap-1">
      <form action={formAction}>
        <input type="hidden" name="id" value={studentId} />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Restoring…" : "Restore"}
        </button>
      </form>
      {state.error && (
        <p className="max-w-[16rem] text-right text-xs text-red-600">
          {state.error}
        </p>
      )}
    </div>
  );
}
