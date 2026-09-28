import { ProjectBrief } from './types';

export const SAMPLE_ACME_SOURCE = `Hey, can you make us a website kind of like Apple but maybe darker? We need around five pages: home, about, products, contact, and maybe something for customers. We want it before the middle of October. We already have the logo but we're still working on product images. Also maybe WhatsApp integration could be useful. It should obviously look good on mobile. We'd like the homepage to feel premium and not too crowded.`;

export const SAMPLE_ACME_BRIEF: ProjectBrief = {
  id: 'brief_acme_demo_01',
  title: 'ACME Website Redesign',
  status: 'EVIDENCE CHECKED',
  created_at: new Date('2026-09-28T09:00:00.000Z').toISOString(),
  createdDateFormatted: 'Sep 28, 2026',
  updated_at: new Date('2026-09-28T09:00:00.000Z').toISOString(),
  source_text: SAMPLE_ACME_SOURCE,
  source_files: [],
  version: 2,
  prompt_version: 'v2.0',
  targetDeadline: {
    clientWording: 'Before the middle of October',
    milestoneType: 'full_launch',
    resolvedStart: '2026-10-10',
    resolvedEnd: '2026-10-15',
    isFirm: false,
    displayLine1: 'Before the middle of October',
    displayLine2: 'Targeting Oct 10 to Oct 15, 2026. Exact launch milestone to be confirmed.',
  },
  clarityData: {
    overall: 58,
    band: 'Needs alignment',
    dimensions: [
      { key: 'goal_and_context', label: 'Goal and business context', score: 10, max: 15, justification: 'Company website for marketing products.' },
      { key: 'scope_and_deliverables', label: 'Scope and deliverables', score: 14, max: 20, justification: 'Five pages listed, customer area boundary unconfirmed.' },
      { key: 'timeline_and_deadline', label: 'Timeline and deadline', score: 9, max: 15, justification: 'Mid-October target given without specific date.' },
      { key: 'content_and_assets', label: 'Content and asset readiness', score: 8, max: 15, justification: 'Logo ready, product photos still in progress.' },
      { key: 'design_direction', label: 'Design direction', score: 9, max: 15, justification: 'Apple style dark mode reference.' },
      { key: 'technical_and_integration', label: 'Technical and integration definition', score: 8, max: 20, justification: 'WhatsApp chat mentioned as optional add-on.' },
    ],
  },
  executiveSummary: {
    goal: 'Design and build a 5-page responsive company website with dark Apple-inspired aesthetic by mid-October.',
    paragraph: 'The client requested a 5-page website covering Home, About, Products, Contact, and a customer area. Visual direction calls for a dark Apple-inspired feel with an uncluttered presentation. Existing logo is ready, while product images remain in progress. Optional WhatsApp integration was mentioned for potential inclusion.',
    keyFacts: [
      { label: 'Project type', value: 'Marketing website' },
      { label: 'Pages', value: 'Home, About, Products, Contact, Customer area' },
      { label: 'Style direction', value: 'Dark, Apple-inspired layout' },
      { label: 'Timeline', value: 'Before mid-October 2026' },
      { label: 'Content status', value: 'Logo ready, photos in progress' },
      { label: 'Extras requested', value: 'WhatsApp integration (optional)' },
    ],
  },
  structuredDeliverables: [
    {
      id: 'D1',
      group: 'Pages',
      label: 'Core marketing pages',
      description: 'Build Home, About, Products, and Contact pages.',
      evidence: 'home, about, products, contact',
      tag: 'Confirmed',
    },
    {
      id: 'D2',
      group: 'Design and Experience',
      label: 'Dark minimalism design system',
      description: 'Develop clean layout and contrast palette inspired by Apple.',
      evidence: 'kind of like Apple but maybe darker',
      tag: 'Confirmed',
    },
    {
      id: 'D3',
      group: 'Design and Experience',
      label: 'Mobile-responsive layout',
      description: 'Ensure full responsiveness and touch ergonomics across viewports.',
      evidence: 'obviously look good on mobile',
      tag: 'Confirmed',
    },
    {
      id: 'D4',
      group: 'Content and Assets',
      label: 'Brand logo integration',
      description: 'Incorporate client existing vector logo asset.',
      evidence: 'already have the logo',
      tag: 'Confirmed',
    },
  ],
  structuredAmbiguities: [
    {
      id: 'A1',
      title: 'Customer section functionality',
      severity: 'HIGH',
      kind: 'UNCLEAR',
      evidence: 'and maybe something for customers',
      whatIsUnclear: 'The client did not specify whether this requires an account login portal or a simple resource FAQ.',
      whyItMatters: 'A custom user login system significantly increases engineering effort.',
      linkedQuestionId: 'Q1',
      isStandardKickoffItem: false,
    },
    {
      id: 'A2',
      title: 'Exact launch milestone date',
      severity: 'MEDIUM',
      kind: 'UNCLEAR',
      evidence: 'We want it before the middle of October',
      whatIsUnclear: 'The client gave a general window rather than a fixed calendar launch date.',
      whyItMatters: 'Review cycles and staging deployment require fixed cutoff dates.',
      linkedQuestionId: 'Q2',
      isStandardKickoffItem: false,
    },
    {
      id: 'A3',
      title: 'Design references and moodboard',
      severity: 'MEDIUM',
      kind: 'UNCLEAR',
      evidence: 'kind of like Apple but maybe darker',
      whatIsUnclear: 'The client did not provide specific website links that illustrate their preferred dark style.',
      whyItMatters: 'Subjective styling terms can lead to multiple draft revisions.',
      linkedQuestionId: 'Q3',
      isStandardKickoffItem: false,
    },
    {
      id: 'A4',
      title: 'Product image delivery date',
      severity: 'MEDIUM',
      kind: 'UNCLEAR',
      evidence: 'working on product images',
      whatIsUnclear: 'The client did not specify when finished product photography will be ready.',
      whyItMatters: 'Final page design depends on real image aspect ratios.',
      linkedQuestionId: 'Q4',
      isStandardKickoffItem: false,
    },
    {
      id: 'A5',
      title: 'Approval contact and budget',
      severity: 'LOW',
      kind: 'MISSING',
      evidence: null,
      whatIsUnclear: 'The message does not mention who approves final page layouts or what budget is allocated.',
      whyItMatters: 'Clear sign-off ownership prevents conflicting stakeholder feedback.',
      linkedQuestionId: 'Q5',
      isStandardKickoffItem: true,
    },
  ],
  structuredQuestions: [
    {
      id: 'Q1',
      text: 'What specific features should the customer area have, such as a login portal or simple documentation?',
      rationale: 'Defines whether backend user authentication is required.',
      linkedAmbiguityId: 'A1',
      priority: 1,
    },
    {
      id: 'Q2',
      text: 'Which exact day in mid-October is your target launch deadline for the website?',
      rationale: 'Sets the timeline for design reviews and staging deployment.',
      linkedAmbiguityId: 'A2',
      priority: 2,
    },
    {
      id: 'Q3',
      text: 'Can you share two or three website links that represent the dark aesthetic you want?',
      rationale: 'Aligns the visual direction before wireframes begin.',
      linkedAmbiguityId: 'A3',
      priority: 3,
    },
    {
      id: 'Q4',
      text: 'When will the product photography be ready for integration into the product pages?',
      rationale: 'Prevents delays in laying out product catalog components.',
      linkedAmbiguityId: 'A4',
      priority: 4,
    },
    {
      id: 'Q5',
      text: 'Who on your team will be the primary contact for design review approvals?',
      rationale: 'Directs drafts to the responsible stakeholder.',
      linkedAmbiguityId: 'A5',
      priority: 5,
    },
  ],
  structuredOutOfScope: [
    {
      id: 'O1',
      group: 'Pending client decision',
      label: 'WhatsApp live chat widget',
      reason: 'Mentioned as an optional convenience item pending scope agreement.',
      evidence: 'Also maybe WhatsApp integration could be useful',
    },
    {
      id: 'O2',
      group: 'Not mentioned, excluded unless confirmed',
      label: 'Professional product photography',
      reason: 'Assumes client provides all product photos and asset files.',
      evidence: null,
    },
    {
      id: 'O3',
      group: 'Not mentioned, excluded unless confirmed',
      label: 'E-commerce payment processing',
      reason: 'Not requested in initial communication.',
      evidence: null,
    },
  ],
  structuredRisks: [
    {
      id: 'R1',
      title: 'Tight delivery schedule for mid-October',
      severity: 'HIGH',
      explanation: 'Launching before mid-October leaves limited time for design reviews and content loading.',
      recommendedAction: 'Confirm exact milestone calendar at kickoff call.',
      owner: 'Both',
    },
    {
      id: 'R2',
      title: 'Product image handoff delays',
      severity: 'MEDIUM',
      explanation: 'In-progress product images may hold up final page sign-offs.',
      recommendedAction: 'Establish a cutoff date for image handoff.',
      owner: 'Client',
    },
    {
      id: 'R3',
      title: 'Undefined customer area complexity',
      severity: 'MEDIUM',
      explanation: 'An admin or user portal could double development hours.',
      recommendedAction: 'Recommend email forms for Phase 1 and defer portals to Phase 2.',
      owner: 'Agency',
    },
    {
      id: 'R4',
      title: 'Subjective styling expectations',
      severity: 'LOW',
      explanation: 'Apple-like dark aesthetic requires reference alignment to avoid rework.',
      recommendedAction: 'Review client moodboard references prior to component styling.',
      owner: 'Agency',
    },
  ],
  project: {
    name: 'ACME Website Redesign',
    summary: 'A 5-page responsive marketing website for ACME with dark aesthetic, premium layout, and potential customer portal & WhatsApp integration.',
    goal: 'Create a modern, responsive company website to support the October product launch.',
    deadline: 'Mid-October',
    deadline_confidence: 'medium',
  },
  deliverables: [
    '5-page responsive marketing website (Home, About, Products, Contact, Customer Page)',
    'Mobile-first responsive layouts across breakpoints',
    'Integration with existing ACME logo and brand assets',
    'Interactive inquiry / contact mechanism'
  ],
  requirements: [
    {
      id: 'req-1',
      title: 'Responsive & Mobile-first Design',
      description: 'The website must be fully adaptive across mobile devices and desktop displays.',
      status: 'confirmed',
      priority: 'high',
      source_excerpt: 'it should obviously look good on mobile',
      confidence: 0.98
    },
    {
      id: 'req-2',
      title: 'Around Five Core Pages',
      description: 'Home, About, Products, Contact, and a fifth undefined customer-oriented page.',
      status: 'confirmed',
      priority: 'high',
      source_excerpt: 'We need around five pages: home, about, products, contact, and maybe something for customers',
      confidence: 0.92
    },
    {
      id: 'req-3',
      title: 'Brand Asset Integration',
      description: 'Existing ACME logo is available; product assets are in progress.',
      status: 'confirmed',
      priority: 'medium',
      source_excerpt: 'We already have the logo but we\'re still working on product images',
      confidence: 0.95
    },
    {
      id: 'req-4',
      title: 'Apple-Inspired Dark Design',
      description: 'Darker visual presentation inspired by Apple-style clean layout and spacious presentation.',
      status: 'ambiguous',
      priority: 'medium',
      source_excerpt: 'kind of like Apple but maybe darker ... feel premium and not too crowded',
      confidence: 0.65
    }
  ],
  scope: {
    in_scope: [
      'Homepage with high-impact hero and uncluttered layout',
      'About Us narrative page',
      'Products catalog overview page',
      'Contact page with standard inquiry form',
      'Asset ingestion for existing logo'
    ],
    uncertain_scope: [
      'Customer-related page: scope undefined (login portal vs simple resource page vs FAQ)',
      'Product images sourcing/photography vs client handoff'
    ],
    possible_future_scope: [
      'WhatsApp live chat widget or click-to-chat integration',
      'Customer account authentication or dashboard'
    ],
    out_of_scope: [
      'Full e-commerce checkout & payment processing (unmentioned)',
      'Custom CRM pipeline development'
    ]
  },
  ambiguities: [
    {
      id: 'amb-1',
      topic: 'Apple-like Design Reference',
      explanation: 'No specific design characteristics defined. "Like Apple" could mean typography, interaction animations, product render showcases, or extreme minimalism.',
      source_excerpt: 'kind of like Apple but maybe darker',
      severity: 'medium',
      suggested_question: 'What specific aspects of Apple\'s design language should we reflect (e.g. typography, smooth scroll animations, product showcases, or dark minimalism)?'
    },
    {
      id: 'amb-2',
      topic: 'Customer Page Functionality',
      explanation: 'Mentioned as "maybe something for customers" without clarifying whether this requires user authentication, account management, documentation, or a simple FAQ.',
      source_excerpt: 'and maybe something for customers',
      severity: 'high',
      suggested_question: 'What specific functionality or content is required for the customer section - a simple FAQ/resource hub, or an authenticated client portal?'
    },
    {
      id: 'amb-3',
      topic: 'Undefined Launch Date',
      explanation: '"Before the middle of October" leaves the hard cutoff ambiguous for scheduling sprint milestones.',
      source_excerpt: 'before the middle of October',
      severity: 'medium',
      suggested_question: 'What is your target launch day in October (e.g., October 1st vs October 15th) to lock in development milestones?'
    }
  ],
  contradictions: [],
  missing_information: [
    {
      id: 'miss-1',
      item: 'Exact launch target date',
      reason: 'Necessary to lock sprint capacity and milestone deliverable dates.',
      importance: 'high'
    },
    {
      id: 'miss-2',
      item: 'Customer page feature list',
      reason: 'Authentication or database requirements will drastically impact backend scope.',
      importance: 'high'
    },
    {
      id: 'miss-3',
      item: 'Final product photography delivery date',
      reason: 'Products page design depends on high-resolution image aspect ratios.',
      importance: 'medium'
    },
    {
      id: 'miss-4',
      item: 'WhatsApp integration requirement confirmation',
      reason: 'Need to clarify if WhatsApp API setup or simple click-to-chat link is desired.',
      importance: 'low'
    }
  ],
  questions: [
    {
      id: 'q-1',
      question: 'What exact calendar date do you need the website live and published?',
      reason: 'Clarifies "before the middle of October" to set milestone deadlines.',
      priority: 'high'
    },
    {
      id: 'q-2',
      question: 'What specific functionality should the "customer" page include - is it a public resources/FAQ page, or an authenticated portal requiring logins?',
      reason: 'Significantly alters technical architecture and scope.',
      priority: 'high'
    },
    {
      id: 'q-3',
      question: 'When you say "like Apple", are you looking for smooth scroll interactions, high-contrast dark photography backgrounds, or clean typography hierarchy?',
      reason: 'Pins down subjective aesthetic guidelines before wireframing.',
      priority: 'medium'
    },
    {
      id: 'q-4',
      question: 'Is the WhatsApp integration required for the initial phase, and is a direct "click-to-chat" link sufficient?',
      reason: 'Differentiates phase 1 MVP from automated WhatsApp business API pipelines.',
      priority: 'medium'
    },
    {
      id: 'q-5',
      question: 'When will the final high-resolution product images be ready for handoff?',
      reason: 'Identifies potential dependency blockers for product page completion.',
      priority: 'medium'
    }
  ],
  risks: [
    {
      id: 'risk-1',
      risk: 'Launch date expressed colloquially as "mid-October"',
      impact: 'Unclear milestone cutoffs and compressed QA testing window.',
      severity: 'medium',
      suggested_action: 'Lock in firm delivery date (e.g. Oct 10 for review, Oct 14 for launch) during kickoff.'
    },
    {
      id: 'risk-2',
      risk: 'Ambiguous customer portal feature',
      impact: 'Potential scope creep into user authentication, session security, and database schemas.',
      severity: 'high',
      suggested_action: 'Decouple authenticated customer features into a Phase 2 discussion unless strictly required for launch.'
    },
    {
      id: 'risk-3',
      risk: 'Delayed product imagery assets',
      impact: 'Design blocks on product catalog page layouts.',
      severity: 'medium',
      suggested_action: 'Design layout with flexible aspect ratios and establish asset deadline 2 weeks prior to launch.'
    }
  ],
  dependencies: [
    {
      id: 'dep-1',
      item: 'Final high-resolution product photography',
      owner: 'client',
      status: 'uncertain'
    },
    {
      id: 'dep-2',
      item: 'Vector logo & brand typography guidelines',
      owner: 'client',
      status: 'confirmed'
    },
    {
      id: 'dep-3',
      item: 'Domain access, DNS, and hosting environment',
      owner: 'team',
      status: 'uncertain'
    },
    {
      id: 'dep-4',
      item: 'Customer page functional scope confirmation',
      owner: 'client',
      status: 'missing'
    }
  ],
  next_steps: [
    {
      id: 'step-1',
      step: 'Send clarification questions regarding launch date and customer page scope.',
      priority: 'high'
    },
    {
      id: 'step-2',
      step: 'Confirm whether WhatsApp click-to-chat is included in initial milestone.',
      priority: 'high'
    },
    {
      id: 'step-3',
      step: 'Collect existing vector logo files and brand assets from client.',
      priority: 'medium'
    },
    {
      id: 'step-4',
      step: 'Draft 5-page sitemap and wireframe layouts with dark minimalist styling.',
      priority: 'medium'
    },
    {
      id: 'step-5',
      step: 'Schedule 15-minute alignment call once responses are received.',
      priority: 'medium'
    }
  ],
  scores: {
    overall: 82,
    scope_clarity: 78,
    timeline_clarity: 65,
    requirements_clarity: 90,
    dependency_clarity: 75,
    calculation_note: 'Calculated from ratio of confirmed requirements, identified uncertainties, and actionable timeline specifications.'
  },
  client_ready_overview: `## ACME Website Redesign - Project Kickoff Alignment

### Project Objective
Develop a modern, mobile-first responsive marketing website featuring a premium dark aesthetic to support ACME's October product release.

### Confirmed Deliverables (Phase 1)
- **Responsive Website Architecture**: Optimized for mobile, tablet, and desktop viewports.
- **Core Sitemap (5 Pages)**: Homepage, About Us, Products Showcase, Contact page, and Customer Resources page.
- **Brand Alignment**: Integration of existing ACME logo and visual styling tailored to your premium dark aesthetic preferences.

### Key Questions for Kickoff Alignment
1. **Target Launch Date**: What specific calendar date in October are you planning the launch for?
2. **Customer Page**: Would you prefer the customer page to serve as a public Resource/FAQ hub, or will it require user logins?
3. **WhatsApp Integration**: Can we start with a direct "click-to-chat" link for Phase 1?
4. **Product Images**: When do you anticipate the final product photography will be ready?

### Immediate Next Steps
- Confirm answers to the 4 alignment questions above.
- Handoff existing vector logo files.
- Delivery of initial wireframes within 5 business days of scope signoff.`
};

