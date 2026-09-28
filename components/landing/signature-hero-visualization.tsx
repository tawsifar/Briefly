"use client";

import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  ArrowRight,
  RotateCcw,
  Play,
  Check,
  AlertTriangle,
  Layers,
  HelpCircle,
  Clock,
  ArrowUpRight,
  FileText,
  ListTodo,
  ExternalLink,
  ChevronRight,
  Terminal,
} from "lucide-react";

export interface HeroRequirementItem {
  id: string;
  phrase: string;
  category: "SCOPE" | "TIMELINE" | "AMBIGUITY" | "POSSIBLE INTEGRATION" | "REQUIREMENT";
  title: string;
  detail: string;
  badge: string;
  color: string;
  darkColor: string;
  // Deep explanation for hover intelligence & "Why this matters"
  sourceQuote: string;
  interpretation: string;
  action: string;
  confidence: string;
  impactTag: string;
}

export const HERO_REQUIREMENT_ITEMS: HeroRequirementItem[] = [
  {
    id: "scope",
    phrase: "five pages",
    category: "SCOPE",
    title: "5-Page Website",
    detail: "Home, About, Products, Contact, and a customer area.",
    badge: "CONFIRMED CORE",
    color: "#2563EB", // Blue
    darkColor: "#60A5FA",
    sourceQuote: "around five pages, home, about, products, contact and maybe something for customers",
    interpretation: "Five core pages identified, with an additional customer section requiring clarity on whether it is an informational page or login area.",
    action: "Confirm customer section scope before finalizing development timeline.",
    confidence: "94%",
    impactTag: "Scope boundary",
  },
  {
    id: "timeline",
    phrase: "middle of October",
    category: "TIMELINE",
    title: "Target: Mid-October",
    detail: "Estimated launch window. Needs a confirmed delivery date.",
    badge: "TARGET DATE",
    color: "#D97706", // Amber
    darkColor: "#FBBF24",
    sourceQuote: "We want it before the middle of October",
    interpretation: "Client specified a target window around mid-October without setting a firm calendar cutoff or approval milestones.",
    action: "Agree on a formal milestone schedule and sign-off deadlines with the client.",
    confidence: "78%",
    impactTag: "Timeline planning",
  },
  {
    id: "ambiguity",
    phrase: "like Apple",
    category: "AMBIGUITY",
    title: "“Like Apple” Visual Reference",
    detail: "Broad design benchmark. Needs concrete reference sites or brand moodboard.",
    badge: "NEEDS CLARIFICATION",
    color: "#E11D48", // Rose / Red-Coral
    darkColor: "#FB7185",
    sourceQuote: "website kind of like Apple but maybe darker",
    interpretation: "Client references a well-known brand style without providing specific UI examples, color palettes, or layout preferences.",
    action: "Ask the client for 2–3 reference websites that showcase the look and feel they want.",
    confidence: "42%",
    impactTag: "Design clarity",
  },
  {
    id: "integration",
    phrase: "WhatsApp integration",
    category: "POSSIBLE INTEGRATION",
    title: "WhatsApp Integration",
    detail: "Client inquiry. Clarify if direct chat button or messaging API is required.",
    badge: "OPTIONAL ADD-ON",
    color: "#059669", // Emerald
    darkColor: "#34D399",
    sourceQuote: "Also maybe WhatsApp integration could be useful",
    interpretation: "Client mentioned WhatsApp as a nice-to-have exploratory feature rather than an initial launch blocker.",
    action: "Recommend a simple click-to-chat button for launch, with automated features deferred to Phase 2.",
    confidence: "68%",
    impactTag: "Scope management",
  },
  {
    id: "requirement",
    phrase: "mobile",
    category: "REQUIREMENT",
    title: "Mobile Responsiveness",
    detail: "Layouts optimized for mobile phones and tablet devices.",
    badge: "CONFIRMED CORE",
    color: "#0284C7", // Cyan
    darkColor: "#38BDF8",
    sourceQuote: "It should obviously look good on mobile",
    interpretation: "Standard requirement for responsive mobile layouts and touch-friendly navigation across all pages.",
    action: "Design responsive layouts for all core pages.",
    confidence: "98%",
    impactTag: "Core requirement",
  },
];

