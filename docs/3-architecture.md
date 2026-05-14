# System Architecture & Tech Stack

## 1. Technology Stack

- **Frontend:** React.js, Tailwind CSS. Must include **React Router** (routing), **React Query** (data fetching/caching), and **Redux Toolkit** (global state management).
- **Backend:** Node.js with Express.js.
- **Database:** PostgreSQL.
- **ORM:** Prisma.

## 2. Backend Architecture (MVCS Pattern)

The Express backend MUST strictly follow the **MVCS (Model-View-Controller-Service)** architecture and adhere to **SOLID principles** (Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, Dependency Inversion).

- **Models / Types:** Defined by Prisma Schema.
- **Controllers (PL):** Handle incoming HTTP requests, validate input, and send HTTP responses. **No business logic here.**
- **Services (BL):** This is the core of the MVCS pattern. It contains all the complex business rules (e.g., GPA calculation, checking if an appeal is valid). Services are called by Controllers.
- **Repositories (DAL):** The only layer that interacts directly with the database via Prisma Client. Called by Services.

## 3. Frontend Architecture

- **Component Structure:** - `components/` (Reusable UI components like Buttons, Cards).
  - `pages/` (View components corresponding to routes using React Router).
  - `layouts/` (Sidebar, Navbar wrappers depending on User Role).
  - `store/` (Redux slices for global state).
  - `api/` (Axios instances and React Query hooks to interact with backend Services).
  - `hooks/` (Custom React hooks for shared logic).
  - `routes/` (Route definitions using React Router).
  - `utils/` (Utility functions, constants, and types).

## 4. Development Workflow Guidelines for AI (Cursor)

1. Always read `1-requirements-and-actors.md` before implementing a new feature to understand the context.
2. Rely strictly on `2-database-schema.md` when defining Prisma models.
3. When generating backend code, strictly enforce the MVCS pattern. Separate routes, controllers, services, and repositories into distinct files.
4. Apply SOLID principles to keep functions pure, small, and testable.
5. For frontend, ensure components are reusable and follow a clear folder structure. Use React Router for navigation and React Query for data fetching.
