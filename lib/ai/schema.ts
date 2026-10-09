import { z } from "zod";
import { Type } from "@google/genai";

export const FactCategorySchema = z.enum([
  "goal",
  "page",
  "feature",
  "design",
  "content",
  "asset",
  "timeline",
  "technical",
  "budget",
  "contact",
  "other",
]);

export const FactStatusSchema = z.enum(["EXPLICIT", "CONDITIONAL", "IMPLIED"]);

export const FactSchema = z.object({
  id: z.string(),
  category: FactCategorySchema,
  statement: z.string(),
  evidence: z.string(),
  status: FactStatusSchema,
});

export const TargetDeadlineSchema = z.object({
  clientWording: z.string().nullable().default(null),
  milestoneType: z
    .enum([
      "soft_launch",
      "full_launch",
      "approximate_target",
      "firm_deadline",
      "flexible_window",
      "unspecified",
    ])
    .default("unspecified"),
  resolvedStart: z.string().nullable().default(null),
  resolvedEnd: z.string().nullable().default(null),
  isFirm: z.boolean().nullable().default(null),
  displayLine1: z.string(),
  displayLine2: z.string(),
});

export const ClarityDimensionItemSchema = z.object({
  key: z.string(),
  label: z.string(),
  score: z.number().int(),
  max: z.number().int(),
  justification: z.string(),
});

export const SummarySectionSchema = z.object({
  goal: z.string(),
  paragraph: z.string(),
  keyFacts: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
    })
  ),
});

export const DeliverableGroupSchema = z.enum([
  "Pages",
  "Design and Experience",
  "Content and Assets",
  "Features",
]);

export const DeliverableTagSchema = z.enum(["Confirmed", "Needs scoping"]);

export const DeliverableItemSchema = z.object({
  id: z.string(),
  factId: z.string().default("F1"),
  group: DeliverableGroupSchema,
  label: z.string(),
  description: z.string(),
  evidence: z.string(),
  tag: DeliverableTagSchema,
});

export const SeverityLevelSchema = z.enum(["HIGH", "MEDIUM", "LOW"]);
export const AmbiguityKindSchema = z.enum(["UNCLEAR", "MISSING", "CONFLICT"]);

export const AmbiguityItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  severity: SeverityLevelSchema,
  kind: AmbiguityKindSchema,
  evidence: z.string().nullable().default(null),
  whatIsUnclear: z.string(),
  whyItMatters: z.string(),
  linkedQuestionId: z.string(),
  isStandardKickoffItem: z.boolean().default(false),
});

export const QuestionItemSchema = z.object({
  id: z.string(),
  text: z.string(),
  rationale: z.string(),
  linkedAmbiguityId: z.string(),
  priority: z.number().int().default(1),
});

export const OutOfScopeGroupSchema = z.enum([
  "Pending client decision",
  "Not mentioned, excluded unless confirmed",
]);

export const OutOfScopeItemSchema = z.object({
  id: z.string(),
  group: OutOfScopeGroupSchema,
  label: z.string(),
  reason: z.string(),
  evidence: z.string().nullable().default(null),
});

export const RiskOwnerSchema = z.enum(["Agency", "Client", "Both"]);

export const RiskItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  severity: SeverityLevelSchema,
  explanation: z.string(),
  recommendedAction: z.string(),
  owner: RiskOwnerSchema,
});

export const BrieflyOutputSchema = z.object({
  facts: z.array(FactSchema).default([]),
  projectTitle: z.string(),
  targetDeadline: TargetDeadlineSchema,
  clarity: z.object({
    dimensions: z.array(ClarityDimensionItemSchema),
  }),
  summary: SummarySectionSchema,
  deliverables: z.array(DeliverableItemSchema),
  ambiguities: z.array(AmbiguityItemSchema),
  questions: z.array(QuestionItemSchema),
  outOfScope: z.array(OutOfScopeItemSchema),
  risks: z.array(RiskItemSchema),
});

export type BrieflyOutputParsed = z.infer<typeof BrieflyOutputSchema>;

