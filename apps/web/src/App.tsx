import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireRole } from './auth/RequireRole';
import { AppLayout } from './layouts/AppLayout';
import { AdminDashboardPage } from './pages/admin/DashboardPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ApplicationPage } from './pages/student/ApplicationPage';
import { ApplyPage } from './pages/student/ApplyPage';
import { StudentDashboardPage } from './pages/student/DashboardPage';
import { ProfilePage } from './pages/student/ProfilePage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/student"
        element={
          <RequireRole role="student">
            <AppLayout />
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
            <AppLayout />
          </RequireRole>
        }
      >
        <Route index element={<AdminDashboardPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
