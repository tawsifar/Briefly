# Briefly

**AI-powered project intake and requirement intelligence for turning messy client communication into clear, actionable project briefs.**

Briefly helps freelancers, agencies, developers, designers, project managers, and consultants transform unstructured client requests into structured project briefs that are easier to understand, review, scope, and communicate.

Instead of manually parsing long emails, messages, meeting notes, or transcripts, Briefly analyzes the available information and organizes it into a clear project overview while preserving uncertainty where the source material is incomplete or ambiguous.

## Overview

Client requirements are often incomplete, inconsistent, or scattered across conversations.

Briefly creates a structured workflow:

```text
Messy Client Input
        ↓
AI Requirement Analysis
        ↓
Evidence-Based Structured Brief
        ↓
Ambiguities + Missing Information
        ↓
Clarification Questions
        ↓
Risks + Scope Analysis
        ↓
Client-Ready Brief
```

The goal is not simply to summarize what a client said.

Briefly is designed to help determine:

* What the client explicitly requested
* What is still unclear
* What information is missing
* Where requirements conflict
* What should be confirmed before development or delivery
* What potential risks should be considered
* Which questions should be sent back to the client

## Core Features

### AI-Powered Requirement Analysis

Briefly uses Gemini to analyze messy project requests and convert them into structured project information.

The generated output can include:

* Project overview
* Goals and objectives
* Requirements
* Deliverables
* Scope classification
* Ambiguities
* Missing information
* Contradictions
* Client clarification questions
* Project risks
* Dependencies
* Recommended next steps
* Clarity scoring

### Evidence-Based Analysis

Briefly is designed to distinguish between information that is explicitly stated, conditional, or implied.

Important requirements can retain their original source excerpts so users can trace a conclusion back to the client's actual wording.

### Ambiguity Detection

The system identifies areas where requirements are unclear or incomplete and explains why clarification may be necessary.

Each ambiguity can be connected to a specific clarification question.

### Contradiction and Scope Detection

Briefly can surface conflicting requirements and classify project items across different scope states, helping users avoid silently assuming details that were never confirmed.

### Client Clarification Questions

Instead of leaving users to figure out what to ask next, Briefly generates focused questions based on identified uncertainties and missing information.

### Internal and Client-Ready Briefs

Briefly supports two different communication needs:

**Internal Brief**

A detailed version containing requirements, ambiguities, risks, evidence, and unresolved questions.

**Client-Ready Brief**

A cleaner version designed for sharing with clients without exposing unnecessary internal analysis.

### Brief Regeneration

Specific sections of a brief can be regenerated without processing the entire project again.

This allows users to selectively refine areas such as:

* Summary
* Scope
* Questions
* Risks

### Workspace and Persistence

Briefs can be managed through a workspace with:

* Recent briefs
* Search
* Status filtering
* Autosaving
* Local workspace storage
* Supabase cloud persistence for authenticated users

### Public Sharing

Briefs can be shared through standalone public routes, making it easier to send completed project summaries to clients or collaborators.

### PDF Export

Client-ready briefs can be formatted for clean document export and printing.

## Technology Stack

### Frontend

* Next.js 15
* React 19
* TypeScript
* Tailwind CSS v4
* Motion
* Lucide React

### AI

* Google Gemini
* `@google/genai`
* Structured JSON responses
* Zod schema validation

### Backend and Data

* Next.js App Router API routes
* Supabase
* Supabase SSR authentication
* Local workspace persistence

### Utilities

* jsPDF
* Zod
* ESLint
* TypeScript

## Architecture

Briefly uses a layered approach to keep AI generation separate from validation and application logic.

```text
User Input
    ↓
Create Brief UI
    ↓
POST /api/briefs
    ↓
Gemini
    ↓
Structured JSON Schema
    ↓
Zod Validation
    ↓
Briefly Validation Pipeline
    ↓
Clarity Calculation
    ↓
ProjectBrief
    ↓
Brief Workspace
```

