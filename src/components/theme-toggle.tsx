"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

export function ThemeToggle({ className }: Props) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // initial state from DOM
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    const root = document.documentElement;
  // Add brief global transition
  root.classList.add("theme-transition");
  window.setTimeout(() => root.classList.remove("theme-transition"), 260);
    if (next) {
      root.classList.add("dark");
      try { localStorage.setItem("theme", "dark"); } catch {}
    } else {
      root.classList.remove("dark");
      try { localStorage.setItem("theme", "light"); } catch {}
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Aydınlık moda geç" : "Karanlık moda geç"}
      className={cn(
        "h-10 w-10 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground",
        className
      )}
    >
      <span className="relative inline-flex h-5 w-5 items-center justify-center">
        <Sun className={cn("absolute h-5 w-5 transition-all duration-300", isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75")} />
        <Moon className={cn("absolute h-5 w-5 transition-all duration-300", isDark ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100")} />
      </span>
    </button>
  );
}
