"use client";

import React, { useState } from "react";
import {
  ProjectBrief,
  DeliverableItem,
  StructuredAmbiguity,
  StructuredQuestion,
  OutOfScopeItem,
  StructuredRisk,
  formatStandardDate,
} from "@/lib/types";
import { useToast } from "@/components/ui/toast";
import { saveBrief } from "@/lib/storage";
import { exportBriefToPdf } from "@/lib/export-pdf";
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Copy,
  Share2,
  Download,
  Sparkles,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  Edit3,
  Check,
  X,
  Info,
  Eye,
  AlertTriangle,
} from "lucide-react";

interface BriefViewProps {
  brief: ProjectBrief;
  onUpdateBrief: (updated: ProjectBrief) => void;
  onBackToDashboard?: () => void;
  onNewBrief?: () => void;
}

export function BriefView({
  brief: initialBrief,
  onUpdateBrief,
  onBackToDashboard,
  onNewBrief,
}: BriefViewProps) {
  const { showToast } = useToast();
  const [brief, setBrief] = useState<ProjectBrief>(initialBrief);
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [titleInput, setTitleInput] = useState<string>(initialBrief.title);
  const [showSourceDrawer, setShowSourceDrawer] = useState<boolean>(false);
  const [activeSourceExcerpt, setActiveSourceExcerpt] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [showClientReadyModal, setShowClientReadyModal] = useState<boolean>(false);
  const [clientReadyText, setClientReadyText] = useState<string>("");
  const [isLoadingClientReady, setIsLoadingClientReady] = useState<boolean>(false);
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null);

  const [prevInitialBrief, setPrevInitialBrief] = useState<ProjectBrief>(initialBrief);
  if (initialBrief !== prevInitialBrief) {
    setPrevInitialBrief(initialBrief);
    setBrief(initialBrief);
    setTitleInput(initialBrief.title);
  }

  const handleUpdate = (updated: ProjectBrief) => {
    setBrief(updated);
    saveBrief(updated);
    onUpdateBrief(updated);
  };

  const handleOpenClientReady = async () => {
    setShowClientReadyModal(true);
    if (!clientReadyText) {
      try {
        setIsLoadingClientReady(true);
        const res = await fetch("/api/briefs/client-ready", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brief }),
        });
        const data = await res.json();
        if (data.markdown) {
          setClientReadyText(data.markdown);
        } else {
          setClientReadyText("Could not generate client-ready text.");
        }
      } catch (e) {
        setClientReadyText("Failed to load client-ready document.");
      } finally {
        setIsLoadingClientReady(false);
      }
    }
  };

  const handleRegenerateSection = async (section: "deliverables" | "ambiguities" | "questions" | "risks" | "summary") => {
    try {
      setRegeneratingSection(section);
      showToast(`Regenerating ${section}...`);
      const res = await fetch("/api/briefs/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section,
          sourceText: brief.source_text,
          currentBriefContext: JSON.stringify(brief),
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        const updatedBrief: ProjectBrief = { ...brief };
        if (section === "deliverables" && Array.isArray(data.data.deliverables)) {
          updatedBrief.structuredDeliverables = data.data.deliverables;
        } else if (section === "ambiguities" && Array.isArray(data.data.ambiguities)) {
          updatedBrief.structuredAmbiguities = data.data.ambiguities;
        } else if (section === "questions" && Array.isArray(data.data.questions)) {
          updatedBrief.structuredQuestions = data.data.questions;
        } else if (section === "risks" && Array.isArray(data.data.risks)) {
          updatedBrief.structuredRisks = data.data.risks;
        } else if (section === "summary" && data.data.summary) {
          updatedBrief.executiveSummary = data.data.summary;
        }
        handleUpdate(updatedBrief);
        showToast(`${section.charAt(0).toUpperCase() + section.slice(1)} regenerated!`);
      } else {
        showToast("Regeneration returned no changes.", "error");
      }
    } catch (e) {
      showToast(`Failed to regenerate ${section}.`, "error");
    } finally {
      setRegeneratingSection(null);
    }
  };

  const handleSaveTitle = () => {
    if (!titleInput.trim()) return;
    const updated: ProjectBrief = {
      ...brief,
      title: titleInput.trim(),
      project: {
        name: titleInput.trim(),
        summary: brief.project?.summary || brief.executiveSummary?.paragraph || "",
        goal: brief.project?.goal || brief.executiveSummary?.goal || "",
        deadline: brief.project?.deadline || brief.targetDeadline?.displayLine1 || null,
        deadline_confidence: brief.project?.deadline_confidence || "medium",
      },
    };
    handleUpdate(updated);
    setIsEditingTitle(false);
    showToast("Project title updated");
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} to clipboard`);
  };

  const handleCopyAllQuestions = () => {
    const questions = brief.structuredQuestions || [];
    if (questions.length === 0) return;
    const formatted = questions
      .map((q) => `${q.id}: ${q.text}\n   Rationale: ${q.rationale}`)
      .join("\n\n");
    navigator.clipboard.writeText(formatted);
    showToast("Copied all client questions to clipboard");
  };

  const handleShareLink = () => {
    const url = `${window.location.origin}/share/${brief.id}`;
    navigator.clipboard.writeText(url);
    showToast("Shareable link copied to clipboard");
  };

  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true);
      showToast("Generating PDF brief...");
      await new Promise((r) => setTimeout(r, 60));
      exportBriefToPdf(brief);
      showToast("PDF downloaded successfully!");
    } catch (err) {
      console.error(err);
      showToast("Failed to generate PDF.", "error");
    } finally {
      setIsExportingPdf(false);
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
    brief.clarityData?.band ||
    (clarityScore >= 85 ? "Ready for kickoff" : clarityScore >= 65 ? "Mostly clear" : "Needs alignment");

  // Normalized list of deliverables
  const deliverables: DeliverableItem[] = brief.structuredDeliverables?.length
    ? brief.structuredDeliverables
    : (brief.requirements || []).map((r, i) => ({
        id: `D${i + 1}`,
        group: "Pages",
        label: r.title,
        description: r.description,
        evidence: r.source_excerpt || "",
        tag: r.status === "confirmed" ? "Confirmed" : "Needs scoping",
      }));

  // Normalized ambiguities
  const ambiguities: StructuredAmbiguity[] = brief.structuredAmbiguities?.length
    ? brief.structuredAmbiguities
    : (brief.ambiguities || []).map((a, i) => ({
        id: `A${i + 1}`,
        title: a.topic,
        severity: (a.severity?.toUpperCase() as any) || "MEDIUM",
        kind: "UNCLEAR",
        evidence: a.source_excerpt,
        whatIsUnclear: a.explanation,
        whyItMatters: "Directly affects kickoff timeline and team capacity.",
        linkedQuestionId: `Q${i + 1}`,
        isStandardKickoffItem: false,
      }));

  // Normalized questions
  const questions: StructuredQuestion[] = brief.structuredQuestions?.length
    ? brief.structuredQuestions
    : (brief.questions || []).map((q, i) => ({
        id: `Q${i + 1}`,
        text: q.question,
        rationale: q.reason,
        linkedAmbiguityId: `A${i + 1}`,
        priority: i + 1,
      }));

  // Normalized outOfScope
  const outOfScope: OutOfScopeItem[] = brief.structuredOutOfScope?.length
    ? brief.structuredOutOfScope
    : [
        ...(brief.scope?.possible_future_scope || []).map((item, i) => ({
          id: `O${i + 1}`,
          group: "Pending client decision" as const,
          label: item,
          reason: "Conditional item pending formal client confirmation.",
          evidence: null,
        })),
        ...(brief.scope?.out_of_scope || []).map((item, i) => ({
          id: `O_ex_${i + 1}`,
          group: "Not mentioned, excluded unless confirmed" as const,
          label: item,
          reason: "Standard industry boundary excluded unless scoped.",
          evidence: null,
        })),
      ];

  const group1OutOfScope = outOfScope.filter((o) => o.group === "Pending client decision");
  const group2OutOfScope = outOfScope.filter((o) => o.group === "Not mentioned, excluded unless confirmed");

  // Normalized risks
  const risks: StructuredRisk[] = brief.structuredRisks?.length
    ? brief.structuredRisks
    : (brief.risks || []).map((r, i) => ({
        id: `R${i + 1}`,
        title: r.risk,
        severity: (r.severity?.toUpperCase() as any) || "MEDIUM",
        explanation: r.impact,
        recommendedAction: r.suggested_action,
        owner: "Agency",
      }));

  // Deliverable groups
  const deliverableGroups: Array<"Pages" | "Design and Experience" | "Content and Assets" | "Features"> = [
    "Pages",
    "Design and Experience",
    "Content and Assets",
    "Features",
  ];

  return (
    <div className="w-full min-h-screen bg-[#FBFBFA] dark:bg-[#0D1117] pb-24 text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Sticky Top Action Bar */}
      <div className="sticky top-14 sm:top-16 z-30 w-full bg-white/95 dark:bg-[#0D1117]/95 backdrop-blur-md border-b border-neutral-200/90 dark:border-neutral-800 py-3 sm:py-3.5 print:hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="px-2.5 py-1 text-sm font-bold border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white rounded-lg focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                  autoFocus
                />
                <button
                  onClick={handleSaveTitle}
                  className="p-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-md"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsEditingTitle(false)}
                  className="p-1.5 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-neutral-950 dark:text-white tracking-tight">
                  {brief.title}
                </h1>
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-1 cursor-pointer"
                  title="Rename Brief"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <span
              className={`px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full uppercase tracking-wider ${
                isEvidenceChecked
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                  : "bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
              }`}
            >
              {statusLabel}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSourceDrawer(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg transition-colors cursor-pointer"
              title="View source message"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Source Message</span>
            </button>

            <button
              onClick={handleOpenClientReady}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg transition-colors cursor-pointer"
              title="Generate Client-Ready Kickoff Overview"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Client Brief</span>
            </button>

            <button
              onClick={handleShareLink}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg transition-colors cursor-pointer"
              title="Copy share link"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>

            <button
              id="print-brief-btn"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 rounded-lg transition-colors cursor-pointer disabled:opacity-60 shadow-xs"
              title="Download PDF specification"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExportingPdf ? "Generating PDF..." : "Export PDF"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Document Body - Matches Part 4 Specification & PDF Template */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        <div className="bg-white dark:bg-[#121620] rounded-2xl border border-neutral-200/90 dark:border-neutral-800 shadow-sm p-6 sm:p-10 space-y-10">
          {/* HEADER BLOCK */}
          <div className="pb-6 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4">
              <span className="text-[11px] font-mono font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase">
                BRIEFLY · INTAKE INTELLIGENCE & PROJECT ALIGNMENT
              </span>
              <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                {brief.id.startsWith("brief_") ? brief.id.slice(0, 12) : `brief_${brief.id.slice(0, 6)}`} | {createdDateStr}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mt-2">
              <div className="space-y-1">
                <span className="inline-block px-2.5 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-[11px] font-mono font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                  PROJECT BRIEF SPECIFICATION
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
                  {brief.title}
                </h1>
                {brief.source_files && brief.source_files.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <span className="text-[10px] font-mono uppercase text-neutral-400 dark:text-neutral-500">
                      Transcribed Files:
                    </span>
                    {brief.source_files.map((f, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 text-[11px] font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-700"
                      >
                        <FileText className="w-3 h-3 text-neutral-500" />
                        {f.name} ({(f.size / 1024).toFixed(0)} KB)
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`inline-block px-3 py-1 text-xs font-mono font-bold rounded-lg border uppercase tracking-wider ${
                    isEvidenceChecked
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                      : "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                  }`}
                >
                  STATUS: {statusLabel}
                </span>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1 max-w-xs">
                  Quotes checked against the client message. Not yet confirmed with the client.
                </p>
              </div>
            </div>

            {/* Three Boxes: TARGET DEADLINE | CLARITY SCORE | CREATED DATE */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {/* TARGET DEADLINE */}
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#161B24] border border-neutral-200/80 dark:border-neutral-800">
                <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-neutral-400 dark:text-neutral-500 block mb-1">
                  TARGET DEADLINE
                </span>
                <div className="text-sm font-bold text-neutral-950 dark:text-white leading-snug">
                  {deadlineLine1}
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  {deadlineLine2}
                </div>
              </div>

              {/* CLARITY SCORE */}
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#161B24] border border-neutral-200/80 dark:border-neutral-800">
                <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-neutral-400 dark:text-neutral-500 block mb-1">
                  CLARITY SCORE
                </span>
                <div className="text-sm font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                  <span>{clarityScore}/100</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-neutral-200/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                    {clarityBand}
                  </span>
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Sum of 6 intake clarity dimensions
                </div>
              </div>

              {/* CREATED DATE */}
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#161B24] border border-neutral-200/80 dark:border-neutral-800">
                <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-neutral-400 dark:text-neutral-500 block mb-1">
                  CREATED DATE
                </span>
                <div className="text-sm font-bold text-neutral-950 dark:text-white">
                  {createdDateStr}
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Initial intake synthesis
                </div>
              </div>
            </div>
          </div>

          {/* 1. EXECUTIVE SUMMARY & CORE GOAL */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-neutral-950 dark:text-white tracking-tight flex items-center gap-2">
              <span>1. Executive Summary & Core Goal</span>
            </h2>

            <div className="p-4 rounded-xl bg-neutral-50/70 dark:bg-[#161B24] border border-neutral-200/80 dark:border-neutral-800 space-y-3">
              <div>
                <span className="text-xs font-mono uppercase font-bold text-neutral-500 dark:text-neutral-400 block mb-1">
                  Project Goal
                </span>
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {brief.executiveSummary?.goal || brief.project?.goal}
                </p>
              </div>

              <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800">
                <span className="text-xs font-mono uppercase font-bold text-neutral-500 dark:text-neutral-400 block mb-1">
                  Executive Summary
                </span>
                <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {brief.executiveSummary?.paragraph || brief.project?.summary}
                </p>
              </div>

              {/* Key Facts at a glance */}
              {brief.executiveSummary?.keyFacts && brief.executiveSummary.keyFacts.length > 0 && (
                <div className="pt-3 border-t border-neutral-200/60 dark:border-neutral-800">
                  <span className="text-[10px] font-mono uppercase font-bold text-neutral-400 dark:text-neutral-500 block mb-2">
                    Key Facts at a glance
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {brief.executiveSummary.keyFacts.map((fact, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-white dark:bg-[#121620] border border-neutral-200/70 dark:border-neutral-800"
                      >
                        <span className="text-[10px] font-mono uppercase font-bold text-neutral-400 dark:text-neutral-500 block">
                          {fact.label}
                        </span>
                        <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
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
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-950 dark:text-white tracking-tight">
                2. Confirmed Deliverables (In-Scope)
              </h2>
              <span className="text-xs font-mono text-neutral-400">
                {deliverables.length} deliverables
              </span>
            </div>

            <div className="space-y-4">
              {deliverableGroups.map((grp) => {
                const itemsInGroup = deliverables.filter((d) => d.group === grp);
                if (itemsInGroup.length === 0) return null;

                return (
                  <div key={grp} className="space-y-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
                      {grp}
                    </span>
                    <div className="grid grid-cols-1 gap-2.5">
                      {itemsInGroup.map((item) => (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/40 dark:bg-[#161B24] flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                        >
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span className="text-sm font-bold text-neutral-900 dark:text-white">
                                {item.label}
                              </span>
                            </div>
                            <p className="text-xs text-neutral-600 dark:text-neutral-300 pl-6">
                              {item.description}
                            </p>
                            {item.evidence && (
                              <div className="pl-6 pt-1">
                                <span className="text-[11px] font-mono italic text-neutral-500 dark:text-neutral-400 border-l-2 border-neutral-300 dark:border-neutral-700 pl-2 block">
                                  &ldquo;{item.evidence}&rdquo;
                                </span>
                              </div>
                            )}
                          </div>

                          <span
                            className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded self-start shrink-0 ${
                              item.tag === "Confirmed"
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                                : "bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
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
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-950 dark:text-white tracking-tight">
                3. Flagged Ambiguities (Requires Alignment)
              </h2>
              <span className="text-xs font-mono text-neutral-400">
                {ambiguities.length} items
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {ambiguities.map((amb) => {
                const isHigh = amb.severity === "HIGH";
                const isMed = amb.severity === "MEDIUM";

                return (
                  <div
                    key={amb.id}
                    className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/40 dark:bg-[#161B24] space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                            isHigh
                              ? "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900"
                              : isMed
                              ? "bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                              : "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-900 dark:text-slate-300"
                          }`}
                        >
                          {amb.severity}
                        </span>
                        <h3 className="text-sm font-bold text-neutral-950 dark:text-white">
                          {amb.id}: {amb.title}
                        </h3>
                      </div>
                      <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                        Linked Question: {amb.linkedQuestionId}
                      </span>
                    </div>

                    {amb.evidence ? (
                      <p className="text-xs font-mono italic text-neutral-500 dark:text-neutral-400 border-l-2 border-neutral-300 dark:border-neutral-700 pl-2">
                        Evidence: &ldquo;{amb.evidence}&rdquo;
                      </p>
                    ) : (
                      <p className="text-xs font-mono italic text-neutral-400 pl-2">
                        Not mentioned in the message
                      </p>
                    )}

                    <div className="text-xs space-y-1 pt-1">
                      <p className="text-neutral-800 dark:text-neutral-200">
                        <strong>What is unclear:</strong> {amb.whatIsUnclear}
                      </p>
                      <p className="text-neutral-600 dark:text-neutral-400">
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
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-950 dark:text-white tracking-tight">
                4. Ready-to-Send Client Questions
              </h2>
              <button
                onClick={handleCopyAllQuestions}
                className="text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy all questions</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#161B24] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400">
                        {q.id} ({q.linkedAmbiguityId}):
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-neutral-950 dark:text-white">
                        &ldquo;{q.text}&rdquo;
                      </p>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 pl-7">
                      <strong>Rationale:</strong> {q.rationale}
                    </p>
                  </div>

                  <button
                    onClick={() => handleCopyText(q.text, q.id)}
                    className="self-start sm:self-center px-3 py-1 text-xs font-medium border border-neutral-200 dark:border-neutral-700 hover:bg-white dark:hover:bg-neutral-800 rounded-lg shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* 5. OUT OF SCOPE / PHASE 2 DEFERS */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-neutral-950 dark:text-white tracking-tight">
              5. Out of Scope / Phase 2 Defers
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Group 1: Pending client decision */}
              <div className="p-4 rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20 space-y-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 block">
                  Pending Client Decision (Conditional)
                </span>
                <div className="space-y-2">
                  {group1OutOfScope.map((item) => (
                    <div key={item.id} className="text-xs space-y-0.5">
                      <div className="font-bold text-neutral-900 dark:text-white">
                        • {item.label}
                      </div>
                      <div className="text-neutral-600 dark:text-neutral-400 pl-3">
                        {item.reason}
                      </div>
                    </div>
                  ))}
                  {group1OutOfScope.length === 0 && (
                    <p className="text-xs text-neutral-400">None flagged.</p>
                  )}
                </div>
              </div>

              {/* Group 2: Excluded unless confirmed */}
              <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#161B24] space-y-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
                  Not Mentioned, Excluded Unless Confirmed
                </span>
                <div className="space-y-2">
                  {group2OutOfScope.slice(0, 6).map((item) => (
                    <div key={item.id} className="text-xs space-y-0.5">
                      <div className="font-bold text-neutral-900 dark:text-white">
                        • {item.label}
                      </div>
                      <div className="text-neutral-600 dark:text-neutral-400 pl-3">
                        {item.reason}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 6. PROJECT DELIVERY RISKS & RECOMMENDATIONS */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-neutral-950 dark:text-white tracking-tight">
              6. Project Delivery Risks & Recommendations
            </h2>

            <div className="grid grid-cols-1 gap-3">
              {risks.map((risk) => {
                const isHigh = risk.severity === "HIGH";
                const isMed = risk.severity === "MEDIUM";

                return (
                  <div
                    key={risk.id}
                    className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/40 dark:bg-[#161B24] space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                            isHigh
                              ? "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900"
                              : isMed
                              ? "bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                              : "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-900 dark:text-slate-300"
                          }`}
                        >
                          {risk.severity}
                        </span>
                        <h3 className="text-sm font-bold text-neutral-950 dark:text-white">
                          {risk.id}: {risk.title}
                        </h3>
                      </div>
                      <span className="text-xs font-mono font-semibold text-neutral-500 dark:text-neutral-400">
                        Owner: {risk.owner}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-700 dark:text-neutral-300">
                      {risk.explanation}
                    </p>

                    <p className="text-xs text-emerald-800 dark:text-emerald-300 pt-1">
                      <strong>Recommended action:</strong> {risk.recommendedAction}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Footer note */}
          <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-400 font-mono">
            <span>Briefly Intake Intelligence</span>
            <span>Quotes verified against client communication</span>
          </div>
        </div>
      </div>

      {/* Raw Source Drawer */}
      {showSourceDrawer && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-lg bg-white dark:bg-[#121620] h-full shadow-2xl p-6 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-base font-bold text-neutral-950 dark:text-white">
                Client Source Communication
              </h3>
              <button
                onClick={() => setShowSourceDrawer(false)}
                className="p-1 text-neutral-500 hover:text-neutral-800 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {brief.source_files && brief.source_files.length > 0 && (
              <div className="space-y-1.5 p-3 rounded-xl bg-neutral-100/70 dark:bg-[#161B24] border border-neutral-200/80 dark:border-neutral-800 text-xs">
                <span className="font-mono uppercase font-bold text-[10px] text-neutral-400">
                  Uploaded & Transcribed Attachments ({brief.source_files.length})
                </span>
                <div className="space-y-1">
                  {brief.source_files.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2 font-mono text-neutral-700 dark:text-neutral-300">
                      <FileText className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{file.name}</span>
                      <span className="text-[10px] text-neutral-400">({(file.size / 1024).toFixed(0)} KB)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-xs font-mono bg-neutral-50 dark:bg-[#181D28] p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 whitespace-pre-wrap leading-relaxed text-neutral-800 dark:text-neutral-200">
              {brief.source_text}
            </div>

            {activeSourceExcerpt && (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs">
                <span className="font-bold text-amber-900 dark:text-amber-200 block mb-1">
                  Selected Verbatim Excerpt:
                </span>
                <p className="italic font-mono text-neutral-700 dark:text-neutral-300">
                  &ldquo;{activeSourceExcerpt}&rdquo;
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Client-Ready Kickoff Document Modal */}
      {showClientReadyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-[#121620] rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#161B24]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                <h3 className="text-sm sm:text-base font-bold text-neutral-950 dark:text-white">
                  Client-Ready Kickoff Alignment Brief
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyText(clientReadyText, "Client-Ready Document")}
                  disabled={isLoadingClientReady || !clientReadyText}
                  className="px-3 py-1.5 text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg flex items-center gap-1.5 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Markdown</span>
                </button>
                <button
                  onClick={() => setShowClientReadyModal(false)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-xs sm:text-sm font-sans leading-relaxed text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap selection:bg-neutral-200 dark:selection:bg-neutral-700">
              {isLoadingClientReady ? (
                <div className="py-12 text-center text-neutral-400 font-mono">
                  Synthesizing client-ready kickoff alignment brief...
                </div>
              ) : (
                clientReadyText
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
