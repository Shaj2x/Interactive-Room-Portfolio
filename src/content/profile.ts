/**
 * SINGLE SOURCE OF TRUTH FOR ALL COPY ON THIS SITE.
 *
 * Every word rendered by the room and its sections comes from this file.
 * Nothing here is invented — it is transcribed from SHAJITH_MASTER_PROFILE.
 * To change what the site says, change it here and nowhere else.
 *
 * Section `id`s are also the URL hashes (#about, #build, ...) and the keys
 * the room hotspots reference. See src/scene/hotspots.ts for the mapping.
 */

export type SectionId =
  | 'build'
  | 'record'
  | 'about'
  | 'leadership'
  | 'projects'
  | 'play'
  | 'contact'
  | 'resume';

export const identity = {
  name: 'Shajith Sasikumar',
  location: 'Ontario, Canada',
  positioning: 'Success comes with Discipline',
  heroLine: 'Someone picks up, even on the days you cannot.',
  subline:
    'I build AI receptionists, voice agents and quiet automation for small businesses. Electrical Engineering at Western University, working toward the Ivey HBA.',
  programme: 'Electrical Engineering, pursuing Ivey HBA',
  institution: 'Western University',
  secondaryAverage: '96.3%',
  buildingSince: 'Age 15',
  spokenLanguages: 'English, Tamil, French',
  email: 'shajithskumar@gmail.com',
  github: 'https://github.com/Shaj2x',
  linkedin: 'https://www.linkedin.com/in/shajith-sasikumar-5080a5344/',
  sourcePortfolio: 'https://shaj2x.github.io/ShajithSasikumarPortfolio/?fps',
  summary:
    'An Electrical Engineering student at Western, working toward the Ivey HBA, who builds AI receptionists, voice agents and automation for small businesses — so the call that would have paid them never goes to voicemail.',
} as const;

/**
 * Résumé PDF. The master profile lists this as an asset still to be gathered,
 * so it is `null` until the file exists. Drop `resume.pdf` into `public/` and
 * set this to `${import.meta.env.BASE_URL}resume.pdf` to turn on the download.
 * While it is null the door shows the live links instead of a dead button.
 */
export const resumeUrl: string | null = null;

export const about = {
  headline: 'Engineering, business, and a habit of finishing what I start.',
  paragraphs: [
    'I am an Electrical Engineering student at Western University, working toward the Ivey HBA dual degree. The two together suit the way I have always worked — build the thing first, then sit down and work out how it pays for itself.',
    'At fifteen I co-founded a streetwear label with a friend and grew it past ten thousand followers. Packing orders at midnight taught me more about running something than any course has. Since then I have led a school’s student council, put on cultural events for the Tamil Student Association, and looked after a polling station through a federal election.',
    'These days I build quiet, dependable systems for small businesses that need the work handled without taking on another salary. Most of my clients are people who would rather be doing the part they love.',
  ],
  facts: [
    { label: 'Based in', value: 'Ontario, Canada' },
    { label: 'Studying', value: 'Electrical Engineering, Western University' },
    { label: 'Pursuing', value: 'Ivey HBA dual degree' },
    { label: 'Secondary average', value: '96.3%' },
    { label: 'Building since', value: 'Age 15' },
    { label: 'Languages', value: 'English, Tamil, French' },
  ],
} as const;

export const problem = {
  title: 'You are not short of customers. You are short of someone to answer them.',
  stats: [
    { figure: '62%', claim: 'of calls to a small business go unanswered' },
    { figure: '85%', claim: 'of those callers never ring back — they ring someone else' },
  ],
  threeThings: [
    {
      title: 'It answers',
      body: 'Picks up on the first ring and books them straight into the calendar you already use — at nine in the morning or nine at night.',
    },
    {
      title: 'It remembers',
      body: 'Keeps the transcript, the contact and the next step, then follows up so nothing quietly slips through.',
    },
    {
      title: 'It knows when to fetch you',
      body: 'The calls that genuinely need a person still reach you — with the background already gathered, so you start halfway through.',
    },
  ],
  flow: ['A call comes in', 'Answered', 'Booked', 'Logged', 'Handed to you'],
} as const;

