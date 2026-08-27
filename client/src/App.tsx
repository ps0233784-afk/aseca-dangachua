import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth';
import { Loading } from './components/ui';
import PublicLayout from './pages/PublicLayout';
import { HomePage, AboutPage, PublicSchools, PublicNotices, PublicEvents, ContactPage } from './pages/public-site';
import LoginPage from './pages/Login';
import AdminLayout from './pages/AdminLayout';
import Dashboard from './pages/Dashboard';
import SchoolsPage from './pages/Schools';
import StudentsPage from './pages/Students';
import StudentProfile from './pages/StudentProfile';
import TeachersStaff from './pages/TeachersStaff';
import ExamsPage from './pages/Exams';
import MarkSheetPage from './pages/MarkSheet';
import AttendancePage from './pages/Attendance';
import AcademicsPage from './pages/Academics';
import FacilitiesPage from './pages/Facilities';
import ContentPage from './pages/Content';
import ToolsPage from './pages/Tools';
import UsersPage from './pages/Users';
import { AffiliationPrint, MarkSheetPrint, CertificatePrint, IdCardPrint } from './pages/Printables';

function Protected({ children }: any) {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public website */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/schools" element={<PublicSchools />} />
        <Route path="/notices" element={<PublicNotices />} />
        <Route path="/events" element={<PublicEvents />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>
      <Route path="/login" element={<LoginPage />} />

      {/* Printable documents */}
      <Route path="/print/affiliation/:schoolId" element={<Protected><AffiliationPrint /></Protected>} />
      <Route path="/print/marksheet/:examId" element={<Protected><MarkSheetPrint /></Protected>} />
      <Route path="/print/certificate/:studentId/:type" element={<Protected><CertificatePrint /></Protected>} />
      <Route path="/print/idcard/:studentId" element={<Protected><IdCardPrint /></Protected>} />

      {/* Admin ERP */}
      <Route path="/app" element={<Protected><AdminLayout /></Protected>}>
        <Route index element={<Dashboard />} />
        <Route path="schools" element={<SchoolsPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="students/:id" element={<StudentProfile />} />
        <Route path="teachers" element={<TeachersStaff mode="teachers" />} />
        <Route path="staff" element={<TeachersStaff mode="staff" />} />
        <Route path="exams" element={<ExamsPage />} />
        <Route path="exams/:id" element={<MarkSheetPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="subjects" element={<AcademicsPage mode="subjects" />} />
        <Route path="timetable" element={<AcademicsPage mode="timetable" />} />
        <Route path="hostel" element={<FacilitiesPage mode="hostel" />} />
        <Route path="library" element={<FacilitiesPage mode="library" />} />
        <Route path="notices" element={<ContentPage mode="notices" />} />
        <Route path="events" element={<ContentPage mode="events" />} />
        <Route path="media" element={<ContentPage mode="media" />} />
        <Route path="pages" element={<ContentPage mode="pages" />} />
        <Route path="certificates" element={<ToolsPage mode="certificates" />} />
        <Route path="excel" element={<ToolsPage mode="excel" />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="audit" element={<UsersPage mode="audit" />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
