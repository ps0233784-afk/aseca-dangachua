import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './lib/auth';
import PublicLayout from './components/layout/PublicLayout';
import AppLayout from './components/layout/AppLayout';
import HomePage from './pages/public/Home';
import AboutPage from './pages/public/About';
import PublicSchoolsPage from './pages/public/Schools';
import ManagingBodyPage from './pages/public/ManagingBody';
import ContactPage from './pages/public/Contact';
import DictionaryPage from './pages/public/Dictionary';
import OlChikiLabPage from './pages/public/OlChikiLab';
import PanditRaghunathMurmuPage from './pages/public/PanditRaghunathMurmu';
import LoginPage from './pages/auth/Login';
import ForgotPasswordPage from './pages/auth/ForgotPassword';
import DashboardPage from './pages/app/Dashboard';
import SchoolsPage from './pages/app/Schools';
import StudentsPage from './pages/app/Students';
import TeachersPage from './pages/app/Teachers';
import StaffPage from './pages/app/Staff';
import UsersPage from './pages/app/Users';
import PageBuilderPage from './pages/app/PageBuilder';
import DictionaryAdminPage from './pages/app/DictionaryAdmin';
import MediaLibraryPage from './pages/app/MediaLibrary';
import WorkspacePage from './pages/app/Workspace';

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      {/* Public website */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/schools" element={<PublicSchoolsPage />} />
        <Route path="/managing-body" element={<ManagingBodyPage />} />
        <Route path="/pandit-raghunath-murmu" element={<PanditRaghunathMurmuPage />} />
        <Route path="/dictionary" element={<DictionaryPage />} />
        <Route path="/olchiki-lab" element={<OlChikiLabPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Admin ERP */}
      <Route path="/app" element={<Protected><AppLayout /></Protected>}>
        <Route index element={<DashboardPage />} />
        <Route path="schools" element={<SchoolsPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="teachers" element={<TeachersPage />} />
        <Route path="staff" element={<StaffPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="page-builder" element={<PageBuilderPage />} />
        <Route path="dictionary" element={<DictionaryAdminPage />} />
        <Route path="media" element={<MediaLibraryPage />} />
        <Route path="workspace/:module" element={<WorkspacePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
