import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { applyTheme, getInitialTheme, type Theme } from "./theme";

function Icon({ name, className }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className ?? ""}`.trim()}>{name}</span>;
}

export function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const canGoBack = useMemo(() => location.pathname !== "/", [location.pathname]);

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <header className="fixed top-0 z-50 w-full border-b border-stone-200/50 bg-stone-50/80 backdrop-blur-md shadow-sm dark:border-stone-800/50 dark:bg-stone-950/80">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            {canGoBack ? (
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-full p-2 text-stone-500 transition-colors hover:text-primary active:scale-95"
                aria-label="Go back"
              >
                <Icon name="arrow_back" />
              </button>
            ) : null}

            <NavLink
              to="/"
              className="text-xl font-bold tracking-tight text-primary dark:text-teal-300"
              style={{ fontFamily: "Plus Jakarta Sans" }}
            >
              PrepForge
            </NavLink>
          </div>

          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "font-semibold text-primary dark:text-teal-300" : "text-stone-500 hover:text-primary dark:hover:text-teal-300"
              }
            >
              Practice
            </NavLink>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive ? "font-semibold text-primary dark:text-teal-300" : "text-stone-500 hover:text-primary dark:hover:text-teal-300"
              }
            >
              Journey
            </NavLink>
            <NavLink
              to="/patterns"
              className={({ isActive }) =>
                isActive ? "font-semibold text-primary dark:text-teal-300" : "text-stone-500 hover:text-primary dark:hover:text-teal-300"
              }
            >
              Patterns
            </NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
              className="rounded-full p-2 text-stone-500 transition-colors hover:text-primary active:scale-95 dark:text-stone-400"
              aria-label="Toggle theme"
            >
              <Icon name="dark_mode" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1200px] px-4 pb-8 pt-24 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}

