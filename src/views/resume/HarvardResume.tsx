import { Profile } from '../../types/profile';
import { SectionKey } from '../../types/resume';

interface Props {
  profile: Profile;
  sectionOrder: SectionKey[];
}

function formatDate(d?: string): string {
  if (!d) return '';
  const [year, month] = d.split('-');
  if (!year) return '';
  if (!month) return year;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(month) - 1]} ${year}`;
}

function formatRange(start?: string, end?: string, current?: boolean): string {
  const s = formatDate(start);
  const e = current ? 'Present' : formatDate(end);
  if (!s && !e) return '';
  if (!s) return e;
  if (!e) return s;
  return `${s} – ${e}`;
}

export function HarvardResume({ profile, sectionOrder }: Props) {
  const p = profile.personal;

  const links = [
    p.email,
    p.phone,
    p.linkedin ? 'LinkedIn' : null,
    p.github ? 'GitHub' : null,
    p.twitter ? 'Twitter' : null,
    p.portfolio || null,
  ].filter(Boolean).join(' | ');

  return (
    <div className="harvard-resume bg-white shadow-lg" style={{ width: '816px', minHeight: '1056px', padding: '48px 56px', fontFamily: 'Times New Roman, Times, serif', fontSize: '11pt', lineHeight: '1.4', color: '#000' }}>
      <div className="text-center mb-3">
        <h1 style={{ fontSize: '22pt', fontWeight: 'bold', letterSpacing: '0.04em', marginBottom: '2px' }}>{p.name || 'Your Name'}</h1>
        <p style={{ fontSize: '9.5pt', color: '#333' }}>{links}</p>
        {p.location && <p style={{ fontSize: '9.5pt', color: '#333' }}>{p.location}</p>}
      </div>

      {p.summary && (
        <div style={{ marginBottom: '10px' }}>
          <p style={{ fontSize: '10.5pt', lineHeight: '1.5', textAlign: 'justify' }}>{p.summary}</p>
        </div>
      )}

      {sectionOrder.map(key => {
        switch (key) {
          case 'education': return <EducationSection key={key} profile={profile} />;
          case 'experience': return <ExperienceSection key={key} profile={profile} />;
          case 'projects': return <ProjectsSection key={key} profile={profile} />;
          case 'skills': return <SkillsSection key={key} profile={profile} />;
          case 'certifications': return <CertificationsSection key={key} profile={profile} />;
          case 'achievements': return <AchievementsSection key={key} profile={profile} />;
          case 'hackathons': return <HackathonsSection key={key} profile={profile} />;
          case 'leadership': return <LeadershipSection key={key} profile={profile} />;
          case 'volunteering': return <VolunteeringSection key={key} profile={profile} />;
          case 'publications': return <PublicationsSection key={key} profile={profile} />;
          case 'research': return <ResearchSection key={key} profile={profile} />;
          case 'patents': return <PatentsSection key={key} profile={profile} />;
          case 'opensource': return <OpenSourceSection key={key} profile={profile} />;
          case 'memberships': return <MembershipsSection key={key} profile={profile} />;
          case 'awards': return <AchievementsSection key={key} profile={profile} />;
          case 'extracurricular': return null;
          default: return null;
        }
      })}
    </div>
  );
}

function SectionDivider({ title }: { title: string }) {
  return (
    <div style={{ marginTop: '14px', marginBottom: '6px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '11pt', fontVariant: 'small-caps', fontWeight: 'bold', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {title}
        </span>
        <div style={{ flex: 1, height: '0.5px', backgroundColor: '#000' }} />
      </div>
    </div>
  );
}

function EducationSection({ profile }: { profile: Profile }) {
  if (!profile.education.length) return null;
  return (
    <div>
      <SectionDivider title="Education" />
      {profile.education.map(edu => (
        <div key={edu.id} style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontWeight: 'bold', fontSize: '10.5pt' }}>{edu.institution}</span>
            <span style={{ fontSize: '10pt' }}>{edu.location}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontStyle: 'italic', fontSize: '10pt' }}>
              {[edu.degree, edu.field].filter(Boolean).join(' in ')}
              {edu.gpa ? `, GPA: ${edu.gpa}` : ''}
            </span>
            <span style={{ fontSize: '10pt' }}>{formatRange(edu.startDate, edu.endDate, edu.current)}</span>
          </div>
          {edu.honors && <p style={{ fontSize: '10pt', marginTop: '1px' }}>{edu.honors}</p>}
          {edu.coursework.length > 0 && (
            <p style={{ fontSize: '9.5pt', marginTop: '2px', color: '#333' }}>
              <span style={{ fontStyle: 'italic' }}>Relevant Coursework:</span> {edu.coursework.join(', ')}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function ExperienceSection({ profile }: { profile: Profile }) {
  if (!profile.experience.length) return null;
  return (
    <div>
      <SectionDivider title="Experience" />
      {profile.experience.map(exp => (
        <div key={exp.id} style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontWeight: 'bold', fontSize: '10.5pt' }}>{exp.role}</span>
            <span style={{ fontSize: '10pt' }}>{formatRange(exp.startDate, exp.endDate, exp.current)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontStyle: 'italic', fontSize: '10pt' }}>{exp.company}</span>
            <span style={{ fontSize: '10pt' }}>{exp.location}</span>
          </div>
          <ul style={{ marginTop: '3px', paddingLeft: '16px', marginBottom: 0 }}>
            {exp.responsibilities.filter(Boolean).map((r, i) => (
              <li key={i} style={{ fontSize: '10pt', marginBottom: '1px', lineHeight: '1.4' }}>{r}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function ProjectsSection({ profile }: { profile: Profile }) {
  if (!profile.projects.length) return null;
  return (
    <div>
      <SectionDivider title="Projects" />
      {profile.projects.map(proj => (
        <div key={proj.id} style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontWeight: 'bold', fontSize: '10.5pt' }}>
              {proj.name}
              {(proj.demoUrl || proj.repoUrl) && (
                <span style={{ fontWeight: 'normal', fontSize: '9.5pt', color: '#0066cc' }}>
                  {proj.demoUrl ? ' Live' : ''}
                  {proj.repoUrl ? (proj.demoUrl ? ' | Github' : ' Github') : ''}
                </span>
              )}
            </span>
            {(proj.startDate || proj.endDate) && (
              <span style={{ fontSize: '10pt' }}>{formatRange(proj.startDate, proj.endDate, proj.current)}</span>
            )}
          </div>
          <ul style={{ marginTop: '2px', paddingLeft: '16px', marginBottom: 0 }}>
            {proj.summary && <li style={{ fontSize: '10pt', lineHeight: '1.4', marginBottom: '1px' }}>{proj.summary}</li>}
            {proj.outcomes && proj.outcomes !== proj.summary && <li style={{ fontSize: '10pt', lineHeight: '1.4', marginBottom: '1px' }}>{proj.outcomes}</li>}
          </ul>
        </div>
      ))}
    </div>
  );
}

function SkillsSection({ profile }: { profile: Profile }) {
  const s = profile.skills;
  const groups = [
    { label: 'Languages', items: s.languages },
    { label: 'Frameworks & Technologies', items: [...s.frameworks, ...s.other] },
    { label: 'Developer Tools', items: [...s.tools, ...s.databases, ...s.cloud] },
    { label: 'Soft Skills', items: s.soft },
  ].filter(g => g.items.length > 0);

  if (!groups.length) return null;

  return (
    <div>
      <SectionDivider title="Technical Skills" />
      {groups.map(g => (
        <p key={g.label} style={{ fontSize: '10pt', lineHeight: '1.5', marginBottom: '2px' }}>
          <span style={{ fontWeight: 'bold' }}>{g.label}:</span> {g.items.join(', ')}
        </p>
      ))}
    </div>
  );
}

function CertificationsSection({ profile }: { profile: Profile }) {
  if (!profile.certifications.length) return null;
  return (
    <div>
      <SectionDivider title="Certifications" />
      {profile.certifications.map(cert => (
        <div key={cert.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '10pt' }}>
            <span style={{ fontWeight: 'bold' }}>{cert.name}</span>
            {cert.issuer ? ` — ${cert.issuer}` : ''}
          </span>
          <span style={{ fontSize: '10pt' }}>{formatDate(cert.date)}</span>
        </div>
      ))}
    </div>
  );
}

function AchievementsSection({ profile }: { profile: Profile }) {
  const items = [...profile.achievements, ...profile.awards];
  if (!items.length) return null;
  return (
    <div>
      <SectionDivider title="Awards & Achievements" />
      {items.map(a => (
        <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
          <span style={{ fontSize: '10pt' }}>
            <span style={{ fontWeight: 'bold' }}>{a.title}</span>
            {a.issuer ? ` — ${a.issuer}` : ''}
            {a.description ? `: ${a.description}` : ''}
          </span>
          <span style={{ fontSize: '10pt' }}>{formatDate(a.date)}</span>
        </div>
      ))}
    </div>
  );
}

function HackathonsSection({ profile }: { profile: Profile }) {
  if (!profile.hackathons.length) return null;
  return (
    <div>
      <SectionDivider title="Hackathons" />
      {profile.hackathons.map(h => (
        <div key={h.id} style={{ marginBottom: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 'bold', fontSize: '10.5pt' }}>{h.name}</span>
            <span style={{ fontSize: '10pt' }}>{formatDate(h.date)}</span>
          </div>
          <p style={{ fontSize: '10pt', fontStyle: 'italic' }}>{h.placement} — {h.project}</p>
          {h.description && <p style={{ fontSize: '10pt', marginTop: '1px' }}>{h.description}</p>}
        </div>
      ))}
    </div>
  );
}

function LeadershipSection({ profile }: { profile: Profile }) {
  if (!profile.leadership.length) return null;
  return (
    <div>
      <SectionDivider title="Leadership" />
      {profile.leadership.map(l => (
        <div key={l.id} style={{ marginBottom: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 'bold', fontSize: '10.5pt' }}>{l.title}</span>
            <span style={{ fontSize: '10pt' }}>{formatRange(l.startDate, l.endDate, l.current)}</span>
          </div>
          <span style={{ fontStyle: 'italic', fontSize: '10pt' }}>{l.organization}</span>
          {l.description && <p style={{ fontSize: '10pt', marginTop: '1px' }}>{l.description}</p>}
        </div>
      ))}
    </div>
  );
}

function VolunteeringSection({ profile }: { profile: Profile }) {
  if (!profile.volunteering.length) return null;
  return (
    <div>
      <SectionDivider title="Volunteering" />
      {profile.volunteering.map(v => (
        <div key={v.id} style={{ marginBottom: '5px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 'bold', fontSize: '10.5pt' }}>{v.role} — {v.organization}</span>
            <span style={{ fontSize: '10pt' }}>{formatRange(v.startDate, v.endDate, v.current)}</span>
          </div>
          {v.description && <p style={{ fontSize: '10pt' }}>{v.description}</p>}
        </div>
      ))}
    </div>
  );
}

function PublicationsSection({ profile }: { profile: Profile }) {
  if (!profile.publications.length) return null;
  return (
    <div>
      <SectionDivider title="Publications" />
      {profile.publications.map(pub => (
        <div key={pub.id} style={{ marginBottom: '5px' }}>
          <p style={{ fontSize: '10pt' }}>
            <span style={{ fontWeight: 'bold' }}>{pub.title}</span>
            {pub.journal ? `, ${pub.journal}` : ''}
            {pub.date ? `, ${formatDate(pub.date)}` : ''}
          </p>
        </div>
      ))}
    </div>
  );
}

function ResearchSection({ profile }: { profile: Profile }) {
  if (!profile.research.length) return null;
  return (
    <div>
      <SectionDivider title="Research" />
      {profile.research.map(r => (
        <div key={r.id} style={{ marginBottom: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 'bold', fontSize: '10.5pt' }}>{r.title}</span>
            <span style={{ fontSize: '10pt' }}>{formatRange(r.startDate, r.endDate, r.current)}</span>
          </div>
          <span style={{ fontStyle: 'italic', fontSize: '10pt' }}>{r.role} — {r.institution}</span>
          {r.description && <p style={{ fontSize: '10pt', marginTop: '1px' }}>{r.description}</p>}
        </div>
      ))}
    </div>
  );
}

function PatentsSection({ profile }: { profile: Profile }) {
  if (!profile.patents.length) return null;
  return (
    <div>
      <SectionDivider title="Patents" />
      {profile.patents.map(p => (
        <div key={p.id} style={{ marginBottom: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 'bold', fontSize: '10pt' }}>{p.title}</span>
            <span style={{ fontSize: '10pt' }}>{p.status}</span>
          </div>
          {p.number && <p style={{ fontSize: '9.5pt', color: '#333' }}>{p.number} · {formatDate(p.date)}</p>}
        </div>
      ))}
    </div>
  );
}

function OpenSourceSection({ profile }: { profile: Profile }) {
  if (!profile.opensource.length) return null;
  return (
    <div>
      <SectionDivider title="Open Source Contributions" />
      {profile.opensource.map(o => (
        <div key={o.id} style={{ marginBottom: '5px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 'bold', fontSize: '10.5pt' }}>{o.project}</span>
            <span style={{ fontSize: '10pt' }}>{formatRange(o.startDate, o.endDate, o.current)}</span>
          </div>
          <span style={{ fontStyle: 'italic', fontSize: '10pt' }}>{o.organization}</span>
          {o.description && <p style={{ fontSize: '10pt', marginTop: '1px' }}>{o.description}</p>}
        </div>
      ))}
    </div>
  );
}

function MembershipsSection({ profile }: { profile: Profile }) {
  if (!profile.memberships.length) return null;
  return (
    <div>
      <SectionDivider title="Professional Memberships" />
      {profile.memberships.map(m => (
        <div key={m.id} style={{ marginBottom: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 'bold', fontSize: '10pt' }}>{m.organization}</span>
            <span style={{ fontSize: '10pt' }}>{formatRange(m.startDate, m.endDate, m.current)}</span>
          </div>
          {m.role && <span style={{ fontStyle: 'italic', fontSize: '10pt' }}>{m.role}</span>}
        </div>
      ))}
    </div>
  );
}
