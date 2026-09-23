// Real Application Skills guide content, transcribed faithfully from the
// client-provided source PDFs (WTA-*-Full-Breakdown.pdf). Replaces the
// placeholder "Full guide coming soon" cards previously on /resources.
//
// Every source doc has a "[Insert walkthrough video link/embed here]" slot
// with no real video yet — videos are modeled with no URL at all
// (videoPending on the resource, no fake link) so the detail page can show
// an honest "Video coming soon" state instead of a broken/fake embed.
export interface ResourceVideo {
  label: string;
  description: string;
  // YouTube video ID — when absent, the detail page shows a "Video coming soon" placeholder.
  youtubeId?: string;
  // The resume doc's second video ("Sample Resumes Worth Looking At") is
  // followed by a bullet list specifically about what to look for in those
  // examples — tied to that video, not a standalone section.
  afterBullets?: string[];
}

export interface ResourceItem {
  label: string;
  tag?: string;
  subtitle?: string;
  description: string;
}

export interface ResourceCallout {
  heading?: string;
  text: string;
  contact?: { email?: string; whatsapp?: string };
}

export interface ResourceSection {
  heading: string;
  paragraphs?: string[];
  // Almost every section's paragraph is an intro line leading into its
  // bullets/items ("...that generally means they:"); the documents guide's
  // Apostille section is the one exception — a trailing note that follows
  // its bullet list in the source PDF, not an intro to it.
  paragraphsPosition?: "before" | "after";
  bullets?: string[];
  items?: ResourceItem[];
  callout?: ResourceCallout;
}

export interface DoAndDont {
  do: string;
  dont: string;
}

export interface Resource {
  slug: string;
  title: string;
  category: string;
  summary: string;
  videoPending: true;
  videos: ResourceVideo[];
  sections: ResourceSection[];
  doAndDont: DoAndDont[];
}

