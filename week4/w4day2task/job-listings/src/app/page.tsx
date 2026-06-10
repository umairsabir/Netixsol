import Header from '@/components/Header';
import FilterBar from '@/components/FilterBar';
import JobList from '@/components/JobList';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <FilterBar />
        <JobList />
      </main>
    </>
  );
}
