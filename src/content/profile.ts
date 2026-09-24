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
  heroLine: 'It answers the call you would have missed.',
  subline:
    'AI receptionists, voice agents and automation for small businesses. Electrical Engineering at Western University, pursuing the Ivey HBA.',
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
    'Electrical Engineering student at Western (pursuing Ivey HBA) who builds AI receptionists, voice agents, and automation for small businesses — so they never miss the call that would have paid them.',
} as const;

/**
 * Résumé PDF. The master profile lists this as an asset still to be gathered,
 * so it is `null` until the file exists. Drop `resume.pdf` into `public/` and
 * set this to `${import.meta.env.BASE_URL}resume.pdf` to turn on the download.
 * While it is null the door shows the live links instead of a dead button.
 */
export const resumeUrl: string | null = null;

export const about = {
  headline: 'Electrical engineering, the Ivey HBA, and a practice that pays for itself.',
  paragraphs: [
    'I am an Electrical Engineering student at Western University, working toward the Ivey HBA dual degree. It suits how I already worked: build the thing, then figure out how it pays for itself.',
    'At fifteen I co-founded a streetwear label and grew it past ten thousand followers, which taught me more about operations than any course has. Since then I have run a school’s student council, organised cultural events for the Tamil Student Association, and managed a polling station for a federal election.',
    'Now I build automated systems for businesses that need the work done without hiring for it.',
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
  title: 'You do not have a lead problem. You have a pickup problem.',
  stats: [
    { figure: '62%', claim: 'of calls to a small business go unanswered' },
    { figure: '85%', claim: 'of those callers never ring back — they ring someone else' },
  ],
  threeThings: [
    {
      title: 'It answers',
      body: 'Picks up and books them into your real calendar, on the first ring, every time.',
    },
    {
      title: 'It remembers',
      body: 'Logs transcript, contact, next step. Nothing dropped. Follows up.',
    },
    {
      title: 'It knows when to hand you the phone',
      body: 'Calls that genuinely need you still reach you, with context already gathered.',
    },
  ],
  flow: ['A call comes in', 'Answered', 'Booked', 'Logged', 'Handed to you'],
} as const;

export const services = [
  {
    title: 'AI Receptionist',
    body: 'Answers every call, books into your real calendar, answers the questions you get twenty times a week, and hands the rest to you with a summary.',
    tags: ['Answers 24/7', 'Books appointments', 'Escalates with context'],
  },
  {
    title: 'Voice Agents',
    body: 'Inbound and outbound agents that hold a real conversation. Screening enquiries, confirming appointments, chasing the follow-ups nobody gets around to.',
    tags: ['Screens enquiries', 'Confirms bookings', 'Runs follow ups'],
  },
  {
    title: 'Workflow Automation',
    body: 'Pipelines that move information for you. Intake forms into the CRM, enquiries into follow-up sequences, reports generated and filed without anyone opening a spreadsheet.',
    tags: ['Intake to CRM', 'Automatic follow up', 'Reports on a schedule'],
  },
  {
    title: 'Websites',
    body: 'Landing pages, storefronts, dashboards and full platforms. Designed, built, deployed, with analytics wired up.',
    tags: ['Designed and built', 'Deployed and measured', 'Yours to keep'],
  },
  {
    title: 'Brand Identity',
    body: 'Logo, colour system, typography and guidelines that keep it consistent once other people start using it.',
    tags: ['Marks', 'Colour and type', 'Usage rules'],
  },
  {
    title: 'Custom Builds',
    body: 'Chatbots trained on your documents, internal tools, data analysers. Scoped against what you actually need rather than what is fashionable.',
    tags: ['Scoped with you', 'Built and handed over', 'Supported after launch'],
  },
] as const;

export const engagement = [
  {
    step: 'Call',
    body: 'Thirty minutes. You describe where your time goes. Honest take on whether automation helps or you just need a better form.',
  },
  {
    step: 'Scope',
    body: 'Written proposal: what gets built, what it costs, what it will and will not do. No retainer before written scope.',
  },
  {
    step: 'Build',
    body: 'Working pieces as they land, not a reveal at the end. Changes cheapest while still building.',
  },
  {
    step: 'Hand over',
    body: 'Runs on your accounts, documented, with a month of support so it survives contact with real customers.',
  },
] as const;

export const faq = [
  {
    q: 'Where does my customer data go?',
    a: 'Onto your own accounts, not mine. Infrastructure you own and can revoke. Exact services listed before anything is built; you approve that list.',
  },
  {
    q: 'What does it cost to set up?',
    a: 'Quoted per project after the first call. No honest flat number without call volume and scope. Written scope with price before you commit.',
  },
  {
    q: 'Will it sound like a robot?',
    a: 'Voices are good now; failures are staying calm and scripted when a person is needed (emergency, complaint, someone upset). Before launch we agree those moments and it hands the call to you.',
  },
  {
    q: 'What happens when it gets something wrong?',
    a: 'Every call logged with a transcript. Anything unsure escalates to you with context instead of being answered badly.',
  },
  {
    q: 'Do I own it?',
    a: 'Yes. Runs on your accounts, documented, portable. Not a subscription you cannot leave.',
  },
] as const;

export const contact = {
  cta: 'Tell me where your time goes.',
  body: 'Thirty minutes, no pitch. If automation is not the answer, I will say so on the call.',
  formPrompt: 'What eats your week?',
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
    'Four games written instead of sleeping. All four run inside this page — no engine, no library, no framework. Three canvases and a game loop; one is nothing but a clock and your nerve.',
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
