import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { PageHeader } from '../../components/PageHeader';
import { TableSkeleton } from '../../components/Skeleton';
import { TextField } from '../../components/TextField';
import { Toolbar } from '../../components/Toolbar';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { authedFetch } from '../../lib/api';
import { errorInfo } from '../../lib/errors';
import type { Student } from '../../lib/types';

export function AdminStudentsPage() {
  const [params, setParams] = useSearchParams();
  const urlQuery = params.get('q') ?? '';
  const [search, setSearch] = useState(urlQuery);
  const debouncedSearch = useDebouncedValue(search, 300);

  useEffect(() => {
    if (debouncedSearch === urlQuery) {
      return;
    }

    const next = new URLSearchParams(params);
    if (debouncedSearch) {
      next.set('q', debouncedSearch);
    } else {
      next.delete('q');
    }
    setParams(next, { replace: true });
  }, [debouncedSearch, urlQuery, params, setParams]);

  const studentsQuery = useQuery({
    queryKey: ['admin', 'students', debouncedSearch],
    queryFn: () => {
      const query = debouncedSearch ? `?q=${encodeURIComponent(debouncedSearch)}` : '';
      return authedFetch<Student[]>(`/admin/students${query}`);
    },
  });

  const students = studentsQuery.data ?? [];

  return (
    <div>
      <PageHeader
        title="Students"
        description="Search registered students by name or matriculation number."
      />

      <Toolbar>
        <div className="w-full sm:w-80">
          <TextField
            label="Search"
            requirement="optional"
            placeholder="Name or matriculation number"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </Toolbar>

      {studentsQuery.isError ? (
        <ErrorState
          message={errorInfo(studentsQuery.error, 'We could not load students.').message}
          onRetry={() => void studentsQuery.refetch()}
          retrying={studentsQuery.isFetching}
        />
      ) : null}

      {studentsQuery.isLoading ? (
        <div className="overflow-hidden rounded-lg border border-ink-200 bg-surface shadow-sm">
          <TableSkeleton rows={6} columns={5} />
        </div>
      ) : null}

      {!studentsQuery.isLoading && !studentsQuery.isError && students.length === 0 ? (
        <EmptyState
          title="No students found"
          description={
            search
              ? 'Try a different name or matriculation number.'
              : 'No students have registered yet.'
          }
        />
      ) : null}

      {students.length > 0 ? (
        <>
          <div className="hidden overflow-hidden rounded-lg border border-ink-200 bg-surface shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-1 text-xs uppercase tracking-wide text-ink-500">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Matric</th>
                    <th className="px-4 py-3">Faculty</th>
                    <th className="px-4 py-3">Level</th>
                    <th className="px-4 py-3">Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-t border-ink-100">
                      <td className="px-4 py-3 font-medium text-ink-900">
                        {student.first_name} {student.last_name}
                      </td>
                      <td className="px-4 py-3 text-ink-600">{student.matric_no}</td>
                      <td className="px-4 py-3 text-ink-600">
                        {student.faculty}
                        <span className="block text-xs text-ink-500">{student.department}</span>
                      </td>
                      <td className="px-4 py-3 text-ink-600">{student.level}</td>
                      <td className="px-4 py-3 text-ink-600">
                        {student.email}
                        <span className="block text-xs text-ink-500">
                          {student.phone ?? 'No phone'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {students.map((student) => (
              <article
                key={student.id}
                className="rounded-lg border border-ink-200 bg-surface p-4 shadow-sm"
              >
                <p className="font-medium text-ink-900">
                  {student.first_name} {student.last_name}
                </p>
                <p className="text-sm text-ink-600">{student.matric_no}</p>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-ink-500">Level</dt>
                    <dd className="text-ink-700">{student.level}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-ink-500">Gender</dt>
                    <dd className="capitalize text-ink-700">{student.gender}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-xs uppercase tracking-wide text-ink-500">Faculty</dt>
                    <dd className="text-ink-700">
                      {student.faculty} · {student.department}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-xs uppercase tracking-wide text-ink-500">Contact</dt>
                    <dd className="break-all text-ink-700">
                      {student.email}
                      <span className="block text-xs text-ink-500">
                        {student.phone ?? 'No phone'}
                      </span>
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
