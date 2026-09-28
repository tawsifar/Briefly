"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Sparkles, CheckCircle2, HelpCircle, Clock, Layers, ArrowUpRight } from "lucide-react";

interface NodeItem {
  id: string;
  category: "SCOPE" | "TIMELINE" | "AMBIGUITY" | "POSSIBLE INTEGRATION";
  phrase: string;
  structuredTitle: string;
  structuredDetails: string;
  status: "confirmed" | "ambiguous" | "future";
  color: string;
  bgHighlight: string;
}

const NODES: NodeItem[] = [
  {
    id: "scope",
    category: "SCOPE",
    phrase: "around five pages: home, about, products, contact, and maybe something for customers",
    structuredTitle: "5-Page Marketing Architecture",
    structuredDetails: "Home, About, Products, Contact + 5th customer page (to be clarified)",
    status: "confirmed",
    color: "border-blue-500 text-blue-700 bg-blue-50",
    bgHighlight: "bg-blue-100/90 text-blue-900 ring-1 ring-blue-300 font-medium px-1 rounded",
  },
  {
    id: "timeline",
    category: "TIMELINE",
    phrase: "before the middle of October",
    structuredTitle: "Target Launch: Mid-October",
    structuredDetails: "Ambiguous date constraint. Recommendation: confirm specific launch calendar cutoff.",
    status: "ambiguous",
    color: "border-amber-500 text-amber-700 bg-amber-50",
    bgHighlight: "bg-amber-100/90 text-amber-900 ring-1 ring-amber-300 font-medium px-1 rounded",
  },
  {
    id: "aesthetic",
    category: "AMBIGUITY",
    phrase: "kind of like Apple but maybe darker",
    structuredTitle: "Visual Reference: Dark Minimalism",
    structuredDetails: "Subjective reference. AI generated question: Typography, motion, or product renders?",
    status: "ambiguous",
    color: "border-purple-500 text-purple-700 bg-purple-50",
    bgHighlight: "bg-purple-100/90 text-purple-900 ring-1 ring-purple-300 font-medium px-1 rounded",
  },
  {
    id: "integration",
    category: "POSSIBLE INTEGRATION",
    phrase: "maybe WhatsApp integration could be useful",
    structuredTitle: "Phase 2 Candidate: WhatsApp Chat",
    structuredDetails: "Flagged as nice-to-have. Suggestion: Start with direct click-to-chat link.",
    status: "future",
    color: "border-emerald-500 text-emerald-700 bg-emerald-50",
    bgHighlight: "bg-emerald-100/90 text-emerald-900 ring-1 ring-emerald-300 font-medium px-1 rounded",
  },
];

