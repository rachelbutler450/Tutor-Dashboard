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
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-pink-500 text-white shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
              />
            </svg>
          </div>
          <h1 className="bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
            Tutor Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your students, weekly load, and Preply income.
          </p>
        </div>

        <div className="rounded-2xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur">
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
                className="w-full rounded-lg bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:shadow-lg hover:brightness-110 disabled:opacity-60"
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
                className="w-full rounded-lg bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:shadow-lg hover:brightness-110 disabled:opacity-60"
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
