import type {
  ProjectBrief,
  DeliverableItem,
  StructuredAmbiguity,
  StructuredQuestion,
  OutOfScopeItem,
  StructuredRisk,
} from "./types";

export interface NormalizedSections {
  deliverables: DeliverableItem[];
  ambiguities: StructuredAmbiguity[];
  questions: StructuredQuestion[];
  outOfScope: OutOfScopeItem[];
  risks: StructuredRisk[];
}

const upperSeverity = (s?: string) => (s ? (s.toUpperCase() as StructuredRisk["severity"]) : "MEDIUM");

/** Structured sections for any brief, mapping legacy (v1) fields when the structured ones are absent. */
export function normalizeBrief(brief: ProjectBrief): NormalizedSections {
  const deliverables: DeliverableItem[] = brief.structuredDeliverables?.length
    ? brief.structuredDeliverables
    : (brief.requirements || []).map((r, i) => ({
        id: `D${i + 1}`,
        group: "Pages",
        label: r.title,
        description: r.description,
        evidence: r.source_excerpt || "",
        tag: r.status === "confirmed" ? "Confirmed" : "Needs scoping",
      }));

  const ambiguities: StructuredAmbiguity[] = brief.structuredAmbiguities?.length
    ? brief.structuredAmbiguities
    : (brief.ambiguities || []).map((a, i) => ({
        id: `A${i + 1}`,
        title: a.topic,
        severity: upperSeverity(a.severity),
        kind: "UNCLEAR",
        evidence: a.source_excerpt,
        whatIsUnclear: a.explanation,
        whyItMatters: "Directly affects kickoff timeline and team capacity.",
        linkedQuestionId: `Q${i + 1}`,
        isStandardKickoffItem: false,
      }));

  const questions: StructuredQuestion[] = brief.structuredQuestions?.length
    ? brief.structuredQuestions
    : (brief.questions || []).map((q, i) => ({
        id: `Q${i + 1}`,
        text: q.question,
        rationale: q.reason,
        linkedAmbiguityId: `A${i + 1}`,
        priority: i + 1,
      }));

  const outOfScope: OutOfScopeItem[] = brief.structuredOutOfScope?.length
    ? brief.structuredOutOfScope
    : [
        ...(brief.scope?.possible_future_scope || []).map((item, i) => ({
          id: `O${i + 1}`,
          group: "Pending client decision" as const,
          label: item,
          reason: "Conditional item pending formal client confirmation.",
          evidence: null,
        })),
        ...(brief.scope?.out_of_scope || []).map((item, i) => ({
          id: `O_ex_${i + 1}`,
          group: "Not mentioned, excluded unless confirmed" as const,
          label: item,
          reason: "Standard industry boundary excluded unless scoped.",
          evidence: null,
        })),
      ];

  const risks: StructuredRisk[] = brief.structuredRisks?.length
    ? brief.structuredRisks
    : (brief.risks || []).map((r, i) => ({
        id: `R${i + 1}`,
        title: r.risk,
        severity: upperSeverity(r.severity),
        explanation: r.impact,
        recommendedAction: r.suggested_action,
        owner: "Agency",
      }));

  return { deliverables, ambiguities, questions, outOfScope, risks };
}
