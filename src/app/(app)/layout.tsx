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
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex min-h-full flex-col">
      <header className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-24 h-56 w-56 rounded-full bg-pink-300/20 blur-3xl" />
        <nav className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-base font-bold tracking-tight"
            >
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/15 ring-1 ring-inset ring-white/25">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
                  />
                </svg>
              </span>
              Tutor Dashboard
            </Link>
            <div className="hidden items-center gap-1 text-sm sm:flex">
              <NavLink href="/dashboard">Home</NavLink>
              <NavLink href="/students/new">Add student</NavLink>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-white/90 ring-1 ring-inset ring-white/20 sm:flex">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-white/20 text-xs font-bold">
                {initial}
              </span>
              <span className="max-w-[10rem] truncate">{displayName}</span>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-lg bg-white/15 px-3 py-1.5 text-sm font-medium text-white ring-1 ring-inset ring-white/25 transition hover:bg-white/25"
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

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-1.5 text-white/85 transition hover:bg-white/10 hover:text-white"
    >
      {children}
    </Link>
  );
}
