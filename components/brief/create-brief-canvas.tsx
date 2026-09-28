"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText,
  UploadCloud,
  Image as ImageIcon,
  Sparkles,
  ArrowRight,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  HelpCircle,
  ShieldAlert,
  Check,
} from "lucide-react";
import { SAMPLE_ACME_SOURCE } from "@/lib/sample-data";
import { useToast } from "@/components/ui/toast";
import { ProjectBrief } from "@/lib/types";
import { saveBrief } from "@/lib/storage";

interface CreateBriefCanvasProps {
  onBriefGenerated: (brief: ProjectBrief) => void;
  onCancel?: () => void;
}

type InputTab = "paste" | "file" | "image";

interface UploadedFileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  dataBase64?: string;
}

const VERTICAL_PROCESSING_STAGES = [
  { id: "01", label: "Reading source", detail: "Normalizing text and attachments..." },
  { id: "02", label: "Finding requirements", detail: "Isolating confirmed features & technical expectations..." },
  { id: "03", label: "Detecting ambiguities", detail: "Identifying subjective language & loose date ranges..." },
  { id: "04", label: "Checking scope", detail: "Separating core commitments from future phases..." },
  { id: "05", label: "Finding missing information", detail: "Flagging unsupplied assets and credentials..." },
  { id: "06", label: "Building your brief", detail: "Calculating clarity score and drafting next steps..." },
];

