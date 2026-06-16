import { NavLink, Outlet } from "react-router-dom";
import { toggleTheme, useTheme } from "../hooks/useTheme";
import { clerkEnabled } from "../lib/authConfig";
import AuthControls from "./AuthControls";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/practice", label: "Practice" },
  { to: "/mock", label: "Mock" },
  { to: "/progress", label: "Progress" },
];

export default function Layout() {
  const theme = useTheme();

  return (
    <div className="flex min-h-full flex-col">
      <div className="aurora" aria-hidden />

      <header className="sticky top-0 z-20">
        <div className="mx-auto mt-3 flex max-w-3xl items-center justify-between gap-3 rounded-2xl border border-white/60 bg-white/70 px-3 py-2.5 shadow-lg shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
          <NavLink to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-sm font-black text-white shadow-md shadow-indigo-600/40">
              PS
            </span>
            <span className="hidden text-sm font-bold heading sm:block">
              NET Prep <span className="muted font-medium">· Pol Science</span>
            </span>
          </NavLink>

          <nav className="flex items-center gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-1.5 text-sm font-semibold transition ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-slate-600 hover:bg-slate-900/5 dark:text-slate-300 dark:hover:bg-white/10"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              title="Toggle dark mode"
              className="ml-1 flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300/70 bg-white/60 text-base transition hover:bg-white dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            {clerkEnabled ? (
              <span className="ml-1 flex items-center">
                <AuthControls />
              </span>
            ) : null}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="mx-auto w-full max-w-3xl px-4 py-8 text-center text-xs muted">
        Made with 💜 for Amisha · UGC NET Political Science
      </footer>
    </div>
  );
}