// Gemini SDK Response Schema definition
export const geminiBrieflyResponseSchema = {
  type: Type.OBJECT,
  properties: {
    facts: {
      type: Type.ARRAY,
      description: "Atomic facts extracted directly from the client communication before generating brief sections.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          category: {
            type: Type.STRING,
            enum: [
              "goal",
              "page",
              "feature",
              "design",
              "content",
              "asset",
              "timeline",
              "technical",
              "budget",
              "contact",
              "other",
            ],
          },
          statement: { type: Type.STRING },
          evidence: { type: Type.STRING, description: "Verbatim quote <= 25 words from the client message." },
          status: { type: Type.STRING, enum: ["EXPLICIT", "CONDITIONAL", "IMPLIED"] },
        },
        required: ["id", "category", "statement", "evidence", "status"],
      },
    },
    projectTitle: { type: Type.STRING, description: "3 to 7 words title describing the project." },
    targetDeadline: {
      type: Type.OBJECT,
      properties: {
        clientWording: { type: Type.STRING, nullable: true },
        milestoneType: {
          type: Type.STRING,
          enum: [
            "soft_launch",
            "full_launch",
            "approximate_target",
            "firm_deadline",
            "flexible_window",
            "unspecified",
          ],
        },
        resolvedStart: { type: Type.STRING, nullable: true },
        resolvedEnd: { type: Type.STRING, nullable: true },
        isFirm: { type: Type.BOOLEAN, nullable: true },
        displayLine1: { type: Type.STRING },
        displayLine2: { type: Type.STRING },
      },
      required: ["milestoneType", "displayLine1", "displayLine2"],
    },
    clarity: {
      type: Type.OBJECT,
      properties: {
        dimensions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              key: { type: Type.STRING },
              label: { type: Type.STRING },
              score: { type: Type.INTEGER },
              max: { type: Type.INTEGER },
              justification: { type: Type.STRING },
            },
            required: ["key", "label", "score", "max", "justification"],
          },
        },
      },
      required: ["dimensions"],
    },
    summary: {
      type: Type.OBJECT,
      properties: {
        goal: { type: Type.STRING },
        paragraph: { type: Type.STRING },
        keyFacts: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              value: { type: Type.STRING },
            },
            required: ["label", "value"],
          },
        },
      },
      required: ["goal", "paragraph", "keyFacts"],
    },
    deliverables: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          factId: { type: Type.STRING },
          group: {
            type: Type.STRING,
            enum: ["Pages", "Design and Experience", "Content and Assets", "Features"],
          },
          label: { type: Type.STRING },
          description: { type: Type.STRING },
          evidence: { type: Type.STRING },
          tag: { type: Type.STRING, enum: ["Confirmed", "Needs scoping"] },
        },
        required: ["id", "factId", "group", "label", "description", "evidence", "tag"],
      },
    },
    ambiguities: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ["HIGH", "MEDIUM", "LOW"] },
          kind: { type: Type.STRING, enum: ["UNCLEAR", "MISSING", "CONFLICT"] },
          evidence: { type: Type.STRING, nullable: true },
          whatIsUnclear: { type: Type.STRING },
          whyItMatters: { type: Type.STRING },
          linkedQuestionId: { type: Type.STRING },
          isStandardKickoffItem: { type: Type.BOOLEAN },
        },
        required: [
          "id",
          "title",
          "severity",
          "kind",
          "whatIsUnclear",
          "whyItMatters",
          "linkedQuestionId",
          "isStandardKickoffItem",
        ],
      },
    },
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          text: { type: Type.STRING },
          rationale: { type: Type.STRING },
          linkedAmbiguityId: { type: Type.STRING },
          priority: { type: Type.INTEGER },
        },
        required: ["id", "text", "rationale", "linkedAmbiguityId", "priority"],
      },
    },
    outOfScope: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          group: {
            type: Type.STRING,
            enum: ["Pending client decision", "Not mentioned, excluded unless confirmed"],
          },
          label: { type: Type.STRING },
          reason: { type: Type.STRING },
          evidence: { type: Type.STRING, nullable: true },
        },
        required: ["id", "group", "label", "reason"],
      },
    },
    risks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ["HIGH", "MEDIUM", "LOW"] },
          explanation: { type: Type.STRING },
          recommendedAction: { type: Type.STRING },
          owner: { type: Type.STRING, enum: ["Agency", "Client", "Both"] },
        },
        required: ["id", "title", "severity", "explanation", "recommendedAction", "owner"],
      },
    },
  },
  required: [
    "facts",
    "projectTitle",
    "targetDeadline",
    "clarity",
    "summary",
    "deliverables",
    "ambiguities",
    "questions",
    "outOfScope",
    "risks",
  ],
};