export function CreateBriefCanvas({ onBriefGenerated, onCancel }: CreateBriefCanvasProps) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<InputTab>("paste");
  const [sourceText, setSourceText] = useState<string>("");
  const [projectNameHint, setProjectNameHint] = useState<string>("");
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentStage, setCurrentStage] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLoadSample = () => {
    setSourceText(SAMPLE_ACME_SOURCE);
    setProjectNameHint("ACME Website Redesign");
    showToast("Loaded ACME client message sample");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files;
    if (!uploaded || uploaded.length === 0) return;

    Array.from(uploaded).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = typeof reader.result === "string" ? reader.result.split(",")[1] : undefined;
        setFiles((prev) => [
          ...prev,
          {
            id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: file.name,
            size: file.size,
            type: file.type || "application/octet-stream",
            dataBase64: base64,
          },
        ]);
        showToast(`Added ${file.name}`);
      };

      if (file.type.startsWith("image/") || file.type === "application/pdf") {
        reader.readAsDataURL(file);
      } else {
        const textReader = new FileReader();
        textReader.onload = () => {
          if (typeof textReader.result === "string") {
            setSourceText((prev) => (prev ? `${prev}\n\n${textReader.result}` : (textReader.result as string)));
            showToast(`Imported text from ${file.name}`);
          }
        };
        textReader.readAsText(file);
      }
    });
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleBuildBrief = async () => {
    const effectiveText = sourceText.trim();
    if (!effectiveText && files.length === 0) {
      showToast("Please paste a client message or upload a document.", "error");
      return;
    }

    setIsProcessing(true);
    setCurrentStage(0);

    const interval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < VERTICAL_PROCESSING_STAGES.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 850);

    try {
      const res = await fetch("/api/briefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: effectiveText || `Analyzed from ${files.length} uploaded attachments.`,
          projectNameHint: projectNameHint.trim() || undefined,
          createdDate: "2026-09-28",
          weekday: "Monday",
          files: files.map((f) => ({
            name: f.name,
            size: f.size,
            mimeType: f.type,
            dataBase64: f.dataBase64,
          })),
        }),
      });

      clearInterval(interval);

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to analyze brief.");
      }

      const data = await res.json();
      const brief = data.brief as ProjectBrief;

      saveBrief(brief);
      setCurrentStage(VERTICAL_PROCESSING_STAGES.length - 1);

      setTimeout(() => {
        setIsProcessing(false);
        showToast("Brief constructed successfully!");
        onBriefGenerated(brief);
      }, 500);
    } catch (err: any) {
      clearInterval(interval);
      setIsProcessing(false);
      console.error("Extraction error:", err);
      showToast(err.message || "Failed to process brief. Please retry.", "error");
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 text-neutral-900 dark:text-neutral-100">
      {/* Title & Subheading */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 block mb-1">
            INTAKE CANVAS
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950 dark:text-white uppercase font-sans">
            CREATE A BRIEF
          </h1>
          <p className="mt-2 text-base sm:text-lg text-neutral-600 dark:text-neutral-300 font-normal">
            &ldquo;Bring us the messy stuff.&rdquo;
          </p>
        </div>

        {/* Load Sample Button */}
        <button
          id="load-sample-acme-btn"
          type="button"
          onClick={handleLoadSample}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#161B22] border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 shadow-2xs transition-all shrink-0 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Load sample conversation</span>
        </button>
      </div>

      {/* Main Canvas Container */}
      <div className="bg-white dark:bg-[#13161F] rounded-2xl border border-neutral-200/90 dark:border-neutral-800 shadow-xs overflow-hidden">
        {/* Top Control Bar: [ Paste text ] [ Upload file ] [ Upload image ] */}
        <div className="p-4 sm:p-5 border-b border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#161922] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="inline-flex p-1 bg-neutral-200/70 dark:bg-neutral-800 rounded-xl text-xs font-medium text-neutral-600 dark:text-neutral-400">
            <button
              id="tab-paste-text"
              onClick={() => setActiveTab("paste")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === "paste"
                  ? "bg-white dark:bg-[#1E2330] text-neutral-950 dark:text-white font-semibold shadow-xs"
                  : "hover:text-neutral-950 dark:hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Paste text</span>
            </button>
            <button
              id="tab-upload-file"
              onClick={() => setActiveTab("file")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === "file"
                  ? "bg-white dark:bg-[#1E2330] text-neutral-950 dark:text-white font-semibold shadow-xs"
                  : "hover:text-neutral-950 dark:hover:text-white"
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload file</span>
            </button>
            <button
              id="tab-upload-image"
              onClick={() => setActiveTab("image")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === "image"
                  ? "bg-white dark:bg-[#1E2330] text-neutral-950 dark:text-white font-semibold shadow-xs"
                  : "hover:text-neutral-950 dark:hover:text-white"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Upload image</span>
            </button>
          </div>

          <div className="text-xs text-neutral-400 dark:text-neutral-500 font-mono">
            Accepts PDF, DOCX, TXT, MD, PNG, JPG, WEBP
          </div>
        </div>

        {/* Input Area */}
        <div className="p-5 sm:p-6 space-y-4">
          {activeTab === "paste" && (
            <div>
              <textarea
                id="source-text-input"
                rows={10}
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Paste a client message, email thread, meeting notes, requirements, or anything else you've received."
                className="w-full text-sm sm:text-base font-sans p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-700 bg-white dark:bg-[#161B24] text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white resize-y leading-relaxed"
              />
              <div className="mt-2 flex items-center justify-between text-xs text-neutral-400 dark:text-neutral-500 font-mono">
                <span>Raw unedited communication</span>
                <span>{sourceText.length} characters</span>
              </div>
            </div>
          )}

          {(activeTab === "file" || activeTab === "image") && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-neutral-500 dark:hover:border-neutral-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-neutral-50/50 dark:bg-[#161B24] hover:bg-neutral-50 dark:hover:bg-[#1A202C]"
              >
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 flex items-center justify-center mx-auto mb-3">
                  {activeTab === "file" ? (
                    <UploadCloud className="w-6 h-6" />
                  ) : (
                    <ImageIcon className="w-6 h-6" />
                  )}
                </div>
                <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {activeTab === "file"
                    ? "Click or drag documents to upload"
                    : "Upload client screenshots or mockups"}
                </h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
                  {activeTab === "file"
                    ? "Accepts PDF, DOCX, TXT, MD"
                    : "Accepts PNG, JPG, WEBP. AI inspects text and visual layout."}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={
                    activeTab === "file"
                      ? ".pdf,.docx,.txt,.md,text/*"
                      : "image/png,image/jpeg,image/webp"
                  }
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Elegant File Pills/Cards */}
              {files.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase text-neutral-400 dark:text-neutral-500">
                    Uploaded Sources ({files.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {files.map((f) => (
                      <div
                        key={f.id}
                        className="flex items-center justify-between p-2.5 bg-neutral-50 dark:bg-[#161B24] border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                          <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate">
                            {f.name}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-mono shrink-0">
                            {(f.size / 1024).toFixed(0)} KB
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveFile(f.id)}
                          className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Supplementary Notes */}
              <div>
                <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 block mb-1">
                  Additional context (Optional):
                </label>
                <textarea
                  rows={3}
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  placeholder="Add any extra conversation notes or client caveats..."
                  className="w-full text-xs p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#161B24] text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white"
                />
              </div>
            </div>
          )}

          {/* Below Source: Optional Project Name */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1 max-w-md">
              <label
                htmlFor="optional-project-name"
                className="text-xs font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block mb-1"
              >
                Optional Project Name:
              </label>
              <input
                id="optional-project-name"
                type="text"
                value={projectNameHint}
                onChange={(e) => setProjectNameHint(e.target.value)}
                placeholder="e.g. ACME Website Redesign"
                className="w-full text-xs px-3 py-2 bg-neutral-50 dark:bg-[#161B24] border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white placeholder-neutral-400"
              />
            </div>

            {/* Bottom-right: BUILD BRIEF → */}
            <div className="flex items-center gap-3 self-end sm:self-center mt-2 sm:mt-0">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                >
                  Cancel
                </button>
              )}
              <button
                id="build-brief-btn"
                type="button"
                disabled={isProcessing || (!sourceText.trim() && files.length === 0)}
                onClick={handleBuildBrief}
                className="px-6 py-2.5 bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 disabled:opacity-50 text-white dark:text-neutral-950 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:cursor-not-allowed"
              >
                <span>BUILD BRIEF →</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Below: "WHAT BRIEFLY WILL FIND" preview */}
      <div className="mt-8 p-6 sm:p-8 bg-white dark:bg-[#13161F] rounded-2xl border border-neutral-200/80 dark:border-neutral-800">
        <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 block mb-4">
          WHAT BRIEFLY WILL FIND
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "SCOPE", desc: "4-tier deliverable matrix" },
            { label: "TIMELINE", desc: "Hard cutoffs vs vague dates" },
            { label: "REQUIREMENTS", desc: "Fact-checked deliverables" },
            { label: "AMBIGUITIES", desc: "Subjective language root cause" },
            { label: "RISKS", desc: "Delivery & dependency traps" },
            { label: "QUESTIONS", desc: "Client clarification list" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-neutral-50 dark:bg-[#161A24] border border-neutral-200/70 dark:border-neutral-800 text-center"
            >
              <div className="text-xs font-bold font-mono text-neutral-900 dark:text-neutral-100 mb-0.5">
                {item.label}
              </div>
              <div className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight">
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI PROCESSING SCREEN (MODAL WITH VERTICAL 01-06 PROCESS & VISIBLE SOURCE) */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-neutral-950/75 dark:bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-white dark:bg-[#13161F] rounded-3xl p-6 sm:p-8 shadow-2xl border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 max-h-[90vh] overflow-y-auto"
            >
              {/* Header: "ANALYZING YOUR REQUEST" */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800 mb-6">
                <div>
                  <h3 className="text-base font-extrabold text-neutral-950 dark:text-white uppercase font-sans tracking-tight">
                    ANALYZING YOUR REQUEST
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Transforming raw conversational text into structured intelligence
                  </p>
                </div>
                <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                  Step {currentStage + 1} of {VERTICAL_PROCESSING_STAGES.length}
                </span>
              </div>

              {/* Vertical Process: 01 to 06 */}
              <div className="space-y-2.5 mb-6">
                {VERTICAL_PROCESSING_STAGES.map((stage, idx) => {
                  const isDone = currentStage > idx;
                  const isCurrent = currentStage === idx;

                  return (
                    <div
                      key={stage.id}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 text-xs ${
                        isCurrent
                          ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 border-neutral-900 dark:border-white shadow-xs"
                          : isDone
                          ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                          : "bg-neutral-50 dark:bg-[#161B24] text-neutral-400 dark:text-neutral-600 border-neutral-200/60 dark:border-neutral-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-xs">{stage.id}</span>
                        <div>
                          <div className="font-semibold">{stage.label}</div>
                          {isCurrent && (
                            <div className="text-[11px] opacity-80 mt-0.5">{stage.detail}</div>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isDone ? (
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        ) : isCurrent ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
                        ) : (
                          <span className="text-[10px] font-mono opacity-50">Pending</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Original Client Message Remains Visible */}
              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <span className="text-[10px] font-mono uppercase font-bold text-neutral-400 dark:text-neutral-500 block mb-1.5">
                  Source Input Under Analysis:
                </span>
                <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#161A24] border border-neutral-200/70 dark:border-neutral-800 text-xs font-mono text-neutral-700 dark:text-neutral-300 line-clamp-3 leading-relaxed">
                  {sourceText.trim() || (files.length > 0 ? `${files.length} attachments uploaded` : "")}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