export const services = [
  {
    title: 'AI Receptionist',
    body: 'Answers every call, books into the calendar you already keep, handles the questions you get twenty times a week, and passes anything else to you with a short summary.',
    tags: ['Answers 24/7', 'Books appointments', 'Escalates with context'],
  },
  {
    title: 'Voice Agents',
    body: 'Agents that hold a real conversation, both directions. They screen enquiries, confirm appointments and chase the follow-ups everyone means to get to and never does.',
    tags: ['Screens enquiries', 'Confirms bookings', 'Runs follow ups'],
  },
  {
    title: 'Workflow Automation',
    body: 'Quiet pipelines that carry information for you — intake forms into the CRM, enquiries into follow-up sequences, reports written and filed without anyone opening a spreadsheet on a Sunday.',
    tags: ['Intake to CRM', 'Automatic follow up', 'Reports on a schedule'],
  },
  {
    title: 'Websites',
    body: 'Landing pages, storefronts, dashboards and full platforms — designed, built and put live, with the analytics wired up so you can see what is working.',
    tags: ['Designed and built', 'Deployed and measured', 'Yours to keep'],
  },
  {
    title: 'Brand Identity',
    body: 'A logo, a colour system, typefaces and a short set of rules that keep everything looking like itself once other people start using it.',
    tags: ['Marks', 'Colour and type', 'Usage rules'],
  },
  {
    title: 'Custom Builds',
    body: 'Chatbots trained on your own documents, internal tools, data analysers. Scoped around what you actually need rather than whatever happens to be fashionable this year.',
    tags: ['Scoped with you', 'Built and handed over', 'Supported after launch'],
  },
] as const;

export const engagement = [
  {
    step: 'Call',
    body: 'Half an hour, just talking. You walk me through where the week actually goes, and I will tell you honestly whether automation helps here or whether you simply need a better form.',
  },
  {
    step: 'Scope',
    body: 'A written proposal — what gets built, what it costs, and what it will and will not do. Nothing starts, and nothing is charged, before that is agreed in writing.',
  },
  {
    step: 'Build',
    body: 'You see working pieces as they land rather than one reveal at the end. Changes are cheapest while the thing is still warm, so say so early and often.',
  },
  {
    step: 'Hand over',
    body: 'It runs on your accounts, written down in plain language, with a month of support beside you while it meets real customers for the first time.',
  },
] as const;

export const faq = [
  {
    q: 'Where does my customer data go?',
    a: 'Onto your own accounts, never mine — infrastructure you hold the keys to and can revoke whenever you like. You get the exact list of services before anything is built, and nothing goes ahead until you have approved it.',
  },
  {
    q: 'What does it cost to set up?',
    a: 'Quoted per project once we have had the first call. I would rather not give you a flat number before I know your call volume and what you need, because it would not be an honest one. You will have the scope and the price in writing before you commit to anything.',
  },
  {
    q: 'Will it sound like a robot?',
    a: 'The voices are genuinely good now. Where these things fail is staying calm and scripted at the moment a person is needed — an emergency, a complaint, somebody having a bad day. We agree on those moments before launch, and when one arrives it hands the call straight to you.',
  },
  {
    q: 'What happens when it gets something wrong?',
    a: 'Every call is logged with a transcript, so you can see exactly what was said. Anything it is unsure about comes to you with the context attached rather than being answered badly and quietly.',
  },
  {
    q: 'Do I own it?',
    a: 'Yes, properly. It runs on your accounts, it is documented, and you can take it with you. This is not a subscription you have to stay in to keep what you paid for.',
  },
] as const;

export const contact = {
  cta: 'Tell me where your week goes, and I will listen.',
  body: 'Half an hour, no pitch, no obligation. If automation is not the right answer for you, I will say so on the call and point you at what is.',
  formPrompt: 'What is eating your week?',
  email: identity.email,
} as const;

