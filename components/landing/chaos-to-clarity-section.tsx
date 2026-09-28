"use client";

import React, { useState } from "react";
import {
  Check,
  AlertTriangle,
  Copy,
  ArrowRight,
  MessageSquare,
  Sparkles,
  FileText,
  Clock,
  ExternalLink,
} from "lucide-react";

export function ChaosToClaritySection({ onTryBrief }: { onTryBrief?: () => void }) {
  const [copiedQuestion, setCopiedQuestion] = useState(false);

  const handleCopyQuestion = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQuestion(true);
    setTimeout(() => setCopiedQuestion(false), 2000);
  };

  return (
    <section
      id="transformation-section"
      className="w-full py-20 sm:py-28 bg-[#F5F5F3] dark:bg-[#0B0D13] border-y border-neutral-200/80 dark:border-neutral-800 transition-colors"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-mono uppercase font-bold tracking-widest text-neutral-400 dark:text-neutral-500 block mb-2">
            The Transformation
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-950 dark:text-white uppercase font-sans">
            FROM CHAOS TO CLARITY.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-600 dark:text-neutral-300">
            See how the same unformatted client communication seamlessly synthesizes into a rigorous, client-ready project brief.
          </p>
        </div>

        {/* Unified Transformation Container - One View (No 2-button toggles) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* LEFT: STATE 1: RAW CLIENT INPUT */}
          <div className="lg:col-span-5 flex flex-col bg-white dark:bg-[#121620] rounded-2xl border border-neutral-200/90 dark:border-neutral-800 hero-dashboard-floating-shadow overflow-hidden transition-all duration-300 hover:-translate-y-1">
            {/* Window Bar - Black-Ash Gradient Header */}
            <div className="px-5 py-3.5 border-b border-neutral-800/80 flex items-center justify-between bg-gradient-to-r from-[#111215] via-[#20232b] to-[#373d49] text-white">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/50 shadow-2xs" />
                <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50 shadow-2xs" />
                <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/50 shadow-2xs" />
                <span className="text-xs font-mono text-neutral-300 pl-2">
                  Slack message
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-950/70 text-rose-300 border border-rose-800/80 shadow-2xs">
                STATE 1: RAW CLIENT INPUT
              </span>
            </div>

            {/* Chat Body */}
            <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-5">
              <div className="space-y-3 font-mono text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-[#181D28] p-4 sm:p-5 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 leading-relaxed">
                <div>
                  <span className="font-bold text-neutral-900 dark:text-white">Marcus [10:42 AM]:</span>
                  <p className="mt-1">
                    &ldquo;Hey, can you make us a website kind of like Apple but maybe darker? We need around five pages, home, about, products, contact and maybe something for customers. We want it before the middle of October. We already have the logo but we&apos;re still working on the product images. Also maybe WhatsApp integration could be useful. It should obviously look good on mobile.&rdquo;
                  </p>
                </div>
                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700/60">
                  <span className="font-bold text-neutral-900 dark:text-white">Marcus [10:45 AM]:</span>
                  <p className="mt-1">
                    &ldquo;Oh and we might need an admin portal where our sales reps can log in to view customer submissions, or maybe just email notifications is fine for now? Let us know what you think on pricing.&rdquo;
                  </p>
                </div>
              </div>

              {/* What Makes This Chaotic */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-neutral-400 dark:text-neutral-500">
                  Unaddressed risks in this message:
                </span>
                <div className="space-y-1.5 text-xs">
                  <div className="p-2 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 flex items-start gap-2 text-amber-900 dark:text-amber-200">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                    <span><strong>&ldquo;Like Apple&rdquo;</strong> - Subjective design reference without agreed brand moodboard.</span>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 flex items-start gap-2 text-amber-900 dark:text-amber-200">
                    <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                    <span><strong>&ldquo;Middle of October&rdquo;</strong> - Vague delivery window with no fixed launch milestones.</span>
                  </div>
                  <div className="p-2 rounded-lg bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-900/50 flex items-start gap-2 text-rose-900 dark:text-rose-200">
                    <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                    <span><strong>&ldquo;Admin portal or email&rdquo;</strong> - Unscoped feature that could double development time.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Note */}
            <div className="px-5 py-3 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#141822] text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
              Raw requests often lead to scope disputes if not clarified upfront.
            </div>
          </div>

          {/* RIGHT: STATE 2: BRIEFLY UNDERSTANDS */}
          <div className="lg:col-span-7 flex flex-col bg-white dark:bg-[#121620] rounded-2xl border border-neutral-200/90 dark:border-neutral-800 hero-dashboard-floating-shadow overflow-hidden transition-all duration-300 hover:-translate-y-1">
            {/* Window Bar - Black-Ash Gradient Header */}
            <div className="px-5 py-3.5 border-b border-neutral-800/80 flex items-center justify-between bg-gradient-to-r from-[#111215] via-[#20232b] to-[#373d49] text-white">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono font-bold text-white tracking-wide">
                  Project Brief · ACME Redesign
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-800/80 shadow-2xs">
                STATE 2: BRIEFLY UNDERSTANDS
              </span>
            </div>

            {/* Structured Content */}
            <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-5">
              {/* 1. Project Goal */}
              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#181D28] border border-neutral-200/80 dark:border-neutral-800/80">
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-neutral-400 dark:text-neutral-500 block mb-1">
                  Project Goal & Scope
                </span>
                <p className="text-xs sm:text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Launch a 5-page responsive marketing website (Home, About, Products, Contact, and Customer FAQ) by mid-October.
                </p>
              </div>

              {/* 2. Confirmed Deliverables Grid */}
              <div>
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-neutral-400 dark:text-neutral-500 block mb-2">
                  Confirmed Deliverables (In Scope)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg border border-neutral-200/70 dark:border-neutral-800 bg-white dark:bg-[#161A24] flex items-center gap-2 font-medium text-neutral-800 dark:text-neutral-200">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>5 core marketing pages</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-neutral-200/70 dark:border-neutral-800 bg-white dark:bg-[#161A24] flex items-center gap-2 font-medium text-neutral-800 dark:text-neutral-200">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Mobile-friendly responsive layouts</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-neutral-200/70 dark:border-neutral-800 bg-white dark:bg-[#161A24] flex items-center gap-2 font-medium text-neutral-800 dark:text-neutral-200">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Brand logo integration</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-neutral-200/70 dark:border-neutral-800 bg-white dark:bg-[#161A24] flex items-center gap-2 font-medium text-neutral-800 dark:text-neutral-200">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Contact & lead inquiry form</span>
                  </div>
                </div>
              </div>

              {/* 3. Items Flagged for Client Clarification */}
              <div>
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-amber-700 dark:text-amber-400 block mb-2">
                  Clarify Before Development Kickoff
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg border border-amber-200/70 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20">
                    <div className="font-bold text-amber-900 dark:text-amber-300 text-[11px] mb-0.5">
                      Visual Direction
                    </div>
                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-tight">
                      Ask for 2–3 reference websites to align on layout and contrast expectations.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg border border-amber-200/70 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20">
                    <div className="font-bold text-amber-900 dark:text-amber-300 text-[11px] mb-0.5">
                      Target Launch Date
                    </div>
                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-tight">
                      Confirm exact day in mid-October to schedule design reviews and sign-offs.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg border border-amber-200/70 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20">
                    <div className="font-bold text-amber-900 dark:text-amber-300 text-[11px] mb-0.5">
                      Customer Area Scope
                    </div>
                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-tight">
                      Recommend email notifications for Phase 1; defer custom login portal to Phase 2.
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. Ready-to-Send Client Question */}
              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700/80 bg-neutral-50 dark:bg-[#161B24] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  <span className="w-5 h-5 rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center font-bold text-xs shrink-0">
                    ?
                  </span>
                  <span>&ldquo;Could you share 2–3 website links you like so our design team can match your style expectations?&rdquo;</span>
                </div>
                <button
                  id="copy-clarifying-question-btn"
                  onClick={() =>
                    handleCopyQuestion(
                      "Could you share 2–3 website links you like so our design team can match your style expectations?"
                    )
                  }
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#1E2330] border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-xs font-mono font-medium flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedQuestion ? "Copied!" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="px-5 py-3 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#141822] flex items-center justify-between text-xs">
              <span className="text-neutral-500 dark:text-neutral-400 font-mono text-[11px]">
                Ready to review and share with your team.
              </span>
              {onTryBrief && (
                <button
                  id="view-full-sample-brief-link"
                  onClick={onTryBrief}
                  className="font-semibold text-neutral-900 dark:text-white hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Explore full interactive brief</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
