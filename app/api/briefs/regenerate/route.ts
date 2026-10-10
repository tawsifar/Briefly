import { NextRequest, NextResponse } from "next/server";
import { regenerateBriefSection } from "@/lib/ai/service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { section, sourceText, currentBriefContext, createdDate } = body;

    if (!section || !sourceText) {
      return NextResponse.json(
        { error: "Section and sourceText are required." },
        { status: 400 }
      );
    }

    const result = await regenerateBriefSection(
      section,
      sourceText,
      currentBriefContext || "",
      typeof createdDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(createdDate) ? createdDate : undefined
    );
    if (!result.ok) {
      return NextResponse.json({ success: false, error: result.error }, { status: result.status });
    }
    return NextResponse.json({ success: true, section, data: result.data });
  } catch (error: any) {
    console.error("Error in /api/briefs/regenerate:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to regenerate section." },
      { status: 500 }
    );
  }
}