Additional API routes support selective regeneration and client-ready transformations.

```text
POST /api/briefs
POST /api/briefs/regenerate
POST /api/briefs/client-ready
```

## Data Reliability

AI-generated output can contain uncertainty or malformed information, so Briefly uses validation and cleanup before displaying the final result.

The pipeline is designed to:

1. Generate structured AI output
2. Validate the response against a defined schema
3. Clean and normalize the result
4. Calculate clarity scores
5. Map the result into the application data model
6. Preserve compatibility with existing brief structures

If Gemini is unavailable, Briefly also includes a grounded deterministic fallback for generating structured output.

## Getting Started

### Prerequisites

Make sure you have:

* Node.js installed
* A Gemini API key
* Supabase credentials if cloud authentication and persistence are being used

### Installation

Clone the repository:

```bash
git clone https://github.com/tawsifar/Briefly.git
```

Move into the project directory:

```bash
cd Briefly
```

Install dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env.local` file and configure the required environment variables.

Example:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.8-flash

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Use the repository `.env.example` as the reference for the expected configuration.

### Run Locally

Start the development server:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

### Production Build

Create a production build:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Project Structure

```text
Briefly/
├── app/
│   ├── api/
│   │   └── briefs/
│   ├── auth/
│   ├── share/
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── brief/
│   ├── dashboard/
│   ├── landing/
│   ├── layout/
│   └── ui/
│
├── lib/
│   ├── ai/
│   │   ├── gemini.ts
│   │   ├── prompts.ts
│   │   ├── schema.ts
│   │   ├── service.ts
│   │   └── validation.ts
│   ├── supabase/
│   ├── auth-context.tsx
│   ├── export-pdf.ts
│   ├── storage.ts
│   ├── types.ts
│   └── utils.ts
│
├── docs/
│   ├── briefly-architecture.md
│   ├── briefly-product.md
│   ├── briefly-progress.md
│   └── supabase-schema.sql
│
└── package.json
```

## Product Philosophy

Briefly is built around a few principles:

### Preserve uncertainty

The system should not silently turn assumptions into facts.

### Keep evidence traceable

Important conclusions should remain connected to the source material whenever possible.

### Separate internal analysis from client communication

Teams may need detailed risk and ambiguity analysis internally, while clients need a concise and professional project summary.

### Turn analysis into action

The purpose of identifying ambiguity is not merely to point it out. Briefly converts uncertainty into concrete clarification questions and next steps.

## Example Use Case

A client sends a message such as:

> "We need a modern website for our Airbnb business. It should have Instagram integration, a booking system, around five pages, and ideally launch next month."

Briefly can help transform that into:

```text
Confirmed
• Website required
• Airbnb-related business
• Instagram integration mentioned
• Booking functionality mentioned

Needs clarification
• Exact number of pages
• Booking workflow
• Launch date
• Required Instagram functionality
• Content and assets
• Payment requirements

Potential risks
• Booking requirements may require additional backend scope
• Launch timeline may depend on content availability
• Payment and availability logic are not defined

Client questions
• Which pages should be included?
• Should the booking system support online payments?
• What launch date should be treated as the target?
• What Instagram functionality is required?
```

The result is a much clearer foundation for project planning and client communication.

## Roadmap

Potential future improvements include:

* More document and media ingestion capabilities
* Meeting and voice transcript workflows
* Deeper source traceability
* Improved contradiction detection
* More advanced project estimation
* Team collaboration
* Version comparison
* Project templates
* External integrations
* More advanced AI agents for project discovery and follow-up

## Status

Briefly currently includes the core project intake workflow, AI analysis pipeline, structured validation, brief management, regeneration, client-ready output, cloud persistence, sharing, and dashboard functionality.

## License

This project is licensed under the MIT License.

## Author

**Tawsif Azam Rahin**

GitHub: [@tawsifar](https://github.com/tawsifar)

Repository: [github.com/tawsifar/Briefly](https://github.com/tawsifar/Briefly)
