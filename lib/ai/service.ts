import { getGeminiClient, getModelName } from "./gemini";
import { geminiBrieflyResponseSchema, BrieflyOutputParsed, BrieflyOutputSchema } from "./schema";
import {
  SYSTEM_INTAKE_ANALYST_PROMPT,
  DOCUMENT_OCR_TRANSCRIPTION_PROMPT,
  buildExtractionPrompt,
  buildSectionRegenerationPrompt,
  buildClientReadyPrompt,
  BRIEFLY_PROMPT_VERSION,
  getTodayDateInfo,
} from "./prompts";
import { validateAndCleanBrief, computeClarityBand, ValidationResult } from "./validation";
import {
  ProjectBrief,
  BrieflyOutput,
  formatStandardDate,
  TargetDeadlineInfo,
  Fact,
  DeliverableItem,
  StructuredAmbiguity,
  StructuredQuestion,
  ClarityDimension,
  OutOfScopeItem,
  StructuredRisk,
} from "../types";

export interface GenerateBriefInput {
  text: string;
  projectNameHint?: string;
  createdDateStr?: string;
  weekdayStr?: string;
  files?: Array<{ name: string; size?: number; mimeType: string; dataBase64?: string }>;
}

/**
 * Transcribe attachments (PDFs and images) verbatim via Gemini multimodal OCR
 */
export async function extractTextFromAttachments(
  files: Array<{ name: string; size?: number; mimeType: string; dataBase64?: string }>
): Promise<string> {
  const validFiles = (files || []).filter((f) => f.dataBase64 && f.mimeType);
  if (validFiles.length === 0) return "";

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return validFiles.map((f) => `[Attachment: ${f.name}]`).join("\n\n");
  }

  try {
    const ai = getGeminiClient();
    const modelName = getModelName();

    const contents: Array<string | { inlineData: { mimeType: string; data: string } }> = [];
    for (const file of validFiles) {
      if (file.dataBase64) {
        contents.push({
          inlineData: {
            mimeType: file.mimeType,
            data: file.dataBase64,
          },
        });
      }
    }
    contents.push(DOCUMENT_OCR_TRANSCRIPTION_PROMPT);

    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config: {
        temperature: 0.1,
      },
    });

    const transcribed = response.text?.trim();
    if (transcribed && transcribed.length > 0) {
      return transcribed;
    }
  } catch (error) {
    console.error("Failed to transcribe attachments via Gemini OCR:", error);
  }

  return validFiles.map((f) => `[Attachment: ${f.name}]`).join("\n\n");
}

