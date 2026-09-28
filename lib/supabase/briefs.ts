import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProjectBrief } from "@/lib/types";

function safeIsoDate(d?: any): string {
  if (!d) return new Date().toISOString();
  try {
    const parsed = new Date(d);
    return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

/**
 * Fetch all briefs for the authenticated user, ordered by most recently updated.
 */
export async function fetchUserBriefs(
  supabase: SupabaseClient
): Promise<ProjectBrief[]> {
  try {
    const { data, error } = await supabase
      .from("briefs")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching briefs from Supabase:", error.message);
      return [];
    }

    return (data || []).map(rowToBrief);
  } catch (err: any) {
    console.error("Exception fetching briefs from Supabase:", err);
    return [];
  }
}

/**
 * Save (upsert) a brief to the database for the authenticated user.
 */
export async function saveBriefToDb(
  supabase: SupabaseClient,
  brief: ProjectBrief,
  userId: string
): Promise<ProjectBrief> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("briefs")
    .upsert(
      {
        id: brief.id,
        user_id: userId,
        title: brief.title || "Untitled Brief",
        status: brief.status || "draft",
        source_text: brief.source_text || "",
        brief_data: brief,
        updated_at: now,
      },
      { onConflict: "id,user_id" }
    )
    .select()
    .single();

  if (error) {
    console.error("Error saving brief to Supabase:", error.message);
    throw new Error(`Failed to save brief to database: ${error.message}`);
  }

  return rowToBrief(data);
}

/**
 * Delete a brief from the database.
 */
export async function deleteBriefFromDb(
  supabase: SupabaseClient,
  briefId: string
): Promise<void> {
  const { error } = await supabase.from("briefs").delete().eq("id", briefId);

  if (error) {
    console.error("Error deleting brief from Supabase:", error.message);
    throw new Error(`Failed to delete brief: ${error.message}`);
  }
}

/**
 * Fetch a single brief by ID.
 */
export async function getBriefByIdFromDb(
  supabase: SupabaseClient,
  briefId: string
): Promise<ProjectBrief | null> {
  const { data, error } = await supabase
    .from("briefs")
    .select("*")
    .eq("id", briefId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    console.error("Error fetching brief from Supabase:", error.message);
    return null;
  }

  return rowToBrief(data);
}

/**
 * Migrate localStorage briefs into the user's Supabase account.
 * Skips briefs that already exist (by ID) or upserts them safely.
 */
export async function migrateLocalBriefsToDb(
  supabase: SupabaseClient,
  localBriefs: ProjectBrief[],
  userId: string
): Promise<number> {
  if (!localBriefs || !localBriefs.length) return 0;

  // Filter out any invalid items
  const validBriefs = localBriefs.filter((b) => b && b.id && b.title);
  if (!validBriefs.length) return 0;

  const rows = validBriefs.map((brief) => ({
    id: brief.id,
    user_id: userId,
    title: brief.title,
    status: brief.status || "draft",
    source_text: brief.source_text || "",
    brief_data: brief,
    created_at: safeIsoDate(brief.created_at),
    updated_at: safeIsoDate(brief.updated_at),
  }));

  try {
    const { error } = await supabase
      .from("briefs")
      .upsert(rows, { onConflict: "id,user_id" });

    if (error) {
      console.warn("Notice during local briefs migration:", error.message);
      return 0;
    }

    return rows.length;
  } catch (err: any) {
    console.warn("Exception migrating local briefs:", err);
    return 0;
  }
}

// ---- Helpers ----

interface BriefRow {
  id: string;
  user_id: string;
  title: string;
  status: string;
  source_text: string;
  brief_data: ProjectBrief;
  created_at: string;
  updated_at: string;
}

function rowToBrief(row: BriefRow): ProjectBrief {
  return {
    ...row.brief_data,
    id: row.id,
    title: row.title,
    status: row.brief_data.status || (row.status as ProjectBrief["status"]),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
