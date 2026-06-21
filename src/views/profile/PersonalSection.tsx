import { useProfile } from '../../context/ProfileContext';
import { Input, SectionHeader } from '../../components/ui';
import { SummarySection } from './SummarySection';

export function PersonalSection() {
  const { profile, updateProfile } = useProfile();
  const p = profile.personal;
  const update = (field: keyof typeof p, value: string) => updateProfile({ personal: { ...p, [field]: value } });

  return (
    <div className="space-y-6">
      <SectionHeader title="Personal Information" description="Your contact details and professional identity." />
      <div className="bg-white rounded-2xl border border-dark-200/50 shadow-card p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Full Name *"  value={p.name}      onChange={e => update('name', e.target.value)}      placeholder="Jane Smith" />
          <Input label="Email *"      type="email" value={p.email}  onChange={e => update('email', e.target.value)}  placeholder="jane@example.com" />
          <Input label="Phone"        value={p.phone}     onChange={e => update('phone', e.target.value)}     placeholder="+1 555 000 0000" />
          <Input label="Location"     value={p.location}  onChange={e => update('location', e.target.value)}  placeholder="San Francisco, CA" />
          <Input label="LinkedIn URL" value={p.linkedin}  onChange={e => update('linkedin', e.target.value)}  placeholder="https://linkedin.com/in/..." />
          <Input label="GitHub URL"   value={p.github}    onChange={e => update('github', e.target.value)}    placeholder="https://github.com/..." />
          <Input label="Portfolio"    value={p.portfolio} onChange={e => update('portfolio', e.target.value)} placeholder="https://yoursite.com" />
          <Input label="Twitter / X"  value={p.twitter}   onChange={e => update('twitter', e.target.value)}   placeholder="https://x.com/..." />
        </div>
      </div>

      <SummarySection />
    </div>
  );
}