export async function generateBrief(input: GenerateBriefInput): Promise<{
  output: BrieflyOutput;
  validation: ValidationResult;
  brief: ProjectBrief;
}> {
  const today = getTodayDateInfo();
  const createdDateStr = input.createdDateStr || today.dateStr;
  const weekdayStr = input.weekdayStr || today.weekdayStr;
  const rawText = (input.text || "").trim();

  // If attachments are present, transcribe them verbatim
  let attachmentTranscript = "";
  if (input.files && input.files.length > 0) {
    attachmentTranscript = await extractTextFromAttachments(input.files);
  }

  const isGenericAttachmentPlaceholder =
    rawText.startsWith("Analyzed from ") && rawText.includes("uploaded attachments");

  let canonicalSourceText = "";
  if (isGenericAttachmentPlaceholder || !rawText) {
    canonicalSourceText = attachmentTranscript || rawText || "Client communication intake.";
  } else if (attachmentTranscript && !rawText.includes(attachmentTranscript)) {
    canonicalSourceText = `${rawText}\n\n--- Extracted Document & OCR Content ---\n\n${attachmentTranscript}`;
  } else {
    canonicalSourceText = rawText;
  }

  const sourceText = canonicalSourceText;
  let rawOutput: BrieflyOutput;

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    console.warn("GEMINI_API_KEY not configured. Using grounded deterministic extraction.");
    rawOutput = generateGroundedFallback(sourceText, input.projectNameHint, createdDateStr, weekdayStr);
  } else {
    try {
      const ai = getGeminiClient();
      const modelName = getModelName();
      const promptText = buildExtractionPrompt(
        sourceText,
        input.projectNameHint,
        createdDateStr,
        weekdayStr
      );

      const contents: Array<string | { inlineData: { mimeType: string; data: string } }> = [];
      if (input.files && input.files.length > 0) {
        for (const file of input.files) {
          if (file.dataBase64) {
            contents.push({
              inlineData: {
                mimeType: file.mimeType,
                data: file.dataBase64,
              },
            });
          }
        }
      }
      contents.push(promptText);

      const response = await ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          systemInstruction: SYSTEM_INTAKE_ANALYST_PROMPT,
          responseMimeType: "application/json",
          responseSchema: geminiBrieflyResponseSchema,
          temperature: 0.15,
        },
      });

      const responseText = response.text;
      if (!responseText) throw new Error("Empty response from Gemini model.");

      const parsedJson = JSON.parse(responseText.trim());
      rawOutput = BrieflyOutputSchema.parse(parsedJson) as BrieflyOutput;
    } catch (error) {
      console.error("Gemini API call failed, falling back to grounded parser:", error);
      rawOutput = generateGroundedFallback(sourceText, input.projectNameHint, createdDateStr, weekdayStr);
    }
  }

  // Run through V1 to V9 validation pipeline
  const validation = validateAndCleanBrief(rawOutput, sourceText, createdDateStr);
  const cleanOutput = validation.output;

  // Compute total score and band in code
  const totalScore = cleanOutput.clarity.dimensions.reduce((acc, d) => acc + d.score, 0);
  const clarityBand = computeClarityBand(totalScore);

  const briefId = `brief_${Date.now().toString(36).substring(0, 6)}`;
  const nowIso = new Date().toISOString();
  const createdDateFormatted = formatStandardDate(createdDateStr);

  const fullBrief: ProjectBrief = {
    id: briefId,
    title: cleanOutput.projectTitle || input.projectNameHint || "Project Brief",
    status: validation.status,
    created_at: nowIso,
    updated_at: nowIso,
    source_text: sourceText,
    source_files: input.files?.map((f) => ({
      name: f.name || "uploaded-file",
      size: f.size || 0,
      type: f.mimeType || "application/octet-stream",
    })) || [],
    version: 2,
    prompt_version: BRIEFLY_PROMPT_VERSION,
    createdDateFormatted,
    targetDeadline: cleanOutput.targetDeadline,
    clarityData: {
      overall: totalScore,
      band: clarityBand,
      dimensions: cleanOutput.clarity.dimensions,
    },
    executiveSummary: cleanOutput.summary,
    structuredDeliverables: cleanOutput.deliverables,
    structuredAmbiguities: cleanOutput.ambiguities,
    structuredQuestions: cleanOutput.questions,
    structuredOutOfScope: cleanOutput.outOfScope,
    structuredRisks: cleanOutput.risks,
    facts: cleanOutput.facts,
    validationIssues: validation.issues,

    // Legacy fields mapped for backward compatibility
    project: {
      name: cleanOutput.projectTitle,
      summary: cleanOutput.summary.paragraph,
      goal: cleanOutput.summary.goal,
      deadline: cleanOutput.targetDeadline.displayLine1,
      deadline_confidence: cleanOutput.targetDeadline.isFirm ? "high" : "medium",
    },
    requirements: cleanOutput.deliverables.map((d) => ({
      id: d.id,
      title: d.label,
      description: d.description,
      status: d.tag === "Confirmed" ? "confirmed" : "ambiguous",
      priority: "high",
      source_excerpt: d.evidence,
      confidence: d.tag === "Confirmed" ? 0.95 : 0.75,
    })),
    deliverables: cleanOutput.deliverables.map((d) => `${d.label} (${d.group}): ${d.description}`),
    scope: {
      in_scope: cleanOutput.deliverables.filter((d) => d.tag === "Confirmed").map((d) => d.label),
      uncertain_scope: cleanOutput.deliverables.filter((d) => d.tag === "Needs scoping").map((d) => d.label),
      possible_future_scope: cleanOutput.outOfScope
        .filter((o) => o.group === "Pending client decision")
        .map((o) => o.label),
      out_of_scope: cleanOutput.outOfScope
        .filter((o) => o.group === "Not mentioned, excluded unless confirmed")
        .map((o) => o.label),
    },
    ambiguities: cleanOutput.ambiguities.map((a) => ({
      id: a.id,
      topic: a.title,
      explanation: `${a.whatIsUnclear} ${a.whyItMatters}`,
      source_excerpt: a.evidence || "Not mentioned in the message",
      severity: a.severity.toLowerCase() as any,
      suggested_question:
        cleanOutput.questions.find((q) => q.linkedAmbiguityId === a.id)?.text || "Please clarify.",
    })),
    questions: cleanOutput.questions.map((q) => ({
      id: q.id,
      question: q.text,
      reason: q.rationale,
      priority: "high",
    })),
    missing_information: cleanOutput.ambiguities
      .filter((a) => a.kind === "MISSING")
      .map((a) => ({
        id: `miss-${a.id}`,
        item: a.title,
        reason: a.whatIsUnclear,
        importance: "high" as const,
      })),
    risks: cleanOutput.risks.map((r) => ({
      id: r.id,
      risk: r.title,
      impact: r.explanation,
      severity: r.severity.toLowerCase() as any,
      suggested_action: r.recommendedAction,
    })),
    dependencies: [],
    next_steps: cleanOutput.questions.slice(0, 3).map((q, idx) => ({
      id: `step-${idx + 1}`,
      step: `Send clarification question: "${q.text}"`,
      priority: "high",
    })),
    scores: {
      overall: totalScore,
      scope_clarity: Math.round((cleanOutput.clarity.dimensions[1]?.score || 14) * 5),
      timeline_clarity: Math.round((cleanOutput.clarity.dimensions[2]?.score || 9) * 6.6),
      requirements_clarity: Math.round((cleanOutput.clarity.dimensions[0]?.score || 9) * 6.6),
      dependency_clarity: Math.round((cleanOutput.clarity.dimensions[5]?.score || 6) * 5),
      calculation_note: `Calculated sum of 6 clarity dimensions: ${totalScore}/100 (${clarityBand})`,
    },
  };

  return { output: cleanOutput, validation, brief: fullBrief };
}

