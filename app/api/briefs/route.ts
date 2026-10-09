import { NextRequest, NextResponse } from "next/server";
import { generateBrief } from "@/lib/ai/service";
import { getTodayDateInfo } from "@/lib/ai/prompts";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, projectNameHint, files, createdDate, weekday } = body;

    const hasText = typeof text === "string" && text.trim().length > 0;
    const hasFiles = Array.isArray(files) && files.length > 0;

    if (!hasText && !hasFiles) {
      return NextResponse.json(
        { error: "Please provide a client message or upload at least one document/image." },
        { status: 400 }
      );
    }

    const today = getTodayDateInfo();
    const { brief, validation } = await generateBrief({
      text: (text || "").trim(),
      projectNameHint: projectNameHint?.trim(),
      createdDateStr: createdDate || today.dateStr,
      weekdayStr: weekday || today.weekdayStr,
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
