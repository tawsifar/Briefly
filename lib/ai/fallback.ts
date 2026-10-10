// Deterministic brief builder used when Gemini is not configured or fails.
// Every section is derived from the message itself (BUG-05..13): no fixed boilerplate.
import { findDeadline, describeWindow } from "./deadline";
import { getTodayDateInfo } from "./prompts";
import type {
  BrieflyOutput,
  TargetDeadlineInfo,
  Fact,
  DeliverableItem,
  StructuredAmbiguity,
  StructuredQuestion,
  OutOfScopeItem,
  StructuredRisk,
  ClarityDimension,
} from "../types";

type Severity = "HIGH" | "MEDIUM" | "LOW";

const CONDITIONAL = /\b(maybe|might|perhaps|possibly|if|ideally|optional(?:ly)?|nice to have)\b/i;
const CONTENT = /\b(logos?|images?|photos?|photography|pictures?|copy|text|texts|content|branding|brand assets|assets?|videos?|fonts?)\b/i;
const PENDING_CLAUSE = /\b(still|working on|not ready|not yet|yet|don't have|do not have|haven't|have not|isn't|is not|aren't|are not|not written|not done)\b/i;
const POSSESS = /\b(have|has|got|already|ready|attached|provide|will send|can send|own)\b/i;
const FEATURE = /\b(integrations?|integrate|order(?:ing)? (?:food|online)|online order(?:ing|s)?|whatsapp|instagram|facebook|chat ?bot|live chat|chat|booking|bookings|payments?|checkout|log ?in|sign ?up|accounts?|portal|cms|api|newsletter|contact form|forms?|search|analytics|e-?commerce|online store|cart|multilingual|translations?|maps?|calendar|notifications?)\b/i;
const DESIGN = /\b(design|look|looks|feel|style|vibe|dark|darker|light|colou?rs?|premium|modern|minimal(?:ist)?|clean|crowded|cluttered|mobile|responsive|fast|elegant|sleek|bold)\b/i;
const LIKE_REF = /\blike\s+([A-Z][\w&.-]*(?:\s+[A-Z][\w&.-]*)?)/;
const PAGE_WORD = /\b(pages?|sections?|sitemap)\b/i;
const PROJECT_NOUN = /\b(website|web ?site|site|web app|mobile app|app|landing page|online store|e-?commerce (?:site|store)|dashboard|brand identity|logo|platform)\b/i;
const BUSINESS = /\b(?:our|my)\s+(?:[\w-]+\s+)?(business|company|shop|store|brand|clinic|restaurant|agency|startup|studio|firm|cafe|salon|practice|customers|clients)\b|\bwe (?:are|run|sell|make|offer)\b/i;
const NUMBER_WORDS: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };

const KNOWN_PAGES: Array<[RegExp, string]> = [
  [/^(home|homepage|home page|landing)$/i, "Home"],
  [/^about(\s+us)?$/i, "About"],
  [/^services?$/i, "Services"],
  [/^products?$/i, "Products"],
  [/^contact(\s+us)?$/i, "Contact"],
  [/^blog$/i, "Blog"],
  [/^faqs?$/i, "FAQ"],
  [/^pricing$/i, "Pricing"],
  [/^portfolio$/i, "Portfolio"],
  [/^gallery$/i, "Gallery"],
  [/^(shop|store)$/i, "Shop"],
  [/^(team|our team)$/i, "Team"],
  [/^careers?$/i, "Careers"],
  [/^testimonials?$/i, "Testimonials"],
];

const FEATURE_LABELS: Array<[RegExp, string]> = [
  [/booking/i, "Booking system"],
  [/order/i, "Online ordering"],
  [/payment|checkout|cart|e-?commerce|online store/i, "Online payments"],
  [/log ?in|sign ?up|account|portal/i, "Customer accounts"],
  [/chat ?bot/i, "Chatbot"],
  [/chat/i, "Chat widget"],
  [/newsletter/i, "Newsletter signup"],
  [/form/i, "Contact form"],
  [/search/i, "Site search"],
  [/analytics/i, "Analytics setup"],
  [/cms/i, "Content management"],
  [/multilingual|translation/i, "Multiple languages"],
  [/map/i, "Location map"],
  [/calendar/i, "Calendar"],
  [/notification/i, "Notifications"],
];

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const joinList = (items: string[]) =>
  items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
