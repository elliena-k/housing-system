import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireRole } from './auth/RequireRole';
import { LoadingState } from './components/LoadingState';
import { AppShell } from './layouts/AppShell';

const LoginPage = lazy(() =>
  import('./pages/auth/LoginPage').then((module) => ({ default: module.LoginPage }))
);
const RegisterPage = lazy(() =>
  import('./pages/auth/RegisterPage').then((module) => ({ default: module.RegisterPage }))
);
const StudentDashboardPage = lazy(() =>
  import('./pages/student/DashboardPage').then((module) => ({
    default: module.StudentDashboardPage,
  }))
);
const ProfilePage = lazy(() =>
  import('./pages/student/ProfilePage').then((module) => ({ default: module.ProfilePage }))
);
const ApplyPage = lazy(() =>
  import('./pages/student/ApplyPage').then((module) => ({ default: module.ApplyPage }))
);
const ApplicationPage = lazy(() =>
  import('./pages/student/ApplicationPage').then((module) => ({
    default: module.ApplicationPage,
  }))
);
const AdminDashboardPage = lazy(() =>
  import('./pages/admin/DashboardPage').then((module) => ({
    default: module.AdminDashboardPage,
  }))
);
const AdminApplicationsPage = lazy(() =>
  import('./pages/admin/ApplicationsPage').then((module) => ({
    default: module.AdminApplicationsPage,
  }))
);
const AdminAllocationsPage = lazy(() =>
  import('./pages/admin/AllocationsPage').then((module) => ({
    default: module.AdminAllocationsPage,
  }))
);
const AdminHostelsPage = lazy(() =>
  import('./pages/admin/HostelsPage').then((module) => ({
    default: module.AdminHostelsPage,
  }))
);
const AdminRoomsPage = lazy(() =>
  import('./pages/admin/RoomsPage').then((module) => ({ default: module.AdminRoomsPage }))
);
const AdminStudentsPage = lazy(() =>
  import('./pages/admin/StudentsPage').then((module) => ({
    default: module.AdminStudentsPage,
  }))
);

export function App() {
  return (
    <Suspense
      fallback={
        <div className="p-8">
          <LoadingState message="Loading page..." />
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/student"
          element={
            <RequireRole role="student">
              <AppShell />
            </RequireRole>
          }
        >
          <Route index element={<StudentDashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="apply" element={<ApplyPage />} />
          <Route path="application" element={<ApplicationPage />} />
        </Route>

        <Route
          path="/admin"
          element={
            <RequireRole role="admin">
              <AppShell />
            </RequireRole>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="applications" element={<AdminApplicationsPage />} />
          <Route path="allocations" element={<AdminAllocationsPage />} />
          <Route path="hostels" element={<AdminHostelsPage />} />
          <Route path="rooms" element={<AdminRoomsPage />} />
          <Route path="students" element={<AdminStudentsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}
