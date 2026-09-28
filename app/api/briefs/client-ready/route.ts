import { NextRequest, NextResponse } from "next/server";
import { generateClientReadyDocument } from "@/lib/ai/service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { brief } = body;

    if (!brief) {
      return NextResponse.json({ error: "Brief data is required." }, { status: 400 });
    }

    const clientReadyMarkdown = await generateClientReadyDocument(JSON.stringify(brief));
    return NextResponse.json({ success: true, markdown: clientReadyMarkdown });
  } catch (error: any) {
    console.error("Error in /api/briefs/client-ready:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate client-ready overview." },
      { status: 500 }
    );
  }
}
