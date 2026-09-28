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
} from "lucide-react";
import { deleteBrief } from "@/lib/storage";
import { useToast } from "@/components/ui/toast";

interface DashboardViewProps {
  briefs: ProjectBrief[];
  onSelectBrief: (brief: ProjectBrief) => void;
  onCreateBrief: () => void;
  onRefreshBriefs?: () => void;
}

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return "Recently";
  const now = Date.now();
  const date = new Date(dateString).getTime();
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

export function DashboardView({
  briefs,
  onSelectBrief,
  onCreateBrief,
  onRefreshBriefs,
}: DashboardViewProps) {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "complete" | "needs_review">("all");

  const filtered = briefs.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.project.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteBrief(id);
    onRefreshBriefs?.();
    showToast("Brief removed from workspace");
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-neutral-900 dark:text-neutral-100">
      {/* Dashboard Headline & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-6 pb-8 border-b border-neutral-200/80 dark:border-neutral-800">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 block mb-1">
            PROJECT INTAKE DASHBOARD
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight uppercase font-sans">
            GOOD MORNING.
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
            className="w-full text-xs pl-10 pr-4 py-2 bg-white dark:bg-[#161B22] border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white text-neutral-800 dark:text-neutral-200 placeholder-neutral-400"
          />
        </div>

        {/* Minimal status tabs */}
        <div className="flex items-center gap-1 text-xs font-medium text-neutral-600 dark:text-neutral-400">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              statusFilter === "all"
                ? "bg-neutral-200/80 dark:bg-neutral-800 text-neutral-950 dark:text-white font-bold"
                : "hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            All ({briefs.length})
          </button>
          <button
            onClick={() => setStatusFilter("needs_review")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              statusFilter === "needs_review"
                ? "bg-neutral-200/80 dark:bg-neutral-800 text-neutral-950 dark:text-white font-bold"
                : "hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            Needs Review
          </button>
          <button
            onClick={() => setStatusFilter("complete")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              statusFilter === "complete"
                ? "bg-neutral-200/80 dark:bg-neutral-800 text-neutral-950 dark:text-white font-bold"
                : "hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            Verified
          </button>
        </div>
      </div>

      {/* Restrained Recent Briefs Area */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2">
          <span className="text-xs font-mono uppercase font-bold tracking-wider text-neutral-400 dark:text-neutral-500">
            RECENT BRIEFS
          </span>
          <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
            {filtered.length} briefs in workspace
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#13161F] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 my-4">
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
              No briefs match your query.
            </p>
            <button
              onClick={onCreateBrief}
              className="mt-3 px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold rounded-lg"
            >
              Create a brief →
            </button>
          </div>
        ) : (
          /* Editorial, restrained list matching exact spec */
          <div className="divide-y divide-neutral-200/80 dark:divide-neutral-800 bg-white dark:bg-[#13161F] rounded-2xl border border-neutral-200/90 dark:border-neutral-800 shadow-2xs overflow-hidden">
            {filtered.map((brief) => {
              const questionCount = brief.questions?.length || 0;
              const questionLabel =
                questionCount === 1 ? "1 question" : `${questionCount} questions`;

              const riskCount = brief.risks?.length || 0;
              const riskLabel =
                riskCount === 0
                  ? "No critical risks"
                  : riskCount === 1
                  ? "1 risk"
                  : `${riskCount} risks`;

              const clarityPct = brief.scores?.overall || 80;
              const timeString = formatRelativeTime(brief.updated_at);

              return (
                <div
                  key={brief.id}
                  onClick={() => onSelectBrief(brief)}
                  className="group p-5 sm:p-6 hover:bg-neutral-50/80 dark:hover:bg-[#181D28] transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  {/* Title & Hierarchy */}
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-base sm:text-lg font-bold text-neutral-950 dark:text-white group-hover:text-neutral-800 dark:group-hover:text-neutral-200 tracking-tight">
                        {brief.title}
                      </h3>
                      <span
                        className={`text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded ${
                          brief.status === "complete"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                            : "bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                        }`}
                      >
                        {brief.status === "complete" ? "Verified" : "Needs Review"}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-1">
                      {brief.project.summary}
                    </p>
                  </div>

                  {/* Restrained Metrics Column */}
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
                        className="p-1.5 text-neutral-300 dark:text-neutral-600 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                        title="Delete brief"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
