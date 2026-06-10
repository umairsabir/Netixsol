import ApplyButton from '@/components/ApplyButton';
import { jobs } from '@/data/jobs';
import Header from '@/components/Header';
import Link from 'next/link';
import { ArrowLeft, MapPin, Calendar, Briefcase } from 'lucide-react';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return jobs.map((job) => ({
    id: job.id.toString(),
  }));
}

export default async function JobDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = jobs.find((j) => j.id === parseInt(id));

  if (!job) {
    notFound();
  }

  const buttonColors = [
    { light: '#ff4d4d', dark: '#b30000' }, // Red
    { light: '#4d94ff', dark: '#0047b3' }, // Blue
    { light: '#4dff88', dark: '#00b33c' }, // Green
    { light: '#ffcc4d', dark: '#b38600' }, // Yellow/Amber
    { light: '#d94dff', dark: '#730099' }, // Purple
    { light: '#4dffff', dark: '#00b3b3' }, // Cyan
    { light: '#ff4db8', dark: '#b30071' }, // Pink
  ];

  const colors = buttonColors[job.id % buttonColors.length];
  const tags = [job.role, job.level, ...job.languages, ...job.tools];

  return (
    <>
      <Header />
      <main className="fade-in">
        <Link 
          href="/" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            color: 'var(--accent)', 
            fontWeight: 700,
            marginBottom: '32px',
            textDecoration: 'none'
          }}
        >
          <ArrowLeft size={18} />
          Back to Listings
        </Link>

        <div 
          style={{
            backgroundColor: 'var(--card-bg)',
            padding: '48px',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px', marginBottom: '40px' }}>
            <div 
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: `radial-gradient(circle at 35% 35%, ${colors.light} 0%, ${colors.dark} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: '#fff',
                fontWeight: 800,
                fontSize: '14px',
                textAlign: 'center',
                padding: '15px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                lineHeight: '1.2',
                position: 'relative',
                boxShadow: `
                  inset 0 0 18px rgba(0,0,0,0.5), 
                  0 12px 24px rgba(0,0,0,0.3),
                  inset 0 6px 9px rgba(255,255,255,0.4)
                `
              }}
            >
              <span style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)', zIndex: 2 }}>{job.company}</span>
              {/* Glossy Overlay */}
              <div style={{
                position: 'absolute',
                top: '5%',
                left: '15%',
                width: '70%',
                height: '40%',
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.4) 0%, transparent 100%)',
                borderRadius: '40% 40% 80% 80%',
                zIndex: 1
              }}></div>
            </div>
            <div>
              <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>{job.position}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '20px' }}>{job.company}</span>
                {job.new && <span style={{ backgroundColor: 'var(--accent)', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>NEW!</span>}
              </div>
            </div>
          </div>

          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '24px',
              padding: '24px 0',
              borderTop: '1px solid var(--accent-light)',
              borderBottom: '1px solid var(--accent-light)',
              marginBottom: '40px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
              <Calendar size={20} color="var(--accent)" />
              <div>
                <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Posted</p>
                <p style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{job.postedAt}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
              <Briefcase size={20} color="var(--accent)" />
              <div>
                <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Contract</p>
                <p style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{job.contract}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
              <MapPin size={20} color="var(--accent)" />
              <div>
                <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Location</p>
                <p style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{job.location}</p>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '20px' }}>Requirements & Skills</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {tags.map((tag) => (
                <span 
                  key={tag}
                  style={{
                    backgroundColor: 'var(--accent-light)',
                    color: 'var(--accent)',
                    padding: '10px 16px',
                    borderRadius: '4px',
                    fontWeight: 700,
                    fontSize: '14px'
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            <div>
              <h3 style={{ marginBottom: '16px', fontSize: '18px', color: 'var(--accent)' }}>Position Overview</h3>
              <ul style={{ listStyle: 'none', color: 'var(--text-secondary)', lineHeight: '2' }}>
                <li><strong>Role:</strong> {job.role}</li>
                <li><strong>Level:</strong> {job.level}</li>
                <li><strong>Contract:</strong> {job.contract}</li>
                <li><strong>Location:</strong> {job.location}</li>
              </ul>
            </div>
            <div>
              <h3 style={{ marginBottom: '16px', fontSize: '18px', color: 'var(--accent)' }}>Key Highlights</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6' }}>
                Join a high-performing team at {job.company} as a {job.position}. 
                Work on impactful projects using {job.languages.join(', ')} {job.tools.length > 0 ? `and ${job.tools.join(', ')}` : ''}.
              </p>
            </div>
          </div>

          <div>
            <h3 style={{ marginBottom: '20px', fontSize: '20px' }}>Detailed Description</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '16px' }}>
              We are looking for a talented {job.position} to join our team at {job.company}. 
              In this role, you will be responsible for building and maintaining high-quality software solutions. 
              You will collaborate with cross-functional teams to deliver exceptional user experiences.
              Our ideal candidate is a self-starter with a passion for excellence and a deep understanding of modern development practices.
            </p>
          </div>

          <ApplyButton />
        </div>
      </main>
    </>
  );
}
