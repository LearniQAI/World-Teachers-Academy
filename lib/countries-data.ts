// Country guide content — transcribed verbatim from the World Teachers Academy
// country landing-page PDFs. Do not paraphrase; this is published copy.

export type Tone = "success" | "info" | "warn" | "danger" | "neutral";

export type ListItem = { label?: string; text: string };

export type Block =
  | { kind: "text"; text: string }
  | { kind: "list"; items: ListItem[] }
  | { kind: "steps"; items: { label: string; text: string }[] }
  | {
      kind: "cards";
      items: { title: string; badge?: string; tone?: Tone; text: string }[];
    }
  | { kind: "callout"; title?: string; text: string; tone: Tone }
  | { kind: "table"; headers: string[]; rows: string[][] }
  | { kind: "quote"; text: string; attribution: string };

export type ReadingSection = { heading: string; blocks: Block[] }; // empty heading = untitled section

export type Region = "Americas" | "Asia" | "Europe" | "Middle East";
export const REGIONS: Region[] = ["Americas", "Asia", "Europe", "Middle East"];

export type Country = {
  slug: string;
  name: string;
  region: Region;
  // Page title when the source guide's own title isn't "Teaching in {name}".
  heading?: string;
  code: string; // ISO 3166-1 alpha-2 — also the Job Portal country filter value
  flagEmoji: string;
  tagline: string;
  statBadges: { value: string; label: string }[];
  guideContents: string[];
  reading: {
    quickFacts: string[];
    sections: ReadingSection[];
    pullQuote?: string;
    // The pull-quote is rendered directly after sections[pullQuoteAfter],
    // matching where it sits in the source guide.
    pullQuoteAfter?: number;
  };
  // A row may leave one side empty; `group` starts a labelled sub-group.
  doAndDontHeading?: string;
  doAndDont: { do?: string; dont?: string; group?: string }[];
  // The dossier-format guides have no video script or debate audio in their source.
  videoScript?: {
    title: string;
    scenes: { direction: string; lines: { speaker: string; text: string }[] }[];
  };
  debateAudio?: {
    title: string;
    host1: string;
    host2: string;
    exchange: { speaker: string; text: string }[];
  };
  closingEquation: { heading: string; content: string };
  jobPortalCTA: { heading: string; text: string; buttonLabel: string; href: string };
};

// ---- small builders (keep the data below readable) -------------------------
const text = (t: string): Block => ({ kind: "text", text: t });
const list = (...items: ListItem[]): Block => ({ kind: "list", items });
const L = (label: string, t: string): ListItem => ({ label, text: t });
const T = (t: string): ListItem => ({ text: t });
const steps = (...items: { label: string; text: string }[]): Block => ({ kind: "steps", items });
const cards = (...items: { title: string; badge?: string; tone?: Tone; text: string }[]): Block => ({
  kind: "cards",
  items,
});
const table = (headers: string[], ...rows: string[][]): Block => ({ kind: "table", headers, rows });
const quote = (t: string, attribution: string): Block => ({ kind: "quote", text: t, attribution });
const callout = (tone: Tone, t: string, title?: string): Block => ({ kind: "callout", tone, text: t, title });

const SCRIPT_TITLE = "FIRST IMPRESSIONS";
const N = "NARRATOR (V.O.)";
const GUIDE_VIDEO = "Video Script — “First Impressions,” following a South African teacher's arrival";

function cta(name: string, code: string): Country["jobPortalCTA"] {
  return {
    heading: `Ready to Teach in ${name}?`,
    text: "Browse current openings and apply for a position through our Job Portal.",
    buttonLabel: `APPLY FOR A POSITION IN ${name.toUpperCase()}`,
    href: `/job-portal?country=${code}`,
  };
}

const argentina: Country = {
  slug: "argentina",
  name: "Argentina",
  code: "AR",
  region: "Americas",
  flagEmoji: "🇦🇷",
  tagline:
    "Culture, visas, and the dollar-economy advantage — a complete guide for South African teachers, with Reading, Video, and Audio.",
  statBadges: [
    { value: "Buenos Aires", label: "Main Teaching Hub" },
    { value: "USD Advantage", label: "Insulates Your Income" },
    { value: "3 Visa Routes", label: "Know the Difference" },
  ],
  guideContents: [
    "Reading — culture, food, landmarks, the visa reality, and the dollar-economy advantage",
    GUIDE_VIDEO,
    "Debate Audio — two hosts weighing whether Argentina is the right fit for you",
  ],
  reading: {
    quickFacts: [
      "Buenos Aires is overwhelmingly the main teaching hub, with a vibrant, well-established private language institute scene",
      "South Africans are broadly welcomed for native-level English teaching, alongside the US, UK, Canada, Ireland, Australia, and New Zealand",
      "One of Latin America's most European-flavoured cultures, shaped heavily by Italian and Spanish immigration",
    ],
    sections: [
      {
        heading: "Mastering the Mate: The Code",
        blocks: [
          text(
            "Mate is Argentina's true daily ritual — a bitter herbal drink shared from a hollowed gourd through a metal straw, passed around a group. Here's how it works:"
          ),
          steps(
            { label: "The Setup", text: "one gourd, one metal straw (bombilla), and one designated preparer for the whole round." },
            { label: "The Pass", text: "accept it graciously. Turning down a shared mate abruptly is considered mildly rude." },
            { label: "The Code", text: "say nothing when handing it back to stay in the rotation. Only say “gracias” when you're ready to stop." }
          ),
        ],
      },
      {
        heading: "The Visa Diagnostic: Legal Standard vs. Common Workaround",
        blocks: [
          text("Argentina's teaching market runs on three real paths in. Know exactly which one you're on:"),
          cards(
            { title: "The Formal Work Visa", badge: "Fully Legal Standard", tone: "success", text: "Employer-sponsored, requires a signed contract." },
            {
              title: "The Digital Nomad Visa",
              badge: "Fully Legal Alternative",
              tone: "success",
              text: "Built for online earners (e.g. Preply, iTalki, or remote foreign institutions). Requires proof of at least $1,500/month in foreign-sourced earnings.",
            },
            {
              title: "The “Uruguay Run”",
              badge: "Informal Workaround",
              tone: "danger",
              text: "Working on a renewable 90-day tourist visa, resetting it with a short trip to Uruguay. Widely used, but genuinely not the legal standard — know the distinction.",
            }
          ),
        ],
      },
      {
        heading: "The Dollar Economy Advantage",
        blocks: [
          text(
            "Institute pay in pesos erodes with real, ongoing inflation. Private tutoring and corporate English, though, are commonly paid in US dollars — and that's the real hedge worth building toward."
          ),
          callout(
            "warn",
            "Commonly paid in US dollars — this is how you insulate your income from peso volatility.",
            "Private Tutoring ($10–$20/hr) & Corporate English ($15–$25/hr)"
          ),
          callout(
            "neutral",
            "Paid in pesos, subject to real, ongoing inflation erosion. Good for networking and building local experience, tough for long-term savings.",
            "Language Institute Salaries"
          ),
          callout("success", "Do not rely entirely on the peso. Structure your income to include dollar-denominated private work."),
        ],
      },
      {
        heading: "Food & Daily Life",
        blocks: [
          list(
            L("Asado", "Argentina's barbecue tradition (bife de chorizo, morcilla), a genuine Sunday social institution"),
            L("Dulce de Leche", "a thick caramel spread used across an enormous range of desserts"),
            T("Dinner rarely happens before 9 or 10pm — plan your evenings accordingly")
          ),
        ],
      },
      {
        heading: "The Teacher's Toolkit: Finding the Work",
        blocks: [
          cards(
            { title: "Established Institutes", text: "International House Buenos Aires, Berlitz Argentina, Wall Street English — consistent presence and demand." },
            { title: "Job Boards", text: "Go Overseas and TEFL.org list current openings across Buenos Aires and secondary cities." },
            { title: "Paperwork & Bureaucracy", text: "Argentina Visa Law's resources cover work visas, the digital nomad visa, and title validation (homologación)." },
            { title: "The Ground Hustle", text: "Direct outreach and networking once in Buenos Aires — demand for native speakers develops fast if you build relationships." }
          ),
        ],
      },
    ],
    pullQuote:
      "Nandi, a South African teacher in Buenos Aires, quickly learned that saying “gracias” ends your turn. It's the quiet code the whole culture runs on.",
    pullQuoteAfter: 0,
  },
  doAndDont: [
    { do: "Accept a shared mate graciously, and say “gracias” only once you're finished", dont: "Assume institute pay in pesos will hold its value — inflation is real and ongoing" },
    { do: "Negotiate private tutoring or corporate English work in US dollars where possible", dont: "Treat the “Uruguay run” as a fully legal standard — it's a common workaround, not the law" },
    { do: "Understand exactly which visa route you're actually on before you commit", dont: "Decline a shared mate abruptly — it can come across as mildly rude" },
    { do: "Embrace late dinners and asado invitations as genuine social occasions", dont: "Expect an early dinner — 9-10pm is completely normal here" },
  ],
  videoScript: {
    title: SCRIPT_TITLE,
    scenes: [
      {
        direction: "NANDI, a South African teacher, sits in a Buenos Aires park with new friends, a mate gourd being passed around the circle, bombilla catching the afternoon light.",
        lines: [
          { speaker: N, text: "Argentina tends to greet new teachers with a shared gourd before anything else — mate isn't just a drink here, it's the daily social ritual the whole culture runs on." },
        ],
      },
      {
        direction: "The gourd reaches Nandi. She drinks, hands it back without a word.",
        lines: [
          { speaker: N, text: "Small detail worth knowing — say “gracias” only once you actually want it to stop coming back. It's a quiet code almost everyone here just knows." },
        ],
      },
      {
        direction: "Weeks earlier, in flashback — Nandi researching Argentina's visa situation online, weighing a formal work visa against the widely used tourist-visa-plus-Uruguay-run approach many teachers take instead.",
        lines: [
          { speaker: "NANDI (to herself, taking notes)", text: "Legally, work visa. Realistically... a lot of people just do the border run." },
          { speaker: N, text: "That's the honest picture. A work visa is the fully legal route, employer-sponsored with a signed contract — but a large number of teachers work on a renewable tourist visa instead, resetting it with a short trip across to Uruguay. It's common, but it's genuinely a workaround, not the legal standard." },
        ],
      },
      {
        direction: "At her new language institute, Nandi's Argentine colleague explains, with a small laugh, that her pay in pesos will need watching against inflation — but private tutoring clients pay her directly in dollars.",
        lines: [
          { speaker: N, text: "That's Argentina's real “dollar economy advantage” — institute pay in pesos erodes with inflation, but private tutoring and corporate English are commonly paid in US dollars instead, insulating that income from the currency's ups and downs." },
        ],
      },
      {
        direction: "Weekend — Nandi stands at the edge of Iguazú Falls, mist rising in great curtains around her, utterly dwarfed by the scale of it.",
        lines: [
          { speaker: N, text: "And once the visa and the pesos are sorted, Argentina offers a teacher something genuinely rare — a warm, deeply social culture, a thriving private teaching market, and landscapes that range from thundering waterfalls to Patagonian glaciers." },
        ],
      },
    ],
  },
  debateAudio: {
    title: "IS ARGENTINA RIGHT FOR YOU?",
    host1: "ZANDILE (worried about the peso and the visa grey area)",
    host2: "BONGANI (has taught in Argentina, makes the case for it)",
    exchange: [
      { speaker: "ZANDILE", text: "I keep hearing Argentina's economy is genuinely unstable. Doesn't that make it a risky place to teach?" },
      { speaker: "BONGANI", text: "It's a fair concern, and worth addressing honestly. The peso does erode with inflation, and institute salaries paid in pesos genuinely lose value over time. But here's the thing — private tutoring and corporate English are commonly paid in US dollars, so a lot of teachers build their real income around that instead." },
      { speaker: "ZANDILE", text: "And the visa situation — is it actually legal to just teach there?" },
      { speaker: "BONGANI", text: "Technically, a proper work visa requires an employer-sponsored contract. In practice, a lot of teachers work on a 90-day tourist visa and reset it with a quick trip to Uruguay. It's genuinely common, but it's a workaround, not the fully legal route — worth knowing which one you're actually doing." },
      { speaker: "ZANDILE", text: "Is there a cleaner legal option?" },
      { speaker: "BONGANI", text: "Genuinely, yes, if you're teaching online — Argentina's Digital Nomad Visa is a real, legal route for anyone earning foreign income, say from tutoring platforms, as long as you can show at least $1,500 a month." },
      { speaker: "ZANDILE", text: "What's the one cultural thing that surprises new teachers most?" },
      { speaker: "BONGANI", text: "Mate, without question. It's not a beverage, it's a full social ritual — shared, passed around, with its own quiet etiquette. Learning it fast earns real goodwill." },
      { speaker: "ZANDILE", text: "So, worth it overall?" },
      { speaker: "BONGANI", text: "Genuinely, yes — as long as you go in with your eyes open about the peso and the visa reality. Structure your income around dollars where you can, and Argentina offers one of the warmest, most socially rich teaching experiences in Latin America." },
    ],
  },
  closingEquation: {
    heading: "The Argentine Equation",
    content:
      "Argentina does not offer a predictable, plug-and-play teaching experience. It requires a strategic approach: balancing legal awareness with the Uruguay run, and offsetting peso inflation by building a dollar-denominated private hustle. For those who master this dual system, the reward is an unmatched cultural warmth, world-class landscapes, and a deeply connected daily life.",
  },
  jobPortalCTA: cta("Argentina", "AR"),
};

const cambodia: Country = {
  slug: "cambodia",
  name: "Cambodia",
  code: "KH",
  region: "Asia",
  flagEmoji: "🇰🇭",
  tagline:
    "Ancient temples, a genuinely accessible market, and a history worth understanding with real care — a complete guide for South African teachers, with Reading, Video, and Audio.",
  statBadges: [
    { value: "No Degree", label: "Route Available" },
    { value: "Split Shifts", label: "Kids AM / Adults PM" },
    { value: "Angkor Wat", label: "World's Largest Temple" },
  ],
  guideContents: [
    "Reading — culture, food, landmarks, the job market, and a note on Cambodia's history",
    GUIDE_VIDEO,
    "Debate Audio — two hosts weighing whether Cambodia is the right fit for you",
  ],
  reading: {
    quickFacts: [
      "Phnom Penh (capital) and Siem Reap (gateway to Angkor) are the main teaching hubs",
      "One of the few markets in Asia genuinely open to teachers without a university degree",
      "South Africans are broadly welcomed alongside the US, UK, Canada, Australia, Ireland, and New Zealand",
    ],
    sections: [
      {
        heading: "Greeting & Daily Life",
        blocks: [
          text(
            "The sampeah — palms pressed together, a slight bow, height varying with the other person's status or age — is Cambodia's traditional greeting, used much like Thailand's wai. Genuine warmth toward foreigners is broadly the norm, and modest dress is expected, especially near temples."
          ),
        ],
      },
      {
        heading: "A Note on History, Handled With Care",
        blocks: [
          callout(
            "warn",
            "Cambodia's 20th-century history, including the Khmer Rouge period, is a genuinely significant and painful part of the country's story. It's not a topic for casual conversation or curiosity — approach it with real sensitivity, and let Cambodian colleagues or friends raise it themselves if and when they choose to, rather than initiating the subject yourself."
          ),
        ],
      },
      {
        heading: "Food",
        blocks: [
          list(
            L("Amok", "a steamed curry, often fish, in banana leaf, widely considered Cambodia's national dish"),
            L("Nom Banh Chok", "rice noodles with a fish-based green curry sauce, a beloved breakfast staple"),
            T("Street food culture is genuine and central to daily life, especially in Phnom Penh")
          ),
        ],
      },
      {
        heading: "Landmarks & Things to See",
        blocks: [
          list(
            L("Angkor Wat", "the world's largest religious monument, and Cambodia's defining landmark"),
            L("Bayon Temple & Ta Prohm", "the serene stone faces of Bayon, and Ta Prohm's famous tree-root ruins"),
            L("Tonlé Sap Lake", "Southeast Asia's largest freshwater lake, home to floating villages"),
            L("Kampot", "a riverside town known for its pepper plantations and relaxed pace")
          ),
        ],
      },
      {
        heading: "Life as a Teacher: The Split-Shift Reality",
        blocks: [
          text("Language centre schedules genuinely revolve around two shifts:"),
          cards(
            { title: "MORNING SHIFT", text: "Children's classes, typically before the school day or early afternoon." },
            { title: "EVENING SHIFT", text: "Adult learners, after their own work day ends." }
          ),
          text(
            "A TEFL certificate is the practical minimum, and Cambodia remains one of the few Asian markets where a university degree isn't strictly required by many language centres — a genuine point of access for career-changers. Working on a tourist visa is illegal; confirm your employer arranges the correct work permit and visa before you start."
          ),
        ],
      },
      {
        heading: "The Teacher's Toolkit: Finding the Work",
        blocks: [
          cards(
            { title: "TEFL Org Jobs Centre", text: "A dedicated jobs board with current Cambodia listings." },
            { title: "Serious Teachers", text: "An ESL/EFL job board covering language centre positions across the country." },
            { title: "Go Overseas & Dave's ESL Café", text: "General teach-abroad boards that regularly list Cambodia-based roles." },
            { title: "Local Facebook Groups", text: "A genuinely common, active channel for language centre openings in Phnom Penh and Siem Reap." }
          ),
        ],
      },
    ],
    pullQuote:
      "Cambodia greets new teachers with genuine warmth, and a market that's noticeably more open than its neighbours — one of the few places in the region where a university degree isn't the gatekeeper it is elsewhere.",
    pullQuoteAfter: 0,
  },
  doAndDont: [
    { do: "Return the sampeah when it's offered to you", dont: "Raise Khmer Rouge history casually or out of curiosity — handle it with real care" },
    { do: "Dress modestly, especially near temples and religious sites", dont: "Assume a degree is required everywhere — many centres genuinely don't ask for one" },
    { do: "Confirm your employer arranges a genuine work permit and visa", dont: "Work on a tourist visa — it is illegal and carries real risk" },
    { do: "Let Cambodian colleagues lead if the country's history comes up", dont: "Touch anyone's head, including a child's — considered disrespectful" },
  ],
  videoScript: {
    title: SCRIPT_TITLE,
    scenes: [
      {
        direction: "KAGISO, a South African teacher, arrives in Siem Reap, the silhouette of Angkor Wat's towers visible in the distance as the sun begins to set.",
        lines: [
          { speaker: N, text: "Cambodia greets new teachers with genuine warmth, and a market that's noticeably more open than its neighbours — one of the few places in the region where a university degree isn't the gatekeeper it is elsewhere." },
          { speaker: "KAGISO (taking in the view)", text: "I didn't expect to see the temples before I even unpacked." },
        ],
      },
      {
        direction: "At his new language centre, Kagiso greets his Cambodian colleagues with a sampeah, palms pressed together, receiving warm smiles in return.",
        lines: [
          { speaker: N, text: "The sampeah is Cambodia's traditional greeting — genuinely appreciated when returned, even imperfectly, by a new foreign teacher." },
        ],
      },
      {
        direction: "Kagiso's daily schedule unfolds on screen — morning classes full of young children, then a break, then an evening class of tired but engaged adult students.",
        lines: [
          { speaker: N, text: "Split shifts are the real rhythm of teaching here — children in the morning, working adults in the evening. It takes some adjusting to, but it's the standard shape of the job." },
        ],
      },
      {
        direction: "Over lunch, a Cambodian colleague gently begins to share a story about her grandparents' generation, and Kagiso listens quietly, without pressing for more than she offers.",
        lines: [
          { speaker: N, text: "Cambodia's 20th-century history is genuinely significant, and genuinely painful for many families. It's not something to bring up out of curiosity — the right approach is simply to listen, with care, if someone chooses to share it themselves." },
        ],
      },
      {
        direction: "Weekend — Kagiso stands before the sprawling stone faces of Bayon Temple, utterly still, taking in the scale of it.",
        lines: [
          { speaker: N, text: "And once the rhythm of split shifts settles in, Cambodia offers a teacher something genuinely rare — one of Asia's most accessible teaching markets, layered alongside some of the most extraordinary ancient history anywhere on earth." },
        ],
      },
    ],
  },
  debateAudio: {
    title: "IS CAMBODIA RIGHT FOR YOU?",
    host1: "ONALERONA (weighing the lack of a degree requirement)",
    host2: "REFILWE (has taught in Cambodia, makes the case for it)",
    exchange: [
      { speaker: "ONALERONA", text: "I keep hearing Cambodia doesn't actually require a degree. Is that too good to be true?" },
      { speaker: "REFILWE", text: "Genuinely not — it's one of the real reasons Cambodia stands out in the region. Plenty of language centres will hire a TEFL-certified teacher without a degree, which opens the door for a lot of people other Asian markets would turn away." },
      { speaker: "ONALERONA", text: "What's the actual day-to-day like?" },
      { speaker: "REFILWE", text: "Split shifts, honestly — children in the morning, adults in the evening, once their own work day ends. It's a genuine rhythm you adjust to fast." },
      { speaker: "ONALERONA", text: "And the visa side of things?" },
      { speaker: "REFILWE", text: "Make sure your employer sorts a real work permit. Working on a tourist visa is illegal here, and it's a genuine risk not worth taking, however common it might seem." },
      { speaker: "ONALERONA", text: "What's the one cultural thing that needs real care?" },
      { speaker: "REFILWE", text: "Cambodia's history, without question. The Khmer Rouge period is genuinely significant and painful for many families — it's not a topic to raise casually. Let colleagues share it if and when they choose to, and listen with real care when they do." },
      { speaker: "ONALERONA", text: "So, worth it overall?" },
      { speaker: "REFILWE", text: "Genuinely, yes — one of the most accessible teaching markets in Asia, paired with some of the most extraordinary ancient history on the continent. Just go in with real respect for the history, and the visa situation properly sorted." },
    ],
  },
  closingEquation: {
    heading: "The Cambodian Equation",
    content:
      "Cambodia rewards teachers who bring both genuine accessibility-seeking pragmatism and genuine cultural care in equal measure — a real entry point for career-changers, alongside a history that deserves to be approached with real respect. Go in with both, and Cambodia offers one of the warmest, most historically extraordinary teaching markets in the region.",
  },
  jobPortalCTA: cta("Cambodia", "KH"),
};

