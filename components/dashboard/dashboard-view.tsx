"use client";

import React, { useState } from "react";
import { ProjectBrief } from "@/lib/types";
import {
  Plus,
  Search,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Trash2,
  Loader2,
  Cloud,
  HardDrive,
} from "lucide-react";
import { deleteBrief } from "@/lib/storage";
import { useToast } from "@/components/ui/toast";
import { useAuth, getUserDisplayName } from "@/lib/auth-context";

interface DashboardViewProps {
  briefs: ProjectBrief[];
  onSelectBrief: (brief: ProjectBrief) => void;
  onCreateBrief: () => void;
  onRefreshBriefs?: () => void;
  onDeleteBrief?: (id: string) => Promise<void> | void;
  loading?: boolean;
}

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return "Recently";
  const now = Date.now();
  const date = new Date(dateString).getTime();
  if (isNaN(date)) return "Recently";
  const diffMinutes = Math.max(1, Math.floor((now - date) / (1000 * 60)));

  if (diffMinutes < 60) {
    return `Updated ${diffMinutes} min ago`;
  }
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `Updated ${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return `Updated ${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
}

function greeting(): string {
  const h = new Date().getHours();
  return h < 12 ? "GOOD MORNING" : h < 18 ? "GOOD AFTERNOON" : "GOOD EVENING";
}

