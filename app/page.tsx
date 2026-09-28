"use client";

import React, { useState, useEffect, useCallback, useRef, useSyncExternalStore } from "react";
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
  saveBrief,
  deleteBrief,
} from "@/lib/storage";
import { SAMPLE_ACME_BRIEF, INITIAL_BRIEFS_LIST } from "@/lib/sample-data";
import { useAuth } from "@/lib/auth-context";
import {
  fetchUserBriefs,
  saveBriefToDb,
  deleteBriefFromDb,
  migrateLocalBriefsToDb,
} from "@/lib/supabase/briefs";

type AppView = "landing" | "dashboard" | "create" | "brief";

function getServerBriefs() {
  return INITIAL_BRIEFS_LIST;
}

function MainApp() {
  const { user, loading: authLoading, supabase } = useAuth();
  const { showToast } = useToast();

  const [currentView, setCurrentView] = useState<AppView>("landing");
  const localBriefs = useSyncExternalStore(subscribeToBriefs, getStoredBriefs, getServerBriefs);

  // Supabase cloud briefs state for authenticated users
  const [cloudBriefs, setCloudBriefs] = useState<ProjectBrief[] | null>(null);
  const [loadingCloudBriefs, setLoadingCloudBriefs] = useState<boolean>(false);
  const [activeBriefIdState, setActiveBriefIdState] = useState<string>(SAMPLE_ACME_BRIEF.id);

  // Track whether we migrated local briefs for this user session
  const migratedForUserRef = useRef<string | null>(null);

  // Fetch or sync user briefs whenever user changes
  const syncUserBriefs = useCallback(async () => {
    if (!user) {
      setCloudBriefs(null);
      setLoadingCloudBriefs(false);
      return;
    }

    setLoadingCloudBriefs(true);
    try {
      // If user just logged in and has not yet migrated local work, sync local briefs to cloud
      if (migratedForUserRef.current !== user.id) {
        const stored = getStoredBriefs();
        // Only migrate if there are local briefs
        if (stored && stored.length > 0) {
          await migrateLocalBriefsToDb(supabase, stored, user.id);
        }
        migratedForUserRef.current = user.id;
      }

      // Fetch fresh briefs from Supabase
      const remote = await fetchUserBriefs(supabase);
      setCloudBriefs(remote);

      // If user has briefs, select the most recent one
      if (remote.length > 0) {
        setActiveBriefIdState(remote[0].id);
        setActiveBriefId(remote[0].id);
      }
    } catch (err: any) {
      console.error("Error syncing user briefs from Supabase:", err);
      showToast("Could not load cloud briefs: " + (err.message || "Unknown error"), "error");
    } finally {
      setLoadingCloudBriefs(false);
    }
  }, [user, supabase, showToast]);

  useEffect(() => {
    if (!authLoading) {
      syncUserBriefs();
    }
  }, [user?.id, authLoading, syncUserBriefs]);

  // Determine current effective briefs list
  const effectiveBriefs: ProjectBrief[] = user
    ? cloudBriefs ?? []
    : localBriefs;

  const activeBrief =
    effectiveBriefs.find((b) => b.id === activeBriefIdState) ||
    effectiveBriefs[0] ||
    SAMPLE_ACME_BRIEF;

  const handleSelectBrief = (b: ProjectBrief) => {
    setActiveBriefIdState(b.id);
    setActiveBriefId(b.id);
    setCurrentView("brief");
  };

  const handleBriefGenerated = async (newBrief: ProjectBrief) => {
    // 1. Always save locally for instant responsiveness
    saveBrief(newBrief);

    // 2. If authenticated, persist directly to Supabase cloud memory
    if (user) {
      try {
        const saved = await saveBriefToDb(supabase, newBrief, user.id);
        setCloudBriefs((prev) => [saved, ...(prev || []).filter((b) => b.id !== saved.id)]);
      } catch (err) {
        console.error("Failed to save brief to Supabase:", err);
      }
    }

    setActiveBriefIdState(newBrief.id);
    setActiveBriefId(newBrief.id);
    setCurrentView("brief");
  };

  const handleUpdateActiveBrief = async (updated: ProjectBrief) => {
    // 1. Save to local storage
    saveBrief(updated);

    // 2. If authenticated, persist update to Supabase
    if (user) {
      try {
        const saved = await saveBriefToDb(supabase, updated, user.id);
        setCloudBriefs((prev) =>
          (prev || []).map((b) => (b.id === saved.id ? saved : b))
        );
      } catch (err) {
        console.error("Failed to update brief in Supabase:", err);
      }
    }

    setActiveBriefIdState(updated.id);
  };

  const handleDeleteBrief = async (briefId: string) => {
    // 1. Delete from local storage
    deleteBrief(briefId);

    // 2. If authenticated, delete from Supabase
    if (user) {
      await deleteBriefFromDb(supabase, briefId);
      setCloudBriefs((prev) => (prev || []).filter((b) => b.id !== briefId));
    }

    // If active brief was deleted, switch to another
    if (activeBriefIdState === briefId) {
      const remaining = effectiveBriefs.filter((b) => b.id !== briefId);
      const nextId = remaining[0]?.id || SAMPLE_ACME_BRIEF.id;
      setActiveBriefIdState(nextId);
      setActiveBriefId(nextId);
    }
  };

  const handleViewSampleBrief = () => {
    const acme =
      effectiveBriefs.find((b) => b.id === SAMPLE_ACME_BRIEF.id) ||
      SAMPLE_ACME_BRIEF;
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
            briefs={effectiveBriefs}
            onSelectBrief={handleSelectBrief}
            onCreateBrief={() => setCurrentView("create")}
            onRefreshBriefs={syncUserBriefs}
            onDeleteBrief={handleDeleteBrief}
            loading={loadingCloudBriefs}
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