const clipWords = (s: string, max = 25) => {
  const words = s.split(/\s+/);
  return words.length > max ? `${words.slice(0, max).join(" ")}...` : s;
};
const stripFiller = (s: string) => s.replace(/^(?:and|or|also|plus)\s+/i, "").replace(/\s+/g, " ").trim();

/** Extract the noun phrase around an asset word, e.g. "product images", "the logo" → "logo". */
function assetPhrases(clause: string): string[] {
  const out: string[] = [];
  const re = /\b(?:(?:the|our|some|a|an|final|new)\s+)?((?:[a-z]+\s+)?(?:logos?|images?|photos?|pictures?|copy|text|content|branding|videos?|fonts?))\b/gi;
  for (const m of clause.matchAll(re)) {
    let phrase = m[1].toLowerCase();
    // Drop a leading verb/pronoun captured by "(?:[a-z]+\s+)?"
    phrase = phrase.replace(/^(?:have|has|had|on|the|our|we|working|got|any|no|with|and|but|use|still|for|some)\s+/, "");
    if (!out.includes(phrase)) out.push(phrase);
  }
  return out;
}

export function generateGroundedFallback(
  sourceText: string,
  projectNameHint?: string,
  createdDateStr?: string,
  _weekdayStr?: string
): BrieflyOutput {
  const activeDateStr = createdDateStr || getTodayDateInfo().dateStr;
  const text = sourceText.trim();

  // 1. Deadline
  const found = findDeadline(text, activeDateStr);
  const targetDeadline: TargetDeadlineInfo = found
    ? {
        clientWording: found.wording,
        milestoneType: "approximate_target",
        resolvedStart: found.start,
        resolvedEnd: found.end,
        isFirm: false,
        displayLine1: cap(found.wording),
        displayLine2: describeWindow(found.start, found.end, activeDateStr),
      }
    : {
        clientWording: null,
        milestoneType: "unspecified",
        resolvedStart: null,
        resolvedEnd: null,
        isFirm: null,
        displayLine1: "Not specified by client",
        displayLine2: "Target milestone date to be determined during kickoff.",
      };
  const daysToDeadline =
    found?.end != null
      ? Math.round((Date.parse(`${found.end}T00:00:00Z`) - Date.parse(`${activeDateStr}T00:00:00Z`)) / 86_400_000)
      : null;

  // 2. Sentences: split on sentence ends and line breaks only. A colon keeps its list together.
  const sentences = text
    .split(/(?<=[.?!])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3);

  const facts: Fact[] = [];
  const deliverables: DeliverableItem[] = [];
  const pending: Array<{ label: string; evidence: string; kind: "feature" | "page" }> = [];
  const usedLabels = new Set<string>();
  const pageNames: string[] = [];
  const designLabels: string[] = [];
  const readyAssets: string[] = [];
  const pendingAssets: Array<{ phrase: string; clause: string }> = [];
  const explicitFeatures: string[] = [];
  let pageCountWord = null as { word: string; n: number; evidence: string } | null;
  let mentionsAssets = false;
  let assetEvidence: string | undefined;
  const properLabels = new Set<string>();
  // Lower-case our own labels mid-sentence, but keep client brand names ("WhatsApp integration").
  const phrase = (label: string) => (properLabels.has(label) ? label : lowerFirst(label));
  let listedPageTotal = 0;
  let mentionsCopy = false;

  const addDeliverable = (d: Omit<DeliverableItem, "id">) => {
    const key = d.label.toLowerCase();
    if (usedLabels.has(key)) return false;
    usedLabels.add(key);
    deliverables.push({ id: `D${deliverables.length + 1}`, ...d });
    return true;
  };

  sentences.forEach((sentence, idx) => {
    const factId = `F${idx + 1}`;
    const evidence = clipWords(sentence);
    const conditional = CONDITIONAL.test(sentence);
    const colonList = sentence.includes(":") ? sentence.slice(sentence.indexOf(":") + 1) : "";
    const clauses = sentence.split(/,|;|\bbut\b|\band\b(?=\s+(?:a|an|the|maybe|also|ideally|some)\b)/i).map((c) => c.trim()).filter(Boolean);
    const categories: Fact["category"][] = [];

    if (/\b(copy|text|texts|content)\b/i.test(sentence)) mentionsCopy = true;

    // ---- Pages (a list after a colon, or named pages, or just a count) ----
    const countMatch = sentence.match(/\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:pages?|sections?)\b/i);
    if (countMatch) {
      const w = countMatch[1].toLowerCase();
      pageCountWord = { word: countMatch[1], n: NUMBER_WORDS[w] ?? Number(w), evidence: countMatch[0] };
    }
    if (PAGE_WORD.test(sentence) && (colonList || /\b(home|about|contact)\b/i.test(sentence))) {
      categories.push("page");
      const listText = colonList || sentence.replace(/^.*?\bpages?\b/i, "");
      const items = listText
        .replace(/[.?!]+$/, "")
        .split(/,|\band\b|&|\//i)
        .map(stripFiller)
        .filter(Boolean);
      for (const item of items) {
        if (CONDITIONAL.test(item)) {
          listedPageTotal++;
          const label = cap(item.replace(CONDITIONAL, "").replace(/\s+/g, " ").trim());
          pending.push({ label, evidence: item, kind: "page" });
          continue;
        }
        const known = KNOWN_PAGES.find(([re]) => re.test(item));
        if (!known && item.split(" ").length > 3) continue; // a clause, not a page name
        listedPageTotal++;
        const name = known ? known[1] : cap(item);
        if (addDeliverable({
          factId, group: "Pages", label: `${name} page`,
          description: `Design and build the ${name} page the client listed.`,
          evidence: item, tag: "Confirmed",
        })) pageNames.push(name);
      }
    }

    // ---- Content & assets: what the client has, what is pending, what they ask us to make ----
    for (const clause of clauses) {
      if (!CONTENT.test(clause) || FEATURE.test(clause)) continue;
      const phrases = assetPhrases(clause);
      if (phrases.length === 0) continue;
      mentionsAssets = true;
      if (!categories.includes("asset")) categories.push("asset");
      if (PENDING_CLAUSE.test(clause)) {
        phrases.forEach((p) => pendingAssets.push({ phrase: p, clause: clause.replace(/[.?!]+$/, "") }));
      } else if (POSSESS.test(clause)) {
        phrases.forEach((p) => readyAssets.push(p));
        assetEvidence ??= clause.replace(/[.?!]+$/, "");
      } else {
        for (const p of phrases) {
          addDeliverable({
            factId, group: "Content and Assets", label: `${cap(p)} creation`,
            description: `Create the ${p} the client asked for.`, evidence: clause.replace(/[.?!]+$/, ""),
            tag: conditional ? "Needs scoping" : "Confirmed",
          });
        }
      }
    }

    // ---- Features: one per clause, each with its own "maybe" ----
    for (const clause of clauses) {
      const kw = clause.match(FEATURE)?.[1];
      if (!kw) continue;
      if (!categories.includes("feature")) categories.push("feature");
      const named = clause.match(/\b([A-Z][\w]+)\s+integration\b/);
      const label = named
        ? `${named[1]} integration`
        : FEATURE_LABELS.find(([re]) => re.test(kw))?.[1] ?? `${cap(kw)} integration`;
      if (named) properLabels.add(label);
      if (usedLabels.has(label.toLowerCase()) || pending.some((p) => p.label === label)) continue;
      if (CONDITIONAL.test(clause)) {
        pending.push({ label, evidence: clipWords(clause.replace(/[.?!]+$/, "")), kind: "feature" });
      } else if (addDeliverable({
        factId, group: "Features", label,
        description: `Build the ${phrase(label)} the client requested. Exact behaviour needs scoping.`,
        evidence: clipWords(clause.replace(/[.?!]+$/, "")), tag: "Needs scoping",
      })) explicitFeatures.push(label);
    }

    // ---- Design & experience ----
    if (DESIGN.test(sentence) || LIKE_REF.test(sentence)) {
      categories.push("design");
      const ref = sentence.match(LIKE_REF)?.[1];
      const candidates: Array<[string, string]> = [];
      if (ref) candidates.push([`Visual style inspired by ${ref}`, `Create a visual style inspired by ${ref}, following the client's description.`]);
      if (/\b(mobile|responsive)\b/i.test(sentence)) candidates.push(["Mobile-friendly layout", "Make every page work well on phones and tablets."]);
      if (/\bhome ?page\b/i.test(sentence)) candidates.push(["Homepage look and feel", "Design the homepage to match the feel the client described."]);
      if (/\b(fast|speed|load)\b/i.test(sentence)) candidates.push(["Fast page loading", "Optimise images and code so pages load quickly."]);
      candidates.push(["Visual design direction", "Apply the visual direction the client described."]);
      for (const [label, description] of candidates) {
        if (addDeliverable({ factId, group: "Design and Experience", label, description, evidence, tag: conditional ? "Needs scoping" : "Confirmed" })) {
          designLabels.push(label);
          break;
        }
      }
    }
    if (found && sentence.includes(found.wording)) categories.push("timeline");

    facts.push({
      id: factId,
      category: categories[0] ?? "goal",
      statement: `The client wrote: "${evidence}"`,
      evidence,
      status: conditional ? "CONDITIONAL" : "EXPLICIT",
    });
  });

  // Pages given only as a count ("around five pages") with no names.
  if (pageNames.length === 0 && pageCountWord) {
    addDeliverable({
      factId: "F1", group: "Pages", label: "Core pages",
      description: `Design and build around ${pageCountWord.word} pages. The client did not list which ones.`,
      evidence: pageCountWord.evidence, tag: "Needs scoping",
    });
  }

  // Content deliverable: only for assets the client already has.
  if (readyAssets.length > 0) {
    addDeliverable({
      factId: facts.find((f) => f.category === "asset")?.id ?? "F1",
      group: "Content and Assets",
      label: "Client-supplied assets",
      description: `Use the client's existing ${joinList(readyAssets)}.`,
      evidence: clipWords(assetEvidence ?? text),
      tag: "Confirmed",
    });
  }

  // 3. Title & summary
  const rawNoun = text.match(PROJECT_NOUN)?.[1]?.toLowerCase() ?? "project";
  const noun = rawNoun === "site" || rawNoun === "web site" ? "website" : rawNoun;
  const verb = /logo|brand/.test(noun) ? "Create" : "Build";
  const ref = text.match(LIKE_REF)?.[1];
  const projectTitle = projectNameHint?.trim() || `${ref ? `${ref}-Inspired ` : "New "}${cap(noun)}${noun === "project" ? "" : " Project"}`;

  const readyBy = found
    ? /^(before|by|until|till|in|on|within|around|about|during|next|this|asap|as soon|urgently)\b/i.test(found.wording)
      ? found.wording
      : `by ${found.wording}`
    : "";
  const goal =
    noun === "project"
      ? `Deliver the work described in the client's message${found ? `, ready ${readyBy}` : ""}.`
      : `${verb} a new ${noun}${ref ? ` with a look inspired by ${ref}` : ""}${found ? `, ready ${readyBy}` : ""}.`;

  // Nothing matched a known category: keep the core request visible instead of an empty section.
  if (deliverables.length === 0 && sentences.length) {
    const core = sentences.find((s) => PROJECT_NOUN.test(s)) ?? sentences[0];
    addDeliverable({
      factId: "F1", group: "Features", label: noun === "project" ? "Core request" : `Core ${noun}`,
      description: `${verb} the ${noun === "project" ? "work" : noun} the client described. Exact scope needs confirming.`,
      evidence: clipWords(core), tag: "Needs scoping",
    });
  }

  const paragraph: string[] = [];
  const pendingPages = pending.filter((p) => p.kind === "page");
  const pendingFeatures = pending.filter((p) => p.kind === "feature");
  if (pageNames.length) {
    paragraph.push(
      `The client asked for ${pageCountWord ? `around ${pageCountWord.word} pages` : "these pages"}: ${joinList(pageNames)}${pendingPages.length ? `, plus ${joinList(pendingPages.map((p) => `"${p.evidence}"`))} as a possible extra` : ""}.`
    );
  }
  if (!pageNames.length && pageCountWord) paragraph.push(`The client asked for ${pageCountWord.evidence} without naming them.`);
  if (designLabels.length) paragraph.push(`Design requests include ${joinList(designLabels.map(lowerFirst))}.`);
  if (readyAssets.length || pendingAssets.length) {
    const pend = joinList(pendingAssets.map((p) => p.phrase));
    paragraph.push(
      readyAssets.length
        ? `The client already has the ${joinList(readyAssets)}${pend ? `, while the ${pend} ${pendingAssets.length > 1 || /s$/.test(pend) ? "are" : "is"} still in progress` : ""}.`
        : `The ${pend} ${pendingAssets.length > 1 || /s$/.test(pend) ? "are" : "is"} still in progress.`
    );
  }
  if (explicitFeatures.length) paragraph.push(`They asked for ${joinList(explicitFeatures.map(phrase))}.`);
  if (pendingFeatures.length) {
    paragraph.push(`${cap(joinList(pendingFeatures.map((p) => p.label)))} ${pendingFeatures.length > 1 ? "were" : "was"} mentioned as a possible extra.`);
  }
  paragraph.push(
    found
      ? `The requested timing is "${found.wording}"${found.start ? ` (${describeWindow(found.start, found.end, activeDateStr).split(" (")[0].replace(/\.$/, "")})` : ""}.`
      : "The client did not give a deadline."
  );
  if (paragraph.length === 1 && sentences.length) paragraph.unshift(`The client wrote: "${clipWords(sentences[0]).replace(/[.?!]+$/, "")}".`);

  // 4. Ambiguities, each paired with one question
  type AmbDraft = Omit<StructuredAmbiguity, "id" | "linkedQuestionId"> & { question: string; rationale: string };
  const amb: AmbDraft[] = [];

  if (found) {
    amb.push({
      title: "Exact launch date", severity: daysToDeadline !== null && daysToDeadline <= 21 ? "HIGH" : "MEDIUM", kind: "UNCLEAR",
      evidence: found.wording, isStandardKickoffItem: false,
      whatIsUnclear: `The client wrote "${found.wording}" but did not give an exact date or say what must be live by then.`,
      whyItMatters: "Design, build and review rounds must be planned back from a fixed date.",
      question: `You mentioned "${found.wording}". Which exact date should we plan the launch for?`,
      rationale: "We need a fixed date to plan design, build and review rounds.",
    });
  } else {
    amb.push({
      title: "Launch date", severity: "HIGH", kind: "MISSING", evidence: null, isStandardKickoffItem: false,
      whatIsUnclear: "The message does not mention a launch date or deadline.",
      whyItMatters: "Without a date we cannot plan the work or check that the scope fits.",
      question: "Do you have a launch date or deadline in mind for this project?",
      rationale: "The date decides how we phase the work.",
    });
  }

  for (const p of pending.slice(0, 3)) {
    const name = p.label;
    amb.push({
      title: `${name} scope`, severity: p.kind === "feature" ? "HIGH" : "MEDIUM", kind: "UNCLEAR",
      evidence: p.evidence, isStandardKickoffItem: false,
      whatIsUnclear:
        p.kind === "page"
          ? `The client mentioned "${p.evidence}" as a maybe and did not say what it should contain.`
          : `The client listed ${phrase(name)} as a maybe and did not say what it must do.`,
      whyItMatters: "It can range from a simple link or page to a separate build, which changes cost and timeline.",
      question:
        p.kind === "page"
          ? `You mentioned "${p.evidence}". Should this be part of the first launch, and what should it include?`
          : `Should ${phrase(name)} be part of the first launch, and what exactly should it do?`,
      rationale: "The answer decides whether this is a small add-on or a separate piece of work.",
    });
  }

  if (pageCountWord && listedPageTotal > 0 && pageCountWord.n !== listedPageTotal) {
    amb.push({
      title: "Page count", severity: "MEDIUM", kind: "CONFLICT", evidence: `${pageCountWord.word} pages`, isStandardKickoffItem: false,
      whatIsUnclear: `The client wrote "${pageCountWord.word} pages" but listed ${listedPageTotal}.`,
      whyItMatters: "Each page adds design and build time.",
      question: `You mentioned ${pageCountWord.word} pages but listed ${listedPageTotal}. Which pages should the final site include?`,
      rationale: "We need the final page list to estimate the work.",
    });
  }

  if (pageCountWord && pageNames.length === 0) {
    amb.push({
      title: "Page list", severity: "MEDIUM", kind: "UNCLEAR", evidence: pageCountWord.evidence, isStandardKickoffItem: false,
      whatIsUnclear: `The client asked for ${pageCountWord.evidence} but did not say which pages.`,
      whyItMatters: "Each page needs its own layout and content.",
      question: `You mentioned ${pageCountWord.evidence}. Which pages should the site include?`,
      rationale: "We need the page list to plan layouts and content.",
    });
  }

  if (ref) {
    const refEvidence = text.match(LIKE_REF)![0];
    amb.push({
      title: "Design references", severity: "MEDIUM", kind: "UNCLEAR", evidence: refEvidence, isStandardKickoffItem: false,
      whatIsUnclear: `The client compared the look to ${ref} but did not say which parts, such as layout, colors or typography.`,
      whyItMatters: "Style references are open to interpretation and can lead to extra design rounds.",
      question: `Which parts of ${ref}'s style do you want us to follow? Two or three example pages you like would help.`,
      rationale: "Concrete examples let us match your taste in the first draft.",
    });
  } else if (designLabels.length === 0) {
    amb.push({
      title: "Visual style", severity: "MEDIUM", kind: "MISSING", evidence: null, isStandardKickoffItem: false,
      whatIsUnclear: "The message does not mention a visual style or reference websites.",
      whyItMatters: "Without a direction we risk several redesign rounds.",
      question: "Can you share two or three examples whose look you like, so we can match your style?",
      rationale: "Examples help us get the first design close to what you want.",
    });
  }

  if (pendingAssets.length) {
    const phrase = joinList(pendingAssets.map((p) => p.phrase));
    amb.push({
      title: "Asset delivery timing", severity: "MEDIUM", kind: "UNCLEAR", evidence: pendingAssets[0].clause, isStandardKickoffItem: false,
      whatIsUnclear: `The client did not say when the ${phrase} will be ready.`,
      whyItMatters: "Pages that depend on these assets cannot be finished without them.",
      question: `When do you expect the ${phrase} to be ready for us?`,
      rationale: "We can plan with placeholders if we know the handoff date.",
    });
  } else if (!mentionsAssets) {
    amb.push({
      title: "Content and assets", severity: "MEDIUM", kind: "MISSING", evidence: null, isStandardKickoffItem: false,
      whatIsUnclear: "The message does not mention who provides the text, images or logo.",
      whyItMatters: "Missing content is the most common cause of launch delays.",
      question: "Will you provide the text, images and logo, or do you need help creating them?",
      rationale: "This tells us whether content work belongs in the estimate.",
    });
  }
  if (!mentionsCopy && (readyAssets.length || pendingAssets.length)) {
    amb.push({
      title: "Website text", severity: "LOW", kind: "MISSING", evidence: null, isStandardKickoffItem: false,
      whatIsUnclear: "The message does not mention who writes the text for each page.",
      whyItMatters: "Layouts depend on real text, and late copy delays launch.",
      question: "Who will write the text for each page, and when could we have it?",
      rationale: "We plan layouts around the real text.",
    });
  }

  if (!BUSINESS.test(text)) {
    amb.push({
      title: "Business and audience", severity: "MEDIUM", kind: "MISSING", evidence: null, isStandardKickoffItem: false,
      whatIsUnclear: "The message does not mention what the business does or who its customers are.",
      whyItMatters: "Tone, page content and priorities depend on the audience.",
      question: "Could you tell us briefly what your business does and who your main customers are?",
      rationale: "This shapes the tone and content of every page.",
    });
  }

  if (!/\b(budget|price|cost|\$|€|£|usd|eur)\b/i.test(text)) {
    amb.push({
      title: "Budget and approval contact", severity: "LOW", kind: "MISSING", evidence: null, isStandardKickoffItem: true,
      whatIsUnclear: "The message does not mention a budget range or who approves the designs.",
      whyItMatters: "Both shape scope decisions on the optional items.",
      question: "Who on your team will approve the designs, and do you have a budget range in mind?",
      rationale: "We can send drafts to the right person and size optional items properly.",
    });
  }

  const order: Record<Severity, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  const sortedAmb = amb.sort((a, b) => order[a.severity] - order[b.severity]).slice(0, 8);
  const ambiguities: StructuredAmbiguity[] = [];
  const questions: StructuredQuestion[] = [];
  sortedAmb.forEach((a, i) => {
    const { question, rationale, ...rest } = a;
    ambiguities.push({ ...rest, id: `A${i + 1}`, linkedQuestionId: `Q${i + 1}` });
    questions.push({ id: `Q${i + 1}`, text: question, rationale, linkedAmbiguityId: `A${i + 1}`, priority: i + 1 });
  });

  // 5. Out of scope
  const outOfScope: OutOfScopeItem[] = pending.map((p, i) => ({
    id: `O${i + 1}`,
    group: "Pending client decision",
    label: p.label,
    reason: "The client mentioned this as a maybe. Treat it as optional until the client confirms.",
    evidence: p.evidence,
  }));
  const notMentioned: Array<[RegExp, string, string]> = [
    [/\b(copy|copywriting|text|texts|content)\b/i, "Copywriting for all pages", "The message does not say who writes the text, so the client provides it unless added."],
    [/\b(host|hosting|domain|server)\b/i, "Domain, hosting and maintenance", "Infrastructure is excluded unless contracted separately."],
    [/\b(seo|search engine)\b/i, "Search engine optimisation", "Not requested in the message."],
    [/\b(photo|photography|images?)\b/i, "Professional photography", "The message does not request photography."],
  ];
  // Web-build exclusions make no sense for a logo or brand job.
  for (const [re, label, reason] of /logo|brand/.test(noun) ? [] : notMentioned) {
    if (!re.test(text)) outOfScope.push({ id: `O${outOfScope.length + 1}`, group: "Not mentioned, excluded unless confirmed", label, reason, evidence: null });
  }

  // 6. Risks
  const riskDrafts: Array<Omit<StructuredRisk, "id">> = [];
  if (!found) {
    riskDrafts.push({ title: "No agreed launch date", severity: "HIGH", owner: "Both",
      explanation: "The client gave no deadline, so expectations about timing may differ.",
      recommendedAction: "Agree a target date and milestones on the kickoff call." });
  } else if (daysToDeadline !== null && daysToDeadline <= 21) {
    riskDrafts.push({ title: "Timeline may be too tight", severity: "HIGH", owner: "Both",
      explanation: `The client wants it ${readyBy}, which leaves about ${Math.max(daysToDeadline, 0)} days for design, build and reviews.`,
      recommendedAction: "Agree an exact date at kickoff and launch the core pages first." });
  } else {
    riskDrafts.push({ title: "Loose launch window", severity: "MEDIUM", owner: "Both",
      explanation: `"${found.wording}" is a window, not a date, so review and launch dates can drift.`,
      recommendedAction: "Confirm an exact launch date and review milestones at kickoff." });
  }
  if (pendingAssets.length) {
    const phrase = joinList(pendingAssets.map((p) => p.phrase));
    riskDrafts.push({ title: "Late assets delay launch", severity: "MEDIUM", owner: "Client",
      explanation: `The ${phrase} ${pendingAssets.length > 1 || /s$/.test(phrase) ? "are" : "is"} still in progress, and pages that use them cannot be finished.`,
      recommendedAction: "Set a handoff date and design with placeholders until then." });
  }
  if (pending.length) {
    riskDrafts.push({ title: "Scope creep from optional extras", severity: "MEDIUM", owner: "Agency",
      explanation: `The client mentioned ${joinList(pending.map((p) => phrase(p.label)))} as possible extras without defining them.`,
      recommendedAction: "Send a separate estimate for each optional item and get written approval." });
  }
  const integration = [...explicitFeatures, ...pendingFeatures.map((p) => p.label)].find((l) => /integration|chat|payment|account|booking/i.test(l));
  if (integration) {
    riskDrafts.push({ title: "Third-party integration effort", severity: "MEDIUM", owner: "Agency",
      explanation: `${integration} may need accounts, approvals or API access from the client.`,
      recommendedAction: "Confirm the exact integration and the accounts needed before estimating." });
  }
  if (ref) {
    riskDrafts.push({ title: "Subjective design expectations", severity: "LOW", owner: "Agency",
      explanation: `Comparing the look to ${ref} leaves room for different interpretations.`,
      recommendedAction: "Agree on reference pages or a mood board before the first draft." });
  }
  const padding: Array<Omit<StructuredRisk, "id">> = [
    { title: "Review turnaround delays", severity: "LOW", owner: "Both",
      explanation: "Slow feedback on drafts stretches the timeline.",
      recommendedAction: "Agree a 48-hour feedback window for each review round." },
    { title: "Unclear approval chain", severity: "LOW", owner: "Client",
      explanation: "The message does not name who signs off, so feedback may conflict.",
      recommendedAction: "Name one approver on the client side before design starts." },
    { title: "Undocumented requirements", severity: "LOW", owner: "Agency",
      explanation: "Details agreed only in conversation are easy to dispute later.",
      recommendedAction: "Send a written scope summary for approval before kickoff." },
  ];
  for (const p of padding) if (riskDrafts.length < 4) riskDrafts.push(p);
  const risks: StructuredRisk[] = riskDrafts
    .sort((a, b) => order[a.severity] - order[b.severity])
    .slice(0, 8)
    .map((r, i) => ({ id: `R${i + 1}`, ...r }));

  // 7. Clarity rubric: full only when specific, half when vague, zero when absent.
  const confirmed = deliverables.filter((d) => d.tag === "Confirmed").length;
  const hasNoun = noun !== "project";
  const hasBusiness = BUSINESS.test(text);
  const dims: ClarityDimension[] = [
    { key: "goal_and_context", label: "Goal and business context", max: 15,
      score: hasNoun && hasBusiness ? 13 : hasNoun ? 8 : 4,
      justification: hasBusiness ? "The client named what to build and described the business." : hasNoun ? `The client asked for a ${noun} but did not describe the business or audience.` : "The message does not say clearly what should be built." },
    { key: "scope_and_deliverables", label: "Scope and deliverables", max: 20,
      score: Math.max(0, Math.min(20, 4 + confirmed * 2) - pending.length * 2),
      justification: `${confirmed} confirmed deliverables${pending.length ? `, ${pending.length} optional items still open` : ""}.` },
    { key: "timeline_and_deadline", label: "Timeline and deadline", max: 15,
      score: !found ? 0 : found.start && found.start === found.end ? 13 : found.start ? 8 : 5,
      justification: !found ? "No deadline was given." : found.start === found.end && found.start ? "A specific date was given." : `The client gave a window ("${found.wording}") rather than a date.` },
    { key: "content_and_assets", label: "Content and asset readiness", max: 15,
      score: readyAssets.length && !pendingAssets.length ? (mentionsCopy ? 13 : 10) : readyAssets.length ? 8 : pendingAssets.length ? 5 : 0,
      justification: readyAssets.length || pendingAssets.length ? `Ready: ${joinList(readyAssets) || "none"}. In progress: ${joinList(pendingAssets.map((p) => p.phrase)) || "none"}.` : "The message does not mention content or assets." },
    { key: "design_direction", label: "Design direction", max: 15,
      score: ref && designLabels.length > 1 ? 10 : ref || designLabels.length ? 7 : 0,
      justification: ref ? `The client referenced ${ref} and described the look in their own words.` : designLabels.length ? "Some style words were given, without references." : "No design direction was given." },
    { key: "technical_and_integration", label: "Technical and integration definition", max: 20,
      score: explicitFeatures.length ? 10 : pendingFeatures.length ? 6 : 5,
      justification: explicitFeatures.length ? "Features were requested but their behaviour is not defined." : pendingFeatures.length ? "Integrations were mentioned only as possibilities." : "No platforms, integrations or hosting needs were mentioned." },
  ];

  // 8. Key facts are computed from the final lists, so counts always match the sections.
  const keyFacts = [
    { label: "Project type", value: hasNoun ? cap(noun) : "Not stated" },
    { label: "Pages", value: pageNames.length ? joinList(pageNames) : "Not listed" },
    { label: "Style direction", value: ref ? `Inspired by ${ref}` : designLabels[0] ?? "Not described" },
    { label: "Timeline", value: targetDeadline.displayLine1 },
    { label: "Content status", value: readyAssets.length || pendingAssets.length ? `${readyAssets.length ? `${cap(joinList(readyAssets))} ready` : ""}${readyAssets.length && pendingAssets.length ? ", " : ""}${pendingAssets.length ? `${joinList(pendingAssets.map((p) => p.phrase))} in progress` : ""}` : "Not mentioned" },
    { label: "Optional extras", value: pending.length ? joinList(pending.map((p) => p.label)) : "None mentioned" },
    { label: "Confirmed deliverables", value: `${confirmed} of ${deliverables.length}` },
  ];

  return {
    facts,
    projectTitle,
    targetDeadline,
    clarity: { dimensions: dims },
    summary: { goal, paragraph: paragraph.join(" "), keyFacts },
    deliverables,
    ambiguities,
    questions,
    outOfScope,
    risks,
  };
}
