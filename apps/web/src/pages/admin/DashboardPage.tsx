import { PageHeader } from '../../components/PageHeader';

export function AdminDashboardPage() {
  return (
    <div>
      <PageHeader
        title="Administrator dashboard"
        description="Application processing, hostel and room management arrive in the next phases."
      />

      <section className="rounded-lg border border-ink-200 bg-surface p-6 shadow-sm">
        <p className="text-sm text-ink-700">
          The student journey is implemented. Administrator tools for processing applications,
          managing hostels and rooms, and allocating rooms will be added in Phase 3 and Phase 4.
        </p>
      </section>
    </div>
  );
}
