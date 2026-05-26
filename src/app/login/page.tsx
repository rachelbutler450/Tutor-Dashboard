"use client";

import { useActionState, useState } from "react";
import { login, signup, type AuthState } from "./actions";

const initialState: AuthState = {};

type Tab = "signin" | "signup";

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("signin");
  const [loginState, loginAction, loginPending] = useActionState(
    login,
    initialState,
  );
  const [signupState, signupAction, signupPending] = useActionState(
    signup,
    initialState,
  );

  const isSignin = tab === "signin";
  const state = isSignin ? loginState : signupState;

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">
            Tutor Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your students, sessions, and Preply reviews.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setTab("signin")}
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                isSignin
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setTab("signup")}
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                !isSignin
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Create account
            </button>
          </div>

          {isSignin ? (
            <form action={loginAction} className="space-y-4">
              <div>
                <label
                  htmlFor="signin-email"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Email
                </label>
                <input
                  id="signin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label
                  htmlFor="signin-password"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <input
                  id="signin-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="input"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loginPending}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
              >
                {loginPending ? "Signing in…" : "Sign in"}
              </button>
            </form>
          ) : (
            <form action={signupAction} className="space-y-4">
              <div>
                <label
                  htmlFor="signup-name"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Full name
                </label>
                <input
                  id="signup-name"
                  name="full_name"
                  type="text"
                  autoComplete="name"
                  className="input"
                  placeholder="Jane Tutor"
                />
              </div>
              <div>
                <label
                  htmlFor="signup-email"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Email
                </label>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label
                  htmlFor="signup-password"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <input
                  id="signup-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className="input"
                  placeholder="At least 6 characters"
                />
              </div>
              <button
                type="submit"
                disabled={signupPending}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
              >
                {signupPending ? "Creating account…" : "Create account"}
              </button>
            </form>
          )}

          {state.error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.error}
            </p>
          )}
          {state.message && (
            <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {state.message}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
