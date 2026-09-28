"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  LayoutDashboard,
  X,
  ArrowRight,
  LogOut,
  ChevronDown,
  Loader2,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  useAuth,
  getUserDisplayName,
  getUserAvatarUrl,
} from "@/lib/auth-context";
import { useToast } from "@/components/ui/toast";

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
  const { user, loading: authLoading, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut } = useAuth();
  const { showToast } = useToast();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);

  // User dropdown menu state
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccessMsg(null);

    if (!email.trim() || !password) {
      setAuthError("Please fill in both email and password.");
      return;
    }

    if (password.length < 6) {
      setAuthError("Password must be at least 6 characters long.");
      return;
    }

    setEmailSubmitting(true);

    try {
      if (authMode === "signin") {
        const { error } = await signInWithEmail(email.trim(), password);
        if (error) {
          setAuthError(error.message);
        } else {
          setShowAuthModal(false);
          setEmail("");
          setPassword("");
          showToast("Signed in successfully!");
          onNavigate?.("dashboard");
        }
      } else {
        const { error, user: createdUser } = await signUpWithEmail(
          email.trim(),
          password,
          fullName
        );
        if (error) {
          setAuthError(error.message);
        } else if (
          createdUser &&
          createdUser.identities &&
          createdUser.identities.length === 0
        ) {
          setAuthError("An account with this email already exists. Please switch to Sign In.");
        } else if (
          createdUser &&
          !createdUser.confirmed_at &&
          (!createdUser.identities || createdUser.identities.length > 0)
        ) {
          setAuthSuccessMsg(
            "Account created! If email confirmation is required, please check your inbox to verify your email."
          );
          showToast("Account created successfully!");
        } else {
          setShowAuthModal(false);
          setEmail("");
          setPassword("");
          setFullName("");
          showToast("Welcome to Briefly! Your account is ready.");
          onNavigate?.("dashboard");
        }
      }
    } catch (err: any) {
      setAuthError(err.message || "An unexpected authentication error occurred.");
    } finally {
      setEmailSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setAuthSuccessMsg(null);
    setGoogleSubmitting(true);

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setAuthError(error.message);
        setGoogleSubmitting(false);
      } else {
        // Fallback reset in case browser redirect is cancelled
        setTimeout(() => {
          setGoogleSubmitting(false);
        }, 5000);
      }
    } catch (err: any) {
      setAuthError(err.message || "Failed to initialize Google authentication.");
      setGoogleSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    await signOut();
    showToast("Signed out successfully.");
    onNavigate?.("landing");
  };

  const displayName = getUserDisplayName(user);
  const avatarUrl = getUserAvatarUrl(user);
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#FBFBFA]/90 dark:bg-[#0D1117]/90 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          {/* Left: Typographic Briefly logo */}
          <div className="flex items-center gap-6">
            <button
              id="nav-brand-btn"
              onClick={() => onNavigate?.("landing")}
              className="flex items-center gap-2 text-left group cursor-pointer"
            >
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-neutral-950 dark:text-neutral-50 group-hover:opacity-80 transition-opacity">
                Briefly<span className="text-neutral-400 dark:text-neutral-500 font-sans">.</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200/70 dark:border-neutral-700">
                INTAKE INTELLIGENCE
              </span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600 dark:text-neutral-300">
            <button
              id="nav-link-dashboard"
              onClick={() => onNavigate?.("dashboard")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
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
              className="hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer"
            >
              How it works
            </button>
            <button
              id="nav-link-examples"
              onClick={() => onNavigate?.("brief")}
              className={`hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer ${
                currentView === "brief" ? "text-neutral-950 dark:text-white font-semibold" : ""
              }`}
            >
              Examples
            </button>
            <button
              id="nav-link-product"
              onClick={() => handleNavClick("product-section")}
              className="hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer"
            >
              Product
            </button>
          </nav>

          {/* Right: Auth, Theme toggle, Create */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {authLoading ? (
              <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            ) : user ? (
              /* Authenticated User Avatar + Dropdown */
              <div className="relative" ref={userMenuRef}>
                <button
                  id="nav-user-menu-btn"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full border border-neutral-200/80 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-all cursor-pointer"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-6 h-6 rounded-full object-cover border border-neutral-300 dark:border-neutral-700"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-[10px] font-bold flex items-center justify-center">
                      {initials}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 max-w-[100px] truncate hidden sm:inline-block">
                    {displayName}
                  </span>
                  <ChevronDown className="w-3 h-3 text-neutral-400" />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#161B22] rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 py-1.5 z-50 text-xs">
                    <div className="px-3.5 py-2.5 border-b border-neutral-100 dark:border-neutral-800">
                      <p className="font-semibold text-neutral-950 dark:text-white truncate">
                        {user.user_metadata?.full_name || displayName}
                      </p>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono truncate">
                        {user.email}
                      </p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onNavigate?.("dashboard");
                        }}
                        className="w-full text-left px-3.5 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/70 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Dashboard</span>
                      </button>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onNavigate?.("create");
                        }}
                        className="w-full text-left px-3.5 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/70 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <Plus className="w-3.5 h-3.5 text-neutral-400" />
                        <span>New Brief</span>
                      </button>
                    </div>

                    <div className="border-t border-neutral-100 dark:border-neutral-800 pt-1">
                      <button
                        id="nav-logout-btn"
                        onClick={handleSignOut}
                        className="w-full text-left px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Sign In Button */
              <button
                id="nav-signin-btn"
                onClick={() => {
                  setAuthMode("signin");
                  setAuthError(null);
                  setAuthSuccessMsg(null);
                  setEmailSubmitting(false);
                  setGoogleSubmitting(false);
                  setShowAuthModal(true);
                }}
                className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Sign in
              </button>
            )}

            {/* Create brief CTA */}
            <button
              id="nav-create-brief-btn"
              onClick={() => onNavigate?.("create")}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 text-xs font-semibold rounded-lg shadow-xs transition-all duration-150 active:scale-98 cursor-pointer"
            >
              <span>+ Create brief</span>
            </button>
          </div>
        </div>
      </header>

      {/* Supabase Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/60 dark:bg-neutral-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#161B22] rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 relative animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 mb-5">
              <div>
                <h3 className="text-base font-bold text-neutral-950 dark:text-white tracking-tight">
                  {authMode === "signin" ? "Sign in to Briefly" : "Create your account"}
                </h3>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {authMode === "signin"
                    ? "Access your saved briefs and project memory"
                    : "Save briefs to cloud with memory and sync"}
                </p>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Notification */}
            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                <span className="font-bold">•</span>
                <span>{authError}</span>
              </div>
            )}

            {/* Success Notification */}
            {authSuccessMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{authSuccessMsg}</span>
              </div>
            )}

            {/* Google OAuth Login Button */}
            <button
              type="button"
              id="google-signin-btn"
              onClick={handleGoogleSignIn}
              disabled={googleSubmitting}
              className="w-full py-2.5 px-4 bg-white dark:bg-[#1E2330] hover:bg-neutral-50 dark:hover:bg-[#252B3B] text-neutral-800 dark:text-neutral-200 text-xs font-semibold rounded-xl border border-neutral-300 dark:border-neutral-700 shadow-2xs transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {googleSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-neutral-500" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
              </div>
              <span className="relative bg-white dark:bg-[#161B22] px-2.5 text-[10px] uppercase font-mono tracking-wider text-neutral-400">
                or with email
              </span>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3">
              {authMode === "signup" && (
                <div>
                  <label className="block text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Your Name or Agency
                  </label>
                  <div className="relative">
                    <UserIcon className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white transition-all"
                      placeholder="e.g. Alex Morgan"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white transition-all"
                    placeholder="you@agency.studio"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs pl-9 pr-9 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white transition-all"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                id="email-auth-submit-btn"
                disabled={emailSubmitting}
                className="w-full mt-2 py-2.5 bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-xs"
              >
                {emailSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Please wait...</span>
                  </>
                ) : (
                  <>
                    <span>{authMode === "signin" ? "Sign In" : "Create Account"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Mode switch */}
            <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-center">
              {authMode === "signin" ? (
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signup");
                      setAuthError(null);
                      setAuthSuccessMsg(null);
                    }}
                    className="font-semibold text-neutral-950 dark:text-white underline cursor-pointer hover:opacity-80"
                  >
                    Sign up
                  </button>
                </p>
              ) : (
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signin");
                      setAuthError(null);
                      setAuthSuccessMsg(null);
                    }}
                    className="font-semibold text-neutral-950 dark:text-white underline cursor-pointer hover:opacity-80"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
