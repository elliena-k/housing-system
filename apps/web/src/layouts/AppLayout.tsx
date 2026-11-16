import { NavLink, Outlet, useNavigate } from 'react-router-dom';
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

const adminLinks: NavItem[] = [{ to: '/admin', label: 'Dashboard', end: true }];

export function AppLayout() {
  const { user, student, signOut } = useAuth();
  const navigate = useNavigate();
  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const displayName = student ? `${student.first_name} ${student.last_name}` : 'Administrator';

  return (
    <div className="min-h-screen bg-surface-1">
      <header className="border-b border-ink-200 bg-surface">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-8">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-500">University of Ibadan</p>
            <p className="text-sm font-semibold text-ink-900">Housing Allocation</p>
          </div>
          <nav className="flex flex-wrap items-center gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `rounded px-2.5 py-1.5 text-sm ${
                    isActive ? 'bg-primary text-white' : 'text-ink-700 hover:bg-ink-100'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-sm text-ink-600">{displayName}</span>
            <Button variant="secondary" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-8">
        <Outlet />
      </main>
    </div>
  );
}
