// Real Application Skills guide content, transcribed faithfully from the
// client-provided source PDFs (WTA-*-Full-Breakdown.pdf). Replaces the
// placeholder "Full guide coming soon" cards previously on /resources.
//
// Video entries can be linked to real YouTube walkthroughs when they are available.
export interface ResourceVideo {
  label: string;
  description: string;
  // YouTube video ID — when absent, the detail page shows a "Video coming soon" placeholder.
  youtubeId?: string;
  // The resume doc's second video ("Sample Resumes Worth Looking At") is
  // followed by a bullet list specifically about what to look for in those
  // examples — tied to that video, not a standalone section.
  afterBullets?: string[];
  // Optional lead-in section rendered above this video (e.g. the self-intro
  // guide's "Then watch a great example" before its example videos).
  before?: ResourceSection;
}

export interface ResourceLink {
  label: string;
  href: string;
}

export interface ResourceItem {
  label: string;
  tag?: string;
  subtitle?: string;
  description: string;
  link?: ResourceLink;
}

export interface ResourceCallout {
  heading?: string;
  text: string;
  contact?: { email?: string; whatsapp?: string };
}

export interface ResourceSection {
  heading: string;
  // Anchor target for in-page links (e.g. "#debate-audio").
  id?: string;
  paragraphs?: string[];
  // Almost every section's paragraph is an intro line leading into its
  // bullets/items ("...that generally means they:"); the documents guide's
  // Apostille section is the one exception — a trailing note that follows
  // its bullet list in the source PDF, not an intro to it.
  paragraphsPosition?: "before" | "after";
  bullets?: string[];
  items?: ResourceItem[];
  callout?: ResourceCallout;
  ctas?: ResourceLink[];
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
  // Optional sections between the summary and the audio player.
  intro?: ResourceSection[];
  // Replaces the default "Listen to this guide" heading above the audio player.
  audioIntro?: ResourceSection;
  // Where the audio guide renders relative to `videos` (0-based index into
  // that array): the audio block is inserted immediately after
  // videos[audioAfterVideo]. Omit to default to after all videos (the plain
  // single-video case, e.g. resume-design). self-introduction-video sets 0 so
  // the debate audio lands right after the main prep video, before the
  // "watch an example" videos that follow it.
  audioAfterVideo?: number;
  videos: ResourceVideo[];
  sections: ResourceSection[];
  doAndDontHeading?: string;
  doAndDont: DoAndDont[];
  // Optional sections after the Do's & Don'ts table.
  closingSections?: ResourceSection[];
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
    slug: "self-introduction-video",
    title: "How to Make a Strong Self-Introduction Video",
    category: "Application Skills",
    audioAfterVideo: 0,
    summary:
      "Your CV tells them what you've done. Your video shows them who you are. When you're applying for a job overseas, your self-introduction video is often an employer's first chance to meet you — so treat it as seriously as your CV.",
    videoPending: true,
    intro: [
      {
        heading: "Your First Impression Should Not Begin With a PDF",
        paragraphs: [
          "When you're applying for a job overseas, you don't have the luxury of simply walking into an employer's office, introducing yourself, shaking their hand and showing them why you're the right person for the job. You're thousands of kilometres away, and the employer may never meet you face-to-face until you've already been shortlisted.",
          "So what can you do? Give them the opportunity to meet you through your camera.",
          "A well-made self-introduction video can help an employer hear your voice, see your personality, understand your communication style and get a sense of the professional you could become in their organisation.",
        ],
        callout: {
          heading: "Treat it as seriously as your CV.",
          text: "That's why at World Teachers Academy, we believe your self-introduction video should be treated as seriously as your CV.",
        },
      },
      {
        heading: "Before You Press Record: Stop. Watch. Listen. Learn.",
        paragraphs: [
          "Don't pick up your phone and immediately start recording. Your first video doesn't have to be your final video.",
          "Before you introduce yourself to an international employer, take a moment to learn from people who have already gone through the process. At World Teachers Academy, we've created a preparation experience to help you understand what employers may notice — and what can make your introduction work for or against you.",
        ],
        callout: {
          heading: "Your first step is not recording.",
          text: "Your first step is learning.",
        },
      },
    ],
    audioIntro: {
      heading: "Listen to the Expats' Debate",
      id: "debate-audio",
      paragraphs: [
        "Hear what other expats have to say. Listen to our Expats' Debate Audio, where people who have experience living, working or applying for opportunities abroad discuss the Do's and Don'ts of Self-Introduction Videos.",
        "Hear different perspectives. Listen to real experiences. Pay attention to the small things people often overlook.",
      ],
      callout: {
        heading: "“I wish I had known this before I recorded my first video.”",
        text: "You may hear someone say exactly that. It's the kind of lesson we want you to learn before you make the same mistake.",
      },
    },
    videos: [
      {
        label: "World Teachers Academy Preparation Video",
        youtubeId: "rWCZsCRdOAg",
        description:
          "After listening to the debate, watch this preparation video. We'll walk you through the important elements of presenting yourself professionally on camera.",
        before: {
          heading: "Watch the Preparation Video",
          id: "preparation-video",
          paragraphs: ["See what a good introduction should look like. You'll learn about:"],
          bullets: [
            "Where to position your camera",
            "Lighting",
            "Background",
            "Clothing",
            "Body language",
            "Eye contact",
            "Voice and communication",
            "What to say — and what not to say",
            "How long your video should be",
            "How to avoid sounding rehearsed",
            "How to present yourself professionally",
          ],
          callout: {
            heading: "Don't just hear the advice.",
            text: "Watch how it is done.",
          },
        },
      },
      {
        before: {
          heading: "Then Watch a Great Example",
          id: "example-videos",
          paragraphs: [
            "See the difference for yourself. Before you record your own introduction, watch a good example self-introduction video. Don't simply watch it — study it. Ask yourself:",
          ],
          bullets: [
            "What made me want to keep watching?",
            "How did the person introduce themselves?",
            "Did they look confident?",
            "Was their background appropriate?",
            "Could I hear them clearly?",
            "Did they sound natural?",
            "Did their personality come through?",
            "Did they make me want to know more about them?",
          ],
          callout: {
            heading: "This isn't about copying somebody else's personality or script.",
            text: "It's about understanding what professional presentation looks like.",
          },
        },
        label: "Self-Introduction Video Example 1",
        youtubeId: "X4mM4GBYl6A",
        description:
          "Watch for the opening, the level of detail, and how the speaker balances professionalism with personality. Notice how quickly you understand who they are and what they can offer a school.",
      },
      {
        label: "Self-Introduction Video Example 2",
        youtubeId: "Yclj1y_kaUM",
        description:
          "Compare the delivery and pacing with the first example. A strong introduction does not need to sound rehearsed; it needs to be easy to follow and relevant to teaching.",
      },
      {
        label: "Self-Introduction Video Example 3",
        youtubeId: "0fA8RMOijiU",
        description:
          "Use this example to assess camera framing, energy, and clarity. These small presentation choices affect how confidently your message comes across.",
      },
      {
        label: "Self-Introduction Video Example 4",
        youtubeId: "-D-zaz7lYDo",
        description:
          "Look for the details that make the introduction memorable without making it too long. Your goal is a focused first impression, not a complete life story.",
      },
    ],
    sections: [
      {
        heading: "Now It's Your Turn",
        paragraphs: [
          "Don't copy the person. Learn from the standard.",
          "The goal isn't to become someone else. You have your own story, your own experience, your own personality and your own reasons for wanting to work abroad. Your video should reflect you — but you should present that version of yourself at your professional best.",
        ],
      },
      {
        heading: "Your Self-Introduction Video Is Your Digital Handshake",
        paragraphs: [
          "A great introduction video doesn't need to be expensive. You don't need a professional film crew, an expensive camera or a complicated studio. What you need is preparation, clarity, confidence and professionalism.",
        ],
        callout: {
          heading: "Your goal is simple:",
          text: "Make the employer want to know more about you.",
        },
      },
      {
        heading: "What Should You Say?",
        paragraphs: [
          "Your introduction video should give the employer a clear picture of who you are without turning into a long speech. A strong introduction can include:",
        ],
        items: [
          {
            label: "01 — Introduce Yourself",
            description: "Tell the employer your name and where you're currently based. Speak naturally. Smile. Look into the camera.",
          },
          {
            label: "02 — Tell Them What You Do",
            description: "Briefly explain your professional background. Keep it relevant to the position you're applying for.",
          },
          {
            label: "03 — Show Your Experience",
            description:
              "Don't simply list everything on your CV. Choose the experience that matters most for the position, and tell them what you've actually done.",
          },
          {
            label: "04 — Show Your Personality",
            description:
              "This is one of the biggest advantages of video. Let the employer see the person behind the qualifications. Your personality can come through without you having to say “I am a friendly and enthusiastic person.” Let them see it.",
          },
          {
            label: "05 — Explain Why You Want the Opportunity",
            description:
              "Tell them why you're interested in working internationally and why the particular role interests you. Avoid sounding like you're reading a generic script you've sent to 50 employers. Make it personal.",
          },
          {
            label: "06 — End With Confidence",
            description:
              "Thank the employer for taking the time to watch your video, and let them know you'd welcome the opportunity to discuss the position further. Then finish with confidence — not desperation, not uncertainty, but professional confidence.",
          },
        ],
      },
      {
        heading: "What Employers Can See That a CV Cannot",
        bullets: [
          "Your CV can tell an employer “I have excellent communication skills.” Your video can demonstrate them.",
          "Your CV can say “I am confident working with people from different cultures.” Your video can give them a first impression of how you communicate.",
          "Your CV can say “I am professional.” Your video can show them how you present yourself.",
        ],
        paragraphs: ["That's the difference."],
        paragraphsPosition: "after",
      },
      {
        heading: "Before You Record: Set Your Standard",
        paragraphs: [
          "At World Teachers Academy, we don't want you to simply submit an application. We want you to present yourself professionally. Before recording, check:",
        ],
        items: [
          { label: "Your Background", description: "Choose a clean, professional environment." },
          { label: "Your Appearance", description: "Dress appropriately for the position you're applying for." },
          { label: "Your Lighting", description: "Make sure your face is clearly visible." },
          { label: "Your Sound", description: "Record somewhere quiet where your voice can be heard clearly." },
          { label: "Your Camera", description: "Keep the camera stable and approximately at eye level." },
          { label: "Your Body Language", description: "Sit or stand naturally. Look into the camera. Smile when appropriate." },
          { label: "Your Message", description: "Know what you want to say before you press record." },
          {
            label: "Your Time",
            description:
              "Keep the video focused. Don't make the employer work through a 10-minute life story to understand who you are.",
          },
        ],
      },
    ],
    doAndDontHeading: "Don't Make These Common Mistakes",
    doAndDont: [
      {
        do: "Use the video to add something your CV cannot — your employer already has your CV",
        dont: "Don't read your CV word-for-word",
      },
      {
        do: "Choose your setting carefully — your environment becomes part of your first impression",
        dont: "Don't record in a messy environment",
      },
      {
        do: "Imagine the camera is the employer, and talk to them",
        dont: "Don't look at yourself instead of the camera",
      },
      {
        do: "Slow down. Breathe. Speak clearly.",
        dont: "Don't speak too quickly — nervousness often makes people rush",
      },
      {
        do: "Sound like yourself — professionally",
        dont: "Don't use complicated words — you don't need to sound like a politician",
      },
      {
        do: "Create enough interest for the employer to want the next conversation",
        dont: "Don't make the video too long — your goal is not to tell your entire life story",
      },
    ],
    closingSections: [
      {
        heading: "Your Phone Is Enough",
        paragraphs: [
          "You don't need a Hollywood production. A modern smartphone can produce a perfectly usable introduction video when you get the basics right:",
        ],
        bullets: [
          "Clean background",
          "Good lighting",
          "Clear sound",
          "Stable camera",
          "Professional appearance",
          "Confident communication",
        ],
        callout: {
          heading: "The technology isn't the most important part.",
          text: "You are.",
        },
      },
      {
        heading: "Your Video Should Answer One Important Question",
        paragraphs: [
          "Don't try to prove everything in one video. Give the employer a reason to continue the conversation.",
          "Your CV gives them your professional history. Your qualifications give them evidence of your education. Your self-introduction video gives them something different: a first glimpse of you.",
        ],
        callout: {
          text: "“Why should I want to meet this person?”",
        },
      },
      {
        heading: "From Application to Opportunity",
        paragraphs: [
          "At World Teachers Academy, we want our candidates to understand that international recruitment is different from applying for a job down the road. You may be applying from another city, another country, or even another continent. You may not get the opportunity to walk into the employer's office and introduce yourself personally — so your digital presence has to work harder.",
          "Together, these tell your story:",
        ],
        bullets: [
          "Your CV",
          "Your professional photograph",
          "Your qualifications",
          "Your communication",
          "Your self-introduction video",
        ],
      },
      {
        heading: "Don't Send Your CV First. Prepare Your Introduction First.",
        paragraphs: [
          "Before an employer sees your resume, ask yourself: “If this employer could meet me for 60–90 seconds, what would I want them to remember?” That's what your video should communicate.",
        ],
        bullets: [
          "Not perfection — preparation.",
          "Not pretending to be someone you're not — professional presentation.",
          "Not a memorised speech — a genuine introduction.",
        ],
      },
      {
        heading: "Your Video Preparation Journey",
        paragraphs: ["Complete these steps before recording:"],
        items: [
          {
            label: "Listen",
            tag: "STEP 1",
            description: "Listen to the Expats' Debate Audio about the Do's and Don'ts of self-introduction videos.",
            link: { label: "Listen now", href: "#debate-audio" },
          },
          {
            label: "Watch",
            tag: "STEP 2",
            description:
              "Watch the World Teachers Academy preparation video and learn how to position yourself professionally on camera.",
            link: { label: "Watch the video", href: "#preparation-video" },
          },
          {
            label: "Study",
            tag: "STEP 3",
            description:
              "Watch a good example self-introduction video before making your own. Study what works. Notice the details. Think about how you can apply the principles to your own personality and experience.",
            link: { label: "Watch the examples", href: "#example-videos" },
          },
          {
            label: "Record",
            tag: "STEP 4",
            description:
              "Now you're ready. Set up your camera. Take a breath. Look into the lens. And introduce yourself to the world.",
          },
        ],
      },
      {
        heading: "We Help You Present the Professional You",
        paragraphs: [
          "We don't want you to simply send applications around the world and hope somebody responds. We want you to understand how international employers experience your application. That's why we encourage every candidate to set their professional standard before submitting their resume.",
        ],
        callout: {
          heading: "Your opportunity may begin long before the interview.",
          text: "It may begin the moment an employer presses ▶ Play.",
        },
      },
      {
        heading: "Ready to Record?",
        paragraphs: [
          "Your next opportunity could start with a 90-second introduction.",
          "Listen. Watch. Study. Prepare. Then press record — and introduce the world to the professional behind your CV.",
        ],
        callout: {
          heading: "World Teachers Academy",
          text: "Prepare. Present. Connect. Go Global.",
        },
        ctas: [
          { label: "Learn how to create your self-introduction video", href: "#preparation-video" },
          { label: "Prepare for your global job opportunity", href: "/job-portal" },
        ],
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
