"use client";

import React, { useState, useSyncExternalStore } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ProjectBrief,
  DeliverableItem,
  StructuredAmbiguity,
  StructuredQuestion,
  OutOfScopeItem,
  StructuredRisk,
  formatStandardDate,
} from "@/lib/types";
import { normalizeBrief } from "@/lib/normalize-brief";
import { computeClarityBand } from "@/lib/ai/validation";
import { getStoredBriefs, subscribeToBriefs } from "@/lib/storage";
import { SAMPLE_ACME_BRIEF, INITIAL_BRIEFS_LIST } from "@/lib/sample-data";
import { exportBriefToPdf } from "@/lib/export-pdf";
import {
  CheckCircle2,
  Copy,
  Download,
  ArrowRight,
} from "lucide-react";

export default function SharePage() {
  const params = useParams();
  const id = params?.id as string;
  const [copied, setCopied] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);

  // Only the sample or a brief saved in this browser can be shown; never substitute another brief (BUG-33).
  // Same hydration-safe store as the main app, so server and client render the same first pass.
  const stored = useSyncExternalStore(subscribeToBriefs, getStoredBriefs, () => INITIAL_BRIEFS_LIST);
  const brief = stored.find((b) => b.id === id) ?? (id === SAMPLE_ACME_BRIEF.id ? SAMPLE_ACME_BRIEF : null);

  if (!brief) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] dark:bg-[#0D1117] flex items-center justify-center p-4">
        <div className="max-w-md text-center space-y-3">
          <h1 className="text-lg font-bold text-neutral-950 dark:text-white">Brief not found</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            This brief is not saved in this browser. Ask the sender to export it as a PDF instead.
          </p>
          <Link href="/" className="inline-block text-sm font-semibold underline text-neutral-900 dark:text-white">
            Go to Briefly
          </Link>
        </div>
      </div>
    );
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPdf = () => {
    try {
      setDownloading(true);
      exportBriefToPdf(brief);
    } finally {
      setTimeout(() => setDownloading(false), 1000);
    }
  };

  const createdDateStr = brief.createdDateFormatted || formatStandardDate(brief.created_at);
  const isEvidenceChecked = brief.status === "EVIDENCE CHECKED" || brief.status === "complete";
  const statusLabel = isEvidenceChecked ? "EVIDENCE CHECKED" : "NEEDS REVIEW";

  const targetDeadline = brief.targetDeadline;
  const deadlineLine1 = targetDeadline?.displayLine1 || brief.project?.deadline || "Not specified by client";
  const deadlineLine2 = targetDeadline?.displayLine2 || "Exact milestone date to be confirmed.";

  const clarityScore = brief.clarityData?.overall ?? brief.scores?.overall ?? 50;
  const clarityBand =
    brief.clarityData?.band || computeClarityBand(clarityScore);

  const { deliverables, ambiguities, questions, outOfScope, risks } = normalizeBrief(brief);

  const group1OutOfScope = outOfScope.filter((o) => o.group === "Pending client decision");
  const group2OutOfScope = outOfScope.filter((o) => o.group === "Not mentioned, excluded unless confirmed");

  const deliverableGroups: Array<"Pages" | "Design and Experience" | "Content and Assets" | "Features"> = [
    "Pages",
    "Design and Experience",
    "Content and Assets",
    "Features",
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-neutral-900 pb-20">
      {/* Top Banner */}
      <div className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200/80 py-3.5 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
              B
            </div>
            <span className="font-bold text-sm tracking-tight text-neutral-900">Briefly</span>
            <span className="text-xs text-neutral-400 font-mono hidden sm:inline">
              / Shared Project Brief
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? "Copied Link!" : "Copy Link"}</span>
            </button>
            <button
              onClick={handleExportPdf}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer disabled:opacity-60"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? "Downloading..." : "Export PDF"}</span>
            </button>
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-neutral-100 text-neutral-800 hover:bg-neutral-200 text-xs font-semibold rounded-lg transition-colors"
            >
              <span>Build with Briefly</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Brief Document Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 space-y-8">
        <div className="bg-white rounded-2xl border border-neutral-200/90 p-6 sm:p-10 shadow-2xs space-y-10">
          {/* HEADER BLOCK */}
          <div className="pb-6 border-b border-neutral-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4">
              <span className="text-[11px] font-mono font-bold tracking-widest text-neutral-400 uppercase">
                BRIEFLY · INTAKE INTELLIGENCE & PROJECT ALIGNMENT
              </span>
              <span className="text-xs font-mono text-neutral-500">
                {brief.id.startsWith("brief_") ? brief.id.slice(0, 12) : `brief_${brief.id.slice(0, 6)}`} | {createdDateStr}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mt-2">
              <div className="space-y-1">
                <span className="inline-block px-2.5 py-1 rounded bg-neutral-100 text-[11px] font-mono font-bold text-neutral-700 uppercase tracking-wider mb-2">
                  PROJECT BRIEF SPECIFICATION
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
                  {brief.title}
                </h1>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`inline-block px-3 py-1 text-xs font-mono font-bold rounded-lg border uppercase tracking-wider ${
                    isEvidenceChecked
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-amber-50 text-amber-800 border-amber-200"
                  }`}
                >
                  STATUS: {statusLabel}
                </span>
                <p className="text-[11px] text-neutral-400 mt-1 max-w-xs">
                  Quotes checked against the client message. Not yet confirmed with the client.
                </p>
              </div>
            </div>

            {/* Three Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80">
                <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-neutral-400 block mb-1">
                  TARGET DEADLINE
                </span>
                <div className="text-sm font-bold text-neutral-950 leading-snug">
                  {deadlineLine1}
                </div>
                <div className="text-xs text-neutral-500 mt-1">
                  {deadlineLine2}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80">
                <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-neutral-400 block mb-1">
                  CLARITY SCORE
                </span>
                <div className="text-sm font-bold text-neutral-950 flex items-center gap-2">
                  <span>{clarityScore}/100</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-neutral-200/70 text-neutral-700">
                    {clarityBand}
                  </span>
                </div>
                <div className="text-xs text-neutral-500 mt-1">
                  Sum of 6 intake clarity dimensions
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80">
                <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-neutral-400 block mb-1">
                  CREATED DATE
                </span>
                <div className="text-sm font-bold text-neutral-950">
                  {createdDateStr}
                </div>
                <div className="text-xs text-neutral-500 mt-1">
                  Initial intake synthesis
                </div>
              </div>
            </div>
          </div>

          {/* 1. EXECUTIVE SUMMARY & CORE GOAL */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-neutral-950 tracking-tight">
              1. Executive Summary & Core Goal
            </h2>
            <div className="p-4 rounded-xl bg-neutral-50/70 border border-neutral-200/80 space-y-3">
              <div>
                <span className="text-xs font-mono uppercase font-bold text-neutral-500 block mb-1">
                  Project Goal
                </span>
                <p className="text-sm font-medium text-neutral-900">
                  {brief.executiveSummary?.goal || brief.project?.goal}
                </p>
              </div>

              <div className="pt-2 border-t border-neutral-200/60">
                <span className="text-xs font-mono uppercase font-bold text-neutral-500 block mb-1">
                  Executive Summary
                </span>
                <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
                  {brief.executiveSummary?.paragraph || brief.project?.summary}
                </p>
              </div>

              {brief.executiveSummary?.keyFacts && brief.executiveSummary.keyFacts.length > 0 && (
                <div className="pt-3 border-t border-neutral-200/60">
                  <span className="text-[10px] font-mono uppercase font-bold text-neutral-400 block mb-2">
                    Key Facts at a glance
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {brief.executiveSummary.keyFacts.map((fact, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-white border border-neutral-200/70"
                      >
                        <span className="text-[10px] font-mono uppercase font-bold text-neutral-400 block">
                          {fact.label}
                        </span>
                        <span className="text-xs font-semibold text-neutral-800">
                          {fact.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 2. CONFIRMED DELIVERABLES (IN-SCOPE) */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-neutral-950 tracking-tight">
              2. Confirmed Deliverables (In-Scope)
            </h2>
            <div className="space-y-4">
              {deliverableGroups.map((grp) => {
                const itemsInGroup = deliverables.filter((d) => d.group === grp);
                if (itemsInGroup.length === 0) return null;

                return (
                  <div key={grp} className="space-y-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 block">
                      {grp}
                    </span>
                    <div className="grid grid-cols-1 gap-2.5">
                      {itemsInGroup.map((item) => (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-xl border border-neutral-200/80 bg-neutral-50/40 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                        >
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span className="text-sm font-bold text-neutral-900">
                                {item.label}
                              </span>
                            </div>
                            <p className="text-xs text-neutral-600 pl-6">
                              {item.description}
                            </p>
                            {item.evidence && (
                              <div className="pl-6 pt-1">
                                <span className="text-[11px] font-mono italic text-neutral-500 border-l-2 border-neutral-300 pl-2 block">
                                  &ldquo;{item.evidence}&rdquo;
                                </span>
                              </div>
                            )}
                          </div>

                          <span
                            className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded self-start shrink-0 ${
                              item.tag === "Confirmed"
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : "bg-amber-50 text-amber-800 border border-amber-200"
                            }`}
                          >
                            {item.tag}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 3. FLAGGED AMBIGUITIES (REQUIRES ALIGNMENT) */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-neutral-950 tracking-tight">
              3. Flagged Ambiguities (Requires Alignment)
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {ambiguities.map((amb) => {
                const isHigh = amb.severity === "HIGH";
                const isMed = amb.severity === "MEDIUM";

                return (
                  <div
                    key={amb.id}
                    className="p-4 rounded-xl border border-neutral-200/80 bg-neutral-50/40 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                            isHigh
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : isMed
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {amb.severity}
                        </span>
                        <h3 className="text-sm font-bold text-neutral-950">
                          {amb.id}: {amb.title}
                        </h3>
                      </div>
                      <span className="text-xs font-mono text-neutral-500">
                        Linked Question: {amb.linkedQuestionId}
                      </span>
                    </div>

                    {amb.evidence ? (
                      <p className="text-xs font-mono italic text-neutral-500 border-l-2 border-neutral-300 pl-2">
                        Evidence: &ldquo;{amb.evidence}&rdquo;
                      </p>
                    ) : (
                      <p className="text-xs font-mono italic text-neutral-400 pl-2">
                        Not mentioned in the message
                      </p>
                    )}

                    <div className="text-xs space-y-1 pt-1">
                      <p className="text-neutral-800">
                        <strong>What is unclear:</strong> {amb.whatIsUnclear}
                      </p>
                      <p className="text-neutral-600">
                        <strong>Why it matters:</strong> {amb.whyItMatters}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 4. READY-TO-SEND CLIENT QUESTIONS */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-neutral-950 tracking-tight">
              4. Ready-to-Send Client Questions
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className="p-4 rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-4"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-neutral-500">
                      {q.id} ({q.linkedAmbiguityId}):
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-neutral-950">
                      &ldquo;{q.text}&rdquo;
                    </p>
                  </div>
                  <p className="text-xs text-neutral-500 pl-7 mt-1">
                    <strong>Rationale:</strong> {q.rationale}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 5. OUT OF SCOPE / PHASE 2 DEFERS */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-neutral-950 tracking-tight">
              5. Out of Scope / Phase 2 Defers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/30 space-y-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800 block">
                  Pending Client Decision (Conditional)
                </span>
                <div className="space-y-2">
                  {group1OutOfScope.map((item) => (
                    <div key={item.id} className="text-xs space-y-0.5">
                      <div className="font-bold text-neutral-900">• {item.label}</div>
                      <div className="text-neutral-600 pl-3">{item.reason}</div>
                    </div>
                  ))}
                  {group1OutOfScope.length === 0 && (
                    <p className="text-xs text-neutral-400">None flagged.</p>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-neutral-200/80 bg-neutral-50/50 space-y-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 block">
                  Not Mentioned, Excluded Unless Confirmed
                </span>
                <div className="space-y-2">
                  {group2OutOfScope.slice(0, 6).map((item) => (
                    <div key={item.id} className="text-xs space-y-0.5">
                      <div className="font-bold text-neutral-900">• {item.label}</div>
                      <div className="text-neutral-600 pl-3">{item.reason}</div>
                    </div>
                  ))}
                  {group2OutOfScope.length === 0 && (
                    <p className="text-xs text-neutral-400">None flagged.</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* 6. PROJECT DELIVERY RISKS & RECOMMENDATIONS */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-neutral-950 tracking-tight">
              6. Project Delivery Risks & Recommendations
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {risks.map((risk) => {
                const isHigh = risk.severity === "HIGH";
                const isMed = risk.severity === "MEDIUM";

                return (
                  <div
                    key={risk.id}
                    className="p-4 rounded-xl border border-neutral-200/80 bg-neutral-50/40 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                            isHigh
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : isMed
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {risk.severity}
                        </span>
                        <h3 className="text-sm font-bold text-neutral-950">
                          {risk.id}: {risk.title}
                        </h3>
                      </div>
                      <span className="text-xs font-mono font-semibold text-neutral-500">
                        Owner: {risk.owner}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-700">{risk.explanation}</p>
                    <p className="text-xs text-emerald-800 pt-1">
                      <strong>Recommended action:</strong> {risk.recommendedAction}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Footer note */}
          <div className="pt-6 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400 font-mono">
            <span>Briefly Intake Intelligence</span>
            <span>{isEvidenceChecked ? "Quotes verified against client communication" : "Some items need review before sharing"}</span>
          </div>
        </div>
      </main>
    </div>
  );
}
