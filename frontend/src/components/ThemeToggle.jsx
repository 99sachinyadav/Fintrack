import { Moon, Sun } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function ThemeToggle() {
  const { theme, setTheme } = useAuth();
  const dark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 text-sm font-medium text-slate-900 backdrop-blur transition hover:bg-white dark:border-slate-700/80 dark:bg-slate-800/70 dark:text-slate-100 dark:hover:bg-slate-700/70"
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
      {dark ? "Light mode" : "Dark mode"}
    </button>
  );
}