const brunei: Country = {
  slug: "brunei",
  name: "Brunei",
  code: "BN",
  region: "Asia",
  flagEmoji: "🇧🇳",
  tagline:
    "An empire's history, an oil-funded present, and the BELTP government programme — a complete guide for South African teachers, with Reading, Video, and Audio.",
  statBadges: [
    { value: "600+ Years", label: "Same Royal Family" },
    { value: "2-3 Teachers", label: "Per Government School" },
    { value: "BELTP", label: "Official Govt. Programme" },
  ],
  guideContents: [
    "Reading — history old and new, culture, the BELTP job market, and a sober note on current law",
    GUIDE_VIDEO,
    "Debate Audio — two hosts weighing whether Brunei is the right fit for you",
  ],
  reading: {
    quickFacts: [
      "Capital: Bandar Seri Begawan, on the island of Borneo in Southeast Asia",
      "Ruled by the same royal family for over 600 years, one of the world's oldest continuously ruling dynasties",
      "South Africa is one of the nationalities most commonly recruited for teaching roles in Brunei, alongside the US, UK, Ireland, Canada, and Australia/New Zealand",
    ],
    sections: [
      {
        heading: "The Old Story & The Current Story",
        blocks: [
          cards(
            {
              title: "THE OLD STORY",
              text: "An empire on Borneo. The Sultanate was founded in the 14th century, and by the 16th century, under Sultan Bolkiah, the Bruneian Empire controlled large stretches of northwest Borneo and reached as far as Manila. Britain became a protectorate in 1888; Brunei chose not to join Malaysia in 1963, gaining full independence in 1984.",
            },
            {
              title: "THE CURRENT STORY",
              text: "Sultan Hassanal Bolkiah has reigned since 1967, one of the world's longest-serving monarchs, over one of the world's few remaining absolute monarchies. Brunei's modern wealth comes overwhelmingly from oil and gas, funding a very high standard of living, free education, and free healthcare for citizens.",
            }
          ),
        ],
      },
      {
        heading: "A Sober Note on Current Law",
        blocks: [
          callout(
            "warn",
            "In 2014, Brunei began phasing in a Sharia-based penal code, fully implemented by 2019 — a significant legal shift that applies to residents and visitors alike. The code includes severe punishments for certain offences, and homosexuality remains illegal, with serious penalties. Teachers considering Brunei, especially anyone from the LGBTQ+ community, should research current legal realities thoroughly and treat this as a genuine safety and legal consideration, not a minor cultural quirk."
          ),
        ],
      },
      {
        heading: "Kampong Ayer & Daily Life",
        blocks: [
          text(
            "Often called the “Venice of the East,” Kampong Ayer is the world's largest stilt settlement — home to around 30,000 people across 42 interconnected villages, continuously inhabited for over a thousand years. Bruneians are widely described as soft-spoken, polite, and genuinely hospitable toward foreigners."
          ),
        ],
      },
      {
        heading: "Food",
        blocks: [
          list(
            L("Ambuyat", "Brunei's national dish, a starchy sago paste eaten by dipping with a special forked stick"),
            L("Nasi Katok", "simple steamed rice with fried chicken and sambal, a beloved everyday staple"),
            T("Alcohol is banned outright (unlike the licensed exceptions found in the UAE or Qatar)")
          ),
        ],
      },
      {
        heading: "Life as a Teacher: The BELTP Programme",
        blocks: [
          text(
            "The Ministry of Education recruits foreign teachers directly through the Brunei-English Language Teacher Project (BELTP), placing 2-3 international primary teachers per government school alongside local faculty. Most recruitment happens January to March each year. Visas are generally valid for two years and renewable, with packages commonly including tax-free salaries, housing, health insurance, and airfare allowances."
          ),
        ],
      },
      {
        heading: "The Teacher's Toolkit: Finding the Work",
        blocks: [
          cards(
            { title: "Serious Teachers", text: "An ESL/EFL job board that regularly lists Brunei government and international school positions." },
            { title: "Byron Recruitment", text: "A specialist agency that recruits directly for Brunei's government school intakes." },
            { title: "School Career Pages", text: "Jerudong International School and International School Brunei list international school openings directly." },
            { title: "BELTP Programme", text: "The Ministry of Education's official channel into government schools, generally accessed via recruitment partners." }
          ),
        ],
      },
    ],
    pullQuote:
      "Brunei tends to surprise new teachers with its contrasts — a country of immense oil wealth and gleaming modern mosques, built right alongside a thousand-year-old water village still very much alive today.",
    pullQuoteAfter: 1,
  },
  doAndDont: [
    { do: "Research Brunei's Sharia-based penal code thoroughly before accepting any offer", dont: "Bring, buy, or consume alcohol anywhere in Brunei — it is fully banned" },
    { do: "Dress modestly in public at all times", dont: "Underestimate the legal seriousness around LGBTQ+ issues" },
    { do: "Accept invitations to local celebrations or family gatherings graciously", dont: "Eat or drink in public during Ramadan daylight hours" },
    { do: "Apply through official channels — BELTP for government schools", dont: "Assume Brunei's job market works like informal ESL hiring elsewhere" },
  ],
  videoScript: {
    title: SCRIPT_TITLE,
    scenes: [
      {
        direction: "KHANYISILE, a South African teacher, arrives in Bandar Seri Begawan, looking out over the stilt houses of Kampong Ayer stretching along the river as her taxi crosses a bridge.",
        lines: [
          { speaker: N, text: "Brunei tends to surprise new teachers with its contrasts — a country of immense oil wealth and gleaming modern mosques, built right alongside a thousand-year-old water village still very much alive today." },
          { speaker: "KHANYISILE (looking out at Kampong Ayer)", text: "People still actually live there — that's not just a museum piece?" },
        ],
      },
      {
        direction: "At her new government school, Khanyisile is introduced to her two fellow international primary teachers and a group of warm, welcoming Bruneian colleagues.",
        lines: [
          { speaker: N, text: "Most government schools host two or three international teachers working alongside local faculty, through the Ministry of Education's official recruitment programme. It's a genuinely supportive setup." },
        ],
      },
      {
        direction: "A colleague invites Khanyisile to a family celebration that weekend, and she's warmly welcomed, offered food, included easily in conversation.",
        lines: [
          { speaker: N, text: "Bruneians are known for being soft-spoken, polite, and genuinely hospitable — being invited into someone's home or celebration is common, and worth embracing." },
        ],
      },
      {
        direction: "Later, in a quieter moment, Khanyisile reads through an orientation document from her school outlining Brunei's legal system, including its Sharia-based penal code.",
        lines: [
          { speaker: N, text: "This is worth understanding clearly before arriving. Since 2019, Brunei has fully implemented a Sharia-based penal code that applies to everyone in the country — including serious restrictions around alcohol, and criminalising homosexuality. It's real, current law, and every teacher considering Brunei should research it thoroughly and take it seriously." },
          { speaker: "KHANYISILE (quietly, closing the document)", text: "Good to know exactly where things stand." },
        ],
      },
      {
        direction: "Weekend — Khanyisile treks through the dense, untouched rainforest of Ulu Temburong National Park, visibly amazed by the canopy walkway view.",
        lines: [
          { speaker: N, text: "And for those who go in prepared and informed, Brunei offers something genuinely rare — deep security, real financial comfort, ancient living history, and some of the most pristine rainforest left in Southeast Asia." },
        ],
      },
    ],
  },
  debateAudio: {
    title: "IS BRUNEI RIGHT FOR YOU?",
    host1: "ZINHLE (concerned about the legal restrictions)",
    host2: "MPUMELELO (has taught in Brunei, makes the case for it)",
    exchange: [
      { speaker: "ZINHLE", text: "Brunei doesn't come up often in teaching-abroad conversations. Is that because people don't know about it, or because of the legal restrictions?" },
      { speaker: "MPUMELELO", text: "Honestly, probably both. It's a small country, so it's less talked-about generally — but the legal side is real and needs to be said plainly. Brunei fully implemented a Sharia-based penal code by 2019, and it includes criminalising homosexuality with serious penalties. That's something anyone considering Brunei needs to research thoroughly and weigh seriously." },
      { speaker: "ZINHLE", text: "So what draws teachers there despite that?" },
      { speaker: "MPUMELELO", text: "Genuine financial security and a very well-run teaching system. Tax-free salary, housing, health insurance, airfare allowances — and government schools recruit directly through an official Ministry of Education programme, so it's a legitimate, structured process." },
      { speaker: "ZINHLE", text: "What's the actual history behind the place? I don't know much about it." },
      { speaker: "MPUMELELO", text: "It's fascinating, genuinely. The same royal family's ruled continuously for over 600 years — Brunei was once a real regional power in the 1500s, controlling parts of Borneo and reaching all the way to Manila. It became a British protectorate in 1888, chose not to join Malaysia in 1963, and became fully independent in 1984." },
      { speaker: "ZINHLE", text: "And day to day — what's it actually like living there?" },
      { speaker: "MPUMELELO", text: "Genuinely calm and safe, with warm, soft-spoken, hospitable people. Alcohol's fully banned, more strictly even than somewhere like Kuwait. But teachers describe eager students, supportive colleagues, and a genuinely manageable workload." },
      { speaker: "ZINHLE", text: "So, worth considering?" },
      { speaker: "MPUMELELO", text: "For the right person, genuinely yes — but only with full, clear-eyed understanding of the legal landscape first. Go in fully informed, and Brunei offers real security and a genuinely rare slice of untouched Southeast Asia in return." },
    ],
  },
  closingEquation: {
    heading: "The Brunei Equation",
    content:
      "Brunei rewards teachers who do the research first: understanding the legal landscape fully, then embracing a genuinely calm, well-funded teaching system and a slice of Southeast Asia still largely untouched by mass tourism. Go in informed, and the reward is real security, genuine hospitality, and a country most teachers never even consider.",
  },
  jobPortalCTA: cta("Brunei", "BN"),
};

const brazil: Country = {
  slug: "brazil",
  name: "Brazil",
  code: "BR",
  region: "Americas",
  flagEmoji: "🇧🇷",
  tagline:
    "Culture, visas, and the private-tutoring economy — a complete guide for South African teachers, with Reading, Video, and Audio.",
  statBadges: [
    { value: "São Paulo & Rio", label: "Main Teaching Hubs" },
    { value: "1,700+ Schools", label: "Wizard Alone" },
    { value: "2 Legal Visas", label: "VITEM V & VITEM XIV" },
  ],
  guideContents: [
    "Reading — culture, food, landmarks, the visa reality, and the private-tutoring economy",
    GUIDE_VIDEO,
    "Debate Audio — two hosts weighing whether Brazil is the right fit for you",
  ],
  reading: {
    quickFacts: [
      "São Paulo and Rio de Janeiro are the largest teaching hubs, with private language schools operating nationwide",
      "South Africa is explicitly among the nationalities preferred by Brazilian language schools and private tutoring clients, alongside the US, UK, Canada, Australia, New Zealand, and Ireland",
      "The largest country in Latin America, home to around 60% of the Amazon Rainforest within its own borders",
    ],
    sections: [
      {
        heading: "Greetings & Personal Space",
        blocks: [
          text(
            "Brazilian warmth is genuine and immediate — a firm handshake, or between friends, one or two cheek kisses (beijinhos), varying by region. Personal space runs noticeably closer than in many Western cultures, and standing near someone during conversation is completely normal, not an intrusion."
          ),
        ],
      },
      {
        heading: "The Visa Diagnostic: Your Three Real Options",
        blocks: [
          text("Brazil's teaching market runs on two genuinely legal visa routes, and one path teachers are warned away from:"),
          cards(
            { title: "VITEM V — Work Visa", badge: "Fully Legal Standard", tone: "success", text: "Requires a firm, confirmed employment offer. Freelance tutoring alone will not secure this visa." },
            { title: "VITEM XIV — Digital Nomad", badge: "Fully Legal Alternative", tone: "success", text: "Introduced 2022. Requires proof of $1,500/month in foreign-sourced income, or $18,000 in savings. Sidesteps employer sponsorship entirely." },
            { title: "The Tourist “Visa Run”", badge: "Genuine Legal Risk", tone: "danger", text: "Repeatedly extending a tourist visa to keep working informally. Not a shortcut — a genuine legal risk, not a recommended route." }
          ),
        ],
      },
      {
        heading: "The Entry Path: How Teachers Actually Build a Career Here",
        blocks: [
          cards(
            { title: "Step 1 — Language School First", text: "Wizard (1,700+ schools), CCAA, CNA, Fisk, English First, Berlitz Brazil, and the binational cultural centres are the accessible paid entry point — a TEFL certificate plus a degree is the typical minimum." },
            { title: "Step 2 — Build Private Tutoring on the Side", text: "Once settled, private tutoring built through Instagram, WhatsApp, and word-of-mouth is the dominant income strategy for experienced teachers in São Paulo and Rio — genuinely different from the language-school-centric approach seen in neighbouring countries." }
          ),
          callout("success", "A firm job offer opens the legal door. Private tutoring builds the real income afterward."),
        ],
      },
      {
        heading: "Food & Daily Life",
        blocks: [
          list(
            L("Feijoada", "a rich black bean and pork stew, widely considered Brazil's national dish, traditionally served on Sundays"),
            L("Pão de Queijo", "chewy, cassava-flour cheese bread, a beloved everyday snack"),
            T("“Jeitinho brasileiro” — a spirited, improvised way of finding a solution around an obstacle, a real cultural value here"),
            T("Punctuality is genuinely relaxed for social gatherings — arriving 15-30 minutes late to a dinner invitation is considered acceptable, even fashionable")
          ),
        ],
      },
      {
        heading: "The Teacher's Toolkit: Finding the Work",
        blocks: [
          cards(
            { title: "Major Language Chains", text: "Wizard, CCAA, CNA, Fisk, English First, and Berlitz Brazil hire consistently across cities." },
            { title: "Binational Cultural Centres", text: "União Cultural Brasil-Estados Unidos and Cultura Inglesa in Rio and São Paulo, genuinely prestigious employers." },
            { title: "Job Boards", text: "Go Overseas and TEFL.org list current openings across Brazil's major teaching hubs." },
            { title: "Building Your Own Client Base", text: "Instagram, WhatsApp, and word-of-mouth — the real long-term income strategy once you're established." }
          ),
        ],
      },
    ],
    pullQuote:
      "Brazil greets new teachers with immediate, genuine warmth — greetings here run closer and friendlier than a lot of newcomers expect, right from the very first meeting.",
    pullQuoteAfter: 0,
  },
  doAndDont: [
    { do: "Secure a firm employment offer before pursuing the standard VITEM V work visa", dont: "Assume freelance tutoring alone will secure legal entry — a firm job offer is required for VITEM V" },
    { do: "Consider the VITEM XIV Digital Nomad Visa if your income comes from foreign/online sources", dont: "Rely on repeated tourist-visa “visa runs” to keep working informally — this carries real legal risk" },
    { do: "Build a private tutoring client base gradually, through word-of-mouth and social media", dont: "Stand back excessively during conversation — closer personal space is the norm here" },
    { do: "Relax about punctuality at social gatherings — 15-30 minutes late is genuinely normal", dont: "Expect an early dinner — jantar typically starts after 8pm" },
  ],
  videoScript: {
    title: SCRIPT_TITLE,
    scenes: [
      {
        direction: "BUHLE, a South African teacher, arrives at a São Paulo language school orientation, greeted warmly with a handshake and, from a colleague she'll be working closely with, a light kiss on each cheek.",
        lines: [
          { speaker: N, text: "Brazil greets new teachers with immediate, genuine warmth — greetings here run closer and friendlier than a lot of newcomers expect, right from the very first meeting." },
          { speaker: "BUHLE (smiling, slightly surprised)", text: "Okay, definitely warmer hellos than I'm used to." },
        ],
      },
      {
        direction: "Weeks earlier, in flashback — Buhle reviewing her school's VITEM V work visa paperwork, her recruiter explaining clearly that freelance tutoring alone wouldn't have gotten her the visa.",
        lines: [
          { speaker: "BUHLE (reviewing documents)", text: "So the firm job offer really is the whole key here?" },
          { speaker: N, text: "Exactly — Brazil's standard work visa genuinely requires a confirmed employment offer. Freelance tutoring alone won't get you in the door legally, which is why so many teachers secure a language school position first, then build private tutoring on the side once they're settled." },
        ],
      },
      {
        direction: "At a dinner invitation, Buhle arrives right on time, only to find she's the first one there by a good twenty minutes.",
        lines: [
          { speaker: N, text: "Small thing worth knowing — arriving fifteen to thirty minutes “late” to a Brazilian dinner invitation is completely normal, even fashionable." },
        ],
      },
      {
        direction: "A scheduling problem comes up at school, and Buhle watches her Brazilian colleague improvise a genuinely creative workaround on the spot, solving it in minutes.",
        lines: [
          { speaker: N, text: "That's jeitinho brasileiro — a real cultural value here, a spirited, improvised way of finding a solution around almost any obstacle." },
        ],
      },
      {
        direction: "Weekend — Buhle stands at the base of Christ the Redeemer in Rio, the sprawling city and Sugarloaf Mountain visible far below.",
        lines: [
          { speaker: N, text: "And once the visa and the rhythm of daily life both click into place, Brazil offers a teacher something genuinely rare — a vibrant, well-established language school market, a private tutoring scene built on real personal trust, and a country of extraordinary natural and cultural scale." },
        ],
      },
    ],
  },
  debateAudio: {
    title: "IS BRAZIL RIGHT FOR YOU?",
    host1: "SIBONGILE (unsure how the visa and tutoring markets connect)",
    host2: "THULANI (has taught in Brazil, makes the case for it)",
    exchange: [
      { speaker: "SIBONGILE", text: "I've heard private tutoring is huge in Brazil — can you actually get in on a tutoring visa alone?" },
      { speaker: "THULANI", text: "No, and that's an important thing to get right early. Brazil's standard work visa, the VITEM V, requires a confirmed employment offer — freelance tutoring by itself won't secure legal entry. Most teachers get a language school job first, then build a private tutoring client base once they're properly settled." },
      { speaker: "SIBONGILE", text: "So the language schools are really the entry point?" },
      { speaker: "THULANI", text: "Genuinely, yes. Brazil has a massive private language school sector — Wizard alone has over 1,700 schools nationwide, plus CCAA, CNA, Fisk, Berlitz, and the prestigious binational centres. A TEFL certificate plus a degree is the typical minimum." },
      { speaker: "SIBONGILE", text: "And once someone's in, how do they actually build up tutoring on the side?" },
      { speaker: "THULANI", text: "Mostly through personal trust networks — Instagram, WhatsApp, word-of-mouth. It's genuinely the dominant strategy for experienced teachers in São Paulo and Rio." },
      { speaker: "SIBONGILE", text: "Is there a legal shortcut for people who just want to teach online instead?" },
      { speaker: "THULANI", text: "There genuinely is — the VITEM XIV Digital Nomad Visa, introduced in 2022. It requires proof of $1,500 a month from foreign sources, or $18,000 in savings, and it sidesteps the whole employer-sponsorship process." },
      { speaker: "SIBONGILE", text: "What's the one thing people should avoid doing?" },
      { speaker: "THULANI", text: "Visa runs — extending a tourist visa repeatedly to keep working informally. It's genuinely risky, legally, and it's not a shortcut worth taking." },
      { speaker: "SIBONGILE", text: "So, worth it overall?" },
      { speaker: "THULANI", text: "Completely — genuine warmth, a well-established teaching market, and one of the most naturally spectacular countries on earth. Just get the visa route right from the start, and the rest tends to fall into place." },
    ],
  },
  closingEquation: {
    heading: "The Brazilian Equation",
    content:
      "Brazil rewards teachers who get the visa sequence right: a language school job first, to enter legally, then a private tutoring client base built afterward, through genuine relationships rather than a job board. For those who follow that order, the reward is a warm, socially rich teaching life in one of the most naturally extraordinary countries on earth.",
  },
  jobPortalCTA: cta("Brazil", "BR"),
};

const china: Country = {
  slug: "china",
  name: "China",
  code: "CN",
  region: "Asia",
  flagEmoji: "🇨🇳",
  tagline:
    "Guanxi, mianzi, and the Z-visa reality — a complete guide for South African teachers, with Reading, Video, and Audio.",
  statBadges: [
    { value: "1 of 7", label: "Recognised Nationalities" },
    { value: "Z-Visa", label: "The Only Legal Route" },
    { value: "0 Fees", label: "Legit Schools Never Charge" },
  ],
  guideContents: [
    "Reading — culture, food, landmarks, the Z-visa process, and scam red flags",
    GUIDE_VIDEO,
    "Debate Audio — two hosts weighing whether China is the right fit for you",
  ],
  reading: {
    quickFacts: [
      "Beijing, Shanghai, Guangzhou, and Shenzhen are the main hubs, with growing demand in second-tier cities",
      "South Africa is one of the seven nationalities China officially recognises as “native English-speaking” for visa purposes",
      "One of the world's oldest continuous civilisations, with over 3,000 years of documented history",
    ],
    sections: [
      {
        heading: "Guanxi & Mianzi: The Two Concepts That Run Everything",
        blocks: [
          cards(
            { title: "GUANXI", text: "Relationship networks built through trust, reciprocity, and long-term investment — shared meals, small favours, consistent effort over years." },
            { title: "MIANZI (FACE)", text: "A person's reputation and dignity. Protecting someone's face — never causing public embarrassment — matters enormously, in the classroom too." }
          ),
        ],
      },
      {
        heading: "Gift-Giving Etiquette",
        blocks: [
          cards(
            { title: "✓ SAFE GIFTS", tone: "success", text: "Tea, fruit, and good-quality items are always well received." },
            { title: "✗ NEVER GIVE", tone: "danger", text: "Clocks (sounds like a death-related phrase), or anything wrapped in white, black, or blue — all linked with funerals." }
          ),
          text("When offered a gift, politely declining once or twice before accepting is customary — a show of grace, not greed."),
        ],
      },
      {
        heading: "The Z-Visa Is the Only Legal Way to Teach",
        blocks: [
          callout(
            "warn",
            "A bachelor's degree, an accredited TEFL/TESOL certificate (120+ hours or 2 years' documented experience), and a clean background check are non-negotiable legal requirements. Never accept an offer suggesting a tourist or business visa “for now” — this is illegal, and one of the clearest red flags in the entire China market. Legitimate schools never charge a placement fee."
          ),
        ],
      },
      {
        heading: "Food",
        blocks: [
          list(
            L("Peking Duck", "Beijing's signature dish, crisp roasted duck with pancakes and hoisin sauce"),
            L("Hot Pot", "a communal, simmering pot shared at the table, especially popular in Sichuan")
          ),
        ],
      },
      {
        heading: "Landmarks",
        blocks: [
          list(
            L("The Great Wall of China", "sections near Beijing (Badaling, Mutianyu) are easily visited"),
            L("The Forbidden City & The Terracotta Army", "(Xi'an) — two of the best-preserved ancient sites in the world")
          ),
        ],
      },
      {
        heading: "The Teacher's Toolkit: Finding the Work",
        blocks: [
          cards(
            { title: "DiscoverChinaTEFL", text: "A transparent job board built specifically to reduce scam risk in the China teaching market." },
            { title: "Go Overseas", text: "A jobs board and directory of teach-abroad providers, with China-specific reviews." },
            { title: "Dave's ESL Café", text: "A long-running, classic ESL job board that still lists China-based roles." },
            { title: "Legitimate Schools Only", text: "Sponsor your Z-visa directly and never charge placement fees — a fee request is a major red flag." }
          ),
        ],
      },
    ],
    pullQuote:
      "China greets new teachers with a striking visual contrast — centuries of history standing directly across the water from some of the most futuristic skylines on earth.",
    pullQuoteAfter: 0,
  },
  doAndDont: [
    { do: "Confirm your employer will sponsor a genuine Z-visa before accepting any offer", dont: "Accept a job offering a tourist or business visa “for now”" },
    { do: "Help colleagues and students keep face — give feedback privately", dont: "Pay a recruiter or school a placement fee" },
    { do: "Decline a gift once or twice politely before accepting it", dont: "Give clocks, or anything wrapped in white, black, or blue" },
    { do: "Choose gifts like tea, fruit, or good quality items when giving your own", dont: "Criticise or embarrass someone publicly" },
  ],
  videoScript: {
    title: SCRIPT_TITLE,
    scenes: [
      {
        direction: "THABISO, a South African teacher, stands on The Bund at dusk, colonial-era buildings behind him, the futuristic Pudong skyline glowing across the river.",
        lines: [
          { speaker: N, text: "China often greets new teachers with a striking visual contrast — centuries of history standing directly across the water from some of the most futuristic skylines on earth." },
          { speaker: "THABISO (taking it in)", text: "I've genuinely never seen two eras sit this close together." },
        ],
      },
      {
        direction: "At a welcome dinner, Thabiso's school director offers a toast, and a colleague quietly nudges him to hold his glass slightly lower than the director's.",
        lines: [
          { speaker: N, text: "Chinese social life runs on two deep concepts: guanxi, relationship networks built through trust and reciprocity, and mianzi — face. Helping someone keep their face is one of the most important things a new teacher can learn early." },
        ],
      },
      {
        direction: "A colleague hands Thabiso a small wrapped gift of tea. He goes to open it immediately, then remembers to politely decline once first.",
        lines: [
          { speaker: "THABISO (smiling, waving it off gently)", text: "Oh, I couldn't possibly—" },
          { speaker: N, text: "That small dance is genuine Chinese etiquette, a show of grace rather than greed. Tea and good quality items are always safe; clocks, and anything wrapped in white, black, or blue, are avoided entirely." },
        ],
      },
      {
        direction: "Weeks earlier, in flashback — Thabiso reviewing his Z-visa paperwork with his school's HR officer, checking his degree certificate, TEFL certificate, and background check documents one by one.",
        lines: [
          { speaker: N, text: "Getting here legally took real preparation. China's Z-visa is the only legal way to teach — a bachelor's degree, an accredited TEFL certificate, and a clean background check are non-negotiable." },
        ],
      },
      {
        direction: "Weekend — Thabiso stands atop a restored section of the Great Wall, wind blowing, utterly still with the view.",
        lines: [
          { speaker: N, text: "And once the paperwork and the etiquette both click into place, China offers something genuinely rare — thousands of years of unbroken history, some of the fastest-changing cities on the planet, and relationships that run remarkably deep." },
        ],
      },
    ],
  },
  debateAudio: {
    title: "IS CHINA RIGHT FOR YOU?",
    host1: "LESEDI (worried about visa scams and legal risk)",
    host2: "KATLEGO (has taught in China, makes the case for it)",
    exchange: [
      { speaker: "LESEDI", text: "I've heard China's visa process is a minefield — scams, fake schools, people ending up working illegally. Is that a real risk?" },
      { speaker: "KATLEGO", text: "It's a genuinely real risk, and it needs to be said plainly. The Z-visa is the only legal way to teach — full stop. If a school suggests starting on a tourist visa “for now,” that's illegal, and it puts you at real risk of fines, deportation, or a re-entry ban." },
      { speaker: "LESEDI", text: "So how does someone actually protect themselves?" },
      { speaker: "KATLEGO", text: "Stick to transparent channels — boards like DiscoverChinaTEFL exist specifically to cut through the scam risk. And remember: legitimate schools sponsor your Z-visa and never charge you a placement fee." },
      { speaker: "LESEDI", text: "What's the one cultural thing that trips people up early?" },
      { speaker: "KATLEGO", text: "Underestimating face — mianzi. Public criticism or embarrassing someone in front of others causes real, lasting damage here. Learning to give feedback privately matters enormously." },
      { speaker: "LESEDI", text: "So, worth it overall?" },
      { speaker: "KATLEGO", text: "If you go in with the legal side done properly, and genuine patience for how relationships and trust are built here — yes, absolutely." },
    ],
  },
  closingEquation: {
    heading: "The China Equation",
    content:
      "China rewards teachers who get the legal groundwork right — a genuine Z-visa, no shortcuts — and who invest real patience in building guanxi and protecting mianzi. Get both right, and China offers unmatched history, pace, and depth of relationship in return.",
  },
  jobPortalCTA: cta("China", "CN"),
};

