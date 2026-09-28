import { NextRequest, NextResponse } from "next/server";
import { regenerateBriefSection } from "@/lib/ai/service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { section, sourceText, currentBriefContext } = body;

    if (!section || !sourceText) {
      return NextResponse.json(
        { error: "Section and sourceText are required." },
        { status: 400 }
      );
    }

    const updated = await regenerateBriefSection(section, sourceText, currentBriefContext || "");
    return NextResponse.json({ success: true, section, data: updated });
  } catch (error: any) {
    console.error("Error in /api/briefs/regenerate:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to regenerate section." },
      { status: 500 }
    );
  }
}