export const INITIAL_BRIEFS_LIST: ProjectBrief[] = [
  {
    ...SAMPLE_ACME_BRIEF,
    updated_at: new Date(Date.now() - 1000 * 60 * 4).toISOString(), // 4 min ago
  },
  {
    id: 'brief_nova_campaign',
    title: 'Nova Campaign',
    status: 'complete',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
    source_text: 'We are launching the Q4 Nova brand campaign. We need 3 landing page variants for A/B testing, HubSpot lead capture integration, and tracking pixel configuration. Brand book and copy are finalized. Launch is set for November 1st. Can you also clarify if animated 3D assets are expected for hero variants?',
    version: 1,
    project: {
      name: 'Nova Campaign',
      summary: 'High-converting Q4 campaign landing page system with 3 variants, HubSpot lead routing, and analytics pixel setup.',
      goal: 'Deliver 3 campaign variants ready for paid traffic before November 1.',
      deadline: 'November 1, 2026',
      deadline_confidence: 'high'
    },
    deliverables: [
      '3 responsive landing page design variants',
      'HubSpot form API sync with automated lead tagging',
      'Meta, Google & LinkedIn conversion pixel tracking',
      'Lighthouse 95+ performance optimization'
    ],
    requirements: [
      {
        id: 'nova-1',
        title: '3 A/B Landing Page Variants',
        description: 'Design and build three distinct visual iterations around the finalized campaign copy.',
        status: 'confirmed',
        priority: 'high',
        source_excerpt: 'We need 3 landing page variants for A/B testing',
        confidence: 0.98
      },
      {
        id: 'nova-2',
        title: 'HubSpot Form Integration',
        description: 'Direct webhook/form submission into client HubSpot CRM portal.',
        status: 'confirmed',
        priority: 'high',
        source_excerpt: 'HubSpot lead capture integration',
        confidence: 0.97
      },
      {
        id: 'nova-3',
        title: 'Finalized Brand Book Alignment',
        description: 'Adherence to approved brand book and typography system.',
        status: 'confirmed',
        priority: 'medium',
        source_excerpt: 'Brand book and copy are finalized',
        confidence: 0.99
      }
    ],
    scope: {
      in_scope: [
        '3 landing page variants (Desktop & Mobile)',
        'HubSpot lead capture form integration',
        'Conversion tracking setup and test event verification'
      ],
      uncertain_scope: [
        'Interactive 3D WebGL hero animations vs static render fallback'
      ],
      possible_future_scope: [
        'Multilingual localization (Spanish & German)'
      ],
      out_of_scope: [
        'Ad spend management or PPC campaign operations'
      ]
    },
    ambiguities: [],
    contradictions: [],
    missing_information: [
      {
        id: 'nova-m1',
        item: '3D asset format confirmation (GLTF vs video MP4)',
        reason: 'Required to ensure loading speed benchmarks.',
        importance: 'medium'
      }
    ],
    questions: [
      {
        id: 'nova-q1',
        question: 'Are the animated hero assets provided as pre-rendered MP4/WebM videos or interactive 3D WebGL models?',
        reason: 'Affects browser bundle size and mobile performance budgets.',
        priority: 'high'
      }
    ],
    risks: [],
    dependencies: [
      {
        id: 'nova-d1',
        item: 'HubSpot API portal access & private app token',
        owner: 'client',
        status: 'confirmed'
      },
      {
        id: 'nova-d2',
        item: 'Tracking pixel IDs for Google and Meta Ads',
        owner: 'client',
        status: 'confirmed'
      }
    ],
    next_steps: [
      {
        id: 'nova-s1',
        step: 'Confirm asset format for hero graphics (MP4 vs interactive 3D).',
        priority: 'high'
      },
      {
        id: 'nova-s2',
        step: 'Handoff wireframes of the 3 variant layouts for approval.',
        priority: 'medium'
      }
    ],
    scores: {
      overall: 94,
      scope_clarity: 96,
      timeline_clarity: 98,
      requirements_clarity: 95,
      dependency_clarity: 92,
      calculation_note: 'High fidelity with locked copy, fixed deadline, and 1 minor asset clarification.'
    }
  },
  {
    id: 'brief_orbit_mobile',
    title: 'Orbit Mobile App',
    status: 'needs_review',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    source_text: 'We want to build something like Uber for dog walkers. Users should be able to book on-demand or schedule ahead. We need GPS tracking so owners can watch the walk in real time, and in-app messaging. Maybe also payments via Stripe? Needs to launch before Christmas. We have rough wireframes in Figma.',
    version: 1,
    project: {
      name: 'Orbit Mobile App',
      summary: 'On-demand dog walking mobile platform with live GPS tracking, in-app messaging, Stripe payments, and dual rider/walker workflows.',
      goal: 'Launch cross-platform iOS & Android MVP before the holiday season.',
      deadline: 'Before Christmas (Dec 2026)',
      deadline_confidence: 'medium'
    },
    deliverables: [
      'Cross-platform iOS & Android mobile application',
      'Live GPS map tracking for active walks',
      'Dual user roles: Pet Owner & Service Walker',
      'Direct in-app messaging channel'
    ],
    requirements: [
      {
        id: 'orb-1',
        title: 'Live GPS Route Tracking',
        description: 'Real-time location updates of walker path visible to pet owner during session.',
        status: 'confirmed',
        priority: 'high',
        source_excerpt: 'GPS tracking so owners can watch the walk in real time',
        confidence: 0.94
      },
      {
        id: 'orb-2',
        title: 'Booking Engine: On-demand & Scheduled',
        description: 'Support immediate pickup requests and recurring calendar appointments.',
        status: 'confirmed',
        priority: 'high',
        source_excerpt: 'book on-demand or schedule ahead',
        confidence: 0.91
      },
      {
        id: 'orb-3',
        title: 'In-app Chat Messaging',
        description: 'Direct channel between pet owner and walker for logistical coordination.',
        status: 'confirmed',
        priority: 'medium',
        source_excerpt: 'in-app messaging',
        confidence: 0.90
      },
      {
        id: 'orb-4',
        title: 'Integrated Payment Processing',
        description: 'Credit card capture and walker payout disbursement via Stripe Connect.',
        status: 'ambiguous',
        priority: 'high',
        source_excerpt: 'Maybe also payments via Stripe?',
        confidence: 0.70
      }
    ],
    scope: {
      in_scope: [
        'Owner profile & pet details onboarding',
        'Walker map discovery & instant booking request',
        'Live background geolocation sync during walk',
        'Stripe payment gateway integration'
      ],
      uncertain_scope: [
        'Walker background check verification system',
        'Automated surge pricing based on weather or demand'
      ],
      possible_future_scope: [
        'Subscription wellness packages and monthly billing',
        'Hardware smart collar Bluetooth sync'
      ],
      out_of_scope: [
        'Veterinary telehealth video consultations',
        'Retail pet supply store'
      ]
    },
    ambiguities: [
      {
        id: 'orb-amb-1',
        topic: 'Walker Payout & Marketplace Escrow',
        explanation: '"Payments via Stripe" could range from simple credit card charges to complex multi-party marketplace payouts (Stripe Connect Express/Custom).',
        source_excerpt: 'Maybe also payments via Stripe?',
        severity: 'high',
        suggested_question: 'Are you looking for standard card checkout, or two-sided marketplace split payments where walkers receive automatic deposits?'
      },
      {
        id: 'orb-amb-2',
        topic: 'Live GPS Polling Battery & Background Limits',
        explanation: 'Continuous real-time GPS tracking requires background location permissions on iOS/Android, which have stringent app store approval policies.',
        source_excerpt: 'GPS tracking so owners can watch the walk in real time',
        severity: 'high',
        suggested_question: 'Can GPS updates be pulsed every 15-30 seconds to preserve device battery and prevent app store rejections?'
      }
    ],
    contradictions: [],
    missing_information: [
      {
        id: 'orb-m1',
        item: 'Apple Developer & Google Play Console organization accounts',
        reason: 'Required for location entitlement approval and testflight distribution.',
        importance: 'high'
      },
      {
        id: 'orb-m2',
        item: 'Figma wireframes link and component library access',
        reason: 'Necessary to estimate screen count and user interaction flows.',
        importance: 'high'
      }
    ],
    questions: [
      {
        id: 'orb-q1',
        question: 'Do you require automated split payments with direct walker bank account transfers (Stripe Connect), or will walker payouts be handled off-platform for MVP?',
        reason: 'Drastically alters database structure, compliance requirements, and payment fees.',
        priority: 'high'
      },
      {
        id: 'orb-q2',
        question: 'What is the hard submission deadline for Apple App Store review to safely meet your pre-Christmas launch?',
        reason: 'App Store review takes 3-7 days and holiday freezes happen in late December.',
        priority: 'high'
      },
      {
        id: 'orb-q3',
        question: 'Will walkers be hired employees (W2) or independent contractors (1099)?',
        reason: 'Defines onboarding identity checks and legal terms acceptance.',
        priority: 'medium'
      },
      {
        id: 'orb-q4',
        question: 'Can you share the Figma file link to verify screen count and flow complexity?',
        reason: 'Pins down accurate frontend build hours.',
        priority: 'medium'
      },
      {
        id: 'orb-q5',
        question: 'Should in-app messaging support photo attachments (e.g. proof of walk)?',
        reason: 'Requires cloud storage bucket (S3/Cloud Storage) and media compression pipelines.',
        priority: 'medium'
      }
    ],
    risks: [
      {
        id: 'orb-r1',
        risk: 'App Store review rejection over background GPS tracking',
        impact: 'Launch delayed past the critical Christmas window.',
        severity: 'high',
        suggested_action: 'Prepare comprehensive demo video and justification document for Apple Review team.'
      },
      {
        id: 'orb-r2',
        risk: 'Two-sided marketplace liquidity chicken-and-egg problem',
        impact: 'Owners cannot find available walkers in local zip codes upon launch.',
        severity: 'high',
        suggested_action: 'Launch initial beta in a single dense neighborhood or city first.'
      }
    ],
    dependencies: [
      {
        id: 'orb-d1',
        item: 'Apple & Google Developer Organization Accounts',
        owner: 'client',
        status: 'uncertain'
      },
      {
        id: 'orb-d2',
        item: 'Figma UX flow handoff',
        owner: 'client',
        status: 'confirmed'
      },
      {
        id: 'orb-d3',
        item: 'Stripe Connect merchant underwriting approval',
        owner: 'client',
        status: 'missing'
      }
    ],
    next_steps: [
      {
        id: 'orb-s1',
        step: 'Confirm Stripe Connect payment architecture requirement.',
        priority: 'high'
      },
      {
        id: 'orb-s2',
        step: 'Receive Figma design file access from product owner.',
        priority: 'high'
      },
      {
        id: 'orb-s3',
        step: 'Lock submission cutoff date for App Store review freeze.',
        priority: 'medium'
      }
    ],
    scores: {
      overall: 71,
      scope_clarity: 68,
      timeline_clarity: 65,
      requirements_clarity: 76,
      dependency_clarity: 70,
      calculation_note: 'High technical ambiguity in live GPS tracking, payment splitting, and holiday app store cutoffs.'
    }
  }
];