export function TransformationDemo({ onTryDemo }: { onTryDemo?: () => void }) {
  const [activeNode, setActiveNode] = useState<string>("scope");
  const [isTransformed, setIsTransformed] = useState<boolean>(true);

  const selected = NODES.find((n) => n.id === activeNode) || NODES[0];

  return (
    <section className="w-full py-16 sm:py-24 bg-gradient-to-b from-[#FBFBFA] via-neutral-100/50 to-[#FBFBFA] border-y border-neutral-200/80 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 text-white text-xs font-semibold mb-4 tracking-wide shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Interactive Transformation Engine</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">
            From conversational chaos to operational certainty.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-neutral-600">
            Hover over the extracted zones below to see how Briefly maps raw client sentences directly into verified project deliverables.
          </p>
        </div>

        {/* Demo Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left: Raw Messy Client Message */}
          <div className="lg:col-span-6 flex flex-col justify-between bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200/90 shadow-sm relative">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-rose-400/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                  <span className="ml-2 text-xs font-mono text-neutral-400">client-chat-transcript.txt</span>
                </div>
                <span className="text-[11px] font-medium text-neutral-400 px-2 py-0.5 bg-neutral-100 rounded">
                  Raw Input (Unstructured)
                </span>
              </div>

              {/* Message text with interactive highlights */}
              <div className="text-sm sm:text-base leading-relaxed text-neutral-700 font-sans space-y-3">
                <p>
                  &ldquo;Hey, can you make us a website{" "}
                  <button
                    onClick={() => setActiveNode("aesthetic")}
                    onMouseEnter={() => setActiveNode("aesthetic")}
                    className={`transition-all duration-150 text-left ${
                      activeNode === "aesthetic"
                        ? "bg-purple-200 text-purple-950 font-semibold ring-2 ring-purple-400 rounded px-1"
                        : "hover:bg-purple-100/70 text-purple-900 border-b border-dashed border-purple-400 cursor-pointer"
                    }`}
                  >
                    kind of like Apple but maybe darker
                  </button>
                  ? We need{" "}
                  <button
                    onClick={() => setActiveNode("scope")}
                    onMouseEnter={() => setActiveNode("scope")}
                    className={`transition-all duration-150 text-left ${
                      activeNode === "scope"
                        ? "bg-blue-200 text-blue-950 font-semibold ring-2 ring-blue-400 rounded px-1"
                        : "hover:bg-blue-100/70 text-blue-900 border-b border-dashed border-blue-400 cursor-pointer"
                    }`}
                  >
                    around five pages: home, about, products, contact, and maybe something for customers
                  </button>
                  . We want it{" "}
                  <button
                    onClick={() => setActiveNode("timeline")}
                    onMouseEnter={() => setActiveNode("timeline")}
                    className={`transition-all duration-150 text-left ${
                      activeNode === "timeline"
                        ? "bg-amber-200 text-amber-950 font-semibold ring-2 ring-amber-400 rounded px-1"
                        : "hover:bg-amber-100/70 text-amber-900 border-b border-dashed border-amber-400 cursor-pointer"
                    }`}
                  >
                    before the middle of October
                  </button>
                  . We already have the logo but we&apos;re still working on product images. Also{" "}
                  <button
                    onClick={() => setActiveNode("integration")}
                    onMouseEnter={() => setActiveNode("integration")}
                    className={`transition-all duration-150 text-left ${
                      activeNode === "integration"
                        ? "bg-emerald-200 text-emerald-950 font-semibold ring-2 ring-emerald-400 rounded px-1"
                        : "hover:bg-emerald-100/70 text-emerald-900 border-b border-dashed border-emerald-400 cursor-pointer"
                    }`}
                  >
                    maybe WhatsApp integration could be useful
                  </button>
                  . It should obviously look good on mobile. We&apos;d like the homepage to feel premium and not too crowded.&rdquo;
                </p>
              </div>
            </div>

            {/* Micro hint */}
            <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                4 Key Requirements Detected
              </span>
              <span className="font-mono text-[11px]">346 characters</span>
            </div>
          </div>

          {/* Center connector icon (visible on desktop) */}
          <div className="hidden lg:flex col-span-12 -my-6 items-center justify-center pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center shadow-md">
              <ArrowRight className="w-5 h-5 text-neutral-100" />
            </div>
          </div>

          {/* Right: Live Structured Output Canvas */}
          <div className="lg:col-span-6 flex flex-col justify-between bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200/90 shadow-sm relative">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-900" />
                  <span className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
                    Structured Extraction
                  </span>
                </div>
                <span className="text-xs text-neutral-500 font-medium">Confidence: 86%</span>
              </div>

              {/* Category Pills Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                {NODES.map((node) => {
                  const isCurrent = node.id === activeNode;
                  return (
                    <button
                      key={node.id}
                      onClick={() => setActiveNode(node.id)}
                      onMouseEnter={() => setActiveNode(node.id)}
                      className={`text-left px-2.5 py-2 rounded-lg border text-xs font-medium transition-all ${
                        isCurrent
                          ? "border-neutral-900 bg-neutral-900 text-white shadow-sm"
                          : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                      }`}
                    >
                      <div className="text-[10px] uppercase font-mono opacity-80">{node.category}</div>
                      <div className="truncate font-semibold mt-0.5">{node.id}</div>
                    </button>
                  );
                })}
              </div>

              {/* Active Card Showcase */}
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="p-5 rounded-xl border border-neutral-200 bg-neutral-50/60 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white border border-neutral-200 text-neutral-700">
                    {selected.category}
                  </span>
                  <span className="text-xs font-medium text-neutral-500">
                    {selected.status === "confirmed" && "Verified Scope"}
                    {selected.status === "ambiguous" && "Needs Clarification"}
                    {selected.status === "future" && "Phase 2 Consideration"}
                  </span>
                </div>

                <h4 className="text-base sm:text-lg font-bold text-neutral-900 leading-snug">
                  {selected.structuredTitle}
                </h4>

                <p className="text-sm text-neutral-600 leading-relaxed">
                  {selected.structuredDetails}
                </p>

                <div className="p-3 bg-white rounded-lg border border-neutral-200/80 text-xs">
                  <span className="font-semibold text-neutral-700 block mb-1">Source Excerpt:</span>
                  <span className="italic text-neutral-600">&ldquo;{selected.phrase}&rdquo;</span>
                </div>
              </motion.div>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
              <span className="text-xs text-neutral-500">
                Ready to extract your own requirements?
              </span>
              <button
                id="demo-try-now-btn"
                onClick={onTryDemo}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-900 hover:text-neutral-700 underline underline-offset-4"
              >
                <span>Load ACME brief</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