// Exact technical status states requested by the user
export const STATUS_STATES = [
  "Extracting key intent...",
  "5 items detected",
  "Mapping source phrases...",
  "Building project structure...",
  "Brief ready for review",
];

export function SignatureHeroVisualization() {
  const containerRef = useRef<HTMLDivElement>(null);
  const phraseRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Active / Focused item across the synchronized system
  const [activeItemId, setActiveItemId] = useState<string>("ambiguity");
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [isAutoCycling, setIsAutoCycling] = useState<boolean>(true);

  // Bottom-left live status text state
  const [statusIndex, setStatusIndex] = useState<number>(0);

  // Active execution track tab: 'immediate' | 'risks' | 'handoff'
  const [executionTab, setExecutionTab] = useState<"immediate" | "risks" | "handoff">("immediate");

  // Measured coordinates for SVG bezier connectors
  const [coords, setCoords] = useState<
    Record<string, { startX: number; startY: number; endX: number; endY: number }>
  >({});

  // Effective highlight target (hover takes immediate precedence over auto cycle)
  const currentHighlightedId = hoveredItemId || activeItemId;
  const currentItem =
    HERO_REQUIREMENT_ITEMS.find((item) => item.id === currentHighlightedId) ||
    HERO_REQUIREMENT_ITEMS[0];

  // Recalculate connector paths from source phrases to destination cards
  const updateCoordinates = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newCoords: Record<
      string,
      { startX: number; startY: number; endX: number; endY: number }
    > = {};

    HERO_REQUIREMENT_ITEMS.forEach((item) => {
      const pEl = phraseRefs.current[item.id];
      const cEl = cardRefs.current[item.id];

      if (pEl && cEl) {
        const pRect = pEl.getBoundingClientRect();
        const cRect = cEl.getBoundingClientRect();

        newCoords[item.id] = {
          startX: Math.round(pRect.right - containerRect.left + 2),
          startY: Math.round(pRect.top + pRect.height / 2 - containerRect.top),
          endX: Math.round(cRect.left - containerRect.left - 2),
          endY: Math.round(cRect.top + cRect.height / 2 - containerRect.top),
        };
      }
    });

    setCoords(newCoords);
  }, []);

  // Update coordinates whenever active item changes or after layout settles
  useLayoutEffect(() => {
    updateCoordinates();
    const timer1 = setTimeout(updateCoordinates, 50);
    const timer2 = setTimeout(updateCoordinates, 200);
    const timer3 = setTimeout(updateCoordinates, 400);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [currentHighlightedId, updateCoordinates]);

  // Window resize & ResizeObserver on container
  useEffect(() => {
    const handleResize = () => updateCoordinates();
    window.addEventListener("resize", handleResize);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && containerRef.current) {
      ro = new ResizeObserver(() => updateCoordinates());
      ro.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      ro?.disconnect();
    };
  }, [updateCoordinates]);

  // Natural loop: Highlights items one-by-one sequentially
  useEffect(() => {
    if (!isAutoCycling || hoveredItemId !== null) return;

    const interval = setInterval(() => {
      setActiveItemId((prev) => {
        const currentIndex = HERO_REQUIREMENT_ITEMS.findIndex((p) => p.id === prev);
        const nextId =
          HERO_REQUIREMENT_ITEMS[(currentIndex + 1) % HERO_REQUIREMENT_ITEMS.length].id;
        return nextId;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoCycling, hoveredItemId]);

  // Cycle bottom-left status monitor text automatically
  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % STATUS_STATES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const handleManualSelect = (id: string) => {
    setActiveItemId(id);
    setIsAutoCycling(false);
  };

  return (
    <div
      ref={containerRef}
      id="hero-intelligence-system"
      className="relative w-full mt-10 lg:mt-12 bg-white dark:bg-[#12151D] rounded-3xl border border-neutral-200/90 dark:border-neutral-800 hero-dashboard-floating-shadow animate-float-dashboard hover:[animation-play-state:paused] overflow-hidden text-neutral-900 dark:text-neutral-100 transition-colors"
    >
      {/* SVG Defs for Glow Filter & Traveling Particles */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <filter id="hero-soft-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
      </svg>

      {/* TOP SYSTEM BAR - FLOATING HEADER WITH ANTIQUE-WHITE BACKGROUND */}
      <div
        className="px-5 py-3 border-b border-[#E5D7C3] dark:border-neutral-800 flex items-center justify-between text-xs relative z-10 shadow-2xs"
        style={{ backgroundColor: "antiquewhite" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] border border-[#E0443E]/50 shadow-2xs" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50 shadow-2xs" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] border border-[#1AAB29]/50 shadow-2xs" />
          </div>
          <div className="flex items-center gap-2 pl-2 border-l border-neutral-300/80 dark:border-neutral-400/40">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-800">
              MESSY INPUT
            </span>
            <span className="text-neutral-400 font-mono">→</span>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-800">
              EXTRACTION
            </span>
            <span className="text-neutral-400 font-mono">→</span>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-800">
              INTERPRETATION
            </span>
            <span className="text-neutral-400 font-mono">→</span>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-800">
              STRUCTURED BRIEF
            </span>
            <span className="text-neutral-400 font-mono">→</span>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-950 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              EXECUTION
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block text-[11px] text-neutral-600 font-mono">
            {hoveredItemId
              ? "Inspecting link"
              : isAutoCycling
              ? "Sequential cycle active"
              : "Manual inspect"}
          </span>
          <button
            onClick={() => setIsAutoCycling(!isAutoCycling)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono font-medium text-neutral-800 hover:bg-white/80 border border-neutral-300/80 bg-white/50 transition-colors cursor-pointer shadow-2xs"
            title={isAutoCycling ? "Pause auto-loop" : "Resume auto-loop"}
          >
            {isAutoCycling ? (
              <>
                <RotateCcw className="w-3 h-3 text-neutral-600" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-emerald-600" />
                <span>Auto-play</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* DYNAMIC SVG CONNECTOR PATHS (Desktop Overlay) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-20 hidden lg:block"
        xmlns="http://www.w3.org/2000/svg"
      >
        {HERO_REQUIREMENT_ITEMS.map((item) => {
          const c = coords[item.id];
          if (!c || c.startX <= 0 || c.endX <= 0) return null;

          const isHighlighted = item.id === currentHighlightedId;
          const dx = Math.max(30, c.endX - c.startX);
          const curvature = Math.max(32, dx * 0.44);
          const pathD = `M ${c.startX} ${c.startY} C ${c.startX + curvature} ${c.startY}, ${c.endX - curvature} ${c.endY}, ${c.endX} ${c.endY}`;

          return (
            <g
              key={item.id}
              className="transition-all duration-300"
              style={{ opacity: isHighlighted ? 1 : 0.28 }}
            >
              {/* Subtle guide baseline */}
              <path
                d={pathD}
                fill="none"
                stroke={item.color}
                strokeWidth={isHighlighted ? 2 : 1}
                strokeDasharray={isHighlighted ? "none" : "3 4"}
                strokeOpacity={isHighlighted ? 0.35 : 0.18}
                strokeLinecap="round"
              />

              {/* Animated dotted/dashed connector path with continuous flow */}
              <path
                d={pathD}
                fill="none"
                stroke={item.color}
                strokeWidth={isHighlighted ? 2.25 : 1.2}
                strokeDasharray="4 6"
                strokeOpacity={isHighlighted ? 0.95 : 0.4}
                strokeLinecap="round"
                filter={isHighlighted ? "url(#hero-soft-glow)" : undefined}
                className={isHighlighted ? "connector-flow-dash" : undefined}
              />

              {/* Animated particle moving along connector path */}
              <circle
                r={isHighlighted ? 3.5 : 2.5}
                fill={item.color}
                opacity={isHighlighted ? 1 : 0.55}
                filter={isHighlighted ? "url(#hero-soft-glow)" : undefined}
              >
                <animateMotion
                  path={pathD}
                  dur={isHighlighted ? "2.2s" : "3.6s"}
                  repeatCount="indefinite"
                />
              </circle>

              {/* Source anchor point at raw text */}
              <circle
                cx={c.startX}
                cy={c.startY}
                r={isHighlighted ? 3.5 : 2}
                fill={item.color}
                opacity={isHighlighted ? 1 : 0.4}
              />

              {/* Destination anchor point at structured brief card */}
              <circle
                cx={c.endX}
                cy={c.endY}
                r={isHighlighted ? 3.5 : 2}
                fill={item.color}
                opacity={isHighlighted ? 1 : 0.4}
              />
            </g>
          );
        })}
      </svg>

      {/* MAIN SPLIT PANELS AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-neutral-100 dark:divide-neutral-800 relative z-10">
        {/* LEFT SIDE: Realistic Messy Client Message Document */}
        <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between bg-[#FBFBFA]/60 dark:bg-[#0F1219]">
          <div>
            {/* Metadata Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center font-bold text-xs">
                  M
                </div>
                <div>
                  <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                    Marcus Vance
                  </div>
                  <div className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">
                    Slack #project-kickoff · 10:42 AM
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 font-medium">
                  STEP 1: MESSY INPUT
                </span>
              </div>
            </div>

            {/* Client message box with coordinated highlighted phrases */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#161A24] border border-neutral-200/90 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 text-sm sm:text-base leading-relaxed space-y-3 font-normal shadow-2xs">
              <p className="leading-relaxed">
                &ldquo;Hey, can you make us a website kind of{" "}
                <button
                  id="phrase-ambiguity-btn"
                  ref={(el) => {
                    phraseRefs.current["ambiguity"] = el;
                  }}
                  onMouseEnter={() => setHoveredItemId("ambiguity")}
                  onMouseLeave={() => setHoveredItemId(null)}
                  onClick={() => handleManualSelect("ambiguity")}
                  className={`inline transition-all duration-200 cursor-pointer rounded px-1.5 py-0.5 font-medium ${
                    currentHighlightedId === "ambiguity"
                      ? "bg-rose-100 text-rose-950 dark:bg-rose-950/90 dark:text-rose-200 ring-2 ring-rose-500 font-semibold shadow-xs"
                      : "text-rose-700 dark:text-rose-300 border-b border-rose-400/80 border-dashed hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  }`}
                  title="Hover or click to inspect: 'like Apple' → AMBIGUITY"
                >
                  like Apple
                </button>{" "}
                but maybe darker? We need around{" "}
                <button
                  id="phrase-scope-btn"
                  ref={(el) => {
                    phraseRefs.current["scope"] = el;
                  }}
                  onMouseEnter={() => setHoveredItemId("scope")}
                  onMouseLeave={() => setHoveredItemId(null)}
                  onClick={() => handleManualSelect("scope")}
                  className={`inline transition-all duration-200 cursor-pointer rounded px-1.5 py-0.5 font-medium ${
                    currentHighlightedId === "scope"
                      ? "bg-blue-100 text-blue-950 dark:bg-blue-950/90 dark:text-blue-200 ring-2 ring-blue-500 font-semibold shadow-xs"
                      : "text-blue-700 dark:text-blue-300 border-b border-blue-400/80 border-dashed hover:bg-blue-50 dark:hover:bg-blue-950/40"
                  }`}
                  title="Hover or click to inspect: 'five pages' → SCOPE"
                >
                  five pages
                </button>
                , home, about, products, contact and maybe something for customers. We want it before
                the{" "}
                <button
                  id="phrase-timeline-btn"
                  ref={(el) => {
                    phraseRefs.current["timeline"] = el;
                  }}
                  onMouseEnter={() => setHoveredItemId("timeline")}
                  onMouseLeave={() => setHoveredItemId(null)}
                  onClick={() => handleManualSelect("timeline")}
                  className={`inline transition-all duration-200 cursor-pointer rounded px-1.5 py-0.5 font-medium ${
                    currentHighlightedId === "timeline"
                      ? "bg-amber-100 text-amber-950 dark:bg-amber-950/90 dark:text-amber-200 ring-2 ring-amber-500 font-semibold shadow-xs"
                      : "text-amber-700 dark:text-amber-300 border-b border-amber-400/80 border-dashed hover:bg-amber-50 dark:hover:bg-amber-950/40"
                  }`}
                  title="Hover or click to inspect: 'middle of October' → TIMELINE"
                >
                  middle of October
                </button>
                . We already have the logo but we&apos;re still working on the product images. Also maybe{" "}
                <button
                  id="phrase-integration-btn"
                  ref={(el) => {
                    phraseRefs.current["integration"] = el;
                  }}
                  onMouseEnter={() => setHoveredItemId("integration")}
                  onMouseLeave={() => setHoveredItemId(null)}
                  onClick={() => handleManualSelect("integration")}
                  className={`inline transition-all duration-200 cursor-pointer rounded px-1.5 py-0.5 font-medium ${
                    currentHighlightedId === "integration"
                      ? "bg-emerald-100 text-emerald-950 dark:bg-emerald-950/90 dark:text-emerald-200 ring-2 ring-emerald-500 font-semibold shadow-xs"
                      : "text-emerald-700 dark:text-emerald-300 border-b border-emerald-400/80 border-dashed hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                  }`}
                  title="Hover or click to inspect: 'WhatsApp integration' → POSSIBLE INTEGRATION"
                >
                  WhatsApp integration
                </button>{" "}
                could be useful. It should obviously look good on{" "}
                <button
                  id="phrase-requirement-btn"
                  ref={(el) => {
                    phraseRefs.current["requirement"] = el;
                  }}
                  onMouseEnter={() => setHoveredItemId("requirement")}
                  onMouseLeave={() => setHoveredItemId(null)}
                  onClick={() => handleManualSelect("requirement")}
                  className={`inline transition-all duration-200 cursor-pointer rounded px-1.5 py-0.5 font-medium ${
                    currentHighlightedId === "requirement"
                      ? "bg-cyan-100 text-cyan-950 dark:bg-cyan-950/90 dark:text-cyan-200 ring-2 ring-cyan-500 font-semibold shadow-xs"
                      : "text-cyan-700 dark:text-cyan-300 border-b border-cyan-400/80 border-dashed hover:bg-cyan-50 dark:hover:bg-cyan-950/40"
                  }`}
                  title="Hover or click to inspect: 'mobile' → REQUIREMENT"
                >
                  mobile
                </button>
                .&rdquo;
              </p>
            </div>
          </div>

          <div className="mt-6 pt-3 flex items-center justify-between text-xs text-neutral-400 dark:text-neutral-500 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-600" />
              Hover any phrase to test coordinated system routing
            </span>
            <span>5 phrases linked</span>
          </div>
        </div>

        {/* RIGHT SIDE: Structured Briefly Intelligence Panel */}
        <div className="lg:col-span-6 p-6 sm:p-8 bg-white dark:bg-[#13161F] flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  STEP 4: STRUCTURED BRIEF
                </span>
                <h3 className="text-base font-bold text-neutral-950 dark:text-white tracking-tight">
                  Extracted Requirements Matrix
                </h3>
              </div>
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                LIVE INTERPRETATION
              </span>
            </div>

            {/* Coordinated Structured Cards */}
            <div className="space-y-2.5">
              {HERO_REQUIREMENT_ITEMS.map((item) => {
                const isSelected = item.id === currentHighlightedId;

                return (
                  <motion.div
                    key={item.id}
                    id={`brief-card-${item.id}`}
                    ref={(el) => {
                      cardRefs.current[item.id] = el;
                    }}
                    onMouseEnter={() => setHoveredItemId(item.id)}
                    onMouseLeave={() => setHoveredItemId(null)}
                    onClick={() => handleManualSelect(item.id)}
                    animate={{
                      scale: isSelected ? 1.015 : 1,
                      x: isSelected ? 3 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                    className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "bg-neutral-50 dark:bg-[#181D28] shadow-md ring-1 ring-neutral-300 dark:ring-neutral-700"
                        : "bg-white dark:bg-[#151922] border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 opacity-70 hover:opacity-100"
                    }`}
                    style={{
                      borderColor: isSelected ? item.color : undefined,
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] font-mono font-bold uppercase tracking-wider"
                          style={{ color: item.color }}
                        >
                          {item.category}
                        </span>
                        <ArrowRight className="w-3 h-3 text-neutral-300 dark:text-neutral-600" />
                        <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                          {item.title}
                        </span>
                      </div>

                      <span
                        className="text-[9px] font-mono uppercase font-semibold px-2 py-0.5 rounded border"
                        style={{
                          color: item.color,
                          borderColor: `${item.color}40`,
                          backgroundColor: `${item.color}15`,
                        }}
                      >
                        {item.badge}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed pl-0.5">
                      {item.detail}
                    </p>

                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] font-mono"
                      >
                        <span className="text-neutral-400 dark:text-neutral-500">
                          Source Anchor: &ldquo;{item.phrase}&rdquo;
                        </span>
                        <span
                          className="font-semibold flex items-center gap-1"
                          style={{ color: item.color }}
                        >
                          <Check className="w-3 h-3" /> Interpreted & Structured
                        </span>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 font-mono">
            <span>
              Active sync:{" "}
              <strong className="text-neutral-900 dark:text-neutral-100">
                &ldquo;{currentItem.phrase}&rdquo;
              </strong>{" "}
              → {currentItem.category}
            </span>
            <span className="text-[11px] text-neutral-400">Coordinated node lock</span>
          </div>
        </div>
      </div>

      {/* BOTTOM SYSTEM BAR: TEXT ACTIVITY STATUS & HOVER INTELLIGENCE WIDGET */}
      <div className="px-6 py-4 bg-[#FBFBFA] dark:bg-[#11141C] border-t border-neutral-200/80 dark:border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* BOTTOM-LEFT: Tiny Technical Status Monitor */}
        <div
          id="hero-status-monitor"
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#161B24] border border-neutral-200/80 dark:border-neutral-700 shadow-2xs"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>

          <div className="h-4 overflow-hidden relative min-w-[190px]">
            <AnimatePresence mode="wait">
              <motion.span
                key={statusIndex}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="absolute inset-0 font-mono text-[11px] font-medium tracking-tight text-neutral-800 dark:text-neutral-200 flex items-center"
              >
                {STATUS_STATES[statusIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* BOTTOM-RIGHT: EXECUTION ROADMAP & ACTIONS */}
        <div
          id="hero-execution-panel"
          className="w-full sm:w-[480px] rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-[#161B24] p-3.5 shadow-sm"
        >
          {/* Header & Tabs */}
          <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-neutral-900 dark:text-white flex items-center gap-1">
                <ListTodo className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
                <span>STEP 5: EXECUTION</span>
              </h4>
            </div>

            {/* Sub-tabs */}
            <div className="flex items-center p-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 text-[10px] font-mono">
              <button
                id="hero-exec-immediate-tab"
                onClick={() => setExecutionTab("immediate")}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer font-medium ${
                  executionTab === "immediate"
                    ? "bg-white dark:bg-[#11141C] text-neutral-950 dark:text-white font-bold shadow-2xs"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
                }`}
              >
                Immediate (3)
              </button>
              <button
                id="hero-exec-risks-tab"
                onClick={() => setExecutionTab("risks")}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer font-medium ${
                  executionTab === "risks"
                    ? "bg-white dark:bg-[#11141C] text-neutral-950 dark:text-white font-bold shadow-2xs"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
                }`}
              >
                Risks (2)
              </button>
              <button
                id="hero-exec-handoff-tab"
                onClick={() => setExecutionTab("handoff")}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer font-medium ${
                  executionTab === "handoff"
                    ? "bg-white dark:bg-[#11141C] text-neutral-950 dark:text-white font-bold shadow-2xs"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
                }`}
              >
                Handoff
              </button>
            </div>
          </div>

          {/* Dynamic Tab Body */}
          <div className="min-h-[82px] flex flex-col justify-center">
            {executionTab === "immediate" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-neutral-50 dark:bg-[#10141C] border border-neutral-100 dark:border-neutral-800/80">
                  <span className="flex items-center gap-2 font-medium text-neutral-800 dark:text-neutral-200 truncate">
                    <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-mono flex items-center justify-center font-bold shrink-0">
                      1
                    </span>
                    <span>Ask client for 2–3 reference links to clarify visual expectations</span>
                  </span>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 shrink-0 border border-amber-200 dark:border-amber-900">
                    High Priority
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-neutral-50 dark:bg-[#10141C] border border-neutral-100 dark:border-neutral-800/80">
                  <span className="flex items-center gap-2 font-medium text-neutral-800 dark:text-neutral-200 truncate">
                    <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-mono flex items-center justify-center font-bold shrink-0">
                      2
                    </span>
                    <span>Confirm launch calendar deadline and milestone review dates</span>
                  </span>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 shrink-0 border border-blue-200 dark:border-blue-900">
                    Milestone
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-neutral-50 dark:bg-[#10141C] border border-neutral-100 dark:border-neutral-800/80">
                  <span className="flex items-center gap-2 font-medium text-neutral-800 dark:text-neutral-200 truncate">
                    <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-mono flex items-center justify-center font-bold shrink-0">
                      3
                    </span>
                    <span>Clarify whether customer area requires an account login</span>
                  </span>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 shrink-0 border border-emerald-200 dark:border-emerald-900">
                    Scope Fence
                  </span>
                </div>
              </div>
            )}

            {executionTab === "risks" && (
              <div className="space-y-1.5">
                <div className="flex items-start gap-2 p-1.5 rounded-lg bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/60 text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div className="leading-tight">
                    <strong className="text-rose-900 dark:text-rose-200 font-bold block">
                      Undefined &ldquo;Customer Area&rdquo;
                    </strong>
                    <span className="text-neutral-600 dark:text-neutral-400 text-[10px]">
                      Client hinted at an area for customers. Clarify whether this is an account login or simple informational page.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-1.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/60 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="leading-tight">
                    <strong className="text-amber-900 dark:text-amber-200 font-bold block">
                      Product Photography Pending
                    </strong>
                    <span className="text-neutral-600 dark:text-neutral-400 text-[10px]">
                      Product images are still being created. Agree on placeholders so design work can proceed on time.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {executionTab === "handoff" && (
              <div className="p-2 rounded-lg bg-neutral-50 dark:bg-[#11141C] border border-neutral-100 dark:border-neutral-800 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
                    <Terminal className="w-3 h-3 text-neutral-400" />
                    <span>Deliverable Formats Ready:</span>
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold text-[10px]">
                    ● 3 synced targets
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-[10px]">
                  <div className="p-1 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 font-medium">
                    Linear Issues
                  </div>
                  <div className="p-1 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 font-medium">
                    Jira Epics
                  </div>
                  <div className="p-1 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 font-medium">
                    Client PDF
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Micro Footer Action */}
          <div className="mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[10px] font-mono text-neutral-400 dark:text-neutral-500">
            <span>Linked to active brief &ldquo;{currentItem.title}&rdquo;</span>
            <span className="flex items-center gap-0.5 text-neutral-700 dark:text-neutral-300 font-semibold hover:underline cursor-pointer">
              <span>View full sprint plan</span>
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
