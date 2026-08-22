"use client";

import { useActionState, useState } from "react";
import { deleteStudent, type FormState } from "@/app/(app)/students/actions";

const initialState: FormState = {};

export function DeleteStudentDialog({
  studentId,
  studentName,
}: {
  studentId: string;
  studentName: string;
}) {
  const [open, setOpen] = useState(false);
  const [typedName, setTypedName] = useState("");
  const [state, formAction, pending] = useActionState(
    deleteStudent,
    initialState,
  );

  const matches = typedName.trim() === studentName;

  function close() {
    setOpen(false);
    setTypedName("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
      >
        Delete student
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-student-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2
              id="delete-student-title"
              className="text-lg font-semibold text-slate-900"
            >
              Delete {studentName}?
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              This removes {studentName} from your active roster, weekly
              lessons, income totals, and Preply tracker. It&apos;s
              recoverable any time from &ldquo;Recently deleted&rdquo; on the
              Students page — nothing is permanently erased.
            </p>

            <form action={formAction} className="mt-4">
              <input type="hidden" name="id" value={studentId} />
              <label
                htmlFor="confirm-name"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Type <span className="font-semibold">{studentName}</span> to
                confirm
              </label>
              <input
                id="confirm-name"
                type="text"
                autoComplete="off"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                className="input"
                placeholder={studentName}
              />

              {state.error && (
                <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {state.error}
                </p>
              )}

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={close}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!matches || pending}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {pending ? "Deleting…" : "Delete student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
