import { NextRequest, NextResponse } from "next/server";
import { generateBrief } from "@/lib/ai/service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, projectNameHint, files, createdDate, weekday } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Source text is required to generate a brief." },
        { status: 400 }
      );
    }

    const { brief, validation } = await generateBrief({
      text: text.trim(),
      projectNameHint: projectNameHint?.trim(),
      createdDateStr: createdDate || "2026-09-28",
      weekdayStr: weekday || "Monday",
      files,
    });

    return NextResponse.json({ brief, validation });
  } catch (error: any) {
    console.error("Error in /api/briefs:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to analyze client communication." },
      { status: 500 }
    );
  }
}