const chile: Country = {
  slug: "chile",
  name: "Chile",
  code: "CL",
  region: "Americas",
  flagEmoji: "🇨🇱",
  tagline:
    "English Opens Doors, private institutes, and Latin America's most stable teaching market — a complete guide for South African teachers, with Reading, Video, and Audio.",
  statBadges: [
    { value: "Santiago", label: "Main Teaching Hub" },
    { value: "6-8 Months", label: "Visa Processing Time" },
    { value: "Most Stable", label: "Economy in LatAm" },
  ],
  guideContents: [
    "Reading — culture, food, landmarks, the visa process, and English Opens Doors",
    GUIDE_VIDEO,
    "Debate Audio — two hosts weighing whether Chile is the right fit for you",
  ],
  reading: {
    quickFacts: [
      "Santiago is the country's economic and educational centre, with the strongest teaching demand nationwide",
      "South Africa is among the nationalities historically welcomed by both English Opens Doors and Chile's private market",
      "Widely regarded as one of the safest, most stable, and most developed countries in Latin America",
    ],
    sections: [
      {
        heading: "Buena Onda & Daily Life",
        blocks: [
          text(
            "Chileans are known for “buena onda” — an easy-going, welcoming attitude — while still valuing genuine politeness. Onces, an afternoon tea tradition around 5pm, is a real daily ritual in most households, and weekend asados are a genuine social institution."
          ),
        ],
      },
      {
        heading: "English Opens Doors (EODP): Verify Before You Rely On It",
        blocks: [
          callout(
            "info",
            "The English Opens Doors Programme is the Ministry of Education's flagship initiative, historically open to South Africans without a restrictive nationality list. Recent reports differ on whether it's currently placing volunteers in-country or running in an adjusted, partly online format. Confirm directly with the programme or a placement agency before relying on it.",
            "STATUS: GENUINELY UNCERTAIN — CHECK DIRECTLY"
          ),
        ],
      },
      {
        heading: "Visa Reality: The Sujeta a Contrato",
        blocks: [
          callout(
            "warn",
            "The visa sujeta a contrato (employer-sponsored, standard route) is genuinely functioning, unlike some neighbouring countries where tourist-visa work remains the informal norm. Processing has recently run 6-8 months following a 2022 immigration law overhaul — patience and early planning matter here.",
            "Plan for 6-8 Months"
          ),
        ],
      },
      {
        heading: "Food",
        blocks: [
          list(
            L("Empanadas de Pino", "pastries filled with beef, onion, egg, olives, and raisins"),
            L("Asado", "Chilean barbecue, a weekend social institution"),
            T("Chile is the world's fourth-largest wine exporter")
          ),
        ],
      },
      {
        heading: "Landmarks",
        blocks: [
          list(
            L("The Atacama Desert", "one of the driest places on earth, famous for its stargazing conditions"),
            L("Torres del Paine", "(Patagonia) — dramatic granite peaks and glaciers"),
            L("Rapa Nui (Easter Island)", "famous for its moai statues, a UNESCO World Heritage Site")
          ),
        ],
      },
      {
        heading: "The Teacher's Toolkit: Finding the Work",
        blocks: [
          cards(
            { title: "English Opens Doors (EODP)", text: "The Ministry of Education's flagship programme — verify current operating status directly before applying." },
            { title: "Binational Institutes", text: "Instituto Chileno-Británico and Instituto Chileno-Norteamericano, prestigious, long-established employers." },
            { title: "Wall Street English", text: "A major private chain with consistent demand for Business and corporate English teachers." },
            { title: "TES, Search Associates, ISS", text: "Standard international school recruitment platforms used across Chile." }
          ),
        ],
      },
    ],
    pullQuote:
      "Chile greets new teachers with sheer geography — a city framed by mountains on one side, and a country stretching over 4,000km from desert to glacier on the other.",
    pullQuoteAfter: 0,
  },
  doAndDont: [
    { do: "Verify English Opens Doors' current operating status directly before applying", dont: "Assume EODP's status from any single source — check directly" },
    { do: "Confirm visa sujeta a contrato sponsorship in writing, and plan for 6-8 months", dont: "Joke about or casually raise Chile's Pinochet-era history" },
    { do: "Greet with “Hola, buenos días” before making a request in shops", dont: "Assume tourist-visa work is an acceptable norm here" },
    { do: "Be punctual for tours and professional meetings", dont: "Rush a shared meal, onces, or asado" },
  ],
  videoScript: {
    title: SCRIPT_TITLE,
    scenes: [
      {
        direction: "THANDIWE, a South African teacher, arrives in Santiago, the towering Andes visible behind the city skyline, genuinely striking against the clear afternoon light.",
        lines: [
          { speaker: N, text: "Chile greets new teachers with sheer geography — a city framed by mountains on one side, and a country stretching over 4,000km from desert to glacier on the other." },
          { speaker: "THANDIWE (looking up at the Andes)", text: "I wasn't expecting the mountains to feel this close." },
        ],
      },
      {
        direction: "At 5pm sharp, Thandiwe's host family sits down for onces — bread, cheese, avocado, and tea — a completely ordinary daily ritual.",
        lines: [
          { speaker: N, text: "Onces, this daily afternoon tea tradition, is genuinely part of everyday Chilean life — not a special occasion, just how the late afternoon is spent, most days, in most homes." },
        ],
      },
      {
        direction: "Weeks earlier, in flashback — Thandiwe reviewing her employer's confirmation that they'll sponsor her visa sujeta a contrato, noting the six-to-eight month processing timeline in her calendar.",
        lines: [
          { speaker: "THANDIWE (to herself, marking the date)", text: "Okay — patience it is." },
          { speaker: N, text: "Chile's standard work visa is properly employer-sponsored, but processing has recently run six to eight months following an immigration law overhaul — worth building into any timeline from the start." },
        ],
      },
      {
        direction: "At a staff asado, a colleague gently steers conversation away when Thandiwe, out of curiosity, starts to ask about Chile's history under Pinochet.",
        lines: [
          { speaker: N, text: "Chile's 20th-century history remains a genuinely sensitive subject for many families — best approached with respect, and left for locals to raise themselves." },
        ],
      },
      {
        direction: "Weekend — Thandiwe stands beneath the towering granite peaks of Torres del Paine, wind whipping across the Patagonian landscape.",
        lines: [
          { speaker: N, text: "And once settled in, Chile offers a teacher something genuinely rare — real stability, a steady and welcoming private teaching market, and landscapes that range from the driest desert on earth to glaciers." },
        ],
      },
    ],
  },
  debateAudio: {
    title: "IS CHILE RIGHT FOR YOU?",
    host1: "AYANDA (unsure about EODP's current status)",
    host2: "NOSIPHO (has taught in Chile, makes the case for it)",
    exchange: [
      { speaker: "AYANDA", text: "I keep seeing conflicting information about English Opens Doors — is it still actually placing volunteers in Chile?" },
      { speaker: "NOSIPHO", text: "Honestly, that's a genuinely fair question, and it's worth checking directly rather than trusting any single source, mine included. What's consistent, though, is that it's historically been one of the most open programmes out there." },
      { speaker: "AYANDA", text: "So if EODP isn't the sure thing it once was, what's the realistic path in?" },
      { speaker: "NOSIPHO", text: "Chile's private market, genuinely. Language institutes, especially the prestigious binational ones, hire consistently, and Business English demand from Santiago's mining, finance, and tech sectors is real and growing." },
      { speaker: "AYANDA", text: "What's the visa situation like for those roles?" },
      { speaker: "NOSIPHO", text: "The visa sujeta a contrato is the standard route, and it's genuinely employer-sponsored. The catch is processing time, which has run six to eight months recently. Patience and planning matter here." },
      { speaker: "AYANDA", text: "What's the one cultural thing worth knowing before arriving?" },
      { speaker: "NOSIPHO", text: "Handle Chile's Pinochet-era history with real sensitivity — it's not a topic for casual jokes or curiosity. Let locals raise it if they choose to." },
      { speaker: "AYANDA", text: "So, worth it overall?" },
      { speaker: "NOSIPHO", text: "Genuinely, yes — one of the most stable, developed countries in Latin America, a steady private teaching market, and landscapes from desert to glacier within one country." },
    ],
  },
  closingEquation: {
    heading: "The Chilean Equation",
    content:
      "Chile rewards teachers who verify before they commit: check EODP's real status, plan around the visa's real timeline, and approach the country's history with real care. Go in prepared, and Chile offers one of Latin America's most stable, rewarding teaching markets.",
  },
  jobPortalCTA: cta("Chile", "CL"),
};

const costaRica: Country = {
  slug: "costa-rica",
  name: "Costa Rica",
  code: "CR",
  region: "Americas",
  flagEmoji: "🇨🇷",
  tagline:
    "Pura Vida, three real visa routes, and an honest look at the hiring landscape — a complete guide for South African teachers, with Reading, Video, and Audio.",
  statBadges: [
    { value: "San José", label: "Main Teaching Hub" },
    { value: "3 Visa Routes", label: "Know the Difference" },
    { value: "Safest in LatAm", label: "No Standing Army" },
  ],
  guideContents: [
    "Reading — culture, food, landmarks, the three-tier visa reality, and the honest hiring picture",
    GUIDE_VIDEO,
    "Debate Audio — two hosts weighing whether Costa Rica is the right fit for you",
  ],
  reading: {
    quickFacts: [
      "San José concentrates most paying teaching jobs, with growing demand near tourist hubs like Guanacaste",
      "One of the safest, most stable countries in Latin America, with no standing army",
      "Costa Rica's high tourist infrastructure means strong, steady demand for English",
    ],
    sections: [
      {
        heading: "Pura Vida & Tico Hospitality",
        blocks: [
          text(
            "“Pura Vida” — literally “pure life” — is used constantly as a greeting, a farewell, a toast, and a whole philosophy. Refusing an offered coffee or snack in someone's home can actually come across as impolite, not just a minor decline."
          ),
        ],
      },
      {
        heading: "An Honest Note on Hiring Preferences",
        blocks: [
          callout(
            "warn",
            "South Africans are eligible at most reputable programmes — but many schools genuinely have a preference for North American accents, and non-North-American applicants are often expected to hold a degree even though it's not legally required, sometimes alongside a video submission to assess accent. It's genuinely doable, just worth knowing upfront rather than discovering it partway through your search."
          ),
        ],
      },
      {
        heading: "The Visa Diagnostic: Three Real Routes",
        blocks: [
          text("There are honestly three ways teachers work in Costa Rica. Know exactly which one you're on:"),
          cards(
            { title: "Categoría Especial", badge: "Fully Legal", tone: "success", text: "Sponsored work visa. Grants CCSS healthcare enrolment and the annual aguinaldo (13th-month bonus)." },
            { title: "Tourist Visa + Self-Employment", badge: "Common Grey Area", tone: "warn", text: "Registering with Tributación as self-employed. Common, but no healthcare access, and a border run every 90-180 days." },
            { title: "Undocumented Work", badge: "Avoid Entirely", tone: "danger", text: "Working with no visa registration or tax status at all. The option to avoid completely." }
          ),
        ],
      },
      {
        heading: "Food",
        blocks: [
          list(
            L("Gallo Pinto", "rice and beans, Costa Rica's iconic breakfast dish"),
            L("Casado", "a balanced lunch plate of rice, beans, meat, and salad"),
            T("Costa Rican cuisine is notably mild — genuine chili heat is not a native characteristic")
          ),
        ],
      },
      {
        heading: "Landmarks",
        blocks: [
          list(
            L("Arenal Volcano", "one of Costa Rica's most iconic active volcanoes"),
            L("Monteverde Cloud Forest", "famous for suspended canopy bridges above the forest"),
            L("Manuel Antonio National Park", "a compact, wildlife-rich park combining rainforest and beach")
          ),
        ],
      },
      {
        heading: "The Teacher's Toolkit: Finding the Work",
        blocks: [
          cards(
            { title: "The TEFL Academy's Resources", text: "Costa Rica-specific guidance, with South Africa listed among eligible nationalities." },
            { title: "International TEFL Academy", text: "A guaranteed job placement programme for certified graduates." },
            { title: "myTEFL Internship Programme", text: "Combines certification with a guaranteed 6-12 month job placement." },
            { title: "Go Overseas & TEFL.org", text: "General job boards listing current openings across San José and tourist-hub regions." }
          ),
        ],
      },
    ],
    pullQuote:
      "Costa Rica greets new teachers with a single phrase that says almost everything — Pura Vida, pure life, used as hello, goodbye, a toast, and a whole philosophy all at once.",
    pullQuoteAfter: 0,
  },
  doAndDont: [
    { do: "Accept offered coffee or food in a Costa Rican home graciously", dont: "Assume eligibility means identical hiring odds to North American applicants" },
    { do: "Consider the sponsored Categoría Especial visa for real healthcare and legal protection", dont: "Work fully undocumented on a tourist visa with no self-employment registration" },
    { do: "Bring a degree certificate if you have one — genuinely useful for non-North-American applicants", dont: "Expect genuinely spicy food — Costa Rican cuisine is notably mild" },
    { do: "Embrace Tico Time for casual gatherings, while staying punctual for tours and professional commitments", dont: "Rush a shared meal or casual gathering" },
  ],
  videoScript: {
    title: SCRIPT_TITLE,
    scenes: [
      {
        direction: "LERATO, a South African teacher, arrives in San José, immediately greeted by a taxi driver with a warm “¡Pura vida!” instead of a simple hello.",
        lines: [
          { speaker: N, text: "Costa Rica greets new teachers with a single phrase that says almost everything — Pura Vida, pure life, used as hello, goodbye, a toast, and a whole philosophy all at once." },
          { speaker: "LERATO (smiling, trying it out)", text: "Pura vida to you too, then." },
        ],
      },
      {
        direction: "At a colleague's home for dinner, Lerato is offered coffee the moment she walks in, and gently tries to decline, only for her host to insist warmly until she accepts.",
        lines: [
          { speaker: N, text: "That small insistence is genuine Tico hospitality — refusing an offered coffee or snack can actually read as impolite here." },
        ],
      },
      {
        direction: "Weeks earlier, in flashback — Lerato researching Costa Rica's visa options, weighing the sponsored Categoría Especial route against the common tourist-visa self-employment workaround.",
        lines: [
          { speaker: "LERATO (to herself, taking notes)", text: "Sponsored visa, real healthcare, no border runs. Worth the extra paperwork." },
          { speaker: N, text: "The sponsored work visa gives real legal protection, healthcare enrolment, and an annual bonus — the common tourist-visa workaround is legal grey area, with a border run every few months and no healthcare access." },
        ],
      },
      {
        direction: "At school, Lerato notices a casual staff gathering starting a good twenty minutes later than planned, nobody remotely bothered by it.",
        lines: [
          { speaker: N, text: "That's Tico Time — punctuality matters for tours and professional commitments, but a relaxed start to a casual gathering is just part of the rhythm here." },
        ],
      },
      {
        direction: "Weekend — Lerato stands on a suspended canopy bridge in the misty Monteverde Cloud Forest.",
        lines: [
          { speaker: N, text: "And once the paperwork and the pace of life both settle in, Costa Rica offers a teacher something genuinely rare — real stability, extraordinary natural beauty, and a philosophy of living well that's hard not to take home with you." },
        ],
      },
    ],
  },
  debateAudio: {
    title: "IS COSTA RICA RIGHT FOR YOU?",
    host1: "NOMFUNDO (weighing the nationality/hiring nuance)",
    host2: "PALESA (has taught in Costa Rica, makes the case for it)",
    exchange: [
      { speaker: "NOMFUNDO", text: "I've heard Costa Rican schools genuinely prefer North American teachers. Does that mean South Africans struggle to get hired?" },
      { speaker: "PALESA", text: "It's a real, honest nuance worth knowing upfront. South Africans are eligible at most reputable programmes — but many schools have a genuine preference for North American accents, and non-North-American applicants are often expected to hold a degree even though it's not legally required." },
      { speaker: "NOMFUNDO", text: "So it's still genuinely doable, just with extra steps?" },
      { speaker: "PALESA", text: "Exactly — plenty of South Africans teach successfully in Costa Rica. It just means going in with a degree if you have one, and being ready for a slightly more competitive process." },
      { speaker: "NOMFUNDO", text: "What's the visa situation actually like?" },
      { speaker: "PALESA", text: "There are really three routes. The sponsored Categoría Especial visa is fully legal — real healthcare, an annual bonus, no border runs. The tourist-visa-plus-self-employment route is common but a genuine grey area. And working fully undocumented is the one to avoid entirely." },
      { speaker: "NOMFUNDO", text: "What's the one cultural thing that surprises new teachers?" },
      { speaker: "PALESA", text: "How central “Pura Vida” really is — it's a genuine daily philosophy. And Tico hospitality is real — declining an offered coffee can actually come across as rude." },
      { speaker: "NOMFUNDO", text: "So, worth it overall?" },
      { speaker: "PALESA", text: "Genuinely, yes — one of the safest, most stable countries in Latin America, incredible natural beauty, and a culture that actively rewards slowing down." },
    ],
  },
  closingEquation: {
    heading: "The Costa Rica Equation",
    content:
      "Costa Rica rewards teachers who go in clear-eyed: aware of the real hiring nuance, deliberate about which visa route they're actually on, and genuinely open to the Pura Vida pace of life. Go in informed, and Costa Rica offers real safety, extraordinary nature, and a philosophy of living well.",
  },
  jobPortalCTA: cta("Costa Rica", "CR"),
};

