import React from "react";

export function Footer() {
  return (
    <footer className="w-full border-t border-neutral-200/80 dark:border-neutral-800 bg-[#FBFBFA] dark:bg-[#0D1117] py-8 sm:py-10 text-neutral-500 dark:text-neutral-400 text-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-serif font-bold text-sm tracking-tight text-neutral-900 dark:text-neutral-100">
            Briefly<span className="text-neutral-400 dark:text-neutral-500 font-sans">.</span>
          </span>
          <span>- Intelligent project intake & scope structuring.</span>
        </div>
        <div className="flex items-center gap-4 sm:gap-6 text-[11px] font-mono">
          <span>Strict Schema Validation</span>
          <span className="text-neutral-300 dark:text-neutral-700">•</span>
          <span>Defensible Scope Delivery</span>
        </div>
      </div>
    </footer>
  );
}