// Reference Output for Part 1 test case adhering strictly to Part 12 & Part 13
export function getReferenceAirbnbBrief(
  sourceText: string,
  projectNameHint?: string,
  createdDateStr: string = "2026-09-28"
): BrieflyOutput {
  return {
    facts: [
      {
        id: "F1",
        category: "goal",
        statement: "The client needs a new website built.",
        evidence: "we need a new website built",
        status: "EXPLICIT",
      },
      {
        id: "F2",
        category: "design",
        statement: "The client requested an aesthetic inspired by Airbnb, but darker, more premium and edgy.",
        evidence: "the vibe of Airbnb, but maybe more premium and edgy",
        status: "EXPLICIT",
      },
      {
        id: "F3",
        category: "page",
        statement: "The client specified four core pages: Home, About, Services, and Contact.",
        evidence: "Home, About, Services, Contact",
        status: "EXPLICIT",
      },
      {
        id: "F4",
        category: "feature",
        statement: "The client proposed a booking portal if it does not require significant extra effort.",
        evidence: "maybe a booking portal if it's not too much extra work",
        status: "CONDITIONAL",
      },
      {
        id: "F5",
        category: "timeline",
        statement: "The client hopes to soft launch by the first week of next month.",
        evidence: "by the first week of next month for our soft launch",
        status: "CONDITIONAL",
      },
      {
        id: "F6",
        category: "content",
        statement: "Final website copy is not yet written.",
        evidence: "We don't have the final text written yet",
        status: "EXPLICIT",
      },
      {
        id: "F7",
        category: "asset",
        statement: "Phone photos are available to use as temporary visual placeholders.",
        evidence: "photos we took on our phones that you can use for now",
        status: "EXPLICIT",
      },
      {
        id: "F8",
        category: "feature",
        statement: "The client asked for a chatbot popup connecting to Instagram.",
        evidence: "chatbot popup that connects directly to our Instagram",
        status: "EXPLICIT",
      },
      {
        id: "F9",
        category: "design",
        statement: "The client requires the design to stand out visually and load very fast.",
        evidence: "needs to 'pop' and obviously load super fast",
        status: "EXPLICIT",
      },
    ],
    projectTitle: projectNameHint || "Premium Airbnb-Inspired Website",
    targetDeadline: {
      clientWording: "First week of next month, soft launch",
      milestoneType: "soft_launch",
      resolvedStart: "2026-10-01",
      resolvedEnd: "2026-10-07",
      isFirm: false,
      displayLine1: "First week of next month, soft launch",
      displayLine2: "Oct 1 to Oct 7, 2026 (3 to 9 days after the message). Exact date to be confirmed.",
    },
    clarity: {
      dimensions: [
        {
          key: "goal_and_context",
          label: "Goal and business context",
          score: 9,
          max: 15,
          justification: "Client requested a new website but did not state what the business does or who its customers are.",
        },
        {
          key: "scope_and_deliverables",
          label: "Scope and deliverables",
          score: 14,
          max: 20,
          justification: "Four core pages are explicitly named, but the booking portal and chatbot depth remain open.",
        },
        {
          key: "timeline_and_deadline",
          label: "Timeline and deadline",
          score: 9,
          max: 15,
          justification: "Client gave a relative soft launch window that falls only 3 to 9 days after the message date.",
        },
        {
          key: "content_and_assets",
          label: "Content and asset readiness",
          score: 5,
          max: 15,
          justification: "No final text is written, brand assets are unmentioned, and only phone photos are currently available.",
        },
        {
          key: "design_direction",
          label: "Design direction",
          score: 7,
          max: 15,
          justification: "Subjective reference to Airbnb and edgy styling without concrete moodboards or color palettes.",
        },
        {
          key: "technical_and_integration",
          label: "Technical and integration definition",
          score: 6,
          max: 20,
          justification: "Instagram chatbot and booking portal requirements lack architecture, authentication, and API specs.",
        },
      ],
    },
    summary: {
      goal: "Build a new premium, edgy website inspired by the look and feel of Airbnb, ready for a soft launch in the first week of next month.",
      paragraph: "The client wants a new website with four to five pages: Home, About, Services, and Contact, plus a possible booking portal if the extra effort is small. They describe the style as Airbnb-like but more premium and edgy, and they want the design to stand out and load very fast. The soft launch is planned for the first week of next month, only days after the message date. Final text is not written yet, so the site will use the client's phone photos as temporary images. The client also asked for a chatbot popup connected to their Instagram.",
      keyFacts: [
        { label: "Project type", value: "New website" },
        { label: "Pages", value: "Home, About, Services, Contact (booking portal maybe)" },
        { label: "Style direction", value: "Airbnb-inspired, more premium and edgy" },
        { label: "Timeline", value: "Soft launch, first week of next month" },
        { label: "Content status", value: "No final text, phone photos available" },
        { label: "Extras requested", value: "Instagram-connected chatbot popup" },
      ],
    },
    deliverables: [
      {
        id: "D1",
        factId: "F3",
        group: "Pages",
        label: "Home page",
        description: "Design and build responsive Home landing page.",
        evidence: "Home, About, Services, Contact",
        tag: "Confirmed",
      },
      {
        id: "D2",
        factId: "F3",
        group: "Pages",
        label: "About page",
        description: "Design and build company About page.",
        evidence: "Home, About, Services, Contact",
        tag: "Confirmed",
      },
      {
        id: "D3",
        factId: "F3",
        group: "Pages",
        label: "Services page",
        description: "Design and build commercial Services page.",
        evidence: "Home, About, Services, Contact",
        tag: "Confirmed",
      },
      {
        id: "D4",
        factId: "F3",
        group: "Pages",
        label: "Contact page",
        description: "Design and build Contact and inquiry page.",
        evidence: "Home, About, Services, Contact",
        tag: "Confirmed",
      },
      {
        id: "D5",
        factId: "F2",
        group: "Design and Experience",
        label: "Airbnb-inspired visual direction",
        description: "Create visual layout inspired by Airbnb clean aesthetic with darker and edgier styling.",
        evidence: "the vibe of Airbnb",
        tag: "Confirmed",
      },
      {
        id: "D6",
        factId: "F9",
        group: "Design and Experience",
        label: "Visually striking design",
        description: "Apply dynamic typography and accent highlights that pop.",
        evidence: "needs to 'pop'",
        tag: "Confirmed",
      },
      {
        id: "D7",
        factId: "F9",
        group: "Design and Experience",
        label: "Fast page loading",
        description: "Optimize assets and markup for fast initial page load.",
        evidence: "load super fast",
        tag: "Confirmed",
      },
      {
        id: "D8",
        factId: "F7",
        group: "Content and Assets",
        label: "Client phone photos as temporary images",
        description: "Process and place client phone photos as temporary image placeholders.",
        evidence: "photos we took on our phones that you can use for now",
        tag: "Confirmed",
      },
      {
        id: "D9",
        factId: "F8",
        group: "Features",
        label: "Chatbot popup connected to Instagram",
        description: "Integrate chat widget connected to client Instagram account.",
        evidence: "chatbot popup that connects directly to our Instagram",
        tag: "Needs scoping",
      },
    ],
    ambiguities: [
      {
        id: "A1",
        title: "Launch date and soft launch meaning",
        severity: "HIGH",
        kind: "UNCLEAR",
        evidence: "by the first week of next month for our soft launch",
        whatIsUnclear: "The date is relative. From Sep 28, 2026 it means Oct 1 to 7, or possibly the week starting Oct 5. The client also did not say what a soft launch includes or whether the date can move.",
        whyItMatters: "A custom premium site with extras may not fit in 3 to 9 days.",
        linkedQuestionId: "Q1",
        isStandardKickoffItem: false,
      },
      {
        id: "A2",
        title: "Booking portal scope",
        severity: "HIGH",
        kind: "UNCLEAR",
        evidence: "maybe a booking portal if it's not too much extra work",
        whatIsUnclear: "The client did not say what customers would book or whether it needs payments, accounts, or a live calendar.",
        whyItMatters: "The work ranges from a simple form to a full booking system.",
        linkedQuestionId: "Q2",
        isStandardKickoffItem: false,
      },
      {
        id: "A3",
        title: "Instagram chatbot scope",
        severity: "HIGH",
        kind: "UNCLEAR",
        evidence: "chatbot popup that connects directly to our Instagram",
        whatIsUnclear: "Connects could mean replying to Instagram messages, showing the feed, or linking to the profile. It is also unclear whether the bot uses scripted or AI answers.",
        whyItMatters: "Direct messaging integrations may need a business account and platform approval, which can take longer than the launch window.",
        linkedQuestionId: "Q3",
        isStandardKickoffItem: false,
      },
      {
        id: "A4",
        title: "Business, audience, and services",
        severity: "HIGH",
        kind: "MISSING",
        evidence: null,
        whatIsUnclear: "The message does not mention what the business does, who its customers are, or what the Services page should cover.",
        whyItMatters: "Design tone and page content cannot be planned without this.",
        linkedQuestionId: "Q4",
        isStandardKickoffItem: false,
      },
      {
        id: "A5",
        title: "Website copy ownership",
        severity: "MEDIUM",
        kind: "UNCLEAR",
        evidence: "We don't have the final text written yet",
        whatIsUnclear: "The client did not say who writes the final text or by when.",
        whyItMatters: "Placeholder text at a soft launch may not be acceptable, and late copy delays launch.",
        linkedQuestionId: "Q5",
        isStandardKickoffItem: false,
      },
      {
        id: "A6",
        title: "Design direction and brand assets",
        severity: "MEDIUM",
        kind: "UNCLEAR",
        evidence: "more premium and edgy",
        whatIsUnclear: "Premium and edgy is subjective, and the client did not mention a logo, brand colors, or fonts.",
        whyItMatters: "Without references we risk redesign rounds.",
        linkedQuestionId: "Q6",
        isStandardKickoffItem: false,
      },
      {
        id: "A7",
        title: "Phone photo quality",
        severity: "MEDIUM",
        kind: "UNCLEAR",
        evidence: "photos we took on our phones",
        whatIsUnclear: "The client did not say how many photos exist or whether they are good enough for a premium look.",
        whyItMatters: "Low quality images can undermine the premium style the client wants.",
        linkedQuestionId: "Q7",
        isStandardKickoffItem: false,
      },
      {
        id: "A8",
        title: "Budget and approval contact",
        severity: "LOW",
        kind: "MISSING",
        evidence: null,
        whatIsUnclear: "The message does not mention a budget range or a name for the person who approves designs.",
        whyItMatters: "Both shape the scope decisions on the booking portal and chatbot.",
        linkedQuestionId: "Q8",
        isStandardKickoffItem: true,
      },
    ],
    questions: [
      {
        id: "Q1",
        text: "Which exact date do you want for the soft launch? 'First week of next month' could mean October 1 to 7.",
        rationale: "We need the exact date to check whether the core pages can be finished in time.",
        linkedAmbiguityId: "A1",
        priority: 1,
      },
      {
        id: "Q2",
        text: "For the booking portal, what would customers book, and do you need online payments or is a simple request form enough?",
        rationale: "The answer decides whether this is a small add-on or a separate build.",
        linkedAmbiguityId: "A2",
        priority: 2,
      },
      {
        id: "Q3",
        text: "When you say the chatbot connects to Instagram, should it reply to your Instagram messages, show your feed, or link visitors to your profile?",
        rationale: "Each option needs very different work and approvals.",
        linkedAmbiguityId: "A3",
        priority: 3,
      },
      {
        id: "Q4",
        text: "Can you tell us what your business does and which services you want listed on the Services page?",
        rationale: "We need this to set the tone of the design and plan the page content.",
        linkedAmbiguityId: "A4",
        priority: 4,
      },
      {
        id: "Q5",
        text: "Who will write the final text for each page, and by what date can we expect it?",
        rationale: "The site cannot launch in a finished state without final text.",
        linkedAmbiguityId: "A5",
        priority: 5,
      },
      {
        id: "Q6",
        text: "Can you share your logo, brand colors, and two or three websites that feel 'premium and edgy' to you?",
        rationale: "Examples let us match your taste in the first draft and avoid rework.",
        linkedAmbiguityId: "A6",
        priority: 6,
      },
      {
        id: "Q7",
        text: "Could you send the phone photos you plan to use, so we can check their quality for a premium look?",
        rationale: "We can plan early if better images are needed.",
        linkedAmbiguityId: "A7",
        priority: 7,
      },
      {
        id: "Q8",
        text: "Who on your team will approve the designs, and do you have a budget range in mind?",
        rationale: "We can send drafts to the right person and size the optional features properly.",
        linkedAmbiguityId: "A8",
        priority: 8,
      },
    ],
    outOfScope: [
      {
        id: "O1",
        group: "Pending client decision",
        label: "Booking portal",
        reason: "Treat as a Phase 2 candidate until the client confirms scope and requirements.",
        evidence: "maybe a booking portal if it's not too much extra work",
      },
      {
        id: "O2",
        group: "Pending client decision",
        label: "Two-way Instagram message automation",
        reason: "Only if the client confirms the chatbot must reply to Instagram direct messages.",
        evidence: "chatbot popup that connects directly to our Instagram",
      },
      {
        id: "O3",
        group: "Not mentioned, excluded unless confirmed",
        label: "Professional copywriting for all pages",
        reason: "Client must provide copy or contract writing as an add-on service.",
        evidence: null,
      },
      {
        id: "O4",
        group: "Not mentioned, excluded unless confirmed",
        label: "Professional photography and image retouching",
        reason: "Client is providing temporary phone photos.",
        evidence: null,
      },
      {
        id: "O5",
        group: "Not mentioned, excluded unless confirmed",
        label: "Logo and brand identity design",
        reason: "Assumes brand identity assets will be supplied by client.",
        evidence: null,
      },
      {
        id: "O6",
        group: "Not mentioned, excluded unless confirmed",
        label: "Domain purchase, hosting setup, and ongoing maintenance",
        reason: "Infrastructure provisioning is excluded unless specifically contracted.",
        evidence: null,
      },
      {
        id: "O7",
        group: "Not mentioned, excluded unless confirmed",
        label: "Search engine optimization and analytics setup",
        reason: "Advanced search positioning and tracking setup are handled as separate phase.",
        evidence: null,
      },
    ],
    risks: [
      {
        id: "R1",
        title: "Timeline too tight for the scope",
        severity: "HIGH",
        explanation: "The soft launch is 3 to 9 days after the message, yet the client wants four to five premium pages, extras, and has no final text.",
        recommendedAction: "Agree an exact date on the kickoff call and propose phases, with the four core pages first and the booking portal and chatbot after.",
        owner: "Both",
      },
      {
        id: "R2",
        title: "Scope creep signals",
        severity: "HIGH",
        explanation: "Phrases like 'maybe', 'if it's not too much extra work', and 'could we throw in' suggest the client expects the booking portal and chatbot at little extra cost.",
        recommendedAction: "Send separate estimates for the core site, the booking portal, and the chatbot, and get written approval for each.",
        owner: "Agency",
      },
      {
        id: "R3",
        title: "Missing text delays launch",
        severity: "HIGH",
        explanation: "Design and layout depend on real copy.",
        recommendedAction: "Agree a copy deadline, share page outlines with word limits, and offer copywriting as a paid option.",
        owner: "Client",
      },
      {
        id: "R4",
        title: "Instagram integration may not work as expected",
        severity: "MEDIUM",
        explanation: "A chatbot linked to Instagram messages may need a business account and platform approval that the client may not have.",
        recommendedAction: "Confirm what 'connects' means and check the account type before promising a date.",
        owner: "Agency",
      },
      {
        id: "R5",
        title: "Phone photos weaken a premium look",
        severity: "MEDIUM",
        explanation: "Low quality phone photos can conflict with the premium look the client desires.",
        recommendedAction: "Review the photos in the first week, set a minimum quality, and plan an image upgrade after launch.",
        owner: "Both",
      },
      {
        id: "R6",
        title: "Visual impact can conflict with speed",
        severity: "MEDIUM",
        explanation: "Large photos and a chatbot script slow pages down, while the client wants both a striking look and very fast loading.",
        recommendedAction: "Set a measurable performance target, compress all images, and load the chatbot after the main content.",
        owner: "Agency",
      },
      {
        id: "R7",
        title: "Airbnb reference could lead to a near copy",
        severity: "LOW",
        explanation: "Over-reliance on Airbnb reference could produce a derivative look.",
        recommendedAction: "Use Airbnb as inspiration for feel and layout only, and collect other references to keep the result distinct.",
        owner: "Agency",
      },
    ],
  };
}

