export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type RequirementStatus = 'confirmed' | 'ambiguous' | 'possible' | 'missing';
export type PriorityLevel = 'high' | 'medium' | 'low';
export type DependencyOwner = 'client' | 'team' | 'unknown' | 'Agency' | 'Client' | 'Both';
export type BriefStatus = 'EVIDENCE CHECKED' | 'NEEDS REVIEW' | 'complete' | 'needs_review' | 'draft';

export interface Fact {
  id: string; // e.g. "F1"
  category:
    | "goal"
    | "page"
    | "feature"
    | "design"
    | "content"
    | "asset"
    | "timeline"
    | "technical"
    | "budget"
    | "contact"
    | "other";
  statement: string;
  evidence: string;
  status: "EXPLICIT" | "CONDITIONAL" | "IMPLIED";
}

export interface TargetDeadlineInfo {
  clientWording: string | null;
  milestoneType:
    | "soft_launch"
    | "full_launch"
    | "approximate_target"
    | "firm_deadline"
    | "flexible_window"
    | "unspecified";
  resolvedStart: string | null;
  resolvedEnd: string | null;
  isFirm: boolean | null;
  displayLine1: string;
  displayLine2: string;
}

export interface ClarityDimension {
  key: string;
  label: string;
  score: number;
  max: number;
  justification: string;
}

export interface DeliverableItem {
  id: string;
  factId?: string;
  group: "Pages" | "Design and Experience" | "Content and Assets" | "Features";
  label: string;
  description: string;
  evidence: string;
  tag: "Confirmed" | "Needs scoping";
}

export interface StructuredAmbiguity {
  id: string; // e.g. "A1"
  title: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  kind: "UNCLEAR" | "MISSING" | "CONFLICT";
  evidence: string | null;
  whatIsUnclear: string;
  whyItMatters: string;
  linkedQuestionId: string;
  isStandardKickoffItem: boolean;
}

export interface StructuredQuestion {
  id: string; // e.g. "Q1"
  text: string;
  rationale: string;
  linkedAmbiguityId: string;
  priority: number;
}

export interface OutOfScopeItem {
  id: string;
  group: "Pending client decision" | "Not mentioned, excluded unless confirmed";
  label: string;
  reason: string;
  evidence: string | null;
}

export interface StructuredRisk {
  id: string; // e.g. "R1"
  title: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  explanation: string;
  recommendedAction: string;
  owner: "Agency" | "Client" | "Both";
}

export interface BrieflyOutput {
  facts: Fact[];
  projectTitle: string;
  targetDeadline: TargetDeadlineInfo;
  clarity: {
    dimensions: ClarityDimension[];
  };
  summary: {
    goal: string;
    paragraph: string;
    keyFacts: { label: string; value: string }[];
  };
  deliverables: DeliverableItem[];
  ambiguities: StructuredAmbiguity[];
  questions: StructuredQuestion[];
  outOfScope: OutOfScopeItem[];
  risks: StructuredRisk[];
}

// Backward compatibility interfaces
export interface ProjectMeta {
  name: string;
  summary: string;
  goal: string;
  deadline: string | null;
  deadline_confidence: ConfidenceLevel;
}

export interface RequirementItem {
  id: string;
  title: string;
  description: string;
  status: RequirementStatus;
  priority: PriorityLevel;
  source_excerpt?: string;
  confidence: number;
}

export interface ScopeClassification {
  in_scope: string[];
  uncertain_scope: string[];
  possible_future_scope: string[];
  out_of_scope: string[];
}

export interface AmbiguityItem {
  id: string;
  topic: string;
  explanation: string;
  source_excerpt: string;
  severity: PriorityLevel;
  suggested_question: string;
}

export interface ContradictionItem {
  id: string;
  topic: string;
  conflict_description: string;
  sources: string[];
  suggested_question: string;
}

export interface MissingInfoItem {
  id: string;
  item: string;
  reason: string;
  importance: PriorityLevel;
}

export interface ClientQuestionItem {
  id: string;
  question: string;
  reason: string;
  priority: PriorityLevel;
}

export interface ProjectRiskItem {
  id: string;
  risk: string;
  impact: string;
  severity: PriorityLevel;
  suggested_action: string;
}

export interface DependencyItem {
  id: string;
  item: string;
  owner: DependencyOwner;
  status: 'confirmed' | 'uncertain' | 'missing';
}

export interface NextStepItem {
  id: string;
  step: string;
  priority: PriorityLevel;
}

export interface ClarityScores {
  overall: number;
  scope_clarity?: number;
  timeline_clarity?: number;
  requirements_clarity?: number;
  dependency_clarity?: number;
  calculation_note?: string;
}

export interface ProjectBrief {
  id: string;
  title: string;
  status: BriefStatus;
  created_at: string;
  updated_at: string;
  source_text: string;
  source_files?: {
    name: string;
    size: number;
    type: string;
  }[];
  // Standard PART 4 structured brief fields
  createdDateFormatted?: string;
  targetDeadline?: TargetDeadlineInfo;
  clarityData?: {
    overall: number;
    band: "Ready for kickoff" | "Mostly clear" | "Needs alignment" | "Unclear";
    dimensions: ClarityDimension[];
  };
  executiveSummary?: {
    goal: string;
    paragraph: string;
    keyFacts: { label: string; value: string }[];
  };
  structuredDeliverables?: DeliverableItem[];
  structuredAmbiguities?: StructuredAmbiguity[];
  structuredQuestions?: StructuredQuestion[];
  structuredOutOfScope?: OutOfScopeItem[];
  structuredRisks?: StructuredRisk[];
  facts?: Fact[];
  validationIssues?: string[];

  // Legacy fields for backward compatibility
  project: ProjectMeta;
  requirements: RequirementItem[];
  deliverables: string[];
  scope: ScopeClassification;
  ambiguities: AmbiguityItem[];
  contradictions?: ContradictionItem[];
  missing_information?: MissingInfoItem[];
  questions: ClientQuestionItem[];
  risks: ProjectRiskItem[];
  dependencies?: DependencyItem[];
  next_steps?: NextStepItem[];
  scores: ClarityScores;
  client_ready_overview?: string;
  version?: number;
  prompt_version?: string;
}

export function formatStandardDate(dateInput?: string | number | Date | null): string {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const date = dateInput ? new Date(dateInput) : new Date();
  const validDate = isNaN(date.getTime()) ? new Date() : date;
  return `${months[validDate.getUTCMonth()]} ${validDate.getUTCDate()}, ${validDate.getUTCFullYear()}`;
}