export function DashboardView({
  briefs,
  onSelectBrief,
  onCreateBrief,
  onRefreshBriefs,
  onDeleteBrief,
  loading = false,
}: DashboardViewProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "complete" | "needs_review">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const displayName = getUserDisplayName(user);

  const filtered = briefs.filter((b) => {
    const titleMatch = (b.title || "").toLowerCase().includes(searchQuery.toLowerCase());
    const summaryText =
      b.executiveSummary?.paragraph || b.project?.summary || b.source_text || "";
    const summaryMatch = summaryText.toLowerCase().includes(searchQuery.toLowerCase());

    const isComplete = b.status === "complete" || b.status === "EVIDENCE CHECKED";
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "complete" && isComplete) ||
      (statusFilter === "needs_review" && !isComplete);

    return (titleMatch || summaryMatch) && matchesStatus;
  });

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      if (onDeleteBrief) {
        await onDeleteBrief(id);
      } else {
        deleteBrief(id);
        onRefreshBriefs?.();
      }
      showToast("Brief removed from workspace");
    } catch (err: any) {
      showToast(err.message || "Failed to delete brief", "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-neutral-900 dark:text-neutral-100">
      {/* Dashboard Headline & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-6 pb-8 border-b border-neutral-200/80 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              PROJECT INTAKE DASHBOARD
            </span>
            {user ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <Cloud className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Cloud Memory Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                <HardDrive className="w-3 h-3 text-neutral-400" />
                Local Workspace
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight uppercase font-sans">
            {user ? `WELCOME BACK, ${displayName.toUpperCase()}.` : `${greeting()}.`}
          </h1>
          <p className="mt-2 text-base sm:text-lg text-neutral-600 dark:text-neutral-300 font-normal">
            &ldquo;Let&apos;s make the messy parts clear.&rdquo;
          </p>
        </div>

        {/* Primary CTA */}
        <button
          id="dashboard-create-brief-btn"
          onClick={onCreateBrief}
          className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-all active:scale-98 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create brief</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 my-8">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search briefs by client or scope..."
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-white dark:bg-[#161B22] border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 shadow-2xs"
          />
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-1 text-xs font-medium text-neutral-600 dark:text-neutral-400">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              statusFilter === "all"
                ? "bg-neutral-200/80 dark:bg-neutral-800 text-neutral-950 dark:text-white font-bold"
                : "hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            All ({briefs.length})
          </button>
          <button
            onClick={() => setStatusFilter("needs_review")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              statusFilter === "needs_review"
                ? "bg-neutral-200/80 dark:bg-neutral-800 text-neutral-950 dark:text-white font-bold"
                : "hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            Needs Review
          </button>
          <button
            onClick={() => setStatusFilter("complete")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              statusFilter === "complete"
                ? "bg-neutral-200/80 dark:bg-neutral-800 text-neutral-950 dark:text-white font-bold"
                : "hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            Evidence checked
          </button>
        </div>
      </div>

      {/* Recent Briefs Area */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2">
          <span className="text-xs font-mono uppercase font-bold tracking-wider text-neutral-400 dark:text-neutral-500">
            RECENT BRIEFS
          </span>
          <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
            {filtered.length === briefs.length
              ? `${briefs.length} ${briefs.length === 1 ? "brief" : "briefs"} in workspace`
              : `${filtered.length} of ${briefs.length} briefs`}
          </span>
        </div>

        {loading ? (
          <div className="p-16 text-center bg-white dark:bg-[#13161F] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 my-4 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-neutral-400 dark:text-neutral-500" />
            <p className="text-xs text-neutral-500 font-mono">Syncing your briefs from cloud...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#13161F] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 my-4">
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
              {searchQuery ? "No briefs match your search." : "No briefs in your workspace yet."}
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1 mb-4">
              Turn messy client emails, notes, or transcripts into structured project briefs.
            </p>
            <button
              onClick={onCreateBrief}
              className="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold rounded-lg cursor-pointer hover:opacity-90 shadow-xs"
            >
              Create your first brief →
            </button>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200/80 dark:divide-neutral-800 bg-white dark:bg-[#13161F] rounded-2xl border border-neutral-200/90 dark:border-neutral-800 shadow-2xs overflow-hidden">
            {filtered.map((brief) => {
              // Structured lists are the current source of truth; legacy arrays go stale after edits (BUG-24).
              const questionCount =
                brief.structuredQuestions?.length ?? brief.questions?.length ?? 0;
              const questionLabel =
                questionCount === 1 ? "1 question" : `${questionCount} questions`;

              const riskCount =
                brief.structuredRisks?.length ?? brief.risks?.length ?? 0;
              const riskLabel =
                riskCount === 0
                  ? "No risks flagged"
                  : riskCount === 1
                  ? "1 risk"
                  : `${riskCount} risks`;

              const clarityPct =
                brief.clarityData?.overall ?? brief.scores?.overall ?? 0;
              const timeString = formatRelativeTime(brief.updated_at);
              const isComplete =
                brief.status === "complete" || brief.status === "EVIDENCE CHECKED";

              const summaryText =
                brief.executiveSummary?.paragraph ||
                brief.project?.summary ||
                (brief.source_text
                  ? brief.source_text.length > 140
                    ? `${brief.source_text.slice(0, 140)}...`
                    : brief.source_text
                  : "No summary available.");

              return (
                <div
                  key={brief.id}
                  onClick={() => onSelectBrief(brief)}
                  className="group p-5 sm:p-6 hover:bg-neutral-50/80 dark:hover:bg-[#181D28] transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  {/* Title & Summary */}
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-base sm:text-lg font-bold text-neutral-950 dark:text-white group-hover:text-neutral-800 dark:group-hover:text-neutral-200 tracking-tight">
                        {brief.title}
                      </h3>
                      <span
                        className={`text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded ${
                          isComplete
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                            : "bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                        }`}
                      >
                        {isComplete ? "Evidence checked" : "Needs Review"}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-1">
                      {summaryText}
                    </p>
                  </div>

                  {/* Metrics Column */}
                  <div className="flex items-center gap-4 sm:gap-6 text-xs text-neutral-600 dark:text-neutral-400 font-mono shrink-0">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-neutral-950 dark:text-white">
                        {clarityPct}% clear
                      </span>
                      <span className="text-neutral-300 dark:text-neutral-700">•</span>
                      <span>{questionLabel}</span>
                      <span className="text-neutral-300 dark:text-neutral-700">•</span>
                      <span
                        className={
                          riskCount === 0
                            ? "text-emerald-700 dark:text-emerald-400"
                            : "text-amber-700 dark:text-amber-400"
                        }
                      >
                        {riskLabel}
                      </span>
                    </div>

                    <div className="hidden md:block text-[11px] text-neutral-400 dark:text-neutral-500">
                      {timeString}
                    </div>

                    <div className="flex items-center gap-2 pl-2 border-l border-neutral-200 dark:border-neutral-800">
                      <button
                        onClick={(e) => handleDelete(e, brief.id)}
                        disabled={deletingId === brief.id}
                        className="p-1.5 text-neutral-300 dark:text-neutral-600 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer disabled:opacity-50"
                        title="Delete brief"
                      >
                        {deletingId === brief.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <ArrowRight className="w-4 h-4 text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