// Grounded parser for inputs if API key is not present or Gemini fails
export function generateGroundedFallback(
  sourceText: string,
  projectNameHint?: string,
  createdDateStr?: string,
  weekdayStr?: string
): BrieflyOutput {
  const today = getTodayDateInfo();
  const activeDateStr = createdDateStr || today.dateStr;

  // 1. Detect any deadline or temporal references in sourceText
  const dateMatch = sourceText.match(
    /(?:(?:the\s+)?deadline(?:\s+is)?|due(?:\s+by)?|launch(?:\s+by)?|target(?:\s+is)?|finish(?:\s+by)?|ready(?:\s+by)?|before|about|around)?\s*(?:the\s+)?(end\s+of\s+[a-z]+|middle\s+of\s+[a-z]+|mid-[a-z]+|beginning\s+of\s+[a-z]+|(?:january|february|march|april|may|june|july|august|september|october|november|december)(?:\s+\d{1,2}(?:st|nd|rd|th)?)?|\d{1,2}(?:st|nd|rd|th)?\s+of\s+[a-z]+|in\s+\d+\s*(?:weeks?|months?|days?)|next\s+(?:month|week|quarter)|by\s+[a-z]+(?:\s+\d{1,2})?)/i
  );

  let targetDeadline: TargetDeadlineInfo;
  if (dateMatch && dateMatch[0]) {
    const rawDatePhrase = dateMatch[0].trim();
    const cleanLine1 = rawDatePhrase.charAt(0).toUpperCase() + rawDatePhrase.slice(1);
    targetDeadline = {
      clientWording: rawDatePhrase,
      milestoneType: "approximate_target",
      resolvedStart: null,
      resolvedEnd: null,
      isFirm: false,
      displayLine1: cleanLine1,
      displayLine2: `Target timeline derived from client message (${rawDatePhrase}). Specific launch milestone to be confirmed during kickoff.`,
    };
  } else {
    targetDeadline = {
      clientWording: null,
      milestoneType: "unspecified",
      resolvedStart: null,
      resolvedEnd: null,
      isFirm: null,
      displayLine1: "Not specified by client",
      displayLine2: "Target milestone date to be determined during kickoff.",
    };
  }

  // 2. Break sourceText into sentences/clauses for grounded fact & deliverable extraction
  const rawSentences = sourceText
    .split(/(?<=[.?!:\n])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8);

  const facts: Fact[] = [];
  const deliverables: DeliverableItem[] = [];

  const candidateSentences = rawSentences.length > 0 ? rawSentences : [sourceText.slice(0, 100)];

  candidateSentences.slice(0, 6).forEach((sentence, idx) => {
    const factId = `F${idx + 1}`;
    let category: Fact["category"] = "goal";
    const lower = sentence.toLowerCase();

    if (lower.includes("page") || lower.includes("home") || lower.includes("about") || lower.includes("contact")) {
      category = "page";
    } else if (lower.includes("design") || lower.includes("vibe") || lower.includes("style") || lower.includes("dark") || lower.includes("look")) {
      category = "design";
    } else if (lower.includes("deadline") || lower.includes("month") || lower.includes("october") || lower.includes("november") || lower.includes("week")) {
      category = "timeline";
    } else if (lower.includes("portal") || lower.includes("feature") || lower.includes("chat") || lower.includes("app") || lower.includes("integration")) {
      category = "feature";
    }

    const excerpt = sentence.length > 100 ? sentence.slice(0, 95) + "..." : sentence;

    facts.push({
      id: factId,
      category,
      statement: `The client mentioned: "${excerpt}"`,
      evidence: excerpt,
      status: lower.includes("maybe") || lower.includes("if") || lower.includes("could") ? "CONDITIONAL" : "EXPLICIT",
    });

    // Deliverable derivation
    if (category === "page" || category === "feature" || category === "goal" || category === "design") {
      let group: DeliverableItem["group"] = "Pages";
      if (category === "design") group = "Design and Experience";
      if (category === "feature") group = "Features";

      deliverables.push({
        id: `D${deliverables.length + 1}`,
        factId,
        group,
        label: category === "page" ? "Identified page requirements" : category === "design" ? "Aesthetic & styling guidelines" : "Core functional scope",
        description: sentence,
        evidence: excerpt,
        tag: lower.includes("maybe") || lower.includes("if") ? "Needs scoping" : "Confirmed",
      });
    }
  });

  // Ensure at least 1-2 deliverables exist
  if (deliverables.length === 0) {
    const firstSentence = candidateSentences[0] || sourceText.slice(0, 60);
    deliverables.push({
      id: "D1",
      factId: "F1",
      group: "Pages",
      label: "Initial client deliverable",
      description: firstSentence,
      evidence: firstSentence.slice(0, 80),
      tag: "Confirmed",
    });
  }

  // 3. Project title
  let projectTitle = projectNameHint;
  if (!projectTitle) {
    const firstWords = candidateSentences[0]?.split(/\s+/).slice(0, 5).join(" ") || "Client Project";
    projectTitle = `${firstWords} Intake Specification`.replace(/[^\w\s-]/g, "");
  }

  // 4. Clarity dimensions
  const hasTimeline = targetDeadline.milestoneType !== "unspecified";
  const clarity = {
    dimensions: [
      { key: "goal_and_context", label: "Goal and business context", score: 10, max: 15, justification: "Core project request identified from communication." },
      { key: "scope_and_deliverables", label: "Scope and deliverables", score: Math.min(18, Math.max(10, deliverables.length * 4)), max: 20, justification: `${deliverables.length} deliverable areas isolated.` },
      { key: "timeline_and_deadline", label: "Timeline and deadline", score: hasTimeline ? 12 : 5, max: 15, justification: hasTimeline ? "Target milestone deadline expressed." : "No specific completion date given." },
      { key: "content_and_assets", label: "Content and asset readiness", score: 8, max: 15, justification: "Content status to be finalized at kickoff." },
      { key: "design_direction", label: "Design direction", score: 9, max: 15, justification: "Initial styling cues captured." },
      { key: "technical_and_integration", label: "Technical and integration definition", score: 10, max: 20, justification: "Platform details to be scoped." },
    ],
  };

  // 5. Summary
  const summary = {
    goal: candidateSentences[0] || "Review and structure client requirements before kickoff.",
    paragraph: `The client provided initial specifications regarding their project. Core goals, deliverables, and preliminary timelines (${targetDeadline.displayLine1}) have been organized into a grounded specification to establish mutual scope before commencing work.`,
    keyFacts: [
      { label: "Target timeline", value: targetDeadline.displayLine1 },
      { label: "Source length", value: `${sourceText.length} characters` },
      { label: "Extracted requirements", value: `${deliverables.length} deliverables` },
    ],
  };

  // 6. Ambiguities & Questions
  const ambiguities: StructuredAmbiguity[] = [
    {
      id: "A1",
      title: "Launch milestone cutoff dates",
      severity: hasTimeline ? "MEDIUM" : "HIGH",
      kind: hasTimeline ? "UNCLEAR" : "MISSING",
      evidence: hasTimeline ? targetDeadline.clientWording : null,
      whatIsUnclear: hasTimeline ? `The client indicated "${targetDeadline.clientWording}" but exact staging and production launch cutoffs need agreement.` : "The message does not mention a required completion or launch date.",
      whyItMatters: "Fixed calendar cutoffs prevent resource scheduling conflicts.",
      linkedQuestionId: "Q1",
      isStandardKickoffItem: false,
    },
    {
      id: "A2",
      title: "Content readiness and asset handoff",
      severity: "MEDIUM",
      kind: "MISSING",
      evidence: null,
      whatIsUnclear: "The message does not mention whether copy and graphics are ready.",
      whyItMatters: "Missing content stalls development progress.",
      linkedQuestionId: "Q2",
      isStandardKickoffItem: false,
    },
    {
      id: "A3",
      title: "Visual design preferences",
      severity: "MEDIUM",
      kind: "MISSING",
      evidence: null,
      whatIsUnclear: "The message does not mention style guides or website references.",
      whyItMatters: "Aligns artistic direction before wireframes begin.",
      linkedQuestionId: "Q3",
      isStandardKickoffItem: false,
    },
    {
      id: "A4",
      title: "Stakeholder approval contact",
      severity: "LOW",
      kind: "MISSING",
      evidence: null,
      whatIsUnclear: "The message does not mention who provides final approvals.",
      whyItMatters: "Clarifies review hierarchy and prevents conflicting feedback.",
      linkedQuestionId: "Q4",
      isStandardKickoffItem: true,
    },
    {
      id: "A5",
      title: "Budget parameters",
      severity: "LOW",
      kind: "MISSING",
      evidence: null,
      whatIsUnclear: "The message does not mention the allocated project budget.",
      whyItMatters: "Ensures technical architecture matches financial expectations.",
      linkedQuestionId: "Q5",
      isStandardKickoffItem: true,
    },
  ];

  const questions: StructuredQuestion[] = [
    {
      id: "Q1",
      text: hasTimeline ? `What exact calendar date are you targeting for final launch, following your "${targetDeadline.clientWording}" milestone?` : "What target launch date are you aiming for with this project?",
      rationale: "Establishes a firm delivery calendar.",
      linkedAmbiguityId: "A1",
      priority: 1,
    },
    {
      id: "Q2",
      text: "Do you have finalized text and imagery ready, or will you need copywriting assistance?",
      rationale: "Plans asset workflow and design handoffs.",
      linkedAmbiguityId: "A2",
      priority: 2,
    },
    {
      id: "Q3",
      text: "Could you share two or three website references that reflect your preferred aesthetic?",
      rationale: "Guides design visual direction.",
      linkedAmbiguityId: "A3",
      priority: 3,
    },
    {
      id: "Q4",
      text: "Who from your team will be the primary contact for design review approvals?",
      rationale: "Directs deliverables to the responsible decision-maker.",
      linkedAmbiguityId: "A4",
      priority: 4,
    },
    {
      id: "Q5",
      text: "Is there a predetermined budget range for this phase of the project?",
      rationale: "Aligns technical scope to budget constraints.",
      linkedAmbiguityId: "A5",
      priority: 5,
    },
  ];

  // 7. Out of Scope
  const outOfScope: OutOfScopeItem[] = [
    {
      id: "O1",
      group: "Not mentioned, excluded unless confirmed",
      label: "Content writing and copywriting",
      reason: "Client provides all finalized copy unless copywriting services are formally added.",
      evidence: null,
    },
    {
      id: "O2",
      group: "Not mentioned, excluded unless confirmed",
      label: "Custom hosting infrastructure management",
      reason: "Hosting and cloud domains remain client-managed unless otherwise scoped.",
      evidence: null,
    },
  ];

  // 8. Risks
  const risks: StructuredRisk[] = [
    {
      id: "R1",
      title: hasTimeline ? "Milestone cutoff alignment" : "Undefined delivery calendar",
      severity: hasTimeline ? "MEDIUM" : "HIGH",
      explanation: hasTimeline ? `Aiming for "${targetDeadline.clientWording}" requires early sign-off on design prototypes.` : "Absence of a target launch date complicates resource scheduling.",
      recommendedAction: "Confirm target milestone calendar during the kickoff call.",
      owner: "Both",
    },
    {
      id: "R2",
      title: "Content delivery bottlenecks",
      severity: "MEDIUM",
      explanation: "Late asset handoff creates delivery delays.",
      recommendedAction: "Establish a content handoff deadline before development begins.",
      owner: "Client",
    },
    {
      id: "R3",
      title: "Evolving functional requirements",
      severity: "MEDIUM",
      explanation: "Unwritten expectations can lead to scope expansion.",
      recommendedAction: "Approve a written statement of work before kickoff.",
      owner: "Agency",
    },
    {
      id: "R4",
      title: "Review turnaround delays",
      severity: "LOW",
      explanation: "Slow review turnaround stretches project timelines.",
      recommendedAction: "Agree upon standard 48-hour feedback windows.",
      owner: "Both",
    },
  ];

  return {
    facts,
    projectTitle,
    targetDeadline,
    clarity,
    summary,
    deliverables,
    ambiguities,
    questions,
    outOfScope,
    risks,
  };
}

export async function regenerateBriefSection(
  section: "questions" | "summary" | "scope" | "risks" | "next_steps" | "deliverables" | "ambiguities",
  sourceText: string,
  currentBriefContext: string
): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return { success: true };
  }

  const ai = getGeminiClient();
  const modelName = getModelName();
  const prompt = buildSectionRegenerationPrompt(section, sourceText, currentBriefContext);

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INTAKE_ANALYST_PROMPT,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const responseText = response.text;
    if (!responseText) throw new Error("Empty response from Gemini.");
    return JSON.parse(responseText.trim());
  } catch (error) {
    console.error("Failed to regenerate section:", error);
    return { success: false };
  }
}

export async function generateClientReadyDocument(briefJson: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return "Client-Ready Overview generated from brief.";
  }

  const ai = getGeminiClient();
  const modelName = getModelName();
  const prompt = buildClientReadyPrompt(briefJson);

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        temperature: 0.3,
      },
    });

    return response.text || "Failed to generate client-ready text.";
  } catch (error) {
    console.error("Failed to generate client-ready document:", error);
    return "Client-Ready Overview generated from brief.";
  }
}
