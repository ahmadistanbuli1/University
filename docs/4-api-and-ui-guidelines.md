# 4. API Endpoints & UI/UX Guidelines (For Cursor AI)

## 1. Context

This document defines the RESTful API structure and the Frontend UI components required for the University Web System, building upon the database schema (Prisma) and MVCS architecture.

## 2. API Endpoints Structure (Backend - Express.js)

The backend MUST follow standard REST conventions. Controllers handle requests, but ALL business logic (e.g., GPA calculation, verifying appeal eligibility) MUST reside in the `Services` layer.

### A. Authentication & Users (`/api/auth` & `/api/users`)

- `POST /api/auth/register`: Registers a new user (default role: STUDENT)
- `POST /api/auth/login`: Authenticates user, returns JWT and user role.
- `GET /api/users/me`: Returns current user profile based on JWT.
- `GET /api/users/faculty`: (Public/Visitor) Lists academic staff and their departments.

### B. University Structure (`/api/structure`)

- `GET /api/structure/colleges`: Lists all colleges.
- `GET /api/structure/departments`: Lists departments (supports `?collegeId=` filter).
- `GET /api/structure/courses`: Lists courses.

### C. Academic Affairs (`/api/academic`)

- `GET /api/academic/enrollments/me`: (Student) Get current active enrolled courses.
- `GET /api/academic/results/me`: (Student) Get all exam results and calculate current GPA.
- `POST /api/academic/results`: (Faculty) Submit grades for a specific `faculty_course_id`.
- `GET /api/academic/results/analytics`: (Faculty/Admin) Get average scores and pass rates for a course.

### D. Student Services (`/api/student-services`)

- `POST /api/student-services/appeals`: (Student) Submit a grade appeal for a specific `exam_result_id`.
- `GET /api/student-services/appeals`: (Admin) List all pending appeals.
- `PATCH /api/student-services/appeals/:id/status`: (Admin) Update appeal status (Approved/Rejected) with `admin_response`.
- `POST /api/student-services/transcripts`: (Student) Request an official transcript.
- `PATCH /api/student-services/transcripts/:id`: (Affairs) Upload the processed PDF path and mark as DELIVERED.

### E. Digital Library (`/api/library`)

- `GET /api/library/books`: (Visitor/Student) List books with pagination and `?keyword=` filter.
- `POST /api/library/books`: (Librarian) Upload a new book (Handles file upload + DB entry).
- `PATCH /api/library/books/:id/read`: Increment `reads_count`.
- `PATCH /api/library/books/:id/download`: Increment `downloads_count`.

---

## 3. Frontend UI/UX Structure (React + Tailwind)

### A. Routing & Layouts (React Router)

The frontend requires role-based layouts.

- **`PublicLayout`**: Navbar with links to News, About, Faculty Directory, Library Search, and Login.
- **`StudentLayout`**: Sidebar containing (Dashboard, My Courses, My Grades, Appeals, Transcript Requests).
- **`FacultyLayout`**: Sidebar containing (My Classes, Grade Entry, Analytics).
- **`AdminLayout`**: Sidebar containing (User Management, Global News, System Logs, Appeals Review).

### B. State Management (Redux Toolkit & React Query)

- **Redux:** Use for global synchronous UI state (e.g., `authSlice` to store current user and role, `themeSlice` for dark/light mode).
- **React Query:** Use for ALL asynchronous API calls. Implement custom hooks (e.g., `useGetStudentGrades()`, `useSubmitAppeal()`) to handle caching, loading states, and automatic refetching.

### C. Core Reusable Components (`/components/common`)

Cursor AI should prioritize building these generic components first:

1. `DataTable`: A generic table component with pagination, sorting, and search (used for books, users, grades).
2. `StatusBadge`: A pill-shaped UI component for Enums (e.g., `<StatusBadge status="PENDING" />` -> renders a yellow pill).
3. `RoleGuard`: A wrapper component that hides/shows UI elements based on the user's role.
   ```tsx
   <RoleGuard allowedRoles={['ADMIN', 'AFFAIRS']}>
     <ApproveAppealButton />
   </RoleGuard>
   ```
