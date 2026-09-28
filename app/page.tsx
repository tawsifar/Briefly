"use client";

import React, { useState, useSyncExternalStore } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { LandingView } from "@/components/landing/landing-view";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { CreateBriefCanvas } from "@/components/brief/create-brief-canvas";
import { BriefView } from "@/components/brief/brief-view";
import { ToastProvider, useToast } from "@/components/ui/toast";
import { ProjectBrief } from "@/lib/types";
import {
  getStoredBriefs,
  subscribeToBriefs,
  getActiveBriefId,
  setActiveBriefId,
} from "@/lib/storage";
import { SAMPLE_ACME_BRIEF, INITIAL_BRIEFS_LIST } from "@/lib/sample-data";

type AppView = "landing" | "dashboard" | "create" | "brief";

function getServerBriefs() {
  return INITIAL_BRIEFS_LIST;
}

function MainApp() {
  const [currentView, setCurrentView] = useState<AppView>("landing");
  const briefs = useSyncExternalStore(subscribeToBriefs, getStoredBriefs, getServerBriefs);
  const [activeBriefIdState, setActiveBriefIdState] = useState<string>(SAMPLE_ACME_BRIEF.id);

  const activeBrief =
    briefs.find((b) => b.id === activeBriefIdState) || briefs[0] || SAMPLE_ACME_BRIEF;

  const handleSelectBrief = (b: ProjectBrief) => {
    setActiveBriefIdState(b.id);
    setActiveBriefId(b.id);
    setCurrentView("brief");
  };

  const handleBriefGenerated = (b: ProjectBrief) => {
    setActiveBriefIdState(b.id);
    setActiveBriefId(b.id);
    setCurrentView("brief");
  };

  const handleUpdateActiveBrief = (updated: ProjectBrief) => {
    setActiveBriefIdState(updated.id);
  };

  const handleViewSampleBrief = () => {
    const acme = briefs.find((b) => b.id === SAMPLE_ACME_BRIEF.id) || SAMPLE_ACME_BRIEF;
    setActiveBriefIdState(acme.id);
    setActiveBriefId(acme.id);
    setCurrentView("brief");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFA] dark:bg-[#0D1117] text-neutral-900 dark:text-neutral-100 selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-neutral-900 transition-colors">
      <Navbar
        currentView={currentView}
        onNavigate={(v) => setCurrentView(v)}
        activeBriefId={activeBrief.id}
      />

      <main className="flex-1 w-full">
        {currentView === "landing" && (
          <LandingView
            onCreateBrief={() => setCurrentView("create")}
            onViewSampleBrief={handleViewSampleBrief}
          />
        )}

        {currentView === "dashboard" && (
          <DashboardView
            briefs={briefs}
            onSelectBrief={handleSelectBrief}
            onCreateBrief={() => setCurrentView("create")}
          />
        )}

        {currentView === "create" && (
          <CreateBriefCanvas
            onBriefGenerated={handleBriefGenerated}
            onCancel={() => setCurrentView("dashboard")}
          />
        )}

        {currentView === "brief" && (
          <BriefView
            brief={activeBrief}
            onUpdateBrief={handleUpdateActiveBrief}
            onBackToDashboard={() => setCurrentView("dashboard")}
            onNewBrief={() => setCurrentView("create")}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function Page() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
