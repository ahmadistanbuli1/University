import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'node:path';
import type { Env } from './config.js';
import { prisma } from './lib/prisma.js';
import { errorHandler } from './middleware/errorHandler.js';
import { createAuthenticateMiddleware } from './middleware/authenticate.js';
import { AuditRepository } from './domains/audit/audit.repository.js';
import { AuditService } from './domains/audit/audit.service.js';
import { AuthRepository } from './domains/auth/auth.repository.js';
import { AuthService } from './domains/auth/auth.service.js';
import { AuthController } from './domains/auth/auth.controller.js';
import { createAuthRouter } from './domains/auth/auth.routes.js';
import { UsersRepository } from './domains/users/users.repository.js';
import { UsersService } from './domains/users/users.service.js';
import { UsersController } from './domains/users/users.controller.js';
import { createUsersRouter } from './domains/users/users.routes.js';
import { StructureRepository } from './domains/structure/structure.repository.js';
import { StructureService } from './domains/structure/structure.service.js';
import { StructureController } from './domains/structure/structure.controller.js';
import { createStructureRouter } from './domains/structure/structure.routes.js';
import { AcademicRepository } from './domains/academic/academic.repository.js';
import { AcademicService } from './domains/academic/academic.service.js';
import { AcademicController } from './domains/academic/academic.controller.js';
import { createAcademicRouter } from './domains/academic/academic.routes.js';
import { StudentServicesRepository } from './domains/studentServices/studentServices.repository.js';
import { StudentServicesService } from './domains/studentServices/studentServices.service.js';
import { StudentServicesController } from './domains/studentServices/studentServices.controller.js';
import { createStudentServicesRouter } from './domains/studentServices/studentServices.routes.js';
import { LibraryRepository } from './domains/library/library.repository.js';
import { LibraryService } from './domains/library/library.service.js';
import { LibraryController } from './domains/library/library.controller.js';
import { createLibraryRouter } from './domains/library/library.routes.js';
import { NewsRepository } from './domains/news/news.repository.js';
import { NewsService } from './domains/news/news.service.js';
import { NewsController } from './domains/news/news.controller.js';
import { createNewsRouter } from './domains/news/news.routes.js';
import { AdminRepository } from './domains/admin/admin.repository.js';
import { AdminService } from './domains/admin/admin.service.js';
import { AdminController } from './domains/admin/admin.controller.js';
import { createAdminRouter } from './domains/admin/admin.routes.js';

export function createApp(env: Env) {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
  app.use(express.json());

  const authenticate = createAuthenticateMiddleware(env);

  const auditRepo = new AuditRepository(prisma);
  const auditService = new AuditService(auditRepo);

  const authRepo = new AuthRepository(prisma);
  const authService = new AuthService(authRepo, auditService, env);
  const authController = new AuthController(authService);

  const usersRepo = new UsersRepository(prisma);
  const usersService = new UsersService(usersRepo);
  const usersController = new UsersController(usersService);

  const structureRepo = new StructureRepository(prisma);
  const structureService = new StructureService(structureRepo);
  const structureController = new StructureController(structureService);

  const academicRepo = new AcademicRepository(prisma);
  const academicService = new AcademicService(academicRepo, auditService);
  const academicController = new AcademicController(academicService);

  const studentRepo = new StudentServicesRepository(prisma);
  const studentService = new StudentServicesService(studentRepo, auditService);
  const studentController = new StudentServicesController(studentService);

  const libraryRepo = new LibraryRepository(prisma);
  const libraryService = new LibraryService(libraryRepo, auditService);
  const libraryController = new LibraryController(libraryService);

  const newsRepo = new NewsRepository(prisma);
  const newsService = new NewsService(newsRepo, auditService);
  const newsController = new NewsController(newsService);

  const adminRepo = new AdminRepository(prisma);
  const adminService = new AdminService(adminRepo, auditService);
  const adminController = new AdminController(adminService);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/uploads', express.static(path.resolve(env.UPLOAD_DIR)));

  app.use('/api/auth', createAuthRouter(authController));
  app.use('/api/users', createUsersRouter(usersController, authenticate));
  app.use('/api/structure', createStructureRouter(structureController));
  app.use('/api/academic', createAcademicRouter(academicController, authenticate));
  app.use('/api/student-services', createStudentServicesRouter(studentController, authenticate));
  app.use('/api/library', createLibraryRouter(libraryController, authenticate, env));
  app.use('/api/news', createNewsRouter(newsController, authenticate));
  app.use('/api/admin', createAdminRouter(adminController, authenticate));

  app.use(errorHandler);
  return app;
}
