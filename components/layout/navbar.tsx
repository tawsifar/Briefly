"use client";

import React, { useState } from "react";
import { Plus, LayoutDashboard, X, ArrowRight, UserCheck } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface NavbarProps {
  currentView?: "landing" | "dashboard" | "create" | "brief";
  onNavigate?: (view: "landing" | "dashboard" | "create" | "brief") => void;
  activeBriefId?: string;
  onScrollToSection?: (sectionId: string) => void;
}

export function Navbar({
  currentView = "landing",
  onNavigate,
  activeBriefId,
  onScrollToSection,
}: NavbarProps) {
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [emailInput, setEmailInput] = useState("lead@agency.studio");

  const handleNavClick = (sectionId: string) => {
    if (currentView !== "landing") {
      onNavigate?.("landing");
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#FBFBFA]/90 dark:bg-[#0D1117]/90 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          {/* Left: Typographic and elegant Briefly logo */}
          <div className="flex items-center gap-6">
            <button
              id="nav-brand-btn"
              onClick={() => onNavigate?.("landing")}
              className="flex items-center gap-2 text-left group"
            >
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-neutral-950 dark:text-neutral-50 group-hover:opacity-80 transition-opacity">
                Briefly<span className="text-neutral-400 dark:text-neutral-500 font-sans">.</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200/70 dark:border-neutral-700">
                INTAKE INTELLIGENCE
              </span>
            </button>
          </div>

          {/* Center/right navigation: Dashboard, How it works, Examples, Product */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600 dark:text-neutral-300">
            <button
              id="nav-link-dashboard"
              onClick={() => onNavigate?.("dashboard")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono uppercase tracking-wider transition-colors ${
                currentView === "dashboard"
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
            <button
              id="nav-link-how-it-works"
              onClick={() => handleNavClick("transformation-section")}
              className="hover:text-neutral-950 dark:hover:text-white transition-colors"
            >
              How it works
            </button>
            <button
              id="nav-link-examples"
              onClick={() => onNavigate?.("brief")}
              className={`hover:text-neutral-950 dark:hover:text-white transition-colors ${
                currentView === "brief" ? "text-neutral-950 dark:text-white font-semibold" : ""
              }`}
            >
              Examples
            </button>
            <button
              id="nav-link-product"
              onClick={() => handleNavClick("product-section")}
              className="hover:text-neutral-950 dark:hover:text-white transition-colors"
            >
              Product
            </button>
          </nav>

          {/* Right: Sign in, Theme toggle, Create a brief */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {isSignedIn ? (
              <button
                onClick={() => onNavigate?.("dashboard")}
                className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white font-medium"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Agency Account</span>
              </button>
            ) : (
              <button
                id="nav-signin-btn"
                onClick={() => setShowSignInModal(true)}
                className="text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white transition-colors px-2 py-1"
              >
                Sign in
              </button>
            )}

            <button
              id="nav-create-brief-btn"
              onClick={() => onNavigate?.("create")}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 text-xs font-semibold rounded-lg shadow-xs transition-all duration-150 active:scale-98 cursor-pointer"
            >
              <span>+ Create brief</span>
            </button>
          </div>
        </div>
      </header>

      {/* Minimal Sign In Modal */}
      {showSignInModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/50 dark:bg-neutral-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#161B22] rounded-2xl p-6 shadow-xl border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 mb-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-950 dark:text-white tracking-tight">
                  Sign in to Briefly
                </h3>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Access your organization&apos;s brief history
                </p>
              </div>
              <button
                onClick={() => setShowSignInModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsSignedIn(true);
                setShowSignInModal(false);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-mono uppercase text-neutral-500 dark:text-neutral-400 mb-1">
                  Work Email
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white"
                  placeholder="name@company.com"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Continue with Email</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <p className="text-[10px] text-neutral-400 text-center">
                Demo mode active: immediate instant sign-in without password.
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
