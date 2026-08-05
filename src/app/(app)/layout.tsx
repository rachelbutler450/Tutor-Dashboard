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

  const displayName =
    profile?.full_name || profile?.email || user.email || "Tutor";
  const initial = displayName.trim().charAt(0).toUpperCase() || "T";

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-20 bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500 shadow-lg shadow-violet-500/20">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 text-white">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-base font-semibold"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/25 text-sm font-bold text-white ring-1 ring-inset ring-white/40 backdrop-blur">
                T
              </span>
              <span className="hidden sm:inline">Tutor Dashboard</span>
            </Link>
            <div className="hidden items-center gap-1 text-sm sm:flex">
              <Link
                href="/dashboard"
                className="rounded-lg px-3 py-1.5 text-white/90 transition hover:bg-white/15 hover:text-white"
              >
                Home
              </Link>
              <Link
                href="/students/new"
                className="rounded-lg px-3 py-1.5 text-white/90 transition hover:bg-white/15 hover:text-white"
              >
                Add student
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 rounded-full bg-white/15 py-1 pl-1 pr-3 text-sm text-white ring-1 ring-inset ring-white/25 backdrop-blur sm:inline-flex">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold text-violet-700">
                {initial}
              </span>
              <span className="max-w-[10rem] truncate">{displayName}</span>
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-lg bg-white/15 px-3 py-1.5 text-sm font-medium text-white ring-1 ring-inset ring-white/25 backdrop-blur transition hover:bg-white/25"
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
