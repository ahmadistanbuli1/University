# Database Schema Requirements (PostgreSQL via Prisma)

## Overview

The database is relational and consists of 5 main domains: User Management, University Structure, Academic Affairs, Library System, and System Auditing.

## 1. User Management

**Table: `users`**

- `id`: Primary Key (UUID)
- `name`: String
- `email`: String (Unique)
- `password`: String (Hashed)
- `role`: Enum (ADMIN, STUDENT, FACULTY, LIBRARIAN, AFFAIRS, MANAGER)
- `college_id`: Foreign Key (Nullable) -> Links to `colleges`
- `created_at`: Timestamp (Default: now)

## 2. University Structure

**Table: `colleges`**

- `id`: Primary Key
- `name`: String
- `description`: Text

**Table: `departments`**

- `id`: Primary Key
- `name`: String
- `college_id`: Foreign Key -> Links to `colleges`

**Table: `courses`**

- `id`: Primary Key
- `name`: String
- `code`: String (Unique)
- `department_id`: Foreign Key -> Links to `departments`

**Table: `faculty_courses`** (Links Faculty to specific Course sections)

- `id`: Primary Key
- `faculty_id`: Foreign Key -> Links to `users` (User role must be FACULTY)
- `course_id`: Foreign Key -> Links to `courses`
- `semester`: String (e.g., "Fall 2025")
- `academic_year`: String (e.g., "2025-2026")

## 3. Academic & Student Affairs

**Table: `students`**

- `id`: Primary Key
- `user_id`: Foreign Key (Unique) -> Links to `users`
- `department_id`: Foreign Key -> Links to `departments`
- `academic_number`: String (Unique)
- `current_semester`: Integer

**Table: `enrollments`** (Courses students are currently taking)

- `id`: Primary Key
- `student_id`: Foreign Key -> Links to `students`
- `course_id`: Foreign Key -> Links to `courses`
- `semester`: String
- `academic_year`: String

**Table: `exam_results`**

- `id`: Primary Key
- `student_id`: Foreign Key -> Links to `students`
- `faculty_course_id`: Foreign Key -> Links to `faculty_courses`
- `score`: Decimal (5,2)
- `attempt_number`: Integer (Default: 1)
- `semester`: String
- `academic_year`: String
- `result_date`: Date (Default: now)
- _Constraint_: Unique ([student_id, faculty_course_id, attempt_number])

**Table: `grade_appeals`**

- `id`: Primary Key
- `student_id`: Foreign Key -> Links to `students`
- `exam_result_id`: Foreign Key -> Links to `exam_results`
- `reason`: Text
- `status`: Enum (PENDING, APPROVED, REJECTED)
- `admin_response`: Text (Nullable)
- `submitted_at`: Timestamp (Default: now)

**Table: `transcript_requests`**

- `id`: Primary Key
- `student_id`: Foreign Key -> Links to `students`
- `status`: Enum (PENDING, PROCESSED, DELIVERED)
- `file_path`: String (Nullable) -> URL/Path to the generated PDF
- `requested_at`: Timestamp (Default: now)
- `processed_at`: Timestamp (Nullable)

## 4. Library System

**Table: `books`**

- `id`: Primary Key
- `title`: String
- `file_path`: String (Path to PDF file)
- `department_id`: Foreign Key -> Links to `departments`
- `added_by`: Foreign Key -> Links to `users` (LIBRARIAN)
- `downloads_count`: Integer (Default: 0)
- `reads_count`: Integer (Default: 0)
- `publish_year`: Integer
- `created_at`: Timestamp (Default: now)

**Table: `book_keywords`**

- `id`: Primary Key
- `book_id`: Foreign Key -> Links to `books`
- `keyword`: String

## 5. System Logs & News

**Table: `news`**

- `id`: Primary Key
- `title`: String
- `content`: Text
- `image_url`: String (Nullable)
- `college_id`: Foreign Key (Nullable) -> Links to `colleges`
- `author_id`: Foreign Key -> Links to `users`
- `created_at`: Timestamp (Default: now)

**Table: `audit_logs`** (Tracking all critical actions)

- `id`: Primary Key
- `user_id`: Foreign Key -> Links to `users`
- `action`: String (e.g., "CREATE_GRADE", "UPDATE_APPEAL", "UPLOAD_BOOK")
- `entity`: String (e.g., "exam_results")
- `entity_id`: String (ID of the affected record)
- `details`: JSON (Nullable) -> Store old/new values for comparison
- `created_at`: Timestamp (Default: now)
