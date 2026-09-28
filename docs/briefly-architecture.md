# Briefly - Technical Architecture

## 1. Stack
- **Framework**: Next.js 15+ App Router (TypeScript, React 19)
- **Styling**: Tailwind CSS v4, custom sophisticated editorial SaaS theme (warm off-white, deep ink/charcoal, semantic accents: blue, amber, emerald, rose)
- **Animation**: `motion/react` (Motion)
- **Icons**: `lucide-react`
- **Validation**: `zod` for strict runtime schema parsing of Gemini responses
- **AI Execution**: `@google/genai` (Google GenAI SDK) server-side (`gemini-3.8-flash`) with structured JSON schema
- **Data & Persistence**: LocalStorage + IndexedDB with demo workspace fallback and tokenized share links
- **Exporting**: Clean print-to-PDF styles, client-ready markdown/formatted clipboard copy, standalone public share route (`/share/[token]`)

## 2. Server API Routes
- `POST /api/briefs`: Ingests messy text or uploaded file content (multimodal/text), prompts Gemini with strict JSON schema, validates with Zod, returns structured brief.
- `POST /api/briefs/regenerate`: Selectively re-analyzes a specific section (questions, summary, scope, or risks) without reprocessing the entire brief.
- `POST /api/briefs/client-ready`: Transforms internal brief with risks/ambiguities into a client-ready executive brief for external sending.

## 3. Data Schema (Briefly JSON Contract)
- Project metadata (name, summary, goal, deadline, deadline_confidence)
- Scope classification (in_scope, uncertain_scope, possible_future_scope, out_of_scope)
- Requirements (title, description, status, priority, source_excerpt, confidence)
- Ambiguities (topic, explanation, source_excerpt, severity, suggested_question)
- Contradictions (topic, conflict_description, sources, suggested_question)
- Missing Information (item, reason, importance)
- Client Questions (question, reason, priority)
- Project Risks (risk, impact, severity, suggested_action)
- Dependencies (item, owner, status)
- Actionable Next Steps (step, priority)
- Clarity & completeness scoring (overall, scope, timeline, requirements, dependencies)
