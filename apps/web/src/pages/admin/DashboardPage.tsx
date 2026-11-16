import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';

export function AdminDashboardPage() {
  return (
    <div>
      <PageHeader
        title="Administrator dashboard"
        description="Manage accommodation inventory. Application processing and allocation arrive next."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          className="rounded-lg border border-ink-200 bg-surface p-6 shadow-sm transition hover:border-primary-300 hover:bg-primary-50"
          to="/admin/hostels"
        >
          <h2 className="text-title font-semibold text-ink-900">Hostels</h2>
          <p className="mt-1 text-sm text-ink-600">
            Add hostels and maintain their location, capacity, gender, and status.
          </p>
        </Link>

        <Link
          className="rounded-lg border border-ink-200 bg-surface p-6 shadow-sm transition hover:border-primary-300 hover:bg-primary-50"
          to="/admin/rooms"
        >
          <h2 className="text-title font-semibold text-ink-900">Rooms</h2>
          <p className="mt-1 text-sm text-ink-600">
            Manage rooms, capacity, and availability across every hostel.
          </p>
        </Link>
      </div>
    </div>
  );
}