export const education = [
  {
    credential: 'BESc, Electrical Engineering',
    org: 'Western University',
    dates: '2025 to 2029',
    detail: 'Working toward the Ivey HBA dual degree alongside it.',
    links: [
      { label: 'Western Engineering', href: 'https://www.eng.uwo.ca/' },
      {
        label: 'Ivey HBA + Engineering',
        href: 'https://www.ivey.uwo.ca/hba/program-details/combined-degree-opportunities/',
      },
    ],
  },
  {
    credential: 'Secondary School Diploma',
    org: 'Chinguacousy Secondary School',
    dates: '2021 to 2025',
    detail: 'Graduated with a 96.3% four-year average.',
    links: [{ label: 'Chinguacousy SS', href: 'https://chinguacousy.peelschools.org/' }],
  },
] as const;

export const work = [
  {
    role: 'Manufacturing Intern',
    org: 'Visual Elements Manufacturing',
    dates: 'Apr to Aug 2026',
    body: 'Programmed and ran HOMAG CNC machinery and Cadmatic 4 for precision production and custom millwork. Read technical drawings with the engineering and fabrication teams, held quality control, and built large-scale retail fixtures for Lululemon, UGG and Nordstrom on Holzma panel saws and CNC automation.',
    href: 'https://visual-elements.ca/',
  },
  {
    role: 'Market Research Intern',
    org: 'GreenVeil',
    dates: 'Apr to Jun 2026',
    body: 'Collected and managed large datasets, turned raw PDF reports into structured Excel workbooks split by product, and analysed multi-year pricing trends against standardised monthly averages.',
    href: 'https://greenveilpackaging.com/',
  },
  {
    role: 'Digital Media and Marketing Coordinator',
    org: 'ThinkThamizh',
    dates: 'Mar to May 2026',
    body: 'Led digital media and marketing for a nonprofit: content, social channels and the website. Built the engagement and outreach strategy and ran the timelines that delivered it.',
    href: 'https://thinkthamizh.ca/',
  },
  {
    role: 'Private Tutor, Founder',
    org: 'ABA Tutoring',
    dates: '2025 to now',
    body: 'Founded ABA Tutoring: one-to-one academic support, in person and online. An engineering background turned toward making hard concepts simple, so results and confidence move together.',
    href: 'https://abatutoring.lovable.app',
  },
  {
    role: 'Deputy Returning Officer',
    org: 'Elections Canada',
    dates: '2025',
    body: 'Ran a polling station for the federal election. Voter eligibility, ballot handling, procedural compliance.',
    href: 'https://www.elections.ca/',
  },
  {
    role: 'Co-Owner',
    org: 'LoveYouReally Apparel',
    dates: '2023 to 2025',
    body: 'Co-founded a streetwear label at fifteen. Product design, customers, fulfilment. Past 10,000 followers and into four figures of revenue.',
    href: 'https://www.instagram.com/lyrapparel/',
  },
  {
    role: 'Program Assistant',
    org: 'Brampton Library',
    dates: '2023 to 2024',
    body: "Ran children's programming, presented sessions, coordinated events including book fairs.",
    href: 'https://www.bramptonlibrary.ca/',
  },
] as const;

export const leadership = [
  {
    role: 'Lead Election Canvasser',
    org: 'Cynthia Sri Pragash Campaign',
    dates: '2025',
    body: 'Led canvassing teams and coordinated voter engagement through the campaign.',
    href: null,
  },
  {
    role: 'Student Activity Council President',
    org: 'Chinguacousy Secondary School',
    dates: '2024 to 2025',
    body: 'Led school-wide initiatives and an executive team delivering events for the student body.',
    href: 'https://chinguacousy.peelschools.org/',
  },
  {
    role: 'Grad Trip Lead Volunteer',
    org: 'GradCity',
    dates: '2024 to 2025',
    body: 'Drove awareness and sign-ups for the graduating class trip, across social campaigns and in person.',
    href: 'https://gradcity.com/',
  },
  {
    role: 'Carabram Lead Volunteer',
    org: 'Brampton Tamil Association',
    dates: '2024',
    body: 'Set the Tamil pavilion up, assigned and led volunteer groups, ran merchandise and ticket sales, and handled visitor questions through the festival.',
    href: 'https://www.carabram.org/cultures/eelam',
  },
  {
    role: 'Tamil Student Association President',
    org: 'Chinguacousy Secondary School',
    dates: '2023 to 2025',
    body: 'Organised cultural programming and built a community around Tamil heritage in the school.',
    href: null,
  },
] as const;

