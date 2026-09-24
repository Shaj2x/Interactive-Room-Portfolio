import { Arcade } from '../arcade/Arcade';
import type { OpenOrigin } from '../scene/openOrigin';
import { SectionShell } from './SectionShell';
import {
  about,
  contact,
  education,
  engagement,
  faq,
  identity,
  leadership,
  play,
  problem,
  projects,
  resumeUrl,
  services,
  toolkit,
  work,
  type SectionId,
} from '../content/profile';
import './sections.css';

interface SectionProps {
  onClose: () => void;
  /** Where the open came from, so the sheet grows out of it. */
  origin: OpenOrigin | null;
}

/** Small helper so every outbound link gets the same safety attributes. */
function Out({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a className="out" href={href} target="_blank" rel="noreferrer noopener">
      {children}
      <span aria-hidden="true"> ↗</span>
    </a>
  );
}

/* --------------------------------------------------------------- What I build */
function Build({ onClose, origin }: SectionProps) {
  return (
    <SectionShell eyebrow="The laptop" title="What I build" index={1} origin={origin} onClose={onClose}>
      <section className="stagger">
        <p className="lede">{identity.heroLine}</p>
        <p className="body-lg">{identity.subline}</p>

        <div className="stat-row">
          {problem.stats.map((s) => (
            <div className="stat" key={s.figure}>
              <span className="stat-figure">{s.figure}</span>
              <span className="stat-claim">{s.claim}</span>
            </div>
          ))}
        </div>
        <p className="punchline">{problem.title}</p>
      </section>

      <section className="stagger">
        <h2>Three things, on every call</h2>
        <ol className="three">
          {problem.threeThings.map((t, i) => (
            <li key={t.title}>
              <span className="num">{String(i + 1).padStart(2, '0')}</span>
              <h3>{t.title}</h3>
              <p>{t.body}</p>
            </li>
          ))}
        </ol>
        <ol className="flow" aria-label="How a call moves through the system">
          {problem.flow.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="stagger">
        <h2>Six things I build</h2>
        <div className="cards">
          {services.map((s) => (
            <article className="card" key={s.title}>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
              <ul className="tags">
                {s.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="stagger">
        <h2>How it works</h2>
        <ol className="steps">
          {engagement.map((e, i) => (
            <li key={e.step}>
              <span className="num">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3>{e.step}</h3>
                <p>{e.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="stagger">
        <h2>Questions I get</h2>
        <dl className="faq">
          {faq.map((f) => (
            <div key={f.q}>
              <dt>{f.q}</dt>
              <dd>{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </SectionShell>
  );
}

/* ---------------------------------------------------------------------- About */
function About({ onClose, origin }: SectionProps) {
  return (
    <SectionShell eyebrow="The corkboard" title="About" index={4} origin={origin} onClose={onClose}>
      <section className="stagger">
        <p className="lede">{about.headline}</p>
        {about.paragraphs.map((p) => (
          <p className="body-lg" key={p.slice(0, 24)}>
            {p}
          </p>
        ))}
      </section>
      <section className="stagger">
        <dl className="facts">
          {about.facts.map((f) => (
            <div key={f.label}>
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
        <p className="body-lg quiet">{identity.summary}</p>
      </section>
    </SectionShell>
  );
}

/* --------------------------------------------------------------------- Record */
function Record({ onClose, origin }: SectionProps) {
  return (
    <SectionShell eyebrow="The bookshelf" title="Record" index={3} origin={origin} onClose={onClose}>
      <section className="stagger">
        <h2>Education</h2>
        <ul className="timeline">
          {education.map((e) => (
            <li key={e.credential}>
              <p className="dates">{e.dates}</p>
              <h3>{e.credential}</h3>
              <p className="org">{e.org}</p>
              <p>{e.detail}</p>
              <p className="links">
                {e.links.map((l) => (
                  <Out href={l.href} key={l.href}>
                    {l.label}
                  </Out>
                ))}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="stagger">
        <h2>Work</h2>
        <ul className="timeline">
          {work.map((w) => (
            <li key={`${w.org}-${w.role}`}>
              <p className="dates">{w.dates}</p>
              <h3>{w.role}</h3>
              <p className="org">{w.org}</p>
              <p>{w.body}</p>
              <p className="links">
                <Out href={w.href}>{new URL(w.href).hostname.replace('www.', '')}</Out>
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="stagger">
        <h2>Leadership and community</h2>
        <ul className="timeline">
          {leadership.map((l) => (
            <li key={`${l.org}-${l.role}`}>
              <p className="dates">{l.dates}</p>
              <h3>{l.role}</h3>
              <p className="org">{l.org}</p>
              <p>{l.body}</p>
              {l.href && (
                <p className="links">
                  <Out href={l.href}>{new URL(l.href).hostname.replace('www.', '')}</Out>
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------- Projects */
function Projects({ onClose, origin }: SectionProps) {
  return (
    <SectionShell eyebrow="The poster" title="Projects shipped" index={2} origin={origin} onClose={onClose}>
      <section className="stagger">
        <p className="lede">Six builds. Repositories and demos below.</p>
        <div className="cards project-cards">
          {projects.map((p) => (
            <article className="card project" key={p.name}>
              <p className="meta">{p.meta}</p>
              <h3>{p.name}</h3>
              <p>{p.body}</p>
              <p className="links">
                <Out href={p.repo}>Repository</Out>
                {p.demo && <Out href={p.demo}>Live demo</Out>}
              </p>
            </article>
          ))}
        </div>
        <p className="links">
          <Out href={identity.github}>Everything else on GitHub</Out>
        </p>
      </section>
    </SectionShell>
  );
}

/* ----------------------------------------------------------------------- Play */
function Play({ onClose, origin }: SectionProps) {
  return (
    <SectionShell eyebrow="The mug" title="Play" index={5} origin={origin} onClose={onClose}>
      <section className="stagger">
        <p className="lede">{play.intro}</p>
      </section>

      {/* Outside .stagger: the arcade runs its own entrance, and a staggered
          fade on a live canvas fights the game's first frame. */}
      <Arcade />

      <section className="stagger">
        <h2>Toolkit</h2>
        <dl className="facts toolkit">
          {toolkit.map((t) => (
            <div key={t.category}>
              <dt>{t.category}</dt>
              <dd>
                <ul className="tags">
                  {t.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </SectionShell>
  );
}

/* -------------------------------------------------------------------- Contact */
function Contact({ onClose, origin }: SectionProps) {
  const subject = encodeURIComponent('Thirty minutes — where my time goes');
  return (
    <SectionShell eyebrow="The phone" title="Book a call" index={6} origin={origin} onClose={onClose}>
      <section className="stagger">
        <p className="lede">{contact.cta}</p>
        <p className="body-lg">{contact.body}</p>
        <p className="prompt">{contact.formPrompt}</p>
        <p className="links cta-row">
          <a className="btn" href={`mailto:${contact.email}?subject=${subject}`}>
            Email {contact.email}
          </a>
          <Out href={identity.linkedin}>LinkedIn</Out>
          <Out href={identity.github}>GitHub</Out>
        </p>
        <p className="body-lg quiet">{identity.location}</p>
      </section>
    </SectionShell>
  );
}

/* --------------------------------------------------------------------- Résumé */
function Resume({ onClose, origin }: SectionProps) {
  return (
    <SectionShell eyebrow="The door" title="Résumé" index={7} origin={origin} onClose={onClose}>
      <section className="stagger">
        <p className="lede">{identity.summary}</p>
        {resumeUrl ? (
          <p className="links cta-row">
            {/* Opened rather than `download`d: a download attribute is inert
                inside the artifact preview's sandbox, so the button would do
                nothing there. Opening it works everywhere, and saving from
                the browser's own PDF viewer is one more click. */}
            <a className="btn" href={resumeUrl} target="_blank" rel="noreferrer noopener">
              Open résumé (PDF)
            </a>
          </p>
        ) : (
          /* No dead button: if the PDF is ever taken down, set `resumeUrl`
             back to null and this stands in for it. */
          <p className="body-lg quiet">
            The PDF is not posted yet. Until it is, the record is in full behind the bookshelf,
            and the links below are current.
          </p>
        )}
        <p className="links cta-row">
          <Out href={identity.sourcePortfolio}>Full portfolio</Out>
          <Out href={identity.github}>GitHub</Out>
          <Out href={identity.linkedin}>LinkedIn</Out>
          <a className="out" href={`mailto:${identity.email}`}>
            {identity.email}
          </a>
        </p>
      </section>
    </SectionShell>
  );
}

const REGISTRY: Record<SectionId, (p: SectionProps) => JSX.Element> = {
  build: Build,
  about: About,
  record: Record,
  projects: Projects,
  play: Play,
  contact: Contact,
  resume: Resume,
};

export function Section({
  id,
  origin,
  onClose,
}: {
  id: SectionId;
  origin: OpenOrigin | null;
  onClose: () => void;
}) {
  const Body = REGISTRY[id];
  return <Body onClose={onClose} origin={origin} />;
}
