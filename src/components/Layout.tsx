import { NavLink, Outlet } from "react-router-dom";
import { toggleTheme, useTheme } from "../hooks/useTheme";
import { clerkEnabled } from "../lib/authConfig";
import AuthControls from "./AuthControls";
import {
  IconHome,
  IconMock,
  IconMoon,
  IconPapers,
  IconPractice,
  IconProgress,
  IconSun,
} from "./icons";

const links = [
  { to: "/", label: "Home", end: true, Icon: IconHome },
  { to: "/practice", label: "Practice", Icon: IconPractice },
  { to: "/mock", label: "Mock", Icon: IconMock },
  { to: "/papers", label: "Papers", Icon: IconPapers },
  { to: "/progress", label: "Progress", Icon: IconProgress },
];

function Brand() {
  return (
    <NavLink to="/" className="flex items-center gap-2.5">
      <span
        className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-extrabold text-white"
        style={{ background: "linear-gradient(180deg,var(--brand-2),var(--brand))" }}
      >
        PS
      </span>
      <span className="display text-[0.95rem] font-extrabold leading-none">
        NET&nbsp;Prep
        <span className="block text-[0.7rem] font-medium t-faint">Political Science</span>
      </span>
    </NavLink>
  );
}

function ThemeToggle() {
  const theme = useTheme();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="icon-btn"
    >
      {theme === "dark" ? <IconSun width={18} /> : <IconMoon width={18} />}
    </button>
  );
}

export default function Layout() {
  return (
    <div className="min-h-full">
      {/* Desktop sidebar */}
      <aside
        className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r p-4 lg:flex"
        style={{ borderColor: "var(--border)", background: "var(--panel)" }}
      >
        <div className="px-1.5 py-2">
          <Brand />
        </div>
        <nav className="mt-4 flex flex-col gap-1">
          {links.map(({ to, label, end, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `nav-link ${isActive ? "nav-link-active" : ""}`
              }
            >
              <Icon width={19} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div
          className="mt-auto flex items-center justify-between rounded-xl border p-2"
          style={{ borderColor: "var(--border)" }}
        >
          <ThemeToggle />
          {clerkEnabled ? <AuthControls /> : <span className="text-xs t-faint pr-1">Local mode</span>}
        </div>
      </aside>

      {/* Mobile top bar */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between border-b px-4 py-2.5 lg:hidden"
        style={{ borderColor: "var(--border)", background: "color-mix(in srgb, var(--panel) 88%, transparent)", backdropFilter: "blur(10px)" }}
      >
        <Brand />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {clerkEnabled ? <AuthControls /> : null}
        </div>
      </header>

      {/* Content */}
      <div className="lg:pl-64">
        <main className="mx-auto w-full max-w-3xl px-4 pb-28 pt-6 lg:pb-12 lg:pt-10">
          <Outlet />
        </main>
        <footer className="mx-auto hidden w-full max-w-3xl px-4 pb-10 text-center text-xs t-faint lg:block">
          Made for Amisha · UGC NET Political Science
        </footer>
      </div>

      {/* Mobile bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t px-1 py-1.5 lg:hidden"
        style={{ borderColor: "var(--border)", background: "color-mix(in srgb, var(--panel) 92%, transparent)", backdropFilter: "blur(10px)" }}
      >
        {links.map(({ to, label, end, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-lg py-1.5 text-[0.66rem] font-semibold ${
                isActive ? "" : "t-faint"
              }`
            }
            style={({ isActive }: { isActive: boolean }) =>
              isActive ? { color: "var(--brand-soft-text)" } : undefined
            }
          >
            <Icon width={21} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
