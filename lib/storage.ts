import { ProjectBrief } from "./types";
import { SAMPLE_ACME_BRIEF, INITIAL_BRIEFS_LIST } from "./sample-data";

const STORAGE_KEY = "briefly_project_briefs_v1";
const ACTIVE_BRIEF_KEY = "briefly_active_brief_id";

const listeners = new Set<() => void>();

export function subscribeToBriefs(callback: () => void) {
  listeners.add(callback);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", callback);
  }
  return () => {
    listeners.delete(callback);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", callback);
    }
  };
}

function notify() {
  listeners.forEach((fn) => fn());
}

let cachedBriefs: ProjectBrief[] = INITIAL_BRIEFS_LIST;
let cacheInitialized = false;

export function getStoredBriefs(): ProjectBrief[] {
  if (typeof window === "undefined") {
    return INITIAL_BRIEFS_LIST;
  }

  if (cacheInitialized) {
    return cachedBriefs;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BRIEFS_LIST));
      cachedBriefs = INITIAL_BRIEFS_LIST;
    } else {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedBriefs = parsed;
      } else {
        cachedBriefs = INITIAL_BRIEFS_LIST;
      }
    }
  } catch (e) {
    console.error("Failed to read briefs from localStorage:", e);
    cachedBriefs = INITIAL_BRIEFS_LIST;
  }

  cacheInitialized = true;
  return cachedBriefs;
}

export function saveBrief(brief: ProjectBrief): ProjectBrief {
  if (typeof window === "undefined") return brief;

  const current = getStoredBriefs();
  const index = current.findIndex((b) => b.id === brief.id);
  const updatedBrief = {
    ...brief,
    updated_at: new Date().toISOString(),
  };

  let nextList: ProjectBrief[];
  if (index >= 0) {
    nextList = [...current];
    nextList[index] = updatedBrief;
  } else {
    nextList = [updatedBrief, ...current];
  }

  cachedBriefs = nextList;
  cacheInitialized = true;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
    localStorage.setItem(ACTIVE_BRIEF_KEY, updatedBrief.id);
  } catch (e) {
    console.error("Failed to save brief to localStorage:", e);
  }

  notify();
  return updatedBrief;
}

export function getBriefById(id: string): ProjectBrief | null {
  const briefs = getStoredBriefs();
  return briefs.find((b) => b.id === id) || (id === SAMPLE_ACME_BRIEF.id ? SAMPLE_ACME_BRIEF : null);
}

export function deleteBrief(id: string): void {
  if (typeof window === "undefined") return;
  const current = getStoredBriefs();
  const filtered = current.filter((b) => b.id !== id);
  cachedBriefs = filtered;
  cacheInitialized = true;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  notify();
}

export function getActiveBriefId(): string {
  if (typeof window === "undefined") return SAMPLE_ACME_BRIEF.id;
  return localStorage.getItem(ACTIVE_BRIEF_KEY) || SAMPLE_ACME_BRIEF.id;
}

export function setActiveBriefId(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTIVE_BRIEF_KEY, id);
  notify();
}
