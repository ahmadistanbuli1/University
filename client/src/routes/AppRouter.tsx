import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout.js';
import { AffairsLayout } from '../layouts/AffairsLayout.js';
import { FacultyLayout } from '../layouts/FacultyLayout.js';
import { LibrarianLayout } from '../layouts/LibrarianLayout.js';
import { ManagerLayout } from '../layouts/ManagerLayout.js';
import { PublicLayout } from '../layouts/PublicLayout.js';
import { StudentLayout } from '../layouts/StudentLayout.js';
import { AdminAppealsPage } from '../pages/AdminAppealsPage.js';
import { AdminDashboardPage } from '../pages/AdminDashboardPage.js';
import { AdminLogsPage } from '../pages/AdminLogsPage.js';
import { AdminNewsPage } from '../pages/AdminNewsPage.js';
import { AdminUsersPage } from '../pages/AdminUsersPage.js';
import { AffairsStudentsPage } from '../pages/AffairsStudentsPage.js';
import { AffairsDashboardPage } from '../pages/AffairsDashboardPage.js';
import { AffairsTranscriptsPage } from '../pages/AffairsTranscriptsPage.js';
import { FacultyAnalyticsPage } from '../pages/FacultyAnalyticsPage.js';
import { FacultyClassesPage } from '../pages/FacultyClassesPage.js';
import { FacultyDashboardPage } from '../pages/FacultyDashboardPage.js';
import { FacultyGradesPage } from '../pages/FacultyGradesPage.js';
import { HomePage } from '../pages/HomePage.js';
import { LibrarianBooksPage } from '../pages/LibrarianBooksPage.js';
import { LibrarianDashboardPage } from '../pages/LibrarianDashboardPage.js';
import { LibraryPage } from '../pages/LibraryPage.js';
import { LoginPage } from '../pages/LoginPage.js';
import { RegisterPage } from '../pages/RegisterPage.js';
import { AdminCurriculumPage } from '../pages/AdminCurriculumPage.js';
import { AdminManagerRequestsPage } from '../pages/AdminManagerRequestsPage.js';
import { ManagerCurriculumPage } from '../pages/ManagerCurriculumPage.js';
import { ManagerDashboardPage } from '../pages/ManagerDashboardPage.js';
import { ManagerNewsPage } from '../pages/ManagerNewsPage.js';
import { ManagerRequestsPage } from '../pages/ManagerRequestsPage.js';
import { ManagerStudentsPage } from '../pages/ManagerStudentsPage.js';
import { NewsPage } from '../pages/NewsPage.js';
import { StudentAppealsPage } from '../pages/StudentAppealsPage.js';
import { StudentCoursesPage } from '../pages/StudentCoursesPage.js';
import { StudentDashboardPage } from '../pages/StudentDashboardPage.js';
import { StudentGradesPage } from '../pages/StudentGradesPage.js';
import { StudentStudyPlanPage } from '../pages/StudentStudyPlanPage.js';
import { StudentTranscriptsPage } from '../pages/StudentTranscriptsPage.js';
import { StudentTuitionPage } from '../pages/StudentTuitionPage.js';
import { StudentPaymentPage } from '../pages/StudentPaymentPage.js';
import { StudentDiscountsPage } from '../pages/StudentDiscountsPage.js';
import { AdminDiscountsPage } from '../pages/AdminDiscountsPage.js';
import { ProtectedRoute } from './ProtectedRoute.js';
import { RoleRoute } from './RoleRoute.js';

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/library" element={<LibraryPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route
          path="/student"
          element={
            <RoleRoute allowedRoles={['STUDENT', 'FACULTY']}>
              <StudentLayout />
            </RoleRoute>
          }
        >
          <Route index element={<StudentDashboardPage />} />
          <Route path="courses" element={<StudentCoursesPage />} />
          <Route path="grades" element={<StudentGradesPage />} />
          <Route path="study-plan" element={<StudentStudyPlanPage />} />
          <Route path="appeals" element={<StudentAppealsPage />} />
          <Route path="transcripts" element={<StudentTranscriptsPage />} />
          <Route path="tuition" element={<StudentTuitionPage />} />
          <Route path="pay/:installmentId" element={<StudentPaymentPage />} />
          <Route path="discounts" element={<StudentDiscountsPage />} />
        </Route>

        <Route
          path="/faculty"
          element={
            <RoleRoute allowedRoles={['FACULTY']}>
              <FacultyLayout />
            </RoleRoute>
          }
        >
          <Route index element={<FacultyDashboardPage />} />
          <Route path="classes" element={<FacultyClassesPage />} />
          <Route path="grades" element={<FacultyGradesPage />} />
          <Route path="analytics" element={<FacultyAnalyticsPage />} />
        </Route>

        <Route
          path="/admin"
          element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <AdminLayout />
            </RoleRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="students" element={<AffairsStudentsPage />} />
          <Route path="news" element={<AdminNewsPage />} />
          <Route path="appeals" element={<AdminAppealsPage />} />
          <Route path="discounts" element={<AdminDiscountsPage />} />
          <Route path="transcripts" element={<AffairsTranscriptsPage />} />
          <Route path="logs" element={<AdminLogsPage />} />
          <Route path="curriculum" element={<AdminCurriculumPage />} />
          <Route path="manager-requests" element={<AdminManagerRequestsPage />} />
        </Route>

        <Route
          path="/affairs"
          element={
            <RoleRoute allowedRoles={['AFFAIRS']}>
              <AffairsLayout />
            </RoleRoute>
          }
        >
          <Route index element={<AffairsDashboardPage />} />
          <Route path="students" element={<AffairsStudentsPage />} />
          <Route path="transcripts" element={<AffairsTranscriptsPage />} />
        </Route>

        <Route
          path="/manager"
          element={
            <RoleRoute allowedRoles={['MANAGER']}>
              <ManagerLayout />
            </RoleRoute>
          }
        >
          <Route index element={<ManagerDashboardPage />} />
          <Route path="news" element={<ManagerNewsPage />} />
          <Route path="curriculum" element={<ManagerCurriculumPage />} />
          <Route path="students" element={<ManagerStudentsPage />} />
          <Route path="requests" element={<ManagerRequestsPage />} />
        </Route>

        <Route
          path="/librarian"
          element={
            <RoleRoute allowedRoles={['LIBRARIAN']}>
              <LibrarianLayout />
            </RoleRoute>
          }
        >
          <Route index element={<LibrarianDashboardPage />} />
          <Route path="books" element={<LibrarianBooksPage />} />
          <Route path="news" element={<NewsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