const colombia: Country = {
  slug: "colombia",
  name: "Colombia",
  code: "CO",
  region: "Americas",
  flagEmoji: "🇨🇴",
  tagline:
    "A genuinely functioning work visa, plus two real public-initiative routes — a complete guide for South African teachers, with Reading, Video, and Audio.",
  statBadges: [
    { value: "M-Visa", label: "Genuinely Functioning" },
    { value: "15 Days", label: "Cédula Deadline" },
    { value: "2 Public Routes", label: "ETF & Heart for Change" },
  ],
  guideContents: [
    "Reading — culture, food, landmarks, the M-visa process, and two confirmed public initiatives",
    GUIDE_VIDEO,
    "Debate Audio — two hosts weighing whether Colombia is the right fit for you",
  ],
  reading: {
    quickFacts: [
      "Bogóta and Medellín are the largest teaching hubs, with growing demand in Cali and coastal cities",
      "Widely regarded as Latin America's most accessible major TEFL market for legal work",
      "Colombia's national bilingualism policy actively drives structural, ongoing demand for English teachers",
    ],
    sections: [
      {
        heading: "Regional Diversity",
        blocks: [
          text(
            "Coastal Afro-Colombian culture around Cartagena feels distinctly different from Bogotá's more formal interior highlands, which is different again from the laid-back rhythm of the coffee region (Eje Cafetero)."
          ),
        ],
      },
      {
        heading: "Two Real Public-Initiative Routes",
        blocks: [
          cards(
            { title: "ETF", badge: "GOVERNMENT", tone: "info", text: "English Teaching Fellowship — places qualified teachers directly into public schools nationwide. Includes a monthly stipend, orientation with accommodation and meals, and a programme-arranged visa." },
            { title: "Heart for Change", badge: "SA ELIGIBLE", tone: "success", text: "Also known as Volunteers Colombia — a community-based English Teaching Fellowship that explicitly lists South Africa among its eligible nationalities." }
          ),
        ],
      },
      {
        heading: "The 15-Day Cédula Deadline",
        blocks: [
          callout(
            "warn",
            "The M-visa (M-Trabajador) requires a confirmed job offer, TEFL certificate, passport, and degree where relevant. Once granted, a cédula (Colombian ID) must be obtained within 15 days of the visa being stamped, with real fines for missing that deadline. Mark this date the moment your visa comes through."
          ),
        ],
      },
      {
        heading: "Food",
        blocks: [
          list(
            L("Arepas", "thick corn pancakes, a genuine daily staple"),
            L("Ajiaco", "a hearty Bogotá specialty stew with three types of potato"),
            T("Coffee (tinto) is central to daily life — the Coffee Cultural Landscape is UNESCO-listed")
          ),
        ],
      },
      {
        heading: "Landmarks",
        blocks: [
          list(
            L("Cartagena's Historic Walled City", "a UNESCO World Heritage Site of colonial architecture"),
            L("Comuna 13", "(Medellín) — once dangerous, now a celebrated centre of street art")
          ),
        ],
      },
      {
        heading: "The Teacher's Toolkit: Finding the Work",
        blocks: [
          cards(
            { title: "ESLstarter's Public School Program", text: "The structured, government-linked ETF route, with visa and accommodation support included." },
            { title: "Heart for Change / Volunteers Colombia", text: "A community-focused fellowship explicitly open to South African applicants." },
            { title: "Go Overseas & TEFL.org", text: "Current openings across Bogotá, Medellín, Cali, and the coast." },
            { title: "Established Language Chains", text: "Berlitz, British Council, Colombo Americano, English First — confirm visa sponsorship before accepting." }
          ),
        ],
      },
    ],
    pullQuote:
      "Colombia's M-visa is genuinely the most functional employer-sponsored work visa in Latin America — a real legal framework, not a grey-area workaround like some neighbouring countries.",
    pullQuoteAfter: 0,
  },
  doAndDont: [
    { do: "Confirm M-visa or ETF sponsorship explicitly before accepting any offer", dont: "Assume Colombia's visa framework works like Peru's or Guatemala's tourist-visa grey area" },
    { do: "Get your cédula within 15 days of your visa being stamped", dont: "Miss the 15-day cédula deadline — the fines are steep" },
    { do: "Respect personal space, especially in interior regions like Bogotá", dont: "Assume the same personal-space norms apply everywhere — the coast is noticeably more relaxed" },
    { do: "Explore the country's regional diversity — coast, mountains, and coffee country each feel different", dont: "Skip confirming a smaller independent school's visa sponsorship capability" },
  ],
  videoScript: {
    title: SCRIPT_TITLE,
    scenes: [
      {
        direction: "KHOLISWA, a South African teacher, arrives in Bogotá, the misty Andean skyline visible from her taxi window, cool mountain air a surprise after the tropical images she'd pictured.",
        lines: [
          { speaker: N, text: "Colombia often greets new teachers with a surprise — Bogotá sits high in the Andes, genuinely cool and misty, a world away from the postcard tropical image most people carry beforehand." },
          { speaker: "KHOLISWA (pulling on a light jacket)", text: "Nobody told me to pack for cool weather." },
        ],
      },
      {
        direction: "At her new language school, Kholiswa's director explains the M-visa process, degree certificate and TEFL certificate laid out on the desk between them.",
        lines: [
          { speaker: N, text: "This school is doing it properly. Colombia's M-visa is genuinely the most functional employer-sponsored work visa in Latin America — a real legal framework, not a grey-area workaround like some neighbouring countries." },
          { speaker: "KHOLISWA (reviewing the paperwork)", text: "And I need to get my cédula within fifteen days once this is stamped?" },
          { speaker: N, text: "Exactly — miss that window and the fines are genuinely steep." },
        ],
      },
      {
        direction: "Weeks later, Kholiswa stands in a stairwell in Medellín's Comuna 13, murals stretching in every direction.",
        lines: [
          { speaker: N, text: "Once settled, the country reveals itself in layers — Comuna 13, once one of Medellín's most dangerous neighbourhoods, is now a celebrated centre of street art and genuine community transformation." },
        ],
      },
      {
        direction: "Weekend — Kholiswa walks the colourful colonial streets of Cartagena's walled Old Town, the Caribbean visible past the old fortifications.",
        lines: [
          { speaker: N, text: "And for a teacher willing to embrace real regional diversity, Colombia offers one of Latin America's most accessible, and genuinely rewarding, teaching markets." },
        ],
      },
    ],
  },
  debateAudio: {
    title: "IS COLOMBIA RIGHT FOR YOU?",
    host1: "ONTHATILE (comparing it to other Latin American options)",
    host2: "BAHLE (has taught in Colombia, makes the case for it)",
    exchange: [
      { speaker: "ONTHATILE", text: "Latin America has a lot of teaching destinations — why does Colombia specifically come up as the top pick?" },
      { speaker: "BAHLE", text: "The visa situation, honestly, more than anything else. Colombia has a genuinely functioning employer-sponsored M-visa — established schools routinely and properly sponsor it. That's a real structural advantage." },
      { speaker: "ONTHATILE", text: "Is it just private schools, or is there public-sector work too?" },
      { speaker: "BAHLE", text: "Genuinely both. The government's national bilingualism push has created real public-school opportunities — the ETF programme places teachers directly into public institutions. And separately, Heart for Change and Volunteers Colombia run community-based placements that explicitly list South Africa as an eligible nationality." },
      { speaker: "ONTHATILE", text: "What's the one cultural thing that surprises new teachers?" },
      { speaker: "BAHLE", text: "How regionally different the country feels. Bogotá's cool, formal, mountain energy is nothing like Cartagena's warm coastal rhythm, which is nothing like the relaxed coffee region in between." },
      { speaker: "ONTHATILE", text: "So, worth it overall?" },
      { speaker: "BAHLE", text: "Genuinely, yes — real legal protection, structural demand driven by actual government policy, and a country with enough regional variety to keep things interesting for years." },
    ],
  },
  closingEquation: {
    heading: "The Colombian Equation",
    content:
      "Colombia rewards teachers who take advantage of what's genuinely rare here: a real functioning legal visa, plus actual public-sector routes most other countries in the region simply don't offer. Bring your cédula paperwork on time, and Colombia offers one of the most accessible, rewarding teaching markets in Latin America.",
  },
  jobPortalCTA: cta("Colombia", "CO"),
};

const france: Country = {
  slug: "france",
  name: "France",
  code: "FR",
  region: "Europe",
  flagEmoji: "🇫🇷",
  tagline:
    "The real South African route in (not TAPIF), B1 French, and a genuine cultural adjustment — a complete guide with Reading, Video, and Audio.",
  statBadges: [
    { value: "IFAS", label: "The Real SA Route" },
    { value: "B1 French", label: "Language Requirement" },
    { value: "7 Months", label: "Standard Contract" },
  ],
  guideContents: [
    "Reading — culture, food, landmarks, and the real (not TAPIF) route in for South Africans",
    GUIDE_VIDEO,
    "Debate Audio — two hosts weighing whether France is the right fit for you",
  ],
  reading: {
    quickFacts: [
      "Paris is the largest hub, though assistant placements are spread across the whole country",
      "The English Language Assistants Program places teachers directly in French public schools",
      "A genuinely competitive, well-structured government scheme, not an informal market",
    ],
    sections: [
      {
        heading: "Correcting a Common Mix-Up",
        blocks: [
          text("Searching for how to teach in France quickly turns up “TAPIF” — but this specific branding is only accessible to US applicants. Here's the actual distinction:"),
          cards(
            { title: "WHAT MOST PEOPLE SEARCH FOR", text: "TAPIF (Teaching Assistant Program in France) — but this specific branded programme is US-applicant only. South Africans cannot apply through TAPIF directly." },
            { title: "THE REAL SOUTH AFRICAN ROUTE", tone: "success", text: "Apply via the French Institute of South Africa (IFAS) for the “English Language Assistants Program in France” — the same France Éducation International scheme, just accessed through the SA-specific channel." }
          ),
        ],
      },
      {
        heading: "Programme Facts",
        blocks: [
          callout(
            "info",
            "Apply through the French Institute of South Africa (IFAS). Requires B1-level French, ages 20-35, for a standard 7-month contract. Pay runs approximately €1,010 gross per month — enough to live modestly in most placement cities, though not a wealth-building wage. Placements are assigned, not chosen, so be genuinely open to wherever you're sent.",
            "The English Language Assistants Program"
          ),
        ],
      },
      {
        heading: "Food",
        blocks: [
          list(
            L("Boulangerie culture", "fresh bread and pastries are a genuine daily ritual, not a treat"),
            L("The long lunch", "meals are treated as real occasions, rarely rushed"),
            T("Cheese and wine pairing is taken seriously and varies significantly by region")
          ),
        ],
      },
      {
        heading: "Landmarks",
        blocks: [
          list(
            L("The Eiffel Tower & the Louvre", "Paris's defining icons, genuinely worth the crowds at least once"),
            L("The Loire Valley", "châteaux and vineyards, a completely different pace from Paris"),
            L("Provence & the Côte d'Azur", "lavender fields and Mediterranean coastline")
          ),
        ],
      },
      {
        heading: "The Teacher's Toolkit: Finding the Work",
        blocks: [
          cards(
            { title: "frenchinstitute.org.za", text: "The French Institute of South Africa's own site — the correct starting point for South African applicants." },
            { title: "France Éducation International", text: "assistants.france-education-international.fr — the official programme portal once your IFAS application is underway." },
            { title: "TEFL.org", text: "General job board resources with additional France-specific guidance." },
            { title: "Private Language Schools", text: "Once in France, language academies and Business English providers hire directly, especially in Paris and major cities." }
          ),
        ],
      },
    ],
    pullQuote:
      "France often surprises new assistants with just how structured the process is — this isn't an informal market you walk into, it's a genuine government programme with real requirements.",
    pullQuoteAfter: 0,
  },
  doAndDont: [
    { do: "Apply through IFAS specifically, not a US-facing TAPIF portal", dont: "Assume TAPIF applies to South African applicants — it doesn't" },
    { do: "Reach at least B1-level French before applying", dont: "Expect to choose your placement city" },
    { do: "Stay genuinely open to whichever region you're assigned", dont: "Rely on the €1,010 stipend to build savings — budget for a modest, not lavish, 7 months" },
    { do: "Treat meals as real social occasions, not something to rush", dont: "Skip the French language preparation — B1 is a real requirement, not a suggestion" },
  ],
  videoScript: {
    title: SCRIPT_TITLE,
    scenes: [
      {
        direction: "THEMBEKA, a South African teacher, stands outside a train station in a small French town she'd never heard of before her placement letter arrived, suitcase in hand.",
        lines: [
          { speaker: N, text: "France often surprises new assistants with just how structured the process is — this isn't an informal market you walk into, it's a genuine government programme with real requirements." },
          { speaker: "THEMBEKA (checking her placement letter)", text: "I really didn't expect to end up somewhere this small, but here we are." },
        ],
      },
      {
        direction: "Weeks earlier, in flashback — Thembeka scrolling through search results for “teach English France,” frustrated to keep landing on a US-only programme page.",
        lines: [
          { speaker: "THEMBEKA (frustrated, to herself)", text: "Every result says TAPIF, TAPIF, TAPIF — but I'm not American." },
          { speaker: N, text: "That confusion is genuinely common. TAPIF is simply the US-branded version of the same scheme. South Africans apply through the French Institute of South Africa instead — same programme, different door." },
        ],
      },
      {
        direction: "At her new school, Thembeka's headteacher welcomes her warmly, then gently checks her French with a few quick questions.",
        lines: [
          { speaker: N, text: "B1-level French is a genuine requirement here, not a formality — worth taking seriously well before you apply." },
        ],
      },
      {
        direction: "At a long lunch with new colleagues, nobody rushes; the meal stretches over ninety unhurried minutes of real conversation.",
        lines: [
          { speaker: N, text: "And little moments like this reveal something real about daily life here — meals are genuine occasions, never just refuelling." },
        ],
      },
      {
        direction: "Weekend — Thembeka wanders through a small Loire Valley town, a château visible above the rooftops, utterly unhurried.",
        lines: [
          { speaker: N, text: "And once the paperwork and the language both come together, France offers a teacher something genuinely rare — real structure, deep cultural richness, and a placement that might take you somewhere you'd never have picked yourself, and be glad for it." },
        ],
      },
    ],
  },
  debateAudio: {
    title: "IS FRANCE RIGHT FOR YOU?",
    host1: "PRECIOUS (confused by the TAPIF branding)",
    host2: "ANESIPHO (has taught in France, makes the case for it)",
    exchange: [
      { speaker: "PRECIOUS", text: "Every time I search how to teach in France, I just get TAPIF results. Is that actually open to South Africans?" },
      { speaker: "ANESIPHO", text: "Genuinely not, and this trips up a lot of people. TAPIF is the US-branded version of the programme. South Africans apply through the French Institute of South Africa instead — same underlying scheme, different application door." },
      { speaker: "PRECIOUS", text: "What does the actual programme require?" },
      { speaker: "ANESIPHO", text: "B1-level French, genuinely non-negotiable, ages 20 to 35, for a standard seven-month contract. Pay runs around €1,010 gross a month — enough to live modestly, not to save much." },
      { speaker: "PRECIOUS", text: "Do you get to pick where you're placed?" },
      { speaker: "ANESIPHO", text: "No, and that's genuinely important to accept going in. Placements are assigned, sometimes to small towns you'd never have chosen yourself — but that's often where the real experience happens." },
      { speaker: "PRECIOUS", text: "What's the one cultural thing that surprises people?" },
      { speaker: "ANESIPHO", text: "How genuinely unrushed meals are. A lunch can stretch well past an hour, and it's treated as real time, not a break to get through." },
      { speaker: "PRECIOUS", text: "So, worth it overall?" },
      { speaker: "ANESIPHO", text: "Genuinely, yes — as long as your French is ready and you go in accepting you don't choose your town. France offers real structure and a depth of culture that's hard to find elsewhere." },
    ],
  },
  closingEquation: {
    heading: "The France Equation",
    content:
      "France rewards teachers who get past the TAPIF confusion, arrive with real B1 French, and stay genuinely open to wherever the programme sends them. Get the application right, and France offers structure, culture, and a placement experience genuinely unlike anywhere else.",
  },
  jobPortalCTA: cta("France", "FR"),
};

// Order shown in the navbar dropdown and the /countries catalogue.
const italy: Country = {
  slug: "italy",
  name: "Italy",
  code: "IT",
  region: "Europe",
  flagEmoji: "🇮🇹",
  tagline:
    "Three real visa routes, la bella figura, and knowing which door actually gets you working — a complete guide with Reading, Video, and Audio.",
  statBadges: [
    { value: "3 Visa Routes", label: "Know the Difference" },
    { value: "20 Hrs/Week", label: "Student Visa Work Limit" },
    { value: "~5-10%", label: "Sponsored D-Visa Success" },
  ],
  guideContents: [
    "Reading — culture, food, landmarks, and the three real visa routes explained clearly",
    GUIDE_VIDEO,
    "Debate Audio — two hosts weighing whether Italy is the right fit for you",
  ],
  reading: {
    quickFacts: [
      "Florence, Rome, and Milan are the largest hubs for both summer camps and language schools",
      "Non-EU teachers genuinely need to understand three distinct visa routes before committing",
      "One of Europe's most competitive teaching markets on paperwork, genuinely rewarding once cleared",
    ],
    sections: [
      {
        heading: "The Visa Diagnostic: Three Real Routes",
        blocks: [
          text("Non-EU teachers in Italy work under one of three genuinely different arrangements. Know exactly which one applies to your situation:"),
          cards(
            {
              title: "90-Day Schengen Window",
              badge: "Camps Only",
              tone: "warn",
              text: "Covers summer camp work only, paying roughly €150-250/week plus board. Does NOT cover language school employment.",
            },
            {
              title: "Student Visa",
              badge: "Legal, Most Common",
              tone: "success",
              text: "Enrol in an Italian language course, which permits up to 20 hours/week of paid work — the most common real route in.",
            },
            {
              title: "Sponsored D-Visa",
              badge: "Rare, ~5-10%",
              tone: "info",
              text: "A genuinely employer-sponsored work visa, subject to Italy's annual immigration quota system. Rare, but real when it happens.",
            }
          ),
        ],
      },
      {
        heading: "La Bella Figura & Riposo",
        blocks: [
          text(
            "“La bella figura” — making a good impression — genuinely shapes daily life, from how people dress to how meals are presented. Riposo, the early-afternoon quiet hours, sees many shops and businesses close, particularly in smaller towns — plan errands accordingly."
          ),
        ],
      },
      {
        heading: "Food",
        blocks: [
          list(
            T("Regional identity runs deep — a dish considered essential in Naples may be unheard of in Milan"),
            T("Meals are treated as genuine social occasions, rarely rushed, especially dinner"),
            T("Coffee culture has real rules — cappuccino is a morning drink, rarely ordered after a meal")
          ),
        ],
      },
      {
        heading: "Landmarks",
        blocks: [
          list(
            L("The Colosseum & Roman Forum", "ancient Rome's defining ruins"),
            L("The Duomo (Florence)", "Brunelleschi's dome, a genuine feat of Renaissance engineering"),
            L("The Amalfi Coast", "dramatic cliffside towns overlooking the Tyrrhenian Sea")
          ),
        ],
      },
      {
        heading: "The Teacher's Toolkit: Finding the Work",
        blocks: [
          cards(
            { title: "Wall Street English", text: "A major private chain with consistent demand across Italian cities." },
            { title: "Inlingua & British Institutes", text: "Established language school networks, genuinely worth contacting directly." },
            { title: "TEFL.org", text: "General job board resources with Italy-specific visa guidance." },
            { title: "Go Overseas", text: "Job listings and provider reviews for summer camp and language school roles." }
          ),
        ],
      },
    ],
    pullQuote:
      "Italy often surprises new teachers with how much the visa route actually matters — the same job title can mean something completely different depending on which door you walked through to get there.",
    pullQuoteAfter: 0,
  },
  doAndDont: [
    { do: "Understand exactly which of the three visa routes applies to your specific situation", dont: "Assume a 90-day Schengen entry covers language school work — it genuinely doesn't" },
    { do: "Respect riposo hours when planning errands, especially in smaller towns", dont: "Order a cappuccino after a meal — a small but real local norm" },
    { do: "Dress with genuine care — la bella figura is a real, everyday expectation", dont: "Assume the sponsored D-Visa is a reliable primary plan — it's genuinely rare" },
    { do: "Treat meals as unhurried social occasions", dont: "Flatten regional food identity — what's normal in one city may be unheard of in another" },
  ],
  videoScript: {
    title: SCRIPT_TITLE,
    scenes: [
      {
        direction: "NOMPUMELELO, a South African teacher, stands in a sunlit courtyard at a Florence summer camp, children's laughter echoing from a nearby classroom.",
        lines: [
          { speaker: N, text: "Italy often surprises new teachers with how much the visa route actually matters — the same job title can mean something completely different depending on which door you walked through to get there." },
          { speaker: "NOMPUMELELO (checking her paperwork)", text: "Ninety days, camps only. I need to remember this doesn't carry over to a language school job." },
        ],
      },
      {
        direction: "Weeks earlier, in flashback — Nompumelelo researching her options online, comparing the Schengen camp route against enrolling in an Italian language course for the work rights it grants.",
        lines: [
          { speaker: N, text: "A ninety-day Schengen entry genuinely covers summer camp work, paying roughly €150 to 250 a week plus board — but it does not cover language school employment. For that, most teachers enrol in a student visa programme instead, which permits up to twenty hours of paid work a week." },
        ],
      },
      {
        direction: "At a small café near the Duomo, Nompumelelo orders a cappuccino after her dinner, and the barista gently raises an eyebrow.",
        lines: [{ speaker: "NOMPUMELELO (laughing, catching herself)", text: "Right — morning drink only. Noted." }],
      },
      {
        direction: "At 2pm on a weekday, Nompumelelo finds the small shops in her neighbourhood shuttered, a printed sign taped to each door.",
        lines: [
          { speaker: N, text: "Riposo, the early-afternoon quiet hours, closes many shops and businesses, especially outside the big cities — a rhythm worth planning around, not fighting." },
        ],
      },
      {
        direction: "Weekend — Nompumelelo stands at a clifftop viewpoint along the Amalfi Coast, pastel-coloured buildings clinging to the hillside below.",
        lines: [
          { speaker: N, text: "And once the visa route is properly understood, Italy offers a teacher something genuinely rare — extraordinary history, real regional richness, and a culture that rewards slowing down." },
        ],
      },
    ],
  },
  debateAudio: {
    title: "IS ITALY RIGHT FOR YOU?",
    host1: "LEBOGANG (confused by the visa options)",
    host2: "KHOLOFELO (has taught in Italy, makes the case for it)",
    exchange: [
      { speaker: "LEBOGANG", text: "I keep seeing different visa advice for Italy. Is there actually one clear way in?" },
      { speaker: "KHOLOFELO", text: "Genuinely not one single way — there are three real routes, and mixing them up is the most common mistake. A ninety-day Schengen entry covers summer camp work only, paying roughly €150 to 250 a week plus board. It does not cover language school employment." },
      { speaker: "LEBOGANG", text: "So what covers language school work, then?" },
      { speaker: "KHOLOFELO", text: "Most teachers enrol in an Italian language course on a student visa, which genuinely permits up to twenty hours of paid work a week. It's the most common real route for longer stays." },
      { speaker: "LEBOGANG", text: "What about an actual sponsored work visa?" },
      { speaker: "KHOLOFELO", text: "That exists too, the D-Visa, but it's genuinely rare — roughly five to ten percent of applicants, subject to Italy's annual quota system. Worth knowing about, but not something to plan around as your primary route." },
      { speaker: "LEBOGANG", text: "What's the one cultural thing that catches people out?" },
      { speaker: "KHOLOFELO", text: "Riposo, genuinely — those early-afternoon hours when smaller shops just close. And la bella figura is real too; how you present yourself actually matters here, day to day." },
      { speaker: "LEBOGANG", text: "So, worth it overall?" },
      { speaker: "KHOLOFELO", text: "Genuinely, yes — as long as you understand which visa route you're actually on. Get that right, and Italy offers extraordinary history and a culture that rewards real patience." },
    ],
  },
  closingEquation: {
    heading: "The Italy Equation",
    content:
      "Italy rewards teachers who get the paperwork distinction right from day one: knowing exactly which of the three visa routes they're actually on, before making any plans around it. Get that clarity early, and Italy offers extraordinary history, regional richness, and a culture that genuinely rewards patience.",
  },
  jobPortalCTA: cta("Italy", "IT"),
};