export const projects = [
  {
    name: 'HarmonAI',
    body: 'Music quiz web app and lyric analyser for songs you can only half remember.',
    meta: 'Apr 2026 · In progress',
    repo: 'https://github.com/Shaj2x/HarmonAI',
    demo: null,
  },
  {
    name: 'Mercatus',
    body: 'Strategy game teaching stocks, crypto and market timing through simulated trades.',
    meta: 'Apr 2026 · HTML',
    repo: 'https://github.com/Shaj2x/Mercatus',
    demo: 'https://shaj2x.github.io/Mercatus/',
  },
  {
    name: 'MarkWise',
    body: 'Homework and assignment grader powered by Claude — cut marking time without cutting feedback.',
    meta: 'Feb 2026 · In progress',
    repo: 'https://github.com/Shaj2x/MarkWise',
    demo: null,
  },
  {
    name: 'StatStack',
    body: 'NBA higher-or-lower game; pick the bigger stat line, keep the streak alive.',
    meta: 'Feb 2026 · HTML',
    repo: 'https://github.com/Shaj2x/StatStack',
    demo: 'https://shaj2x.github.io/StatStack/',
  },
  {
    name: 'Raptors Blackjack',
    body: 'Blackjack in Toronto Raptors colours; full hand logic, no library.',
    meta: 'Feb 2026 · HTML',
    repo: 'https://github.com/Shaj2x/Raptors-BlackJack',
    demo: 'https://shaj2x.github.io/Raptors-BlackJack/',
  },
  {
    name: 'Anthropogenic Sound Device Simulator',
    body: 'ES1050 at Western: the simulation captures sound inputs, timestamps them and logs to a virtual microSD — modelling environmental noise recording.',
    meta: 'Mar 2026 · HTML',
    repo: 'https://github.com/Shaj2x/Anthropogenic-Sound-Device-Simulator---ES1050-Project',
    demo: 'https://shaj2x.github.io/Anthropogenic-Sound-Device-Simulator---ES1050-Project/',
  },
] as const;

/**
 * The arcade. `id` keys the game implementations in `src/game/`; the copy here
 * is what the cabinet list and the stage header show. Adding a game means
 * adding a row here and a factory in `src/arcade/registry.ts`.
 */
export const play = {
  intro:
    'Four small games, written on nights I should have been asleep. They all run right here in the page — no engine, no library, no framework behind them. Three canvases and a game loop, and one that is nothing but a clock and your nerve. Stay a while.',
  games: [
    {
      id: 'pong',
      name: 'Night Shift Pong',
      kind: 'Duel',
      how: 'First to seven. The machine is awake too.',
    },
    {
      id: 'snake',
      name: 'Signal Snake',
      kind: 'Survival',
      how: 'Collect the nodes. The edges wrap; your tail does not.',
    },
    {
      id: 'time-it',
      name: 'Quarter Second',
      kind: 'Nerve',
      how: 'Stop the clock on the target, blind.',
    },
    {
      id: 'updraft',
      name: 'Updraft',
      kind: 'Climb',
      how: 'Climb the weather. Gravity never stops asking.',
    },
  ],
} as const;

export const toolkit = [
  { category: 'Languages', items: ['Java', 'C++', 'Python', 'JavaScript', 'C#', 'HTML/CSS'] },
  {
    category: 'Tools and frameworks',
    items: ['Git', 'MATLAB', 'OnShape', 'CAD', 'Cadmatic', 'HOMAG CNC', 'Photoshop', 'After Effects'],
  },
  {
    category: 'Creative and other',
    items: ['FL Studio', 'Canva', 'Leadership', 'Entrepreneurship'],
  },
  { category: 'Spoken', items: ['English (fluent)', 'Tamil (fluent)', 'French (limited)'] },
] as const;

/** Lines the laptop screen cycles through as an easter egg. */
export const screenLines = [
  'listening on :443',
  'call routed → calendar',
  'transcript saved',
  'escalating to human',
  'build → measure → hand over',
] as const;
