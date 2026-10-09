import { BrieflyOutput, DeliverableItem, StructuredAmbiguity, StructuredQuestion, OutOfScopeItem, StructuredRisk } from "../types";

export interface ValidationResult {
  isValid: boolean;
  status: "EVIDENCE CHECKED" | "NEEDS REVIEW";
  output: BrieflyOutput;
  issues: string[];
}

export function normalizeTextForEvidence(str: string): string {
  return str
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-") // en dash, em dash -> standard hyphen
    .replace(/\.{3,}|\u2026/g, " ") // replace ellipses (...) with space
    .replace(/[^\w\s'-]/g, " ") // remove punctuation marks
    .replace(/\s+/g, " ")
    .trim();
}

export function isSubstringOfSource(evidence: string, sourceText: string): boolean {
  if (!evidence) return false;
  const normEvidence = normalizeTextForEvidence(evidence);
  if (!normEvidence) return false;
  const normSource = normalizeTextForEvidence(sourceText);
  if (normSource.includes(normEvidence)) return true;

  // Fuzzy fallback: If evidence has 3+ words, check if significant content words appear in source
  const evidenceWords = normEvidence.split(" ").filter((w) => w.length > 2);
  if (evidenceWords.length >= 3) {
    let matchCount = 0;
    for (const word of evidenceWords) {
      if (normSource.includes(word)) matchCount++;
    }
    if (matchCount / evidenceWords.length >= 0.75) {
      return true;
    }
  }
  return false;
}

// Banned words per Rule 12 / V5
const BANNED_WORDS = [
  "sprint capacity",
  "unspecified",
  "synergy",
  "leverage",
  "seamless",
  "robust",
  "utilize",
];

export function sanitizeStyleText(text: string): string {
  if (!text) return "";
  let cleaned = text;

  // Replace em dash and en dash with comma or hyphen
  cleaned = cleaned.replace(/[\u2014\u2013]/g, ", ");
  // Remove runs of 3+ dashes, equals signs, underscores, box characters
  cleaned = cleaned.replace(/[-=_━─│┌┐└┘├┤┬┴┼]{3,}/g, " ");
  // Remove emoji
  cleaned = cleaned.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "");

  // Auto-fix banned words in text
  cleaned = cleaned.replace(/\bunspecified\b/gi, "not stated");
  cleaned = cleaned.replace(/\bsprint capacity\b/gi, "team availability");
  cleaned = cleaned.replace(/\bsynergy\b/gi, "coordination");
  cleaned = cleaned.replace(/\bleverage\b/gi, "use");
  cleaned = cleaned.replace(/\bseamless\b/gi, "smooth");
  cleaned = cleaned.replace(/\brobust\b/gi, "reliable");
  cleaned = cleaned.replace(/\butilize\b/gi, "use");

  // Collapse multiple spaces
  cleaned = cleaned.replace(/\s+/g, " ").trim();
  return cleaned;
}

export function validateAndCleanBrief(
  rawOutput: BrieflyOutput,
  sourceText: string,
  createdDateStr: string = "2026-09-28"
): ValidationResult {
  const issues: string[] = [];
  let droppedItems = false;

  // Clone object
  const output: BrieflyOutput = JSON.parse(JSON.stringify(rawOutput));

  // V5: Style sanitization on all strings
  output.projectTitle = sanitizeStyleText(output.projectTitle);
  output.summary.goal = sanitizeStyleText(output.summary.goal);
  output.summary.paragraph = sanitizeStyleText(output.summary.paragraph);
  output.summary.keyFacts.forEach((f) => {
    f.label = sanitizeStyleText(f.label);
    f.value = sanitizeStyleText(f.value);
  });

  // Check for banned words left
  for (const banned of BANNED_WORDS) {
    const combinedText = `${output.summary.goal} ${output.summary.paragraph}`.toLowerCase();
    if (combinedText.includes(banned)) {
      issues.push(`V5: Found banned word "${banned}" in summary`);
    }
  }

  // V9: Filter out agency process documents from deliverables
  const forbiddenDeliverableTerms = [
    "scope alignment document",
    "milestone breakdown",
    "delivery timeline",
    "feature architecture",
    "architecture document",
    "alignment document",
  ];

  const validDeliverables: DeliverableItem[] = [];
  const deliverableLabels = new Set<string>();

  for (const item of output.deliverables) {
    item.label = sanitizeStyleText(item.label);
    item.description = sanitizeStyleText(item.description);

    const normLabel = item.label.toLowerCase();
    const isAgencyDoc = forbiddenDeliverableTerms.some((term) => normLabel.includes(term));
    if (isAgencyDoc) {
      issues.push(`V9: Dropped internal agency process deliverable: "${item.label}"`);
      droppedItems = true;
      continue;
    }

    // Check if duplicate label (V6)
    if (deliverableLabels.has(normLabel)) {
      issues.push(`V6: Duplicate deliverable label dropped: "${item.label}"`);
      droppedItems = true;
      continue;
    }

    // Evidence check (V2)
    if (!isSubstringOfSource(item.evidence, sourceText)) {
      issues.push(`V2: Deliverable "${item.label}" evidence is not in source: "${item.evidence}"`);
      droppedItems = true;
      continue;
    }

    deliverableLabels.add(normLabel);
    validDeliverables.push(item);
  }
  output.deliverables = validDeliverables;

  // V2 & V6 & V7: Ambiguities validation
  const validAmbiguities: StructuredAmbiguity[] = [];
  const ambiguityIds = new Set<string>();

  for (const amb of output.ambiguities) {
    amb.title = sanitizeStyleText(amb.title);
    amb.whatIsUnclear = sanitizeStyleText(amb.whatIsUnclear);
    amb.whyItMatters = sanitizeStyleText(amb.whyItMatters);

    // If kind is MISSING, evidence is null or not in message
    if (amb.kind === "MISSING") {
      amb.evidence = null;
      if (!amb.whatIsUnclear.toLowerCase().startsWith("the message does not mention")) {
        amb.whatIsUnclear = `The message does not mention ${amb.whatIsUnclear.replace(/^The client did not mention\s*/i, "")}`;
      }
    } else if (amb.evidence) {
      if (!isSubstringOfSource(amb.evidence, sourceText)) {
        issues.push(`V2: Ambiguity "${amb.title}" evidence is not in source: "${amb.evidence}"`);
        droppedItems = true;
        continue;
      }
    }

    ambiguityIds.add(amb.id);
    validAmbiguities.push(amb);
  }
  output.ambiguities = validAmbiguities;

  // V6 & V7 & V8: Questions validation
  const validQuestions: StructuredQuestion[] = [];
  const questionIds = new Set<string>();

  for (const q of output.questions) {
    q.text = sanitizeStyleText(q.text);
    q.rationale = sanitizeStyleText(q.rationale);

    // Limit word count to 30 words (V8)
    const words = q.text.split(/\s+/).filter(Boolean);
    if (words.length > 30) {
      issues.push(`V8: Question "${q.id}" exceeds 30 words (${words.length} words)`);
    }

    // Check that question text does not duplicate inside ambiguities (V6)
    const firstEightWords = words.slice(0, 8).join(" ").toLowerCase();
    for (const amb of output.ambiguities) {
      if (amb.whatIsUnclear.toLowerCase().includes(firstEightWords)) {
        issues.push(`V6: Question text appears inside ambiguity ${amb.id}`);
      }
    }

    questionIds.add(q.id);
    validQuestions.push(q);
  }
  output.questions = validQuestions;

  // Verify Cross-references (V7)
  for (const amb of output.ambiguities) {
    if (!questionIds.has(amb.linkedQuestionId)) {
      issues.push(`V7: Ambiguity ${amb.id} references non-existent question ${amb.linkedQuestionId}`);
      // fallback link to first question
      if (output.questions[0]) amb.linkedQuestionId = output.questions[0].id;
    }
  }
  for (const q of output.questions) {
    if (!ambiguityIds.has(q.linkedAmbiguityId)) {
      issues.push(`V7: Question ${q.id} references non-existent ambiguity ${q.linkedAmbiguityId}`);
      if (output.ambiguities[0]) q.linkedAmbiguityId = output.ambiguities[0].id;
    }
  }

  // V8: Limits verification
  if (output.questions.length < 3 || output.questions.length > 10) {
    issues.push(`V8: Question count ${output.questions.length} is outside allowed range (3-10)`);
  }
  if (output.ambiguities.length < 5 || output.ambiguities.length > 10) {
    issues.push(`V8: Ambiguity count ${output.ambiguities.length} is outside allowed range (5-10)`);
  }

  // V3: Score verification and sum calculation
  let computedTotalScore = 0;
  for (const dim of output.clarity.dimensions) {
    dim.label = sanitizeStyleText(dim.label);
    dim.justification = sanitizeStyleText(dim.justification);
    if (dim.score < 0 || dim.score > dim.max) {
      issues.push(`V3: Dimension "${dim.key}" score ${dim.score} out of bounds (max ${dim.max})`);
      dim.score = Math.max(0, Math.min(dim.score, dim.max));
    }
    computedTotalScore += Math.round(dim.score);
  }

  // V4: Dates validation & deadline safety net
  const targetDeadline = output.targetDeadline;
  targetDeadline.displayLine1 = sanitizeStyleText(targetDeadline.displayLine1);
  targetDeadline.displayLine2 = sanitizeStyleText(targetDeadline.displayLine2);

  // Safety net: check if client gave deadline wording or if source text contains explicit timeline cues
  const line1Lower = targetDeadline.displayLine1.toLowerCase();
  if (targetDeadline.clientWording) {
    if (line1Lower.includes("to be confirmed") || line1Lower.includes("not specified")) {
      issues.push(`V4: Client gave deadline wording "${targetDeadline.clientWording}" but Line 1 says "${targetDeadline.displayLine1}"`);
      targetDeadline.displayLine1 = targetDeadline.clientWording;
    }
  } else if (line1Lower.includes("not specified") || line1Lower.includes("to be confirmed")) {
    // Scan sourceText for date/timeline keywords that the LLM may have missed
    const dateMatch = sourceText.match(
      /(?:(?:the\s+)?deadline(?:\s+is)?|due(?:\s+by)?|launch(?:\s+by)?|target(?:\s+is)?|finish(?:\s+by)?|ready(?:\s+by)?|before|about|around)?\s*(?:the\s+)?(end\s+of\s+[a-z]+|middle\s+of\s+[a-z]+|mid-[a-z]+|beginning\s+of\s+[a-z]+|(?:january|february|march|april|may|june|july|august|september|october|november|december)(?:\s+\d{1,2}(?:st|nd|rd|th)?)?|\d{1,2}(?:st|nd|rd|th)?\s+of\s+[a-z]+|in\s+\d+\s*(?:weeks?|months?|days?)|next\s+(?:month|week|quarter)|by\s+[a-z]+(?:\s+\d{1,2})?)/i
    );
    if (dateMatch && dateMatch[0]) {
      const recovered = dateMatch[0].trim();
      targetDeadline.clientWording = recovered;
      targetDeadline.displayLine1 = recovered.charAt(0).toUpperCase() + recovered.slice(1);
      targetDeadline.displayLine2 = `Target deadline derived from client message (${recovered}). Exact launch milestone date to be confirmed during kickoff.`;
      targetDeadline.milestoneType = "approximate_target";
      issues.push(`V4: Recovered client deadline wording "${recovered}" from source communication`);
    }
  }

  if (targetDeadline.resolvedStart && targetDeadline.resolvedStart < createdDateStr) {
    issues.push(`V4: resolvedStart ${targetDeadline.resolvedStart} is earlier than createdDate ${createdDateStr}`);
  }

  // Out of scope checks (Group 2 max 6, no enterprise buzzwords)
  const validOutOfScope: OutOfScopeItem[] = [];
  let group2Count = 0;
  for (const item of output.outOfScope) {
    item.label = sanitizeStyleText(item.label);
    item.reason = sanitizeStyleText(item.reason);

    if (item.label.toLowerCase().includes("enterprise")) {
      issues.push(`V11: Removed invented enterprise out-of-scope item "${item.label}"`);
      droppedItems = true;
      continue;
    }

    if (item.group === "Pending client decision") {
      if (item.evidence && !isSubstringOfSource(item.evidence, sourceText)) {
        issues.push(`V2: OutOfScope "${item.label}" evidence not in source`);
        droppedItems = true;
        continue;
      }
    } else {
      if (group2Count >= 6) {
        issues.push(`V8: OutOfScope Group 2 exceeds max limit of 6 items`);
        continue;
      }
      group2Count++;
    }
    validOutOfScope.push(item);
  }
  output.outOfScope = validOutOfScope;

  // Risks validation (V8: 4 to 8 risks, imperative action)
  const validRisks: StructuredRisk[] = [];
  for (const risk of output.risks) {
    risk.title = sanitizeStyleText(risk.title);
    risk.explanation = sanitizeStyleText(risk.explanation);
    risk.recommendedAction = sanitizeStyleText(risk.recommendedAction);
    validRisks.push(risk);
  }
  output.risks = validRisks;

  if (output.risks.length < 4 || output.risks.length > 8) {
    issues.push(`V8: Risk count ${output.risks.length} is outside allowed range (4-8)`);
  }

  // Compute final status per Rule 6
  const isClean = issues.length === 0 && !droppedItems;
  const status: "EVIDENCE CHECKED" | "NEEDS REVIEW" = isClean ? "EVIDENCE CHECKED" : "NEEDS REVIEW";

  if (issues.length > 0) {
    console.warn("Briefly validation logged issues:", issues);
  }

  return {
    isValid: isClean,
    status,
    output,
    issues,
  };
}

export function computeClarityBand(score: number): "Ready for kickoff" | "Mostly clear" | "Needs alignment" | "Unclear" {
  if (score >= 85) return "Ready for kickoff";
  if (score >= 65) return "Mostly clear";
  if (score >= 40) return "Needs alignment";
  return "Unclear";
}