const japan: Country = {
  slug: "japan",
  name: "Japan",
  code: "JP",
  region: "Asia",
  flagEmoji: "🇯🇵",
  tagline:
    "Honne, tatemae, and four real routes into one of the world's most established teaching markets — a complete guide with Reading, Video, and Audio.",
  statBadges: [
    { value: "4 Real Routes", label: "JET, ALT, Eikaiwa, Int'l" },
    { value: "Meishi", label: "Business Card Ritual" },
    { value: "Est. Market", label: "Decades of Structure" },
  ],
  guideContents: [
    "Reading — culture, food, landmarks, honne/tatemae, and the four real routes in",
    GUIDE_VIDEO,
    "Debate Audio — two hosts weighing whether Japan is the right fit for you",
  ],
  reading: {
    quickFacts: [
      "Tokyo and Osaka are the largest hubs, though ALT placements reach right across the country",
      "One of the world's longest-established, most structured English-teaching markets",
      "Four genuinely distinct routes in, each with a different pace, pay, and competitiveness",
    ],
    sections: [
      {
        heading: "Honne & Tatemae: The Two Concepts That Run Everything",
        blocks: [
          cards(
            { title: "HONNE", text: "A person's true feelings and desires — genuinely held, but not necessarily spoken aloud in professional or public settings." },
            { title: "TATEMAE", text: "The public face or stated position, chosen to maintain group harmony — not dishonesty, but genuine social tact." }
          ),
        ],
      },
      {
        heading: "Meishi: The Business Card Ritual",
        blocks: [
          text("Exchanging business cards (meishi) is a genuine, structured ritual in Japanese professional life — treated with real formality:"),
          steps(
            { label: "Present with both hands", text: "card facing the recipient, text readable to them, with a slight bow." },
            { label: "Receive with both hands", text: "take a moment to actually read it before putting it away." },
            { label: "Never write on it, fold it, or put it straight in your back pocket", text: "treat it as an extension of the person." }
          ),
        ],
      },
      {
        heading: "Four Real Routes In",
        blocks: [
          cards(
            { title: "JET Programme", text: "The official government scheme — genuinely well-structured, competitive, placing ALTs in public schools nationwide." },
            { title: "ALT (via Dispatch Companies)", text: "Interac, Altia Central and similar — a faster, more accessible route into public school assistant teaching." },
            { title: "Eikaiwa (Private Conversation Schools)", text: "Private language schools with flexible hours, genuinely popular for city-based placements." },
            { title: "International Schools", text: "Higher bar for entry (often requiring a teaching license), but genuinely strong pay and conditions." }
          ),
        ],
      },
      {
        heading: "Food",
        blocks: [
          list(
            L("Ramen", "regional broth styles vary enormously, genuinely worth exploring beyond one city"),
            L("Izakaya culture", "casual after-work drinking and small plates, a real social institution")
          ),
        ],
      },
      {
        heading: "Landmarks",
        blocks: [
          list(
            L("Mount Fuji", "Japan's defining, genuinely iconic peak"),
            L("Fushimi Inari Shrine (Kyoto)", "thousands of vermillion torii gates winding up the mountainside"),
            L("Hiroshima Peace Memorial", "a significant, sobering historical site, approached with genuine respect")
          ),
        ],
      },
    ],
    pullQuote:
      "Japan often surprises new teachers with how much unspoken structure sits beneath the surface — this is a culture where what's said and what's meant aren't always the same thing, and that's not dishonesty, it's genuine social care.",
    pullQuoteAfter: 0,
  },
  doAndDont: [
    { do: "Present and receive business cards with both hands, and read them before putting them away", dont: "Write on, fold, or pocket a business card carelessly" },
    { do: "Bow when greeting, matching the depth of the other person where possible", dont: "Assume a direct “no” will always be spoken plainly — tatemae often softens refusal" },
    { do: "Research which of the four routes genuinely fits your goals before applying", dont: "Tip at restaurants — it's genuinely not expected, and can cause confusion" },
    { do: "Remove your shoes wherever indoor footwear norms expect it", dont: "Assume JET, ALT, eikaiwa, and international schools are interchangeable — they're genuinely different jobs" },
  ],
  videoScript: {
    title: SCRIPT_TITLE,
    scenes: [
      {
        direction: "LINDIWE, a South African teacher, stands before the vermillion torii gates of Fushimi Inari, the path winding up into the trees ahead of her.",
        lines: [
          { speaker: N, text: "Japan often surprises new teachers with how much unspoken structure sits beneath the surface — this is a culture where what's said and what's meant aren't always the same thing, and that's not dishonesty, it's genuine social care." },
          { speaker: "LINDIWE (taking in the gates)", text: "I've never walked through anything quite like this." },
        ],
      },
      {
        direction: "At her new school, Lindiwe carefully presents her business card with both hands, bowing slightly, and receives her principal's card the same way, pausing to read it.",
        lines: [
          { speaker: N, text: "The meishi exchange is a genuine ritual here — present and receive with both hands, and actually take a moment to read it. Small details, but they matter." },
        ],
      },
      {
        direction: "In a staff meeting, a colleague responds to a scheduling request with a warm, non-committal answer, and Lindiwe later learns it was a gentle no.",
        lines: [
          { speaker: "LINDIWE (reflecting, to a friend)", text: "I'm learning to listen for what's not quite being said." },
          { speaker: N, text: "That's honne and tatemae in action — the true feeling beneath the polite, harmony-preserving surface. Reading it takes time, but it comes." },
        ],
      },
      {
        direction: "Weekend — Lindiwe stands at a viewpoint with Mount Fuji rising clearly against a bright blue sky.",
        lines: [
          { speaker: N, text: "And once the etiquette and the unspoken layers both start to click, Japan offers a teacher something genuinely rare — deep structure, real respect, and a culture worth a lifetime of learning." },
        ],
      },
    ],
  },
  debateAudio: {
    title: "IS JAPAN RIGHT FOR YOU?",
    host1: "NKOSANA (confused by the different routes in)",
    host2: "AYANDA (has taught in Japan, makes the case for it)",
    exchange: [
      { speaker: "NKOSANA", text: "Everyone mentions JET, ALT, eikaiwa — are these all basically the same thing with different names?" },
      { speaker: "AYANDA", text: "Genuinely not — they're four real, distinct paths. JET is the official government scheme, well-structured and competitive. ALT roles through dispatch companies like Interac are a faster, more accessible way into public schools. Eikaiwa are private conversation schools, genuinely flexible. International schools sit at the top, usually wanting a teaching license." },
      { speaker: "NKOSANA", text: "What's the one thing that catches new teachers off guard culturally?" },
      { speaker: "AYANDA", text: "Honne and tatemae, without question. What someone says isn't always exactly what they mean — it's about preserving harmony, not deception. Learning to read that takes real time." },
      { speaker: "NKOSANA", text: "And the business card thing I keep hearing about?" },
      { speaker: "AYANDA", text: "Meishi, genuinely a real ritual. Both hands to give, both hands to receive, and actually read it before putting it away. Small, but it says a lot about how seriously first impressions are taken here." },
      { speaker: "NKOSANA", text: "So, worth it overall?" },
      { speaker: "AYANDA", text: "Genuinely, yes — as long as you pick the route that actually fits your goals. Japan rewards patience and real cultural curiosity with one of the most structured, rewarding teaching markets anywhere." },
    ],
  },
  closingEquation: {
    heading: "The Japan Equation",
    content:
      "Japan rewards teachers who choose their route deliberately, and invest real patience in reading the unspoken layers of honne and tatemae. Get both right, and Japan offers deep structure, genuine respect, and a culture worth a lifetime of learning.",
  },
  jobPortalCTA: cta("Japan", "JP"),
};

const kuwait: Country = {
  slug: "kuwait",
  name: "Kuwait",
  code: "KW",
  region: "Middle East",
  flagEmoji: "🇰🇼",
  tagline:
    "A fully dry country, the genuine tradition of diwaniya, and a market that values real classroom experience — a complete guide with Reading, Video, and Audio.",
  statBadges: [
    { value: "Fully Dry", label: "No Exceptions, Unlike UAE/Qatar" },
    { value: "Diwaniya", label: "UNESCO-Recognised Tradition" },
    { value: "~2 Years", label: "Experience Commonly Expected" },
  ],
  guideContents: [
    "Reading — culture, food, landmarks, the fully-dry reality, and diwaniya",
    GUIDE_VIDEO,
    "Debate Audio — two hosts weighing whether Kuwait is the right fit for you",
  ],
  reading: {
    quickFacts: [
      "Kuwait City concentrates the large majority of international teaching positions",
      "Genuinely tax-free income, a real financial advantage across the Gulf region",
      "Around 2 years of classroom experience is commonly expected, more than some neighbouring markets",
    ],
    sections: [
      {
        heading: "Fully Dry: Not the Same as Its Neighbours",
        blocks: [
          callout(
            "danger",
            "Unlike the UAE or Qatar, where alcohol is available through licensed hotels and venues, Kuwait is genuinely and completely dry — there are no licensed exceptions anywhere in the country. This is worth understanding clearly before you commit, not discovering on arrival.",
            "No Exceptions, Anywhere"
          ),
          cards(
            { title: "Kuwait", badge: "Fully Dry", tone: "danger", text: "Alcohol is banned outright, with no exceptions anywhere in the country." },
            { title: "UAE", badge: "Licensed Exceptions", text: "Alcohol is available through licensed hotels, bars, and restaurants." },
            { title: "Qatar", badge: "Licensed Exceptions", text: "Alcohol is available through licensed hotels and select venues." }
          ),
        ],
      },
      {
        heading: "Diwaniya: A Genuine Living Tradition",
        blocks: [
          callout(
            "info",
            "The diwaniya — a regular gathering of men (traditionally) to discuss politics, business, and daily life — is a genuine, UNESCO-recognised Kuwaiti cultural tradition, still very much alive today. Being invited to one is a real mark of trust and hospitality.",
            "A UNESCO-Recognised Social Institution"
          ),
        ],
      },
      {
        heading: "Food",
        blocks: [
          list(
            L("Machboos", "spiced rice with meat or fish, widely considered Kuwait's national dish"),
            L("Arabic coffee (gahwa)", "served with dates, a genuine daily hospitality ritual")
          ),
        ],
      },
      {
        heading: "Landmarks",
        blocks: [
          list(
            L("Kuwait Towers", "the country's defining modern landmark, overlooking the Gulf"),
            L("The Grand Mosque", "Kuwait's largest, a genuine architectural landmark")
          ),
        ],
      },
      {
        heading: "The Teacher's Toolkit: Finding the Work",
        blocks: [
          cards(
            { title: "Go Overseas", text: "Job listings and provider reviews for Gulf-region teaching placements." },
            { title: "TEFL Org", text: "General job board resources with Kuwait-specific guidance." },
            { title: "Search Associates", text: "A respected international school recruitment platform, especially for experienced teachers." },
            { title: "Dave's ESL Café", text: "A long-running, classic ESL job board that still lists Gulf-based roles." }
          ),
        ],
      },
    ],
    pullQuote:
      "Kuwait often surprises new teachers with just how central hospitality and conversation are to daily life — the diwaniya tradition here isn't a tourist curiosity, it's a genuine, living institution.",
    pullQuoteAfter: 1,
  },
  doAndDont: [
    { do: "Accept a diwaniya invitation graciously — it's a genuine mark of trust", dont: "Bring, buy, or expect to find alcohol anywhere in Kuwait — there are genuinely no exceptions" },
    { do: "Dress modestly in public at all times", dont: "Assume Kuwait's rules mirror the UAE or Qatar — they are genuinely stricter here" },
    { do: "Build real classroom experience before applying — roughly 2 years is commonly expected", dont: "Eat or drink in public during Ramadan daylight hours" },
    { do: "Research Kuwait's fully-dry status clearly before accepting an offer", dont: "Underestimate the experience bar — this market values proven classroom time" },
  ],
  videoScript: {
    title: SCRIPT_TITLE,
    scenes: [
      {
        direction: "ZODWA, a South African teacher, arrives in Kuwait City, the Kuwait Towers catching the late afternoon light along the Gulf corniche.",
        lines: [
          { speaker: N, text: "Kuwait often surprises new teachers with just how central hospitality and conversation are to daily life — the diwaniya tradition here isn't a tourist curiosity, it's a genuine, living institution." },
          { speaker: "ZODWA (taking in the skyline)", text: "I've read about diwaniya, but I still don't fully understand it yet." },
        ],
      },
      {
        direction: "Weeks later, a colleague invites Zodwa to a family diwaniya gathering, where she's welcomed warmly into a genuine, ongoing conversation over coffee and dates.",
        lines: [
          { speaker: N, text: "Being invited to a diwaniya is a real mark of trust — a UNESCO-recognised tradition of gathering to talk, genuinely still alive today, not performed for visitors." },
        ],
      },
      {
        direction: "At a restaurant, Zodwa notices there's no alcohol on the menu at all, not even in the upscale section, and remembers reading about this before she arrived.",
        lines: [
          { speaker: "ZODWA (to herself, nodding)", text: "Right — properly, fully dry. Not like what I read about Dubai." },
          { speaker: N, text: "Worth knowing clearly — Kuwait is genuinely dry with no exceptions, unlike the UAE or Qatar, where licensed venues exist. It's a real, meaningful difference between Gulf countries." },
        ],
      },
      {
        direction: "At her new school, Zodwa's principal reviews her CV, nodding at her two years of prior classroom experience.",
        lines: [
          { speaker: N, text: "This market genuinely values proven experience — roughly two years is commonly expected, more than some neighbouring countries ask for." },
        ],
      },
      {
        direction: "Weekend — Zodwa stands beneath the towering Kuwait Towers at sunset, the Gulf stretching out beyond them.",
        lines: [
          { speaker: N, text: "And once the culture and the expectations are both understood clearly, Kuwait offers a teacher something genuinely rare — real hospitality, tax-free income, and a living tradition of conversation and trust." },
        ],
      },
    ],
  },
  debateAudio: {
    title: "IS KUWAIT RIGHT FOR YOU?",
    host1: "AMOGELANG (unsure about the fully-dry rules)",
    host2: "TUMELO (has taught in Kuwait, makes the case for it)",
    exchange: [
      { speaker: "AMOGELANG", text: "I've heard Kuwait is completely dry, no exceptions at all. Is that actually true, even compared to somewhere like Dubai?" },
      { speaker: "TUMELO", text: "Genuinely true, and it's worth understanding clearly before you go. Unlike the UAE or Qatar, where licensed hotels and venues serve alcohol, Kuwait has no exceptions anywhere. It's a real, meaningful difference between Gulf countries, not a minor detail." },
      { speaker: "AMOGELANG", text: "What's diwaniya, and why does it come up so much?" },
      { speaker: "TUMELO", text: "It's a genuine, UNESCO-recognised tradition — regular gatherings to talk, share coffee, and build real community. Being invited to one is a real mark of trust, and it says a lot about how seriously hospitality is taken here." },
      { speaker: "AMOGELANG", text: "Is it hard to actually get hired?" },
      { speaker: "TUMELO", text: "Genuinely more competitive than some neighbouring markets — around two years of classroom experience is commonly expected. Worth building that up before applying if you can." },
      { speaker: "AMOGELANG", text: "So, worth it overall?" },
      { speaker: "TUMELO", text: "Genuinely, yes — tax-free income, real hospitality, and a culture that takes conversation and trust seriously. Just go in fully clear on the fully-dry reality and the experience bar." },
    ],
  },
  closingEquation: {
    heading: "The Kuwait Equation",
    content:
      "Kuwait rewards teachers who arrive genuinely informed: clear on the fully-dry reality, ready with real classroom experience, and open to the deep hospitality of diwaniya culture. Go in prepared, and Kuwait offers real financial reward and a genuine tradition of trust and conversation.",
  },
  jobPortalCTA: cta("Kuwait", "KW"),
};

const laos: Country = {
  slug: "laos",
  name: "Laos",
  code: "LA",
  region: "Asia",
  flagEmoji: "🇱🇦",
  tagline:
    "No recruiter gatekeepers, direct department outreach, and a document chain that genuinely differs from most other countries — a complete guide with Reading, Video, and Audio.",
  statBadges: [
    { value: "Not Hague", label: "Full Legalisation Required" },
    { value: "$500-1,500/mo", label: "Language Centres & NGOs" },
    { value: "$40-46K/yr", label: "International School Packages" },
  ],
  guideContents: [
    "Reading — the real document chain, a direct contact directory, and a 6-month playbook",
    GUIDE_VIDEO,
    "Debate Audio — two hosts weighing whether Laos is the right fit for you",
  ],
  reading: {
    quickFacts: [
      "Laos has no large formal recruitment pipeline — the market rewards direct outreach, not competing in a system you're locked out of",
      "Salaries: US$500-1,500/month at language centres and NGOs; international school packages can reach US$40,000-46,000/year plus housing, insurance, and flights",
      "Myanmar is excluded from this guide entirely, per current “Do Not Travel” advisories — this guide covers Laos only",
    ],
    sections: [
      {
        heading: "The Document Chain: Laos Is Genuinely Different",
        blocks: [
          callout(
            "warn",
            "Unlike most countries in this guide series, a simple apostille will not work here. Documents require full consular legalisation instead — a longer, more involved process. Start this chain 4-6 months before you intend to travel.",
            "Laos Is NOT a Hague Apostille Convention Member"
          ),
          steps(
            { label: "SAQA verification letter for your degree and transcripts", text: "25+ working days" },
            { label: "SACE registration certificate", text: "name must match your passport exactly" },
            { label: "SAPS Police Clearance Certificate", text: "2-4 weeks, valid only 6 months, time it carefully" },
            { label: "120-hour accredited TEFL/TESOL certificate", text: "" },
            { label: "DIRCO Certificate of Authentication (Legalisation Section, Pretoria)", text: "6-8 weeks, originals only, certified copies are rejected" },
            { label: "Legalisation by a Lao diplomatic mission, by courier or agent", text: "Laos has no resident embassy in South Africa" }
          ),
          text("Budget: approximately R5,000-8,000+. Total timeline: 3-6 months."),
        ],
      },
      {
        heading: "Direct Contact Directory",
        blocks: [
          text("Laos rewards candidates who approach the right departments and schools directly, rather than waiting for a recruiter:"),
          cards(
            { title: "Ministry of Education and Sports (MoES)", text: "No. 1 Lanexang Avenue, Vientiane. Tel: +856 21 216 004. moes.edu.la" },
            { title: "MoES Education Coordination Unit (ECU)", text: "Correct entry point for foreign educators. Tel: +856 21 243672 / 020 5459 5936. Email: ecu.moes.laopdr@gmail.com" },
            { title: "MoES Dept. of Higher Education", text: "For university-level teaching. Tel: +856 20 212 019" },
            { title: "Australian International School of Laos", text: "Direct applications: admin.manager@aisedulaos.com. Provides work visa + residence permit; welcomes newly qualified teachers." },
            { title: "Vientiane International School (IB)", text: "Applies via Tes Jobs. August-start hiring closes around December the prior year." }
          ),
        ],
      },
      {
        heading: "The Six-Month Direct-Application Playbook",
        blocks: [
          steps(
            { label: "MONTHS 1-2", text: "SAQA verification, SAPS clearance application, SACE certificate copy, enrol in a 120-hour TEFL." },
            { label: "MONTHS 2-3", text: "DIRCO authentication; courier legalisation to the Lao mission; build a 2-page international teaching CV plus tailored cover letter." },
            { label: "MONTHS 3-4", text: "Email schools and the MoES ECU directly, one PDF attachment (CV, degree, TEFL, clearance, references). Follow up once after 10 working days." },
            { label: "MONTHS 4-6", text: "Interview plus a 20-minute demo lesson. International schools hire October-January for an August start; language centres hire year-round." }
          ),
        ],
      },
      {
        heading: "What Employers Actually Expect",
        blocks: [
          list(
            T("Bachelor's degree in education or English-related field; BEd/PGCE especially strong for international schools"),
            T("Recognised TEFL/TESOL/CELTA/PGCE, 120-hour minimum"),
            T("South African English-medium training is a genuine asset; offer IELTS if requested"),
            T("Multilingual classroom experience — a daily South African reality — is worth making explicit on your CV"),
            T("Modest dress near monasteries, returning the nop greeting, and genuine patience are all noticed")
          ),
        ],
      },
      {
        heading: "Honest Caveats",
        blocks: [
          list(
            T("Verify all phone numbers before relying on them — Lao government contacts change; call MoES to confirm the ECU desk"),
            T("The ECU email is a donor-liaison desk, not a jobs board — use it to ask which office handles foreign teacher accreditation"),
            T("“Native speaker” preference exists, but at least one major Vientiane international school explicitly welcomes newly qualified, non-native teachers with strong qualifications — pitch qualifications, not accent"),
            T("Never accept a role proposing long-term teaching on a tourist visa"),
            T("Arrive with meaningful savings — pay can be unpredictable even when hired directly")
          ),
        ],
      },
    ],
    pullQuote:
      "Laos often surprises new teachers with how much the process rewards initiative — this isn't a market you wait to be discovered in, it's one you write directly into.",
    pullQuoteAfter: 1,
  },
  doAndDont: [
    { do: "Start your document legalisation chain 4-6 months before travelling", dont: "Assume an apostille alone will work — Laos requires full consular legalisation" },
    { do: "Email schools and the MoES ECU directly with one clean PDF attachment", dont: "Submit certified copies to DIRCO — originals only are accepted" },
    { do: "Time your SAPS clearance carefully — it's only valid 6 months", dont: "Accept a role proposing long-term work on a tourist visa" },
    { do: "Arrive with meaningful savings, since pay timing can be unpredictable", dont: "Assume the ECU email is a jobs board — it's a liaison desk, use it to ask the right question" },
  ],
  videoScript: {
    title: SCRIPT_TITLE,
    scenes: [
      {
        direction: "NOMSA, a South African teacher, stands outside the Ministry of Education and Sports building on Lanexang Avenue, a folder of documents held carefully under her arm.",
        lines: [
          { speaker: N, text: "Laos often surprises new teachers with how much the process rewards initiative — this isn't a market you wait to be discovered in, it's one you write directly into." },
          { speaker: "NOMSA (checking her folder)", text: "Degree, SACE, TEFL, clearance — all legalised, not just apostilled. Took months to get here." },
        ],
      },
      {
        direction: "Months earlier, in flashback — Nomsa on a call with a legalisation agent, carefully noting down each step of the process on a printed checklist.",
        lines: [
          { speaker: N, text: "Laos genuinely isn't part of the Hague Apostille Convention — documents need full consular legalisation instead, start to finish, usually three to six months. Worth beginning this early, not scrambling later." },
        ],
      },
      {
        direction: "At a café in Vientiane, Nomsa reviews an email she's drafting to a school's admin manager, attaching a single clean PDF with her CV, degree, TEFL certificate, and references.",
        lines: [
          { speaker: "NOMSA (reading it over, satisfied)", text: "One PDF, one clear subject line. Let's see." },
          { speaker: N, text: "Direct outreach genuinely works here — a well-documented, professional application to the right department or school stands out precisely because so few candidates take this route seriously." },
        ],
      },
      {
        direction: "Weeks later, Nomsa teaches a demo lesson at an international school, her multilingual classroom experience from South Africa clearly resonating with the interview panel.",
        lines: [
          { speaker: N, text: "And once the paperwork is behind you, Laos offers a teacher something genuinely rare — a market that rewards real preparation and initiative, in one of Southeast Asia's most understated, welcoming countries." },
        ],
      },
    ],
  },
  debateAudio: {
    title: "IS LAOS RIGHT FOR YOU?",
    host1: "PALESA (worried about the lack of a formal recruitment system)",
    host2: "REABETSWE (has researched Laos deeply, makes the case for it)",
    exchange: [
      { speaker: "PALESA", text: "Laos doesn't seem to have a big formal recruitment pipeline like some other countries. Doesn't that make it harder to actually get hired?" },
      { speaker: "REABETSWE", text: "It's a genuinely different kind of market, but not necessarily harder — it means South Africans aren't competing inside a system built around other nationalities. The advantage goes to whoever approaches the right departments and schools directly, properly documented." },
      { speaker: "PALESA", text: "What's the one thing that catches people off guard about the paperwork?" },
      { speaker: "REABETSWE", text: "That Laos isn't part of the Hague Apostille Convention. A simple apostille genuinely won't work — documents need full consular legalisation, which takes three to six months from start to finish. Budget real time for this." },
      { speaker: "PALESA", text: "Is it worth pursuing the native-speaker angle, or does that limit South Africans?" },
      { speaker: "REABETSWE", text: "A native-speaker preference genuinely exists, but at least one major international school in Vientiane explicitly welcomes newly qualified, non-native teachers with strong qualifications. The real advice is to pitch your qualifications, not your accent." },
      { speaker: "PALESA", text: "What should someone genuinely avoid?" },
      { speaker: "REABETSWE", text: "Never accept a role built around a tourist visa — and arrive with real savings, since pay can be unpredictable even in a legitimate, direct-hire role." },
      { speaker: "PALESA", text: "So, worth it overall?" },
      { speaker: "REABETSWE", text: "Genuinely, yes, for the right person — someone willing to do the document work properly and reach out directly. Laos rewards exactly that kind of preparation." },
    ],
  },
  closingEquation: {
    heading: "The Laos Equation",
    content:
      "Laos rewards teachers who do the unglamorous work properly: the full legalisation chain, direct and professional outreach to the right departments, and genuine patience with an informal, relationship-driven market. Do that groundwork, and Laos offers a genuine, understated opportunity most other candidates never even attempt.",
  },
  jobPortalCTA: cta("Laos", "LA"),
};

