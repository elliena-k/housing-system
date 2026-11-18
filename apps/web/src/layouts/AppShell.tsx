import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { Button } from '../components/Button';

interface NavItem {
  to: string;
  label: string;
  end?: boolean;
}

const studentLinks: NavItem[] = [
  { to: '/student', label: 'Dashboard', end: true },
  { to: '/student/profile', label: 'Profile' },
  { to: '/student/apply', label: 'Apply' },
  { to: '/student/application', label: 'Application' },
];

const adminLinks: NavItem[] = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/applications', label: 'Applications' },
  { to: '/admin/allocations', label: 'Allocations' },
  { to: '/admin/hostels', label: 'Hostels' },
  { to: '/admin/rooms', label: 'Rooms' },
  { to: '/admin/students', label: 'Students' },
];

const pageTitles: Record<string, string> = {
  '/student': 'Dashboard',
  '/student/profile': 'Profile',
  '/student/apply': 'Apply for accommodation',
  '/student/application': 'Your application',
  '/admin': 'Administrator dashboard',
  '/admin/applications': 'Applications',
  '/admin/allocations': 'Allocations',
  '/admin/hostels': 'Hostels',
  '/admin/rooms': 'Rooms',
  '/admin/students': 'Students',
};

export function AppShell() {
  const { user, student, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const links = user?.role === 'admin' ? adminLinks : studentLinks;
  const title = pageTitles[location.pathname] ?? 'Housing Allocation';
  const displayName = student ? `${student.first_name} ${student.last_name}` : 'Administrator';
  const initials = student ? `${student.first_name.charAt(0)}${student.last_name.charAt(0)}` : 'AD';

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      navigate('/login', { replace: true });
    } finally {
      setSigningOut(false);
    }
  };

  const navigation = (
    <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Main navigation">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) =>
            `block rounded-md px-3 py-2.5 text-sm font-medium transition ${
              isActive
                ? 'bg-primary text-white'
                : 'text-ink-700 hover:bg-ink-100 hover:text-ink-900'
            }`
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );

  const account = (
    <div className="border-t border-ink-100 p-4">
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-800">
          {initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink-900">{displayName}</p>
          <p className="text-xs text-ink-500">
            {user?.role === 'admin' ? 'Administrator' : 'Student'}
          </p>
        </div>
      </div>
      <Button
        className="w-full"
        variant="secondary"
        onClick={handleSignOut}
        loading={signingOut}
        loadingLabel="Signing out..."
      >
        Sign out
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-1">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-ink-900 focus:shadow-lg"
      >
        Skip to content
      </a>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-ink-200 bg-surface lg:flex">
        <div className="border-b border-ink-100 px-5 py-5">
          <p className="text-xs uppercase tracking-wide text-ink-500">University of Ibadan</p>
          <p className="mt-1 text-lg font-semibold text-ink-900">Housing Allocation</p>
        </div>
        {navigation}
        {account}
      </aside>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-ink-900/40"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="relative flex h-full w-72 max-w-[85%] flex-col border-r border-ink-200 bg-surface shadow-xl">
            <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-ink-500">University of Ibadan</p>
                <p className="text-base font-semibold text-ink-900">Housing Allocation</p>
              </div>
              <button
                type="button"
                className="rounded-md px-2 py-1 text-sm font-medium text-ink-600 underline hover:bg-ink-100"
                onClick={() => setMenuOpen(false)}
              >
                Close
              </button>
            </div>
            {navigation}
            {account}
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-ink-200 bg-surface/95 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-8">
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-ink-300 text-ink-700 hover:bg-ink-100 lg:hidden"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-ink-500">Housing Allocation</p>
              <h1 className="truncate text-title font-semibold text-ink-900">{title}</h1>
            </div>
          </div>
        </header>

        <main id="main-content" className="mx-auto max-w-6xl px-4 py-6 sm:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
