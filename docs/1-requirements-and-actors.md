# University Web System - Requirements & Actors

## 1. Project Overview

A comprehensive web system serving as the unified digital interface for the university. It acts as a central hub for university news, digital library resources, and academic services (grades, student affairs, exam analysis).

## 2. System Scope

- **University Structure Management:** Display colleges, departments, and courses.
- **Academic Staff Directory:** Faculty members and their associated courses.
- **Digital Library:** Categorized books with read/download capabilities and statistics.
- **Unified Student Services:** Exam results viewing, academic enrollment management, grade appeals, and transcript requests.
- **Centralized Reports:** Analytics for exam results and library usage.

## 3. Actors and Roles (Permissions)

The system has 7 distinct user roles, inheriting basic functionalities:

1. **Visitor:** Can browse news, university info, and search for books.
2. **Student:** Inherits Visitor. Can login, read/download books, view enrolled courses, view their exam grades/GPA, **submit grade appeals for specific courses**, and **request official academic transcripts**.
3. **Faculty Member:** Inherits Student. Can enter exam results for their courses, suggest reference books, and view exam analytics.
4. **Librarian:** Manages library system. Can perform CRUD operations on books, upload PDF files, and generate library reports.
5. **College Manager:** Manages specific college data (college news, courses, faculty members).
6. **Student Affairs Officer:** Manages student profiles, enrollments, academic records, and processes transcript requests.
7. **Admin (System Manager):** Full system control, user management, global news management, and high-level exam result analysis. Review and process grade appeals.

## 4. Key Functional Requirements

- **Auth System:** Registration, Login, Role-based access control (RBAC).
- **Library Module:** Upload PDFs, track download/read counts, keyword tagging, advanced filtering.
- **Academic Module:** Course registration, grading system, GPA calculation, grade appeals processing, and transcript generation.
- **News Module:** College-specific and global university news posting.