const mexico: Country = {
  slug: "mexico",
  name: "Mexico",
  code: "MX",
  region: "Americas",
  flagEmoji: "🇲🇽",
  tagline:
    "A TEFL certificate that legally counts toward your visa, and a celebration of memory too often misunderstood — a complete guide with Reading, Video, and Audio.",
  statBadges: [
    { value: "TEFL = Degree", label: "For Visa Purposes, Uniquely" },
    { value: "180 Days", label: "FMM Tourist Entry Window" },
    { value: "Not Halloween", label: "Día de los Muertos, Truly" },
  ],
  guideContents: [
    "Reading — culture, food, landmarks, the real visa process, and correcting a common myth",
    GUIDE_VIDEO,
    "Debate Audio — two hosts weighing whether Mexico is the right fit for you",
  ],
  reading: {
    quickFacts: [
      "Mexico City is the largest hub, with genuine demand also in Guadalajara and coastal cities",
      "One of the few countries where a TEFL certificate can legally substitute for a degree on the work visa",
      "International and bilingual K-12 schools still genuinely expect a degree plus real experience",
    ],
    sections: [
      {
        heading: "A Genuinely Unique Visa Advantage",
        blocks: [
          callout(
            "success",
            "Mexican law allows a TEFL certificate to substitute for a bachelor's degree specifically for work visa purposes — a genuine rarity among the countries in this guide series. This opens real doors for career-changers without a formal teaching degree. Note: international and bilingual K-12 schools still typically want a degree and real classroom experience, regardless of this visa flexibility.",
            "TEFL Certificate as Legal Degree Substitute"
          ),
        ],
      },
      {
        heading: "The Visa Reality",
        blocks: [
          callout(
            "warn",
            "The Temporary Resident Visa (often still called “FM3”) is employer-sponsored. Most teachers enter on an FMM tourist permit (up to 180 days) to secure a job offer, then formally apply for the work visa — working on tourist status itself is not legally permitted. Always confirm your employer's INM registration before accepting an offer.",
            "Secure Your Offer First, Then Apply"
          ),
        ],
      },
      {
        heading: "Correcting a Common Myth",
        blocks: [
          cards(
            { title: "THE MISCONCEPTION", tone: "danger", text: "“Día de los Muertos is Mexican Halloween.” A genuinely common, and genuinely inaccurate, assumption many newcomers bring with them." },
            { title: "THE REALITY", tone: "success", text: "A UNESCO-recognised celebration of memory and family, honouring loved ones who've passed — genuinely joyful, not spooky, and deeply distinct from Halloween." }
          ),
        ],
      },
      {
        heading: "Food",
        blocks: [
          list(
            L("Tacos al Pastor", "marinated pork, pineapple, and onion, a genuine Mexico City institution"),
            L("Mole", "a rich, complex sauce with regional variations across the country")
          ),
        ],
      },
      {
        heading: "Landmarks",
        blocks: [
          list(
            L("Chichen Itza", "the iconic Maya step pyramid, a genuine UNESCO World Heritage Site"),
            L("Teotihuacan", "the vast pre-Aztec pyramid complex just outside Mexico City"),
            L("Oaxaca", "renowned for its cuisine, crafts, and vivid Día de los Muertos celebrations")
          ),
        ],
      },
      {
        heading: "The Teacher's Toolkit: Finding the Work",
        blocks: [
          cards(
            { title: "Premier TEFL", text: "Structured programme support for Mexico-specific placement and visa guidance." },
            { title: "Go Overseas", text: "Job listings and provider reviews across Mexico's major teaching hubs." },
            { title: "TEFL.org", text: "General job board resources with country-specific requirements." },
            { title: "School of TEFL", text: "Certification paired with job-search support for the Mexican market." }
          ),
        ],
      },
    ],
    pullQuote:
      "Mexico often surprises new teachers with how accessible the paperwork genuinely is — this is one of the few places where your certificate alone can carry real legal weight.",
    pullQuoteAfter: 0,
  },
  doAndDont: [
    { do: "Secure a job offer first, then formally apply for your work visa", dont: "Work on FMM tourist status alone — it is genuinely not legally permitted" },
    { do: "Confirm your employer's INM registration before accepting any offer", dont: "Call Día de los Muertos “Mexican Halloween” — it's a distinct, deeply meaningful tradition" },
    { do: "Approach Día de los Muertos as the genuine celebration of memory it is", dont: "Assume every school accepts a TEFL certificate in place of a degree — international schools still want both" },
    { do: "Bring a degree if you have one — still an advantage at international schools", dont: "Skip verifying your employer's visa sponsorship capability in writing" },
  ],
  videoScript: {
    title: SCRIPT_TITLE,
    scenes: [
      {
        direction: "A South African teacher stands before the Maya step pyramid at Chichen Itza, morning light catching the ancient stonework.",
        lines: [
          { speaker: N, text: "Mexico often surprises new teachers with how accessible the paperwork genuinely is — this is one of the few places where your certificate alone can carry real legal weight." },
        ],
      },
      {
        direction: "Weeks earlier, in flashback, the teacher reviews her FMM tourist permit alongside her TEFL certificate, confirming with her new employer that it will substitute for a degree on her visa application.",
        lines: [
          { speaker: N, text: "Mexican law genuinely allows a TEFL certificate to substitute for a bachelor's degree, specifically for work visa purposes — a real advantage for career-changers. Secure your job offer first, on your FMM tourist entry, then apply for the proper Temporary Resident Visa." },
        ],
      },
      {
        direction: "At a staff room in late October, a Mexican colleague gently explains the meaning behind an ofrenda being set up nearby, photos of family members carefully arranged.",
        lines: [
          { speaker: N, text: "Día de los Muertos is genuinely not “Mexican Halloween” — it's a UNESCO-recognised celebration of memory and family, joyful and deeply meaningful, worth approaching with real respect." },
        ],
      },
      {
        direction: "Weekend — the teacher walks through Oaxaca's markets, vivid marigolds and handcrafted skulls on display ahead of the coming celebrations.",
        lines: [
          { speaker: N, text: "And once the paperwork is properly sorted, Mexico offers a teacher something genuinely rare — real accessibility, extraordinary history, and traditions worth understanding on their own terms." },
        ],
      },
    ],
  },
  debateAudio: {
    title: "IS MEXICO RIGHT FOR YOU?",
    host1: "ZINTLE (unsure about the visa process)",
    host2: "MPHO (has taught in Mexico, makes the case for it)",
    exchange: [
      { speaker: "ZINTLE", text: "I heard you don't even need a degree to teach legally in Mexico. Is that actually true?" },
      { speaker: "MPHO", text: "Genuinely, yes, for work visa purposes specifically — Mexican law allows a TEFL certificate to substitute for a bachelor's degree. It's a real rarity among the countries we cover. Worth noting though, international and bilingual K-12 schools still typically want a degree and real experience regardless." },
      { speaker: "ZINTLE", text: "How does the actual visa process work?" },
      { speaker: "MPHO", text: "Most teachers enter on an FMM tourist permit, up to 180 days, to secure a job offer first. Then you formally apply for the Temporary Resident Visa, employer-sponsored. Working on tourist status itself genuinely isn't legally permitted." },
      { speaker: "ZINTLE", text: "What's the one cultural thing people misunderstand most?" },
      { speaker: "MPHO", text: "Día de los Muertos, without question. It's genuinely not Mexican Halloween — it's a UNESCO-recognised celebration of memory and family, and treating it as a spooky costume holiday genuinely misses the point." },
      { speaker: "ZINTLE", text: "So, worth it overall?" },
      { speaker: "MPHO", text: "Genuinely, yes — the visa flexibility alone makes Mexico one of the more accessible markets out there, and the culture and history are extraordinary once you approach them with real respect." },
    ],
  },
  closingEquation: {
    heading: "The Mexico Equation",
    content:
      "Mexico rewards teachers who take advantage of its genuine accessibility while getting the sequence right: job offer first, then the proper visa — and who approach the country's traditions on their own real terms. Get both right, and Mexico offers one of the most accessible, culturally rich teaching markets in Latin America.",
  },
  jobPortalCTA: cta("Mexico", "MX"),
};

// ---- Dossier-format guides -------------------------------------------------
// These come from a different PDF series (no Video Script / Debate Audio, no
// "What's In This Guide" list), so those fields are intentionally omitted.

const qatar: Country = {
  slug: "qatar",
  name: "Qatar",
  code: "QA",
  region: "Middle East",
  flagEmoji: "🇶🇦",
  heading: "Teaching in Qatar: The Quiet Oasis",
  tagline:
    "A definitive playbook for educators from South Africa, the UK, Ireland, Australia, New Zealand, Canada, and the US seeking extreme personal safety, institutional prestige, and high-tier tax-free compensation in Doha.",
  statBadges: [
    { value: "Doha Central Hub", label: "World-class cultural landmarks & premier schools" },
    { value: "English Primary", label: "Instruction language across elite academies" },
    { value: "Full Package Norm", label: "Tax-free salary, flights, housing & healthcare" },
    { value: "South African Friendly", label: "Recognized passport pool for tier-1 hiring" },
  ],
  guideContents: [],
  reading: {
    quickFacts: [],
    sections: [
      {
        heading: "The Cultural Dichotomy: Bustle vs. Understated Structure",
        blocks: [
          cards(
            {
              title: "The Conflation: The Loud Scene",
              tone: "warn",
              text: "The Myth: Often confused with Dubai's nightlife-heavy, consumerist pace.\nThe Misconception: Fear that a conservative monarchy translates to social isolation or severe confinement.\nThe Reality: If your priority is nonstop clubbing and high-octane spectacle, Qatar will feel misaligned with your lifestyle expectations.",
            },
            {
              title: "The Oasis: Quiet Wealth & Family Safety",
              tone: "success",
              text: "The Reality: An understated, ultra-safe society engineered for calm and professional focus.\nThe Environment: Unrivaled public safety, world-class healthcare, and deeply structured community living.\nThe Verdict: Qatar trades superficial buzz for authentic stability, prestige, and generational savings potential.",
            }
          ),
        ],
      },
      {
        heading: "The Desert Rhythm: Daily Schedule Architecture",
        blocks: [
          cards(
            {
              title: "The 6:30 AM Desert Dawn Start",
              text: "School days start early before the sun is fully up to beat midday heatwaves. Staff meetings and intensive instruction occur in temperature-controlled, state-of-the-art facilities.\nSchool Hours: Typically conclude between 1:30 PM and 2:30 PM.",
            },
            {
              title: "The Sunset Reawakening & Karak Ritual",
              text: "As the heat breaks at dusk, public life begins. Evenings center on strolls along the Corniche, social dinners in Souq Waqif, and hot cups of spiced Karak tea.\nCommunity Life: Family parks, open markets, and seaside cafés.",
            }
          ),
        ],
      },
      {
        heading: "The Ecosystem of Sponsorship & Institutional Compliance",
        blocks: [
          table(
            ["LEGAL PILLAR", "OPERATIONAL MECHANISM", "EDUCATOR SAFEGUARD"],
            [
              "Sponsoring Employer",
              "Your residence permit and legal status are directly anchored to your educational institution.",
              "Ensure the contract is confirmed in writing; changing schools mid-term requires explicit sponsor approval.",
            ],
            [
              "Work Residence Permit (RP)",
              "Government-issued status allowing long-term stay, banking, housing leases, and local driving rights.",
              "Non-Negotiable: Never travel or begin classroom work before full Work RP clearance is verified.",
            ],
            [
              "Exit Permits & Travel",
              "Formal administrative coordination required by some entities prior to departing the country.",
              "Handled seamlessly by tier-1 international schools around designated academic holiday terms.",
            ]
          ),
        ],
      },
      {
        heading: "The Six-Month Runway: Document Attestation Roadmap",
        blocks: [
          cards(
            {
              title: "Dossier Assembly",
              badge: "MONTH 1",
              tone: "info",
              text: "Obtain original degrees, verified academic transcripts, professional teaching licenses, and national police clearance certificates.",
            },
            {
              title: "The Attestation Hurdle",
              badge: "MONTHS 2 – 5",
              tone: "info",
              text: "Authentication by relevant Department of Foreign Affairs / DIRCO, notary authentications, and Qatari Embassy legalization stamps.",
            },
            {
              title: "Visa Issuance & Touchdown",
              badge: "MONTH 6",
              tone: "info",
              text: "Work visa clearance approval, flight bookings, Doha airport arrival, and completion of medical checks for final Residency Permit.",
            }
          ),
          callout(
            "danger",
            "Never enter Qatar on an informal tourist visa expecting to convert to teaching employment locally. All documents must be attested beforehand, and your formal Work Residence Permit process initiated through an accredited school.",
            "CRITICAL COMPLIANCE DIRECTIVE"
          ),
        ],
      },
      {
        heading: "Workplace Diplomacy & Rules of the Realm",
        blocks: [
          cards(
            {
              title: "The Etiquette of “Saving Face”",
              text: "Gulf workplace hierarchy relies on indirect communication. Publicly criticizing leadership or colleagues in staff meetings causes irrevocable loss of face and destroys trust.\nBest Practice: Address concerns gently in private one-on-one sessions.",
            },
            {
              title: "Hospitality & Social Respect",
              text: "Accept offered Arabic coffee (Gahwa) and dates with your right hand. Greet the most senior person first. With female nationals, wait for a hand to be extended; otherwise, offer a nod.\nSocial Norm: Modest dress required in public spaces. Alcohol strictly in licensed hotels.",
            }
          ),
        ],
      },
      {
        heading: "Life in Doha: Heritage, Gastronomy & Leisure",
        blocks: [
          cards(
            { title: "Art & Heritage", text: "Museum of Islamic Art: I.M. Pei masterpiece. Explore Katara Cultural Village and the National Museum." },
            { title: "Living Tradition", text: "Souq Waqif: Historic bazaar with artisan stalls, traditional spices, and historic falconry hospital quarters." },
            { title: "Signature Cuisine", text: "Feast on spiced Machboos, breakfast Balaleet, and daily brewed spiced cardamom Karak." }
          ),
        ],
      },
      {
        heading: "Target Placement Channels",
        blocks: [
          cards(
            { title: "Search Associates", text: "Premier international school hiring fairs" },
            { title: "TEFL Org Jobs", text: "Dedicated language academy listings" },
            { title: "Go Overseas", text: "School reviews & direct teach-abroad programs" },
            { title: "Dave's ESL Café", text: "Established Gulf academic job boards" }
          ),
        ],
      },
    ],
  },
  doAndDont: [],
  closingEquation: {
    heading: "Strictness is the Feature, Not the Bug",
    content: "The thorough paperwork builds the foundation for unparalleled safety, prestige, and financial peace.",
  },
  jobPortalCTA: cta("Qatar", "QA"),
};

const saudiArabia: Country = {
  slug: "saudi-arabia",
  name: "Saudi Arabia",
  code: "SA",
  region: "Middle East",
  flagEmoji: "🇸🇦",
  heading: "Teaching in Saudi Arabia: The Modern Blueprint",
  tagline:
    "The comprehensive orientation guide to navigating Vision 2030, rapid social modernization, and the Kingdom's lucrative, tier-1 teaching market for international educators from South Africa and worldwide.",
  statBadges: [
    { value: "Vision 2030 Driven", label: "Mandatory English curriculum from primary school" },
    { value: "Premium Earnings", label: "Tax-free salary, flight allowances & housing" },
    { value: "Ultra-Low Crime", label: "Consistently ranked among the safest global environments" },
    { value: "BA + 120h TEFL", label: "Mandatory non-negotiable baseline for visa issuance" },
  ],
  guideContents: [],
  reading: {
    quickFacts: [],
    sections: [
      {
        heading: "The Engine of Opportunity: Conservative Roots Meets Rapid Reform",
        blocks: [
          cards(
            {
              title: "Deep Islamic Heritage",
              text: "Cultural Bedrock: Rooted in historic Islamic traditions, tight-knit family honor, and profound hospitality.\nWorld Heritage: Home to eight UNESCO sites, including the ancient Nabataean tombs of Hegra (AlUla).\nSocial Etiquette: Gracious hospitality (Qahwa & dates) and mutual modesty remain the core social standard.",
            },
            {
              title: "The Vision 2030 Evolution",
              text: "Economic Shift: National mandate expanding beyond oil into tourism, logistics, and global commerce.\nMajor Reforms: Reopened public cinemas, major entertainment/concerts, and women driving (2018 onward).\nPublic Spaces: Significant relaxation of mandatory abayas and strict gender-segregated zoning.",
            }
          ),
        ],
      },
      {
        heading: "Primary Hubs: Where Modern Education Meets Heritage",
        blocks: [
          cards(
            {
              title: "Riyadh",
              badge: "THE CAPITAL HUB",
              tone: "info",
              text: "Financial center with dense international school networks. Features the mud-brick Masmak Fortress, At-Turaif (Diriyah), and the Kingdom Centre.",
            },
            {
              title: "Jeddah",
              badge: "THE COASTAL METROPOLIS",
              tone: "info",
              text: "Cosmopolitan Red Sea coastal hub. Gateway city famous for Al-Balad's UNESCO-listed coral architecture and relaxed coastal lifestyle.",
            },
            {
              title: "AlUla & Hegra",
              badge: "CULTURAL HERITAGE SITE",
              tone: "info",
              text: "Breathtaking desert living steeped in ancient Nabataean civilization. An emerging epicenter of global eco-tourism and cultural projects.",
            }
          ),
        ],
      },
      {
        heading: "The Peninsula Table: Foundations of Saudi Hospitality",
        blocks: [
          table(
            ["DISH / TRADITION", "DESCRIPTION & ORIGIN", "CULTURAL MEANING"],
            [
              "Qahwa & Dates",
              "Cardamom-infused Arabic coffee served warm in traditional finjan cups with premium dates.",
              "Universal symbol of hospitality; accept graciously with your right hand.",
            ],
            [
              "Kabsa & Mandi",
              "Spiced meat and rice national dishes; Mandi is traditionally slow-cooked in underground fire pits.",
              "Centerpiece of communal gatherings, family honor, and banquets.",
            ],
            [
              "Saleeg & Matazeez",
              "Saleeg: Hijazi creamy broth-rice dish. Matazeez: Najdi dumpling stew with tender vegetables.",
              "Regional comfort staples highlighting rich geographic diversity.",
            ]
          ),
        ],
      },
      {
        heading: "The Classroom Access Matrix: Navigating Gender Dynamics",
        blocks: [
          cards(
            {
              title: "Male Educators",
              text: "Classroom Access: Restricted primarily to boys' schools, male colleges, and corporate training divisions.\nNot permitted to teach girls or female university classes in traditional public streams.",
            },
            {
              title: "Female Educators",
              text: "Dual Market Access: Highly sought after across female educational tiers and primary/elementary co-educational stages.\nEnjoys broader versatility across both early-years boys and all-female institutes.",
            }
          ),
        ],
      },
      {
        heading: "The Professional Pipeline: Attestation, Qiwa & Iqama",
        blocks: [
          cards(
            {
              title: "Sponsorship & Attestation",
              badge: "STEP 1 & 2: PRE-ARRIVAL",
              tone: "info",
              text: "Secure signed contract. Complete degree attestation, police clearances, and medical check authenticated via Saudi Cultural Attache / Embassy.",
            },
            {
              title: "Government Platform",
              badge: "STEP 3: MOFA & QIWA",
              tone: "info",
              text: "Your sponsoring school issues government visa slips via MoFA and initiates digital contract binding through the national Qiwa platform.",
            },
            {
              title: "Iqama Issuance",
              badge: "STEP 4: IN-COUNTRY",
              tone: "info",
              text: "Arrive in KSA on entry visa, complete in-country finger-printing and blood labs to receive official Iqama (Civil Residency Card).",
            }
          ),
          callout(
            "warn",
            "Saudi Arabia is not a backpacker TEFL market. Online, non-accredited certificates are strictly denied. A Bachelor's Degree from an accredited institution and an in-person or 120+ hour verified TEFL/CELTA are legal baselines.",
            "PREMIUM MARKET COMPLIANCE"
          ),
        ],
      },
      {
        heading: "Verified Sourcing & Recruitment Channels",
        blocks: [
          cards(
            { title: "Search Associates", text: "Elite international school hiring fairs" },
            { title: "TEFL Org Jobs", text: "Verified KSA academy & university positions" },
            { title: "Go Overseas", text: "Alumni reviews & vetted provider listings" },
            { title: "Qiwa / MoFA", text: "Official Saudi government visa portals" }
          ),
        ],
      },
    ],
  },
  doAndDontHeading: "The Cultural Etiquette Grid: Respect vs. Strict Prohibitions",
  doAndDont: [
    { do: "Dress conservatively and respectfully in all public facilities.", dont: "Zero Alcohol / Pork: Both substances are strictly prohibited under national law." },
    { do: "Accept hospitality warmly if invited into a local home (honored custom).", dont: "No PDA: Avoid public displays of affection; respect community decorum." },
    { do: "Confirm full package details (housing, airfare, health coverage) in writing.", dont: "No Unauthorized Photography: Never film or photograph locals without permission." },
  ],
  closingEquation: {
    heading: "Strict Cultural Roots. Rapid Modernization. Lucrative Rewards.",
    content: "For qualified educators committed to cultural respect, KSA offers an unparalleled career launchpad.",
  },
  jobPortalCTA: cta("Saudi Arabia", "SA"),
};

