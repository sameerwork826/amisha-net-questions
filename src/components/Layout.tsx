import { NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/practice", label: "Practice" },
  { to: "/mock", label: "Mock Test" },
  { to: "/progress", label: "Progress" },
];

export default function Layout() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <NavLink to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
              PS
            </span>
            <span className="text-sm font-semibold text-slate-800 sm:text-base">
              NET Prep · Political Science
            </span>
          </NavLink>
        </div>
        <nav className="mx-auto flex max-w-3xl gap-1 px-2 pb-2">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <Outlet />
      </main>

      <footer className="mx-auto w-full max-w-3xl px-4 py-6 text-center text-xs text-slate-400">
        Made for Amisha · UGC NET Political Science practice
      </footer>
    </div>
  );
}
