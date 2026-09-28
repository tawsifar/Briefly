"use client";

import React from "react";
import { SignatureHeroVisualization } from "./signature-hero-visualization";
import { ChaosToClaritySection } from "./chaos-to-clarity-section";
import {
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileCheck2,
  Layers,
  Sparkles,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";

interface LandingViewProps {
  onCreateBrief: () => void;
  onViewSampleBrief: () => void;
}

export function LandingView({ onCreateBrief, onViewSampleBrief }: LandingViewProps) {
  const scrollToTransformation = () => {
    const el = document.getElementById("transformation-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="w-full min-h-screen bg-[#FBFBFA] dark:bg-[#0D1117] text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Large Editorial Headline */}
          <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-950 dark:text-white leading-tight uppercase font-sans text-center max-w-4xl mx-auto">
            <span className="block whitespace-nowrap">TURN MESSY CLIENT REQUESTS</span>
            <span className="block text-neutral-500 dark:text-neutral-400">
              INTO CLEAR PROJECT BRIEFS.
            </span>
          </h1>

          {/* Editorial Subheading */}
          <p className="mt-5 sm:mt-6 text-base sm:text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto text-center leading-relaxed font-normal">
            &ldquo;Paste the conversation. Briefly finds the scope, deadlines, ambiguities, risks, questions, and next steps.&rdquo;
          </p>

          {/* CTAs */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 flex-wrap">
            <button
              id="hero-create-brief-cta"
              onClick={onCreateBrief}
              className="px-8 py-3.5 bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-semibold rounded-xl text-sm sm:text-base shadow-sm hover:shadow transition-all duration-150 flex items-center justify-center gap-2 group cursor-pointer w-full sm:w-auto text-center"
            >
              <span>Create a brief →</span>
            </button>

            <button
              id="hero-see-how-it-works-cta"
              onClick={scrollToTransformation}
              className="px-7 py-3.5 bg-white hover:bg-neutral-50 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-semibold rounded-xl text-sm sm:text-base border border-neutral-200 dark:border-neutral-700 shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto text-center"
            >
              <span>See how it works</span>
            </button>

            <button
              id="hero-sample-brief-cta"
              onClick={onViewSampleBrief}
              className="px-6 py-3.5 text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer w-full sm:w-auto text-center"
            >
              <span>View ACME Sample Brief →</span>
            </button>
          </div>

          {/* SIGNATURE BRIEFLY VISUALIZATION */}
          <SignatureHeroVisualization />
        </div>
      </section>

      {/* TRANSFORMATION SECTION: FROM CHAOS TO CLARITY */}
      <ChaosToClaritySection onTryBrief={onViewSampleBrief} />

      {/* PRODUCT / ARCHITECTURE CAPABILITIES */}
      <section
        id="product-section"
        className="py-20 sm:py-28 max-w-6xl mx-auto px-4 sm:px-6 transition-colors"
      >
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase font-bold tracking-widest text-neutral-400 dark:text-neutral-500 block mb-2">
            Clear Project Boundaries
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950 dark:text-white">
            Built for teams where vague client requests cause costly revisions.
          </h2>
          <p className="mt-4 text-neutral-600 dark:text-neutral-300 text-base sm:text-lg">
            Briefly separates confirmed deliverables from subjective language, defines clear scope boundaries, and drafts polite client questions in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Card 1 */}
          <div className="group relative bg-white dark:bg-[#13161F] p-8 rounded-2xl border border-neutral-200/90 dark:border-neutral-800/90 shadow-sm hover:shadow-[0_22px_45px_-12px_rgba(0,0,0,0.22),0_10px_20px_-8px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_25px_55px_-12px_rgba(0,0,0,0.92),0_0_0_1px_rgba(255,255,255,0.14)] hover:-translate-y-2.5 transition-all duration-300 ease-out flex flex-col justify-between overflow-hidden cursor-pointer">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center border border-amber-200/60 dark:border-amber-800/80 shadow-2xs group-hover:scale-110 group-hover:rotate-1 transition-all duration-300">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/50">
                  Ambiguity Guard
                </span>
              </div>
              <h3 className="text-xl font-extrabold tracking-tight text-neutral-950 dark:text-white mb-3 group-hover:text-amber-900 dark:group-hover:text-amber-200 transition-colors">
                Catch Vague Expectations Early
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed font-normal">
                Detects open-ended phrases like <span className="font-mono px-1.5 py-0.5 rounded bg-amber-500/10 dark:bg-amber-400/10 text-amber-900 dark:text-amber-200 text-xs font-semibold border border-amber-500/20">&ldquo;like Apple&rdquo;</span> or <span className="font-mono px-1.5 py-0.5 rounded bg-amber-500/10 dark:bg-amber-400/10 text-amber-900 dark:text-amber-200 text-xs font-semibold border border-amber-500/20">&ldquo;mid-October&rdquo;</span> and automatically structures clarifying questions before scope creep happens.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs">
              <span className="font-mono font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 text-[11px]">
                01 / CLARITY ENGINE
              </span>
              <span className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                <span>View Rule</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="group relative bg-white dark:bg-[#13161F] p-8 rounded-2xl border border-neutral-200/90 dark:border-neutral-800/90 shadow-sm hover:shadow-[0_22px_45px_-12px_rgba(0,0,0,0.22),0_10px_20px_-8px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_25px_55px_-12px_rgba(0,0,0,0.92),0_0_0_1px_rgba(255,255,255,0.14)] hover:-translate-y-2.5 transition-all duration-300 ease-out flex flex-col justify-between overflow-hidden cursor-pointer">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/80 shadow-2xs group-hover:scale-110 group-hover:rotate-1 transition-all duration-300">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/50">
                  Scope Perimeter
                </span>
              </div>
              <h3 className="text-xl font-extrabold tracking-tight text-neutral-950 dark:text-white mb-3 group-hover:text-blue-900 dark:group-hover:text-blue-200 transition-colors">
                Enforce Scope Boundaries
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed font-normal">
                Organizes unstructured requests into <span className="font-semibold text-neutral-900 dark:text-white">Confirmed Scope</span>, items requiring clarification, and <span className="font-mono px-1.5 py-0.5 rounded bg-blue-500/10 dark:bg-blue-400/10 text-blue-900 dark:text-blue-200 text-xs font-semibold border border-blue-500/20">Phase 2 Defers</span> - so both sides agree on exact contract boundaries.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs">
              <span className="font-mono font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 text-[11px]">
                02 / SCOPE CONTROL
              </span>
              <span className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                <span>View Hierarchy</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="group relative bg-white dark:bg-[#13161F] p-8 rounded-2xl border border-neutral-200/90 dark:border-neutral-800/90 shadow-sm hover:shadow-[0_22px_45px_-12px_rgba(0,0,0,0.22),0_10px_20px_-8px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_25px_55px_-12px_rgba(0,0,0,0.92),0_0_0_1px_rgba(255,255,255,0.14)] hover:-translate-y-2.5 transition-all duration-300 ease-out flex flex-col justify-between overflow-hidden cursor-pointer">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/80 shadow-2xs group-hover:scale-110 group-hover:rotate-1 transition-all duration-300">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/50">
                  Client Alignment
                </span>
              </div>
              <h3 className="text-xl font-extrabold tracking-tight text-neutral-950 dark:text-white mb-3 group-hover:text-emerald-900 dark:group-hover:text-emerald-200 transition-colors">
                Ready-to-Send Inquiries
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed font-normal">
                Generates <span className="font-semibold text-neutral-900 dark:text-white">polite, professional inquiries</span> crafted to copy-paste straight into Slack or email - resolving open assumptions without friction or delay.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs">
              <span className="font-mono font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 text-[11px]">
                03 / CLIENT COMM
              </span>
              <span className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                <span>View Templates</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