const uae: Country = {
  slug: "uae",
  name: "UAE",
  code: "AE",
  region: "Middle East",
  flagEmoji: "🇦🇪",
  heading: "Teaching in the UAE: Modern Horizons & Ancient Roots",
  tagline:
    "Where futuristic skylines meet timeless Bedouin traditions. A comprehensive orientation to tax-free earning potential, global multicultural classrooms, and cultural compliance.",
  statBadges: [
    { value: "7 Emirates", label: "Federation Hubs" },
    { value: "Expat-Majority", label: "Global Demographics" },
    { value: "0% Tax", label: "Personal Income Tax" },
    { value: "English", label: "Workplace Standard" },
  ],
  guideContents: [],
  reading: {
    quickFacts: [],
    sections: [
      {
        heading: "1. The Operational Reality",
        blocks: [
          cards(
            {
              title: "The Federation Landscape",
              text: "Comprising seven emirates, with Dubai and Abu Dhabi (the capital) serving as primary educational epicenters. Powered by a multicultural expat majority, English is the dominant working language of international schooling.",
            },
            {
              title: "The Modern Work Week",
              text: "Schools operate across a modern Sunday to Thursday working schedule, with Friday and Saturday observed as the weekend, allowing ample time for personal restoration and community events.",
            },
            {
              title: "Architectural Anchors",
              text: "• Burj Khalifa (Dubai): World's tallest tower defining modern engineering.\n• Louvre Abu Dhabi: Landmark cultural institution on Saadiyat Island.\n• Sheikh Zayed Grand Mosque: Masterpiece of white marble craftsmanship.\n• Al Fahidi & Al Ain: Historic wind-tower heritage and UNESCO-listed oases.",
            }
          ),
          quote(
            "It’s bigger than the photos. The UAE is reinventing itself in real-time, built on expatriate energy sitting atop centuries-old hospitality.",
            "Sipho, South African Educator"
          ),
        ],
      },
      {
        heading: "2. Hospitality & The Public Boundary",
        blocks: [
          text("The Sacred Ritual of Gahwa (Arabic Coffee) — Serving gahwa alongside dates is a time-honored gesture of respect:"),
          cards(
            { title: "One-Third Pour", text: "Poured 1/3 full—a deliberate mark of honor, never stinginess." },
            { title: "The Refill Loop", text: "Refilled continuously until you gently tilt/shake the cup." },
            { title: "Date Pairing", text: "Always presented with fresh dates as a gesture of welcome." }
          ),
          cards({
            title: "Public vs. Private Boundaries",
            text: "• The Public Sphere: Conservative modesty is strictly expected across shopping malls, civic avenues, and workplaces. Public displays of affection beyond modest hand-holding are frowned upon.\n• Licensed & Private Venues: Beachwear and relaxed social norms apply strictly within private pools, hotel resorts, and licensed establishments.\n• Ramadan Protocol: Public eating, drinking, and smoking during daylight hours are paused out of respect, including by non-Muslim educators.",
          }),
          text("The Local Plate & Global Cuisine"),
          list(
            L("Machboos", "Fragrant spiced rice with meat or fish and loomi (dried lime)."),
            L("Harees", "Slow-cooked cracked wheat and meat, essential for festivities."),
            L("Luqaimat", "Crispy golden fried dumplings drizzled in sweet date syrup."),
            L("Karak", "Spiced black milk tea anchoring morning and afternoon breaks.")
          ),
        ],
      },
      {
        heading: "3. The Educator's Calculus: The Draw vs. The Trade-Off",
        blocks: [
          table(
            ["DIMENSION", "THE COMPELLING DRAW", "THE NECESSARY TRADE-OFF"],
            ["Tax-Free Earnings", "Zero personal income tax, maximizing net monthly take-home pay.", "High cost of living and soaring housing rents—especially in central Dubai."],
            ["Climate & Seasons", "Deeply pleasant, sunny, and temperate outdoor winter season (Nov–Apr).", "Intense summer heat (May–Sep) drastically restricting outdoor activities."],
            ["Community Dynamic", "Warm, diverse expatriate peer network; friendships form quickly.", "Transient cycle with high expatriate turnover as colleagues rotate out."],
            ["Professional Standard", "World-class school facilities and well-resourced multinational classrooms.", "Rigid administrative hierarchies, strict punctuality, and compliance reviews."]
          ),
        ],
      },
      {
        heading: "4. Contract Anatomy: Look Beyond the Headline",
        blocks: [
          text("The Full Package Triangle — A lucrative tax-free salary headline means little without contractual guarantees. Verify that your formal written offer includes:"),
          steps(
            { label: "Housing Support", text: "Provided accommodation or adequate housing allowance." },
            { label: "Annual Relocation Flights", text: "Round-trip home airfare allowances." },
            { label: "Comprehensive Medical", text: "Full-coverage healthcare insurance." }
          ),
          callout(
            "warn",
            "Never relocate based on verbal representations. Ensure all housing provisions, flight allocations, and end-of-service gratuities are finalized in writing before departure.",
            "The Golden Contract Rule"
          ),
        ],
      },
      {
        heading: "5. Classroom Pedagogy & Hierarchy",
        blocks: [
          list(
            L("Global Demographics", "You will teach students from dozens of national backgrounds in an environment valuing multicultural empathy."),
            L("Institutional Respect", "Strict deference to school directors and heads of department is expected; align with administrative decisions professionally."),
            L("Punctuality & Readiness", "Timing is non-negotiable. Punctuality in meetings and classroom management forms the foundation of professional trust.")
          ),
          quote(
            "Go in blind, and the same things become the culture shock everyone complains about. Go in prepared, and it delivers exactly what people post about.",
            "Kabelo, UAE International Teacher"
          ),
        ],
      },
    ],
  },
  doAndDontHeading: "6. Rules of Engagement: Code of Conduct",
  doAndDont: [
    { do: "Dress modestly in public spaces, shopping centers, and campuses.", dont: "Engage in public displays of affection beyond simple hand-holding." },
    { do: "Observe public daylight fasting customs during Ramadan with respect.", dont: "Consume alcohol outside of officially licensed hotels or private spaces." },
    { do: "Carefully calculate your specific emirate's living and rental costs.", dont: "Assume Dubai's rental overhead applies equally across all 7 emirates." },
    { do: "Accept gahwa and dates graciously as an honored personal welcome.", dont: "Treat conservative cultural norms or legal statutes as optional guidelines." },
  ],
  closingEquation: {
    heading: "Navigate the UAE with World Teachers Academy",
    content:
      "Master document attestation, evaluate international school packages across Dubai and Abu Dhabi, and launch your tax-free teaching career with confidence.",
  },
  jobPortalCTA: cta("UAE", "AE"),
};

const spain: Country = {
  slug: "spain",
  name: "Spain",
  code: "ES",
  region: "Europe",
  flagEmoji: "🇪🇸",
  heading: "Spain: The Teacher's Dossier",
  tagline:
    "Culture, visa pathways, and real-world logistics for South African educators. Experience immersive Spanish living, connection-driven schedules, and verified legal entry routes.",
  statBadges: [
    { value: "€700 – €1,000/mo", label: "Auxiliar cultural-immersion stipend" },
    { value: "12 – 16 Hours/wk", label: "Part-time language assistant timetable" },
    { value: "17 Autonomous Regions", label: "45 UNESCO sites & co-official languages" },
    { value: "BA + TEFL Norm", label: "Universal qualification baseline" },
  ],
  guideContents: [],
  reading: {
    quickFacts: [],
    sections: [
      {
        heading: "A Different Relationship to Time: Connection Over Schedule",
        blocks: [
          cards(
            {
              title: "The Iberian Daily Rhythm",
              text: "Late-Hour Dining: Dinner rarely begins before 9:00 PM or 10:00 PM. Restaurants don't operate on 6:00 PM schedules.\nExtended Midday Pause: Lunch runs between 2:00 PM and 3:30 PM, serving as the substantive culinary center of the day.\nConnection First: Life revolves around relational warmth, casual terrace gatherings, and unwushed public pacing.",
            },
            {
              title: "The Art of Sobremesa",
              text: "Lingering at the Table: The revered custom of conversing long after the meal ends; the invisible ingredient of Spanish food culture.\nSocial Rituals: Two cheek-kisses as the standard greeting; vibrant evening tapas runs jumping between local neighborhood bars.\nSacred Sundays: Long, inviolable Sunday lunches uniting extended multi-generational families.",
            }
          ),
        ],
      },
      {
        heading: "Heritage & The Regional Divide",
        blocks: [
          cards(
            {
              title: "Barcelona",
              badge: "CATALONIA EPICENTER",
              tone: "info",
              text: "Antoni Gaudí's awe-inspiring La Sagrada Família, whimsical Park Güell, Catalan bilingualism, and cosmopolitan Mediterranean life.",
            },
            {
              title: "Granada & Seville",
              badge: "ANDALUSIA HEART",
              tone: "info",
              text: "The sublime Moorish palaces of The Alhambra, passionate 15th-century UNESCO Flamenco heritage, and warm southern living.",
            },
            {
              title: "Madrid & Beyond",
              badge: "CENTRAL HUB",
              tone: "info",
              text: "Vibrant academy network, historic plazas, bustling nightlife, alongside distinct regions like the Basque Country and Galicia.",
            }
          ),
          callout(
            "warn",
            "Treat an assistant placement as an enriching, low-stress cultural-immersion gap year rather than a high-income corporate move. Auxiliar roles grant a modest stipend (€700–€1,000) under a student visa, not an employer-sponsored work contract.",
            "THE PROFESSIONAL REALITY CHECK"
          ),
        ],
      },
      {
        heading: "Program Eligibility: Avoiding the NALCAP Dead-End",
        blocks: [
          cards(
            {
              title: "The Blocked Path: NALCAP",
              tone: "danger",
              text: "Specifically Restricted: Despite heavy marketing online, NALCAP is exclusively open to North American (US & Canadian) passport holders.\nSouth African applicants must NOT waste valuable time applying here.",
            },
            {
              title: "The Open Doors for South Africans",
              tone: "success",
              text: "BEDA, ConversaSpain & Auxiliares: Officially open to South Africans via confirmed bilateral accords, placing teachers in Madrid, Catholic schools, and regional public networks.\nRoute your ambition to confirmed, eligible program gateways.",
            }
          ),
        ],
      },
      {
        heading: "Teaching Routes in Spain: Comparative Matrix",
        blocks: [
          table(
            ["FEATURE", "OFFICIAL AUXILIARES", "BEDA / CONVERSASPAIN", "PRIVATE ACADEMIES"],
            ["South African Eligibility", "Yes (Bilateral accord)", "Yes (Explicitly recognized)", "Yes (Requires work visa)"],
            ["Role & Setting", "Public & semi-private schools", "Catholic (BEDA) & public schools", "Independent language schools"],
            ["Time Commitment", "Part-time (12–16 hrs/week)", "Part-time (12–20 hrs/week)", "Full-time / Flexible schedules"],
            ["Compensation", "€700 – €1,000 monthly stipend", "€700 – €1,000 monthly stipend", "Higher, stable professional salary"],
            ["Legal Visa Framework", "Non-EU Student Visa", "Non-EU Student Visa", "Employer-Sponsored Work Visa"]
          ),
        ],
      },
      {
        heading: "Verified Sourcing Portals",
        blocks: [
          cards(
            { title: "Ministry Portal", text: "educacionfpydeportes.gob.es" },
            { title: "Agency Direct", text: "BEDA & ConversaSpain portals" },
            { title: "Job Boards", text: "TEFL.org & Go Overseas" },
            { title: "Direct Hustle", text: "In-person academy networking" }
          ),
        ],
      },
    ],
  },
  doAndDontHeading: "Cultural & Practical Rules of Engagement",
  doAndDont: [
    { do: "Confirm verified eligibility (Auxiliares, BEDA, ConversaSpain) before applying.", dont: "Don't Apply for NALCAP: It is legally barred to non-US/Canadian citizens." },
    { do: "Embrace sobremesa and adapt your biological clock to late meals.", dont: "Don't Rush Shared Meals: Never demand hasty restaurant service or early dinners." },
    { do: "Treat the language assistant stipend strictly as a cultural-immersion adventure.", dont: "Never Work Illegally: Do not teach unauthorized private classes without proper visa clearance." },
  ],
  closingEquation: {
    heading: "Spain Rewards Those Who Adapt",
    content: "Prepare your documents. Adjust your internal clock. Enjoy the sobremesa.",
  },
  jobPortalCTA: cta("Spain", "ES"),
};

const centralEurope: Country = {
  slug: "central-europe",
  name: "Central Europe",
  code: "PL · HU",
  region: "Europe",
  flagEmoji: "🇵🇱🇭🇺",
  heading: "Centuries of History. High Purchasing Power. Teach in Central Europe.",
  tagline:
    "Escape inflated living costs without sacrificing European lifestyle. Discover high-demand ESL placements across Poland and Hungary designed for Native English teachers, including South African educators.",
  statBadges: [
    { value: "Native English", label: "Surging corporate & language school demand" },
    { value: "$800 – $1,900/mo", label: "Strong local purchasing power" },
    { value: "Under $2 Coffee", label: "Bar mleczny meals at deep discount" },
    { value: "BA + TEFL", label: "Observed qualification baseline" },
  ],
  guideContents: [],
  reading: {
    quickFacts: [],
    sections: [
      {
        heading: "The Destination Breakdown",
        blocks: [
          cards(
            {
              title: "Poland",
              badge: "3,500 – 7,500 PLN ($900–$1,900)",
              tone: "info",
              text: "Major Hubs: Warsaw & Kraków, with surging regional positions.\nMarket Drivers: Outside Eurozone (PLN); booming Business English sectors.\nLocal Culture: Legendary hospitality (\"Gość w dom, Bóg w dom\"); traditional milk bars (bar mleczny) with low-cost meals.\nVisa Advantage: Multiple viable non-EU routes (D-Type visa, TRP in-country, and JDG Sole Trader registration).",
            },
            {
              title: "Hungary",
              badge: "300k – 450k HUF ($800–$1,200)",
              tone: "info",
              text: "Major Hubs: Budapest dominates, supported by university towns Debrecen and Szeged.\nLifestyle Anchor: Historic bath culture (Széchenyi), punctuality, and vibrant cafe life.\nNon-EU Reality: CETP program is restricted to US/Canadian citizens; South Africans must use direct work permits or the White Card.\nDigital Path: White Card nomad visa available for remote ESL teachers earning €3,000/month.",
            }
          ),
        ],
      },
      {
        heading: "Market Diagnostic Matrix",
        blocks: [
          table(
            ["DIMENSION", "POLAND", "HUNGARY"],
            ["Primary Hubs", "Warsaw, Kraków, Wrocław", "Budapest, Debrecen, Szeged"],
            ["Average Monthly Comp", "$900 – $1,900 (Business English premium)", "$800 – $1,200"],
            ["Non-EU Visa Pathways", "D-Visa, TRP, JDG (Sole Freelance Permit)", "Employer Work Permit, White Card (Nomad)"],
            ["Culinary Heritage", "Pierogi, Żurek, Bigos, Oscypek", "Gulyás, Lángos, Kürtőskalács, Tokaj wine"],
            ["Cultural Pillar", "Home-based hospitality & formal respect", "Public thermal bath culture & exact punctuality"]
          ),
        ],
      },
      {
        heading: "Poland: Verified Legal Pathways for Non-EU Educators",
        blocks: [
          cards(
            {
              title: "D-Type National Visa",
              badge: "Route 01",
              tone: "success",
              text: "Direct pre-arrival permit. Requires employer-sponsored work permit. Valid for 1 year with continuous work rights.",
            },
            {
              title: "Ground Route (TRP)",
              badge: "Route 02",
              tone: "success",
              text: "Arrive via visa-exempt status and finalize employment locally. Secure Temporary Residence Permit for up to 3 years.",
            },
            {
              title: "Freelance Route (JDG)",
              badge: "Route 03",
              tone: "success",
              text: "Jednoosobowa Działalność Gospodarcza. Self-employed sole trader permit for teachers running private or corporate contracts.",
            }
          ),
          callout(
            "warn",
            "The commonly referenced CETP program is legally limited to US and Canadian passport holders. South African educators cannot apply via CETP and must pursue direct employer sponsorship or verify Hungary's Digital Nomad \"White Card\" (€3,000 monthly income and €10,000 savings).",
            "Important Eligibility Notice (Hungary / South African Applicants)"
          ),
        ],
      },
      {
        heading: "Placement Sourcing & Next Steps",
        blocks: [
          cards(
            { title: "Job Boards", text: "Active regional openings via Go Overseas & TEFL.org" },
            { title: "Placement Partners", text: "Premier TEFL tailored visa assistance" },
            { title: "Direct Outreach", text: "Language chain direct hire in Warsaw & Budapest" },
            { title: "Onboarding Prep", text: "Observed TEFL certification guidance" }
          ),
        ],
      },
    ],
  },
  doAndDontHeading: "The Cultural Etiquette Compass",
  doAndDont: [
    {
      group: "Essential Protocols: Poland",
      do: "Accept generous second and third food portions; hospitality is an honored civic duty.",
      dont: "Treat memorial sites like Auschwitz-Birkenau casually; conduct yourself with quiet dignity and respect.",
    },
    { do: "Address colleagues and contacts with formal honorifics (Pan/Pani) until explicitly asked to use first names." },
    {
      group: "Essential Protocols: Hungary",
      do: "Lock firm eye contact during toasts; partake in communal thermal baths at Széchenyi as standard leisure.",
      dont: "Exhibit loud, disruptive behavior in trams or historic coffee houses.",
    },
    { do: "Uphold punctuality strictly; early arrival is expected in academic environments." },
  ],
  closingEquation: {
    heading: "Your Central European Classroom is Waiting",
    content: "Access structured dossiers, verified school directories, and visa application kits.",
  },
  // Covers two countries, so the Job Portal link isn't pre-filtered to one of them.
  jobPortalCTA: {
    heading: "Ready to Teach in Central Europe?",
    text: "Browse current openings and apply for a position through our Job Portal.",
    buttonLabel: "APPLY FOR A POSITION IN CENTRAL EUROPE",
    href: "/job-portal",
  },
};

const southKorea: Country = {
  slug: "south-korea",
  name: "South Korea",
  code: "KR",
  region: "Asia",
  flagEmoji: "🇰🇷",
  heading: "Teaching in South Korea: Ancient Roots & Hyper-Modernity",
  tagline:
    "Unlock one of the world’s most structured, well-compensated ESL ecosystems. South Africa is one of only seven privileged nationalities legally eligible for the premier E-2 teaching visa.",
  statBadges: [
    { value: "E-2 Eligible Nation", label: "1 of only 7 qualifying global passports" },
    { value: "Free Housing Norm", label: "Furnished studio or housing allowance provided" },
    { value: "EPIK & Hagwons", label: "Public co-teaching & private academy pathways" },
    { value: "Clean Record + BA", label: "Apostilled credentials required for sponsorship" },
  ],
  guideContents: [],
  reading: {
    quickFacts: [],
    sections: [
      {
        heading: "The Cultural Ecosystem: Ancient Hierarchy in a Digital World",
        blocks: [
          cards(
            {
              title: "Confucian Hierarchy & Harmony",
              text: "Respect & Age: Deeply rooted in Confucianism. A respectful slight bow when greeting older colleagues or your school director is expected.\nSaving Face (Kibun): Preserving group harmony is vital. Never criticize coworkers or management openly; resolve feedback quietly in private.\nGlobal Cultural Wave: Home to Hallyu (K-pop, K-dramas, cinema), creating a vibrant and culturally magnetic environment for educators.",
            },
            {
              title: "The Emotion of Jeong (정)",
              text: "Unconditional Bond: Jeong represents a profound, loyal warmth that grows through shared meals, time, and patient guidance.\nClassroom Heart: Teachers who demonstrate patience and empathy build unbreakable student rapport that transcends language barriers.\nCommunity Care: Colleagues frequently look out for foreign teachers, welcoming you with food, guidance, and genuine social inclusion.",
            }
          ),
        ],
      },
      {
        heading: "Translating the Classroom: The “Sleeping Student” Protocol",
        blocks: [
          callout(
            "warn",
            "Western teachers often mistake a sleeping student as disrespect or insolence. In reality, Korean students study from early morning through late evening at hagwons and self-study libraries. A dozing student is battling pure exhaustion. Never reprimand with frustration—wake them gently with a warm smile and build jeong.",
            "Rethinking Student Fatigue in South Korea"
          ),
        ],
      },
      {
        heading: "Landscape & Escapes: Beyond the Seoul Metropolis",
        blocks: [
          cards(
            {
              title: "Seoul",
              badge: "METROPOLITAN EPICENTER",
              tone: "info",
              text: "Hyper-modern skyline paired with historic treasures like Gyeongbokgung Palace and the traditional alleys of Bukchon Hanok Village.",
            },
            {
              title: "Gyeongju",
              badge: "THE OPEN-AIR MUSEUM",
              tone: "info",
              text: "Ancient capital of the thousand-year Silla dynasty, featuring royal burial mounds, sacred stone temples, and UNESCO archaeological parks.",
            },
            {
              title: "Jeju Island",
              badge: "THE SOUTHERN ESCAPE",
              tone: "info",
              text: "Subtropical volcanic getaway with lush waterfalls, dramatic seaside basalt cliffs, and a serene, restorative coastal pace.",
            }
          ),
        ],
      },
      {
        heading: "The Job Matrix: Choosing Your Strategic Teaching Route",
        blocks: [
          table(
            ["DIMENSION", "EPIK (PUBLIC SCHOOL CO-TEACHING)", "HAGWONS (PRIVATE ACADEMIES)"],
            ["Employer Structure", "South Korean Ministry of Education", "Privately owned after-school learning businesses"],
            ["Teacher Role", "Co-teacher alongside a licensed Korean educator", "Lead solo instructor with smaller, focused class sizes"],
            ["Working Schedule", "Standard daytime hours (8:30 AM – 4:30 PM); extensive vacation", "Afternoon to evening shifts (1:00 PM – 9:00 PM / 10:00 PM)"],
            ["Pedagogical Vibe", "Structured, traditional, textbook & lecture oriented", "Lively, dynamic, conversational, and energetic environment"],
            ["Core Benefits", "High holiday allowance, entrance/exit allowances, contract bonus", "Flexible start dates year-round, modern facilities, direct placement"]
          ),
        ],
      },
      {
        heading: "Navigating the Job Market: Sourcing & Vetting Roadmap",
        blocks: [
          cards(
            {
              title: "Official Public Route",
              badge: "STEP 01",
              tone: "info",
              text: "Apply directly via epik.go.kr for the gold-standard public school system. Applications open twice yearly for Spring and Fall intakes.",
            },
            {
              title: "Hagwon Job Boards",
              badge: "STEP 02",
              tone: "info",
              text: "Explore trusted boards like Dave's ESL Café or partner with verified recruiters to secure continuous private academy interviews.",
            },
            {
              title: "Rigorous Vetting",
              badge: "STEP 03",
              tone: "warn",
              text: "Non-Negotiable: Cross-reference schools on Reddit (r/teachinginkorea, r/Korea) and expat blacklist/whitelist groups before signing.",
            }
          ),
        ],
      },
      {
        heading: "",
        blocks: [
          cards(
            { title: "Tabletop Social Dining", text: "Bond over tabletop Korean BBQ, authentic Kimchi, Bibimbap bowls, and hot bowls of spicy Tteokbokki after evening classes." },
            { title: "The Mega-Cafe Culture", text: "South Korea's expansive multi-story coffee shops serve as community workspaces, relaxation sanctuaries, and social hubs." }
          ),
        ],
      },
    ],
  },
  doAndDontHeading: "The Golden Rules for Success in South Korea",
  doAndDont: [
    { do: "Bow slightly when greeting administrators, elders, and senior colleagues.", dont: "Don't Assume War Fears: Daily life in Seoul is peaceful; the DMZ is an educational day trip, not a daily hazard." },
    { do: "Address disagreements calmly in one-on-one private discussions to protect harmony.", dont: "Never Sign Blindly: Do not accept a hagwon offer without speaking to a current foreign teacher or vetting reviews." },
    { do: "Embrace Korean BBQ gatherings and ubiquitous cafe work cultures.", dont: "No Unverified Travel: Never board a plane before your E-2 visa issuance number is officially finalized." },
  ],
  closingEquation: {
    heading: "South Korea Rewards Patience & Professionalism",
    content: "Once the hierarchy and cultural nuances click, you unlock deep respect, lifelong friendships, and exceptional savings.",
  },
  jobPortalCTA: cta("South Korea", "KR"),
};

