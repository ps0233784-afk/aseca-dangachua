import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { I18nProvider } from './lib/i18n';
import { ThemeProvider } from './contexts/ThemeContext';
import { BrandProvider } from './contexts/BrandContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/toast';

import PublicLayout from './components/layout/PublicLayout';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

import Home from './pages/public/Home';
import Schools from './pages/public/Schools';
import About from './pages/public/About';
import ManagingBody from './pages/public/ManagingBody';
import Culture from './pages/public/Culture';
import Notices from './pages/public/Notices';
import Events from './pages/public/Events';
import Gallery from './pages/public/Gallery';
import Results from './pages/public/Results';
import Contact from './pages/public/Contact';

import Dashboard from './pages/app/Dashboard';
import SchoolsAdmin from './pages/app/SchoolsAdmin';
import StudentsPage from './pages/app/Students';
import StudentDetail from './pages/app/StudentDetail';
import StaffPage from './pages/app/Staff';
import AcademicsPage from './pages/app/Academics';
import AttendancePage from './pages/app/Attendance';
import ExamsPage from './pages/app/Exams';
import ExamDetail from './pages/app/ExamDetail';
import ReportCardsPage from './pages/app/ReportCards';
import TimetablePage from './pages/app/Timetable';
import FeesPage from './pages/app/Fees';
import HostelPage from './pages/app/Hostel';
import LibraryPage from './pages/app/Library';
import NoticesAdmin from './pages/app/NoticesAdmin';
import EventsAdmin from './pages/app/EventsAdmin';
import GalleryAdmin from './pages/app/GalleryAdmin';
import DocumentsPage from './pages/app/Documents';
import CertificatesPage from './pages/app/Certificates';
import IdCardsPage from './pages/app/IdCards';
import ReportsPage from './pages/app/Reports';
import UsersPage from './pages/app/Users';
import RolesPage from './pages/app/Roles';
import SettingsPage from './pages/app/Settings';
import AuditPage from './pages/app/Audit';
import CultureAdmin from './pages/app/CultureAdmin';
import ManagingBodyAdmin from './pages/app/ManagingBodyAdmin';
import AchievementsAdmin from './pages/app/AchievementsAdmin';
import ProfilePage from './pages/app/Profile';
import PortalPage from './pages/app/Portal';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <I18nProvider>
      <ThemeProvider>
        <BrandProvider>
          <AuthProvider>
            <ToastProvider>
              <BrowserRouter>
                <Routes>
                  {/* Public */}
                  <Route element={<PublicLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/schools" element={<Schools />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/managing-body" element={<ManagingBody />} />
                    <Route path="/culture" element={<Culture />} />
                    <Route path="/academics" element={<About />} />
                    <Route path="/notices" element={<Notices />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/results" element={<Results />} />
                    <Route path="/contact" element={<Contact />} />
                  </Route>

                  {/* Auth */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />

                  {/* ERP */}
                  <Route path="/app" element={<RequireAuth><AppLayout /></RequireAuth>}>
                    <Route index element={<Dashboard />} />
                    <Route path="portal" element={<PortalPage />} />
                    <Route path="schools" element={<SchoolsAdmin />} />
                    <Route path="students" element={<StudentsPage />} />
                    <Route path="students/:id" element={<StudentDetail />} />
                    <Route path="staff" element={<StaffPage />} />
                    <Route path="academics" element={<AcademicsPage />} />
                    <Route path="attendance" element={<AttendancePage />} />
                    <Route path="exams" element={<ExamsPage />} />
                    <Route path="exams/:id" element={<ExamDetail />} />
                    <Route path="report-cards" element={<ReportCardsPage />} />
                    <Route path="timetable" element={<TimetablePage />} />
                    <Route path="fees" element={<FeesPage />} />
                    <Route path="hostel" element={<HostelPage />} />
                    <Route path="library" element={<LibraryPage />} />
                    <Route path="notices" element={<NoticesAdmin />} />
                    <Route path="events" element={<EventsAdmin />} />
                    <Route path="gallery" element={<GalleryAdmin />} />
                    <Route path="documents" element={<DocumentsPage />} />
                    <Route path="certificates" element={<CertificatesPage />} />
                    <Route path="id-cards" element={<IdCardsPage />} />
                    <Route path="reports" element={<ReportsPage />} />
                    <Route path="culture" element={<CultureAdmin />} />
                    <Route path="achievements" element={<AchievementsAdmin />} />
                    <Route path="managing-body" element={<ManagingBodyAdmin />} />
                    <Route path="users" element={<UsersPage />} />
                    <Route path="roles" element={<RolesPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="audit" element={<AuditPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                  </Route>

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </BrowserRouter>
            </ToastProvider>
          </AuthProvider>
        </BrandProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
