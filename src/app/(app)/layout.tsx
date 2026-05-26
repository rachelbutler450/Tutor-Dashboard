import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/login/actions";
import type { Profile } from "@/lib/types";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  const displayName = profile?.full_name || profile?.email || user.email || "Tutor";

  return (
    <div className="flex min-h-full flex-col">
      <header className="no-print border-b border-slate-200 bg-white">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-base font-semibold text-slate-900"
            >
              Tutor Dashboard
            </Link>
            <div className="hidden items-center gap-4 text-sm sm:flex">
              <Link
                href="/dashboard"
                className="text-slate-600 transition hover:text-slate-900"
              >
                Home
              </Link>
              <Link
                href="/students/new"
                className="text-slate-600 transition hover:text-slate-900"
              >
                Add student
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-500 sm:inline">
              {displayName}
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Sign out
              </button>
            </form>
          </div>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
