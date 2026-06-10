'use client';

import { jobs } from '@/data/jobs';
import { useJobStore } from '@/store/useJobStore';
import JobCard from './JobCard';

export default function JobList() {
  const filters = useJobStore((state) => state.filters);

  const filteredJobs = jobs.filter((job) => {
    if (filters.length === 0) return true;
    const tags = [job.role, job.level, ...job.languages, ...job.tools];
    return filters.every((filter) => tags.includes(filter));
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {filteredJobs.length > 0 ? (
        filteredJobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))
      ) : (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
          <h2>No jobs match your selected filters.</h2>
          <p>Try clearing some filters to see more opportunities.</p>
        </div>
      )}
    </div>
  );
}
