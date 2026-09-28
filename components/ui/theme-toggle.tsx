"use client";

import React from "react";
import { useTheme } from "@/lib/theme-context";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      id="theme-toggle-btn"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={`p-2 rounded-lg text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${className}`}
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-neutral-600" />
      )}
    </button>
  );
}