const taiwan: Country = {
  slug: "taiwan",
  name: "Taiwan",
  code: "TW",
  region: "Asia",
  flagEmoji: "🇹🇼",
  heading: "Taiwan: The Premier Asian Gateway",
  tagline:
    "The ideal first-time international teaching destination—seamless hyper-convenience, world-class safety, accessible ARC visas, and genuine cultural warmth.",
  statBadges: [
    { value: "Big 7", label: "Recognized Passports" },
    { value: "#1 Safe", label: "Global Expat Ranking" },
    { value: "30+", label: "Taipei Night Markets" },
    { value: "Year-Round", label: "Buxiban Hiring Cycles" },
  ],
  guideContents: [],
  reading: {
    quickFacts: [],
    sections: [
      {
        heading: "1. Landscape & Geopolitical Reality",
        blocks: [
          cards(
            {
              title: "The Subtropical Convenience Hub",
              text: "A lush island of dramatic mountains and modern transit networks. From the Taipei MRT to high-speed rail, living here offers unmatched public infrastructure and seasonal subtropical ease.",
            },
            {
              title: "Primary Placements",
              text: "• Taipei: Capital epicenter with high school density and bustling expat culture.\n• Taichung & Tainan: Cultural centers known for historic temples and balanced climate.\n• Kaohsiung: Sun-soaked southern maritime metropolis with open waterfronts.",
            },
            {
              title: "Defining Landmarks",
              text: "• Taipei 101: Architectural icon defining the modern skyline.\n• Longshan Temple: Old Wanhua sanctuary honouring 165+ deities.\n• Taroko Gorge & Sun Moon Lake: Marble canyons and alpine escapes.",
            },
            {
              title: "The Geopolitical Baseline",
              text: "Since 1949, Taiwan has functioned with full independent self-governance, its own constitution, currency (NTD), and democracy. While the PRC claims sovereignty under its policy, foreign educators enjoy complete social freedom and exceptional daily safety.",
            }
          ),
        ],
      },
      {
        heading: "2. Everyday Life & Social Fabric",
        blocks: [
          cards(
            {
              title: "The Night Market Ecosystem",
              text: "Night markets form the living room of Taiwanese culture—not merely tourist spots, but community hubs where multi-generational families gather, friends meet, and daily dinners are eaten.",
            },
            {
              title: "Culinary Touchstones & “Xiaochi”",
              text: "• Xiaolongbao: Delicate, handmade soup dumplings.\n• Beef Noodle Soup: Slow-simmered, rich national comfort food.\n• Bubble Tea (Boba): Homegrown global phenomenon from local tea stalls.\n• Stinky Tofu: Pungent fermented street delicacy—an essential expat rite of passage.",
            },
            {
              title: "Professional Decorum & Harmony",
              text: "Taiwanese society values mutual respect and social composure. Teachers thrive by reflecting this dignity:\n• Calm Composure\n• Professional Nod\n• Saving Face\nKeep emotional outbursts out of school; replace casual touching/hugs with polite greetings.",
            }
          ),
          callout(
            "info",
            "Taiwan legally restricts English teaching visas to recognized native English-speaking nationalities: South Africa, United States, United Kingdom, Canada, Ireland, Australia, and New Zealand. South African educators benefit from full bilateral recognition alongside Commonwealth peers.",
            "The ‘Big 7’ Native English Speaker Advantage"
          ),
        ],
      },
      {
        heading: "3. The Education Landscape: Buxibans vs. Public Schools",
        blocks: [
          table(
            ["DIMENSION", "BUXIBANS (PRIVATE CRAM SCHOOLS)", "PUBLIC & INTERNATIONAL SCHOOLS (E.G. TFETP)"],
            ["Setting & Scale", "Private after-school academies. Taiwan's single largest employer of foreign ESL teachers.", "Formal state primary/secondary schools or accredited private international institutions."],
            ["Hiring Cycles", "Year-round continuous recruitment. Flexible start windows.", "Strictly seasonal hiring (typically July–August for the fall academic year)."],
            ["Prerequisites", "Bachelor's degree (or Associate Degree + 120-hr TEFL) + Clean Criminal Background Check.", "Formal state teaching qualification/license (PGCE, SACE, state cert) + Bachelor's degree."],
            ["Weekly Schedule", "Afternoon to evening hours (approx. 1:30 PM - 9:00 PM), plus occasional Saturdays.", "Structured daytime hours (8:00 AM - 4:30 PM), Monday to Friday with full school holidays."],
            ["Ideal For", "First-time educators seeking immediate placement and dynamic small classes.", "Career teachers seeking public school stability and curriculum integration."]
          ),
        ],
      },
      {
        heading: "4. 5-Step ARC Residency Pipeline",
        blocks: [
          steps(
            { label: "Prerequisites Assembled", text: "Degree apostille/attestation, Big 7 passport, and clean police check." },
            { label: "Employer Sponsorship", text: "Sign signed contract with a recognized, licensed school." },
            { label: "Work Permit Approval", text: "Employer files directly with Taiwan Ministry of Labor (MOL)." },
            { label: "Resident Visa Issued", text: "Entry clearance validated via overseas Taipei Representative Office." },
            { label: "In-Country ARC Card", text: "National Immigration Agency issues Alien Resident Certificate (legal ID)." }
          ),
          callout(
            "danger",
            "Private tutoring outside your ARC sponsor is illegal under Taiwanese labor law. Protect your standing by working solely under your authorized school permit.",
            "Strict Legal Note"
          ),
        ],
      },
      {
        heading: "5. Taiwan vs. Mainland China",
        blocks: [
          list(
            L("Cultural Adjustment", "Taiwan presents a considerably gentler curve with bilingual signage and friendly expat networks."),
            L("Visa Flow", "Streamlined ARC progression compared to the multi-tier Mainland Z-visa and municipal hurdles."),
            L("Digital & Social Freedom", "Uncensored internet access and comprehensive civil openness.")
          ),
        ],
      },
      {
        heading: "6. Sourcing Placements",
        blocks: [
          list(
            L("Tealit.com", "Dedicated Taiwan ESL classifieds, contracts, and housing."),
            L("104 Job Bank (104.com.tw)", "Island-wide direct recruitment platform."),
            L("TFETP Portal", "Official government public school application system."),
            L("Go Overseas & Dave's ESL Cafe", "Verified school reviews and postings.")
          ),
        ],
      },
    ],
  },
  doAndDontHeading: "7. The Educator's Code of Conduct",
  doAndDont: [
    { do: "Confirm full employer sponsorship (Work Permit + ARC) in writing.", dont: "Engage in unauthorized private tutoring outside your visa sponsor." },
    { do: "Maintain calm, polite composure even under workplace stress.", dont: "Conflate Taiwan's streamlined ARC process with China's Z-visa." },
    { do: "Embrace night market street stalls as everyday social life.", dont: "Trivialize or casually debate sensitive cross-strait political topics." },
    { do: "Acknowledge colleagues and elders with a polite nod or slight bow.", dont: "Default to informal hugging or back-slapping in professional settings." },
  ],
  closingEquation: {
    heading: "Begin Your Journey to Taiwan with World Teachers Academy",
    content:
      "Get accredited, connect with verified school sponsors across Taipei, Taichung, and Kaohsiung, and secure your Alien Resident Certificate with ease.",
  },
  jobPortalCTA: cta("Taiwan", "TW"),
};

const thailand: Country = {
  slug: "thailand",
  name: "Thailand",
  code: "TH",
  region: "Asia",
  flagEmoji: "🇹🇭",
  heading: "Teaching in Thailand: The Land of Smiles",
  tagline:
    "Where legendary warmth meets deep Buddhist respect. A lighter-stress classroom rhythm, remarkably affordable living, and unmatched cultural depth for international educators.",
  statBadges: [
    { value: "Uncolonized", label: "Sovereign Pride" },
    { value: "Theravada", label: "Buddhist Core" },
    { value: "High Stretch", label: "Purchasing Power" },
    { value: "Lighter Hours", label: "Balanced Rhythm" },
  ],
  guideContents: [],
  reading: {
    quickFacts: [],
    sections: [
      {
        heading: "1. National Pillars & Cultural Roots",
        blocks: [
          cards(
            {
              title: "Proudly Uncolonized History",
              text: "Thailand holds a unique distinction in Southeast Asia: it has never been colonized. National pride in this preserved independence runs deep, influencing cultural sovereignty, social interactions, and educator respect.",
            },
            {
              title: "Buddhism as the Daily Anchor",
              text: "Theravada Buddhism fundamentally shapes daily social etiquette, ethical obligations, campus shrines, and the rhythm of national school holidays. Respecting Buddhist symbols is non-negotiable.",
            },
            {
              title: "Bangkok & Regional Epicenters",
              text: "• Bangkok: The dynamic, mega-city hub uniting ancient gilded temples with modern transit.\n• Chiang Mai & The North: Walled historic capital surrounded by hundreds of sacred temples.\n• The Islands (South): Phuket, Krabi, and Koh Samui offering weekend tropical escapes.",
            },
            {
              title: "Critical Legal Law: The Constitutional Monarchy",
              tone: "danger",
              text: "The monarchy is held in sacred regard. Criticizing or disrespecting the Royal Family (Lèse-Majesté) is a severe criminal offense strictly enforced for foreigners and locals alike, both in person and online. Golden rule: refrain from political commentary entirely.",
            }
          ),
        ],
      },
      {
        heading: "2. The Anatomy of Physical Etiquette",
        blocks: [
          cards(
            {
              title: "The Sacred Head vs. The Lowest Feet",
              text: "• The Head (Sacred): The highest spiritual point of the body. Never touch anyone's head—even playfully or affectionately with small children.\n• The Feet (Lowest): The spiritually lowest point. Never point your feet at anyone, at Buddha images, or at classroom shrines. Adjust seated posture carefully.",
            },
            {
              title: "The Currency of Respect: The Wai",
              text: "The traditional Thai greeting (palms together with a slight bow) is offered as gratitude, greeting, or deference. When students or colleagues offer a wai, returning it with genuine courtesy is essential—intention matters far more than perfect angle.",
            }
          ),
          steps(
            { label: "Palms pressed at chest level", text: "" },
            { label: "Fingertips rise toward chin", text: "" },
            { label: "Slight head bow in acknowledgement", text: "" }
          ),
          cards({
            title: "Professionalism Over Tropical Heat",
            text: "Despite humid temperatures, schools expect formal decorum. Covered shoulders and knees are absolute baselines; collared shirts and tailored trousers/skirts project the dignity required of teachers.",
          }),
        ],
      },
      {
        heading: "3. The Placement Diagnostic: Gulf vs. Thailand",
        blocks: [
          table(
            ["DIMENSION", "THE GULF PLACEMENTS (UAE, QATAR, KSA)", "THAILAND PLACEMENTS"],
            ["Pace & Weekly Hours", "Rigid, heavier teaching hours with high administrative oversight.", "Lighter teaching contact hours; calmer, more balanced school day pace."],
            ["Classroom Culture", "Highly formal, structured corporate education frameworks.", "Warm and welcoming, yet hierarchy matters deeply. Respect must be earned."],
            ["The Financial Equation", "Substantial tax-free raw salaries with end-of-service gratuities.", "Modest nominal salary, but ultra-low cost of living lets funds stretch far."],
            ["Lifestyle & Immersion", "Modern, air-conditioned infrastructure and conservative norms.", "Rich outdoor cultural immersion, daily street markets, and tropical ease."]
          ),
        ],
      },
      {
        heading: "4. Communication & Social Goodwill",
        blocks: [
          cards({
            title: "“Mai Pen Rai” & Emotional Restraint",
            text: "Roughly translated as \"it's okay\" or \"never mind,\" this philosophy represents emotional composure. In Thailand, raising your voice or displaying anger is viewed as a serious personal failure that causes both parties to lose face.",
          }),
          callout("success", "Pedagogical Skill + Mai Pen Rai Restraint + Physical Etiquette = Deep Community Trust", "THE GOODWILL EQUATION"),
          cards({
            title: "Street Food & Sustenance",
            text: "• Pad Thai: Stir-fried tamarind noodles, tofu, egg, and crushed peanuts.\n• Tom Yum Goong: Fragrant hot and sour lemongrass prawn soup.\n• Som Tum: Fiery shredded green papaya salad with lime and chili.\n• Mango Sticky Rice: Sweet coconut sticky rice with ripe golden mango.",
          }),
        ],
      },
      {
        heading: "5. The Weekend Travel Horizon",
        blocks: [
          text("Accessible Cultural Escapes"),
          list(
            L("Ayutthaya", "UNESCO-listed ruins of Thailand's ancient royal capital, an easy day trip from Bangkok."),
            L("Wat Phra Kaew & Wat Arun", "Bangkok's sacred Grand Palace and the Riverside Temple of Dawn."),
            L("Chiang Mai Old City", "Mountain air, artisan markets, and elephant sanctuaries."),
            L("Southern Coast & Islands", "World-class diving, limestone karst cliffs, and beach bungalows reachable via affordable domestic transit.")
          ),
        ],
      },
      {
        heading: "6. Sourcing Placements",
        blocks: [
          list(
            L("Direct School Networks", "Public schools (Anuban / Mattayom) and private bilingual academies."),
            L("Verified TEFL Boards", "TEFL.org, Go Overseas, and Ajarn.com (Thailand's leading specialized ESL portal)."),
            L("Prerequisites", "Bachelor's Degree + 120-hour TEFL certificate + Police Clearance for Non-B Visa.")
          ),
        ],
      },
    ],
  },
  doAndDontHeading: "7. The Educator's Code of Conduct",
  doAndDont: [
    { do: "Return a wai when offered by students, staff, or community members.", dont: "Touch anyone's head, even playfully or when encouraging children." },
    { do: "Dress modestly with covered shoulders and knees at school.", dont: "Point feet at colleagues, monks, elders, or religious images." },
    { do: "Cultivate calm patience (Mai Pen Rai) during scheduling shifts.", dont: "Raise your voice, express frustration, or cause anyone to lose face." },
    { do: "Show sincere reverence at temple sites and toward Buddha shrines.", dont: "Make critical remarks about the monarchy in public or online." },
  ],
  closingEquation: {
    heading: "Begin Your Teaching Adventure with World Teachers Academy",
    content:
      "Obtain your TEFL certification, master cultural nuances, and secure verified school placements across Bangkok, Chiang Mai, and coastal provinces.",
  },
  jobPortalCTA: cta("Thailand", "TH"),
};

const vietnam: Country = {
  slug: "vietnam",
  name: "Vietnam",
  code: "VN",
  region: "Asia",
  flagEmoji: "🇻🇳",
  heading: "Teaching in Vietnam: Energy, Warmth & Quiet Respect",
  tagline:
    "Step into Southeast Asia’s most established educator community—combining electric urban vitality, extraordinary food traditions, and an unshakeable cultural philosophy of mutual dignity.",
  statBadges: [
    { value: "2 Major Hubs", label: "Hanoi & HCMC" },
    { value: "40+ Students", label: "Average Public Class" },
    { value: "Strict Law", label: "Work Permit Required" },
    { value: "High Respect", label: "Social Currency" },
  ],
  guideContents: [],
  reading: {
    quickFacts: [],
    sections: [
      {
        heading: "1. Sheer Energy & A Tale of Two Hubs",
        blocks: [
          cards({
            title: "The Pulse of the Streets",
            text: "Vietnam greets incoming teachers with immediate vibrancy: buzzing motorbike flows and unforced, genuine hospitality. Strangers offer help freely without asking. While Vietnamese is tonal and complex, learning basic courtesies earns immediate goodwill.",
          }),
          quote("I did not expect breakfast to feel like an extreme sport.", "Bongani, South African Teacher in Hanoi’s Old Quarter"),
          cards(
            {
              title: "Hanoi vs. Ho Chi Minh City (HCMC)",
              text: "• Hanoi (The North): The historic, deliberate capital. Tree-lined boulevards, French colonial architecture, ancient trade quarters, and a quieter, seasonal tempo.\n• HCMC / Saigon (The South): The commercial powerhouse. High-energy, modern, tropical, and fast-moving with a thriving 24/7 dining scene.\nBoth cities house massive, highly active foreign educator networks.",
            },
            {
              title: "Iconic Landscapes & Escapes",
              text: "• Sa Pa: High-altitude terraced rice fields & ethnic communities.\n• Hạ Long Bay: UNESCO marine karsts rising from jade water.\n• Hội An: Historic riverside merchant port illuminated by lanterns.\n• Hoàn Kiếm Lake: The spiritual heart of Hanoi morning life.",
            }
          ),
        ],
      },
      {
        heading: "2. Daily Rhythms & Sacred Traditions",
        blocks: [
          cards(
            {
              title: "Daily Sustenance: Street-Level Mastery",
              text: "• Phở: Fragrant slow-simmered beef/chicken broth; iconic breakfast.\n• Bánh Mì: Crispy French baguette loaded with pâté, roast meats & herbs.\n• Bún Chả: Hanoi grilled pork patties in broth with rice vermicelli.\n• Gỏi Cuốn: Fresh rice paper rolls with fresh herbs and shrimp.\n• Cà Phê Sữa Đá: Intense drip coffee over ice with condensed milk.",
            },
            {
              title: "The Everyday Reality of the Family Altar",
              text: "Spiritual life weaves Buddhism, Taoism, Confucianism, and profound ancestor veneration into daily life. Altars in homes and shops receive daily offerings of fruit, incense, and flowers.\nCultural Rule: Always treat family altars with quiet physical distance. Never treat sacred home shrines as tourist photo opportunities without permission.",
            }
          ),
          cards({
            title: "The “Quiet Respect” Framework",
            text: "Success in Vietnam requires moving away from loud, public individualism. Across family homes, public markets, and school corridors, the single most valuable behavioral currency is Quiet Respect.",
          }),
        ],
      },
      {
        heading: "3. Social Mechanics & The Classroom Reality",
        blocks: [
          table(
            ["DIMENSION", "WHAT DESTROYS TRUST (THE MISTAKE)", "WHAT BUILDS TRUST (THE MASTER KEY)"],
            ["Classroom Correction", "Calling out a student publicly in front of 40 peers → causes severe loss of face and embarrassment.", "Pulling the student aside for gentle, private 1-on-1 feedback → earns lasting loyalty and safety."],
            ["Student Demographics", "Treating silence as disinterest or lack of preparation.", "Recognizing that students are deeply respectful and eager, requiring warm encouragement to speak up."],
            ["Classroom Scale", "Relying on low-energy lecture formats in large rooms.", "Deploying active classroom management and structured team activities for groups of 35–45+ learners."],
            ["Professional Attire", "Wearing casual backpacker street clothes into school.", "Modest business-casual attire (collared shirts, covered knees) demonstrating respect for the institution."]
          ),
        ],
      },
      {
        heading: "4. The Legal Divide: Proper Work Permits",
        blocks: [
          text("THE JOB OFFER GATEKEEPER (DECISION FLOW)"),
          cards(
            { title: "Are they asking you to enter/teach on a Tourist or Business Visa?", badge: "ALERT", tone: "danger", text: "Walk away. This is illegal." },
            { title: "Is the school failing to verify their licensed sponsor status?", badge: "ALERT", tone: "danger", text: "Walk away." },
            { title: "Is full Work Permit sponsorship confirmed explicitly in writing prior to arrival?", badge: "LEGAL", tone: "success", text: "Proceed safely." }
          ),
          callout(
            "danger",
            "Vietnam’s labor departments have significantly tightened work permit and visa enforcement. Shortcuts suggested by unverified brokers represent severe legal risks, including deportation. Always secure legitimate employer sponsorship in writing.",
            "Zero Tolerance Law Enforcement"
          ),
        ],
      },
      {
        heading: "5. Compliance Check: Green vs Red Flags",
        blocks: [
          cards(
            {
              title: "Green Flags (Legitimate Placements)",
              tone: "success",
              text: "• Registered institution handles official Work Permit (WP).\n• Temporary Residence Card (TRC) assistance provided.\n• Attested degree, TEFL certificate, and criminal check requested before entry.",
            },
            {
              title: "Red Flags (Illegal Shortcuts)",
              tone: "danger",
              text: "• Suggesting \"visa runs\" every 3 months on tourist visas.\n• Verbal promises of visa processing without formal contracts.\n• Withholding salary until visa status is \"sorted out locally.\"",
            }
          ),
        ],
      },
    ],
  },
  doAndDontHeading: "6. The Educator's Code of Conduct",
  doAndDont: [
    { do: "Address student errors privately and gently to preserve face.", dont: "Humiliate or publicly criticize students or colleagues in meetings." },
    { do: "Wear modest, professional business-casual attire on campus.", dont: "Accept teaching positions requiring illegal entry on tourist visas." },
    { do: "Show quiet physical reverence around family altars and shrines.", dont: "Treat household or storefront ancestor altars as photo props." },
    { do: "Demand written verification of legal work permit sponsorship.", dont: "Lose your temper or display outward anger when dealing with bureaucracy." },
  ],
  closingEquation: {
    heading: "Teach in Vietnam with World Teachers Academy",
    content:
      "Master TEFL certification, navigate work permit document legalisation, and connect with reputable public and international school partners in Hanoi and Ho Chi Minh City.",
  },
  jobPortalCTA: cta("Vietnam", "VN"),
};

// Alphabetical by name — the catalog grid uses this order as-is.
export const countries: Country[] = [
  argentina,
  brazil,
  brunei,
  cambodia,
  centralEurope,
  chile,
  china,
  colombia,
  costaRica,
  france,
  italy,
  japan,
  kuwait,
  laos,
  mexico,
  qatar,
  saudiArabia,
  southKorea,
  spain,
  taiwan,
  thailand,
  uae,
  vietnam,
].sort((a, b) => a.name.localeCompare(b.name));

// For the navbar dropdown / mobile menu: countries grouped by region (each group alphabetical).
export const countriesByRegion: { region: Region; countries: Country[] }[] = REGIONS.map((region) => ({
  region,
  countries: countries.filter((c) => c.region === region),
}));

export function getCountryBySlug(slug: string): Country | undefined {
  return countries.find((c) => c.slug === slug);
}