export const resources: Resource[] = [
  {
    slug: "resume-design",
    title: "Full Breakdown: How to Design Your Resume",
    category: "Application Skills",
    summary:
      "Your resume is usually the very first thing a school sees — often before your self-introduction video, before any interview. A hiring coordinator may spend under thirty seconds deciding whether to keep reading, so clean structure and clarity matter just as much as the substance of your experience.",
    videoPending: true,
    videos: [
      {
        label: "How to Design a Resume That Gets You Shortlisted",
        youtubeId: "YpBq2IjTy98",
        description:
          "A short tutorial covering structure, content, and how to use Canva to build it. Seeing the layout built step by step makes it much easier to replicate than trying to work it out from a written list alone. Watch this before you start building your own.",
      },
      {
        label: "Sample Resumes Worth Looking At",
        description:
          "Looking at a few strong examples helps you see what “clean and professional” actually looks like in practice — not just in theory.",
        afterBullets: [
          "How much white space they leave (a cluttered resume feels overwhelming at a glance)",
          "How they organise sections so the most important information is easy to find",
          "How consistent the formatting is — fonts, spacing, bullet style",
          "How they handle a professional photo, if one is included",
        ],
      },
    ],
    sections: [
      {
        heading: "What Your Resume Should Include",
        bullets: [
          "Contact details and a short professional summary (2-3 sentences on who you are and what you're looking for)",
          "Teaching qualifications — degree, TEFL/TESOL certificate, and hours completed",
          "Teaching experience, most recent first, in short bullet points rather than paragraphs",
          "Relevant skills — classroom management, lesson planning, technology comfort",
          "Education and any additional certifications",
          "A professional photo, where expected — a clean, friendly headshot is a safe default for teaching roles abroad",
        ],
      },
      {
        heading: "Tools Worth Using",
        items: [
          {
            label: "Canva",
            tag: "FREE PLAN",
            description:
              "The best starting point — its free plan includes a wide range of fully customisable resume templates, no design experience required.",
          },
          {
            label: "Novoresume & Zety",
            tag: "FREE TIER",
            description: "Resume builders with free tiers that guide you section by section.",
          },
          {
            label: "Google Docs & Microsoft Word",
            tag: "FREE",
            description: "Free built-in resume templates, professional if kept clean and simple.",
          },
          {
            label: "Europass CV",
            tag: "EU-SPECIFIC",
            description: "A standardised format widely expected by employers and institutions across Europe.",
          },
        ],
      },
    ],
    doAndDont: [
      {
        do: "Keep it to one, or at most two, pages — nobody's reading a five-page resume for a teaching role",
        dont: "Don't cram everything in — cutting content is better than shrinking the font to fit",
      },
      {
        do: "Use a clean, readable font and consistent spacing throughout",
        dont: "Don't mix formatting styles — inconsistent fonts, sizes, or bullet styles look unpolished fast",
      },
      {
        do: "Stay consistent with verb tense — past roles in past tense, current role in present tense",
        dont: "Don't write in full paragraphs for your experience section — it's harder to skim",
      },
      {
        do: "Lead with a short professional summary so your intent is clear at a glance",
        dont: "Don't leave out your TEFL hours or certificate type — schools want that detail specifically",
      },
      {
        do: "Use short bullet points for experience, not dense paragraphs",
        dont: "Don't send a Word document as your final version — formatting can break on the recipient's device",
      },
      {
        do: "Include a professional photo where it's expected for the destination you're applying to",
        dont: "Don't use a low-effort casual photo — a simple, well-lit smartphone photo taken seriously reads better than a cropped social media picture",
      },
      {
        do: "Save your final version as a PDF before sending, so formatting doesn't shift on another device",
        dont: "Don't reuse the exact same resume for every application without checking it still fits what that school is asking for",
      },
    ],
  },
  {
    slug: "getting-your-documents-ready",
    title: "Full Breakdown: Getting Your Documents Ready",
    category: "Application Skills",
    summary:
      "A confirmed job offer means nothing if your paperwork isn't ready to back it up. Degree certificates, background checks, and apostilled or notarised documents can take weeks — sometimes months — to process properly, and most visa delays come down to exactly this: documents that weren't sorted early enough. Getting this right before you need it is one of the highest-value things you can do in your entire preparation.",
    videoPending: true,
    videos: [
      {
        label: "Getting Your Documents Ready to Teach Abroad",
        youtubeId: "hSN5YhfGaB4",
        description:
          "A short breakdown of the document process, from gathering originals to getting them legalised. Watch this before you start collecting paperwork — seeing the full sequence laid out helps you avoid the most common mistake: starting the process too late.",
      },
    ],
    sections: [
      {
        heading: "The Documents You'll Likely Need",
        bullets: [
          "Degree certificate (original, or a certified copy where accepted)",
          "Academic transcripts",
          "TEFL/TESOL/CELTA certificate",
          "Police clearance / criminal background check — often required from every country you've lived in for an extended period, not just your home country",
          "Passport (with genuine validity remaining — many countries require 6+ months beyond your intended stay)",
          "Passport-sized photographs (specific requirements vary by country)",
          "Reference letters",
          "Medical documents, where required",
          "Updated CV/resume",
        ],
      },
      {
        heading: "Apostille, Notarisation & Legalisation — What's the Difference?",
        bullets: [
          "Notarisation — a notary public confirms a document (or a copy of it) is genuine, or witnesses a signature",
          "Apostille — an official certification, under the Hague Convention, that verifies a document for use in another member country, without needing further legalisation through an embassy",
          "Embassy legalisation — required instead of an apostille when the destination country isn't part of the Hague Convention",
        ],
        paragraphs: [
          "South Africa is a member of the Hague Apostille Convention, so most documents used for teaching abroad can be apostilled through the Department of International Relations and Cooperation (DIRCO) rather than needing full embassy legalisation — but requirements still vary by destination country, so always confirm exactly what your specific placement requires before you begin.",
        ],
        paragraphsPosition: "after",
      },
      {
        heading: "Get Help With This Directly",
        callout: {
          text: "Document authentication is genuinely one of the most confusing parts of preparing to teach abroad. DOCSSA specialises in exactly this — reach out for direct help getting your degree, background check, and other documents properly authenticated.",
          contact: {
            email: "info@docssa.co.za",
            whatsapp: "+27 64 516 9790",
          },
        },
      },
    ],
    doAndDont: [
      {
        do: "Start this process months before your intended departure date — apostille and notarisation processing times are often longer than people expect",
        dont: "Don't wait until you have a confirmed job offer to start — begin gathering and authenticating documents as early as possible",
      },
      {
        do: "Order extra certified copies of key documents — you'll likely need more than one over the course of your application and visa process",
        dont: "Don't assume a regular certified copy is the same as an apostilled one — they serve different legal purposes",
      },
      {
        do: "Check your specific destination country's exact requirements — apostille vs. embassy legalisation depends entirely on where you're going",
        dont: "Don't let your passport's remaining validity slip below what your destination requires",
      },
      {
        do: "Keep digital scans of every document as a backup, stored somewhere secure",
        dont: "Don't assume your background check from years ago is still valid — most employers want one issued recently, often within 3-6 months",
      },
      {
        do: "Reach out to DOCSSA early if you're unsure where to start",
        dont: "Don't lose track of which documents you've sent where — keep a simple checklist as you go",
      },
    ],
  },
  {
    slug: "understanding-visas-work-permits",
    title: "Full Breakdown: Understanding Visas & Work Permits",
    category: "Application Skills",
    summary:
      "“What sponsorship actually means” is one of the most misunderstood parts of teaching abroad. A lot of teachers accept an offer without fully understanding what their visa actually permits, who's responsible for what, or what happens if something changes mid-contract. Getting this right before you sign anything protects you legally and financially.",
    videoPending: true,
    videos: [
      {
        label: "Understanding Visas & Work Permits",
        youtubeId: "tt63AL3JSlg",
        description:
          "A short breakdown of how employer sponsorship actually works, and the questions to ask before accepting any offer. Watch this before you sign any contract — understanding the shape of the process makes it much easier to spot a red flag when one comes up.",
      },
    ],
    sections: [
      {
        heading: "The Core Visa Categories You'll Run Into",
        paragraphs: ["Across different countries, teaching visas generally fall into a few recurring patterns:"],
        items: [
          {
            label: "Employer-Sponsored Work Visa",
            tag: "MOST STRUCTURED",
            description:
              "The school applies for and sponsors your visa directly, tied specifically to that job. This is the fully legal, structured route wherever it's available.",
          },
          {
            label: "Freelance / Self-Employed Visa",
            tag: "FLEXIBLE",
            description:
              "You register as an independent contractor and invoice multiple schools or clients yourself, rather than being tied to one employer. Genuinely available in a small number of countries.",
          },
          {
            label: "Digital Nomad Visa",
            tag: "ONLINE INCOME",
            description:
              "Designed for remote/online income rather than in-person teaching, typically requiring proof of a minimum monthly income from foreign sources.",
          },
          {
            label: "Tourist-Visa-Plus-Informal-Work",
            tag: "GREY AREA",
            description:
              "Extremely common in practice in some markets, but genuinely a legal grey area, not a real visa category. Understand clearly if this is what you're actually being offered.",
          },
        ],
      },
      {
        heading: "What “Sponsorship” Actually Means",
        paragraphs: [
          "When a school says they'll “sponsor” your visa, that generally means they:",
        ],
        bullets: [
          "Provide the formal job offer and supporting documentation your visa application needs",
          "Register with (or are already registered with) the relevant immigration authority as an approved employer",
          "Sometimes cover some or all of the visa application costs — this varies enormously and should never be assumed",
        ],
      },
      {
        heading: "Questions to Ask Before You Sign Anything",
        paragraphs: [
          "It does not automatically mean they'll handle every step of the process for you, cover all your costs, or that the visa is guaranteed to be approved. Ask directly what “sponsorship” includes in your specific case.",
        ],
        bullets: [
          "Exactly which visa type will I be on, and is this school actually authorised to sponsor it?",
          "Who pays for the visa application, and are there any costs I'm responsible for?",
          "How long does the process typically take, and when do I need to start it?",
          "What happens to my visa status if I leave this job early, or if the school terminates my contract?",
          "Does this visa allow me to take on private tutoring or other paid work on the side?",
          "What does the visa require me to do after I arrive (registration, medical checks, ID applications, etc.)?",
          "Is there a renewal process, and who is responsible for managing it?",
        ],
      },
    ],
    doAndDont: [
      {
        do: "Get sponsorship details in writing before accepting any offer — a verbal promise isn't enough",
        dont: "Don't accept “we'll sort it” as a full explanation — ask for specifics",
      },
      {
        do: "Ask specifically which visa category you'll be on, by name, not just “we'll sort your visa”",
        dont: "Don't assume a tourist-visa arrangement is the same as a real work visa — know clearly which one you're actually on",
      },
      {
        do: "Understand your own responsibilities in the process, even when the school is leading it",
        dont: "Don't work outside what your visa permits — including private tutoring, if your visa doesn't allow it",
      },
      {
        do: "Research your destination's general visa reality in advance — some countries have genuinely functioning sponsorship systems, others rely heavily on informal workarounds",
        dont: "Don't assume sponsorship means all costs are covered — confirm this explicitly",
      },
      {
        do: "Keep copies of every visa-related document you're given or asked to provide",
        dont: "Don't sign a contract with unresolved visa questions — get clarity first, not after you've committed",
      },
    ],
  },
  {
    slug: "building-a-teaching-portfolio",
    title: "Full Breakdown: Building a Teaching Portfolio",
    category: "Application Skills",
    summary:
      "A resume tells a school what you've done. A teaching portfolio shows them how you actually teach. It's the difference between a school reading a list of qualifications and a school seeing real evidence of your classroom thinking — and in a competitive market, that evidence is often what moves you from “maybe” to “yes.”",
    videoPending: true,
    videos: [
      {
        label: "Building a Teaching Portfolio That Stands Out",
        youtubeId: "s7hT6LFRpMg",
        description:
          "A short breakdown of what to include and how to put it together. Watch this before you start pulling your portfolio together — seeing a real example built out makes it much easier to know what “good” actually looks like.",
      },
    ],
    sections: [
      {
        heading: "What to Include",
        bullets: [
          "Sample lesson plans — two or three well-structured examples, ideally covering different age groups or skill levels",
          "A teaching philosophy — a short, genuine statement (a few sentences to a short paragraph) on how you approach teaching and why",
          "Classroom activities — games, worksheets, or exercises you've genuinely used and would use again",
          "Worksheets or materials you've created yourself, not just downloaded",
          "Projects — any larger pieces of student work you've guided, if you have them",
          "Certificates — your TEFL/TESOL/CELTA certificate, and any additional professional development",
          "Student-learning examples, where appropriate — anonymised or with permission",
          "Photos of classroom activities, only where you have genuine permission to use them",
        ],
      },
      {
        heading: "Writing Your Teaching Philosophy",
        paragraphs: [
          "This is the part most people find hardest, because it asks you to put your own approach into words rather than just listing facts. Keep it short — a few honest sentences beats a long, generic paragraph. Focus on:",
        ],
        bullets: [
          "What you believe makes a lesson actually work",
          "How you handle a mixed-ability classroom",
          "What you want students to feel, not just learn, in your lessons",
        ],
        callout: {
          heading: "Make it genuinely yours.",
          text: "A philosophy that sounds like it could belong to any teacher isn't doing its job. The more specific and genuinely yours it is, the more it actually tells a school about you.",
        },
      },
    ],
    doAndDont: [
      {
        do: "Include only your own work — lesson plans and materials you've genuinely created or adapted",
        dont: "Don't pad it with downloaded materials you didn't create or genuinely use",
      },
      {
        do: "Keep it organised and easy to skim — a school reviewing your portfolio won't read every page in full",
        dont: "Don't write a generic, copy-paste teaching philosophy — it should sound like you",
      },
      {
        do: "Update it as you gain experience — a portfolio should grow with you",
        dont: "Don't include identifiable student information or photos without clear permission",
      },
      {
        do: "Get explicit permission before including any student work or photos",
        dont: "Don't make it overwhelming — a focused, well-chosen selection beats an exhaustive dump",
      },
      {
        do: "Tailor it slightly for the type of role you're applying to",
        dont: "Don't let it sit unfinished forever — a partial portfolio you actually send beats a perfect one you never finish",
      },
    ],
  },
  {
    slug: "reading-a-country-before-you-go",
    title: "Full Breakdown: Reading a Country Before You Go",
    category: "Application Skills",
    summary:
      "Whether you're moving abroad to teach, relocating for any other kind of work, or simply travelling long-term, arriving somewhere new without understanding how daily life actually works there is one of the most common causes of early culture shock. This isn't just for teachers — anyone heading abroad benefits from knowing what to expect before they land, not after.",
    videoPending: true,
    videos: [
      {
        label: "How to Actually Research a Country Before You Go",
        description:
          "A short breakdown of how to build a real picture of a country before arriving, beyond just reading a Wikipedia page. Watch this before you start your own research — it'll save you from spending hours reading the wrong kind of information.",
      },
    ],
    sections: [
      {
        heading: "What to Actually Research",
        bullets: [
          "Culture and daily life — greetings, personal space, punctuality norms, how directly people communicate",
          "Cost of living — housing, food, transport, and how far your income will genuinely go",
          "Safety and stability — current, up-to-date information, not assumptions based on outdated news",
          "Local laws and customs — including anything that differs meaningfully from what you're used to",
          "Food and dietary norms — what's available, what's affordable, and any customs around eating",
          "Transport and getting around — public transport reliability, whether you'll need to drive, general infrastructure",
          "Climate and seasons — what you'll actually need to pack, and what time of year you're arriving in",
          "Healthcare access — what's available, what it costs, and what your insurance or visa covers",
          "If you're working there specifically — classroom norms, workplace culture, and professional expectations, where relevant",
        ],
      },
      {
        heading: "Where to Actually Look",
        bullets: [
          "Our Country Guides — built specifically to give a real feel for a country's culture, daily life, and (where relevant) classroom norms, not just tourist highlights",
          "Official government travel advisories — for genuinely current safety and entry-requirement information",
          "Expat and community forums — for honest, lived-experience perspectives, though always cross-check anything important",
          "Recent, dated sources — culture and cost of living can shift meaningfully over just a few years, so check how current your information actually is",
        ],
        // Explicitly preserved per the client's instruction that this
        // framing (applies beyond just teachers) should not be trimmed out.
        callout: {
          heading: "This applies to more than just teachers.",
          text: "Whether you're relocating for work, travelling long-term, or moving for any other reason entirely, the same research habits apply. Understanding a country before you arrive is universal preparation, not a teaching-specific skill.",
        },
      },
    ],
    doAndDont: [
      {
        do: "Research beyond the tourist highlights — daily life is a different picture from a holiday itinerary",
        dont: "Don't rely on a single blog post or video as your full picture",
      },
      {
        do: "Check multiple sources, especially for anything safety or cost-of-living related",
        dont: "Don't assume your home country's norms will transfer — greetings, punctuality, and communication styles can differ significantly",
      },
      {
        do: "Look for recent information — a five-year-old blog post may no longer reflect reality",
        dont: "Don't skip researching just because you're excited — the excitement is exactly why this step matters",
      },
      {
        do: "Research regional differences within the country — culture and cost of living can vary hugely between cities and regions",
        dont: "Don't confuse a tourist's experience with what living there long-term is actually like",
      },
      {
        do: "Talk to people who've actually lived there, not just visited",
        dont: "Don't ignore official safety advisories in favour of more exciting but less reliable sources",
      },
    ],
  },
  {
    slug: "classroom-management-from-day-one",
    title: "Full Breakdown: Classroom Management From Day One",
    category: "Application Skills",
    summary:
      "Walking into a large, mixed-ability classroom for the first time is one of the most common sources of early anxiety for new teachers abroad. Good classroom management isn't about being strict — it's about building a room where students know what to expect and want to participate. Get this right from day one, and everything else about teaching gets genuinely easier.",
    videoPending: true,
    videos: [
      {
        label: "Classroom Management From Day One",
        youtubeId: "SW2oyWoKer0",
        description:
          "A short breakdown of practical strategies for large and mixed-ability classes. Watch this before your first day — seeing these strategies demonstrated makes them far easier to actually use than reading them as a list.",
      },
    ],
    sections: [
      {
        heading: "Managing Large Classes",
        bullets: [
          "Establish clear routines early — how to get attention, how to hand out materials, how transitions between activities work. Predictability reduces chaos.",
          "Use your voice deliberately — a lower, calmer tone often commands more attention than raising your volume",
          "Position yourself strategically — moving around the room, rather than staying at the front, keeps students engaged and gives you better oversight",
          "Give clear, simple instructions — one instruction at a time, checked for understanding, works far better than a long list all at once",
        ],
      },
      {
        heading: "Managing Mixed-Ability Classes",
        bullets: [
          "Differentiate the task, not just the content — the same topic can have an easier and harder version of the same activity",
          "Use pair and group work deliberately — pairing stronger and weaker students can genuinely help both, if structured well",
          "Have “early finisher” activities ready — students who finish early and have nothing to do will create their own distractions",
          "Check in with struggling students individually, rather than only addressing the whole class",
        ],
      },
      {
        heading: "The Quiet Strategies That Actually Work",
        bullets: [
          "Consistency matters more than severity — a predictable, fair response to disruption works better than an occasional harsh one",
          "Praise effort publicly, correct privately — public criticism damages trust; private, constructive feedback preserves it",
          "Build rapport early — a class that likes and respects you manages itself far more than one that doesn't",
          "Model the behaviour you want — calm, respectful, patient teachers tend to get calm, respectful, patient classrooms back",
        ],
        callout: {
          heading: "The core principle.",
          text: "A great teacher doesn't simply punish bad behaviour — a great teacher creates a classroom where students understand the expectations and genuinely want to participate.",
        },
      },
    ],
    doAndDont: [
      {
        do: "Set clear expectations in your very first lesson — don't assume students will infer the rules",
        dont: "Don't raise your voice as a first response — it escalates more than it resolves",
      },
      {
        do: "Stay calm and consistent, even when a class is testing boundaries",
        dont: "Don't assume one classroom management style works for every class",
      },
      {
        do: "Learn your students' names quickly — it changes the whole dynamic of a room",
        dont: "Don't let early disruptions go unaddressed — small issues left alone tend to grow",
      },
      {
        do: "Prepare more material than you think you'll need",
        dont: "Don't punish the whole class for one student's behaviour — it damages trust with everyone else",
      },
      {
        do: "Reflect after each lesson — notice what worked and what didn't, and adjust",
        dont: "Don't wing it without a plan — walking in unprepared is one of the fastest ways to lose control of a room",
      },
    ],
  },
  {
    slug: "tefl-vs-tesol-vs-celta",
    title: "Full Breakdown: TEFL vs TESOL vs CELTA",
    category: "Application Skills",
    summary:
      "Job listings often say “TEFL/TESOL/CELTA required” as if they're interchangeable — but they're genuinely not the same thing, and picking the wrong one for your goals can cost you time and money. Understanding what each certificate actually is helps you choose the right one for the market you're targeting, rather than guessing.",
    videoPending: true,
    videos: [
      {
        label: "TEFL vs TESOL vs CELTA Explained",
        description:
          "A short breakdown comparing the three certificates side by side. Watch this before you commit to a course — a clear visual walkthrough makes the differences much easier to grasp than reading acronyms in isolation.",
      },
    ],
    sections: [
      {
        heading: "What Each Certificate Actually Means",
        items: [
          {
            label: "TEFL",
            tag: "MOST COMMON",
            subtitle: "Teaching English as a Foreign Language",
            description:
              "The broadest and most common term worldwide. “TEFL” isn't owned by one organisation — it's a category, and course quality varies enormously between providers, from basic 40-hour online courses to in-depth 120-hour or 300+ hour diplomas. This variation is exactly why employers sometimes ask specifically about hours and accreditation, not just whether you're “TEFL certified.”",
          },
          {
            label: "TESOL",
            tag: "OFTEN INTERCHANGEABLE",
            subtitle: "Teaching English to Speakers of Other Languages",
            description:
              "Often used interchangeably with TEFL, though TESOL programmes are somewhat more likely to have an academic or university affiliation, and the term is used more commonly in the US and Canada. In practice, most employers weigh the level, accreditation, and practical training content more than which of these two labels sits on the certificate.",
          },
          {
            label: "CELTA",
            tag: "PREMIUM MARKETS",
            subtitle: "Certificate in Teaching English to Speakers of Other Languages",
            description:
              "A single, specific, Cambridge-administered qualification — not a category like TEFL or TESOL. It's intensive (typically 4-5 weeks full-time, or a longer part-time option), includes mandatory assessed teaching practice with real students, and carries strong, consistent name recognition, especially with British Council positions, university language departments, and premium schools across Europe and the Middle East. Trinity's CertTESOL is a well-regarded equivalent, accepted by most of the same employers.",
          },
        ],
      },
      {
        heading: "Which One Do You Actually Need?",
        bullets: [
          "Most teaching jobs worldwide — particularly across Asia, Latin America, and online tutoring platforms — accept a standard, well-accredited 120-hour TEFL or TESOL certificate.",
          "Premium language schools, British Council roles, and university language departments frequently prefer or require CELTA (or a recognised equivalent like Trinity CertTESOL).",
          "A higher-level TEFL Diploma (Level 5 or equivalent) is a genuine middle ground — more academic weight and employer recognition than a basic TEFL, without CELTA's cost and intensity.",
        ],
      },
    ],
    doAndDont: [
      {
        do: "Check the specific job listing's wording carefully — “TEFL/TESOL/CELTA” usually means any of the three is accepted; “CELTA or equivalent” is more specific",
        dont: "Don't assume the cheapest, shortest course is enough for competitive markets — a 40-hour basic certificate won't carry the same weight as a 120+ hour accredited one",
      },
      {
        do: "Choose a course with real accreditation, not just a provider's own branding",
        dont: "Don't assume TEFL and TESOL are functionally different — in most hiring contexts, they're treated the same",
      },
      {
        do: "Go for at least 120 hours if you're aiming at a competitive market",
        dont: "Don't assume CELTA is required everywhere — most jobs worldwide genuinely don't require it",
      },
      {
        do: "Consider CELTA or Trinity CertTESOL if you're specifically targeting British Council roles, university positions, or premium European/Gulf schools",
        dont: "Don't skip checking accreditation — an unaccredited “certificate” from an unknown provider may not be recognised at all",
      },
      {
        do: "Keep your certificate and transcript accessible — schools may ask for proof of hours and accreditation body",
        dont: "Don't choose based on the acronym alone — the hours, accreditation, and practical teaching component matter more than which of the three names is on the certificate",
      },
    ],
  },
];

export function getResourceBySlug(slug: string): Resource | undefined {
  return resources.find((r) => r.slug === slug);
}
