import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path, { resolve } from 'node:path';
import type { Env } from './config.js';
import { prisma } from './lib/prisma.js';
import { errorHandler } from './middleware/errorHandler.js';
import { createAuthenticateMiddleware, optionalAuthenticate } from './middleware/authenticate.js';
import { ActivityLogController } from './domains/audit/activity-log.controller.js';
import { createActivityLogRouter } from './domains/audit/activity-log.routes.js';
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
import { TuitionRepository } from './domains/tuition/tuition.repository.js';
import { TuitionService } from './domains/tuition/tuition.service.js';
import { TuitionController } from './domains/tuition/tuition.controller.js';
import { createTuitionRouter } from './domains/tuition/tuition.routes.js';
import { NotificationRepository } from './domains/notifications/notification.repository.js';
import {
  NotificationDispatchService,
  NotificationService,
} from './domains/notifications/notification.service.js';
import { NotificationController } from './domains/notifications/notification.controller.js';
import { createNotificationRouter } from './domains/notifications/notification.routes.js';
import { CurriculumRepository } from './domains/curriculum/curriculum.repository.js';
import { CurriculumService } from './domains/curriculum/curriculum.service.js';
import { CurriculumController } from './domains/curriculum/curriculum.controller.js';
import { createCurriculumRouter } from './domains/curriculum/curriculum.routes.js';
import { ManagerRepository } from './domains/manager/manager.repository.js';
import { ManagerService } from './domains/manager/manager.service.js';
import { ManagerController } from './domains/manager/manager.controller.js';
import {
  createAdminManagerRequestsRouter,
  createManagerRouter,
} from './domains/manager/manager.routes.js';
import { GradeSubmissionsRepository } from './domains/gradeSubmissions/grade-submissions.repository.js';
import { GradeSubmissionsService } from './domains/gradeSubmissions/grade-submissions.service.js';
import { GradeSubmissionsController } from './domains/gradeSubmissions/grade-submissions.controller.js';
import { createGradeSubmissionsRouter } from './domains/gradeSubmissions/grade-submissions.routes.js';

export function createApp(env: Env) {
  const app = express();
  if (env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }
  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
  app.use(cookieParser());
  app.use(express.json());

  const authenticate = createAuthenticateMiddleware(env);
  const optionalAuth = optionalAuthenticate(env);

  const auditRepo = new AuditRepository(prisma);
  const auditService = new AuditService(auditRepo);

  const authRepo = new AuthRepository(prisma);
  const authService = new AuthService(authRepo, auditService, env);
  const authController = new AuthController(authService, env);

  const usersRepo = new UsersRepository(prisma);
  const usersService = new UsersService(usersRepo);
  const usersController = new UsersController(usersService);

  const structureRepo = new StructureRepository(prisma);
  const structureService = new StructureService(structureRepo);
  const structureController = new StructureController(structureService);

  const notificationRepo = new NotificationRepository(prisma);
  const notificationDispatch = new NotificationDispatchService(notificationRepo);
  const notificationService = new NotificationService(notificationRepo);
  const notificationController = new NotificationController(notificationService);

  const academicRepo = new AcademicRepository(prisma);
  const academicService = new AcademicService(academicRepo, auditService, notificationDispatch);
  const academicController = new AcademicController(academicService);

  const studentRepo = new StudentServicesRepository(prisma);
  const studentService = new StudentServicesService(
    studentRepo,
    auditService,
    resolve(env.UPLOAD_DIR),
    notificationDispatch
  );
  const studentController = new StudentServicesController(studentService);

  const libraryRepo = new LibraryRepository(prisma);
  const libraryService = new LibraryService(libraryRepo, auditService, resolve(env.UPLOAD_DIR));
  const libraryController = new LibraryController(libraryService);

  const newsRepo = new NewsRepository(prisma);
  const newsService = new NewsService(newsRepo, auditService, notificationDispatch);
  const newsController = new NewsController(newsService);

  const adminRepo = new AdminRepository(prisma);
  const adminService = new AdminService(adminRepo, auditService);
  const adminController = new AdminController(adminService);

  const tuitionRepo = new TuitionRepository(prisma);
  const tuitionService = new TuitionService(tuitionRepo, auditService, notificationDispatch);
  const tuitionController = new TuitionController(tuitionService);

  const curriculumRepo = new CurriculumRepository(prisma);
  const curriculumService = new CurriculumService(curriculumRepo, auditService);
  const curriculumController = new CurriculumController(curriculumService);

  const managerRepo = new ManagerRepository(prisma);
  const managerService = new ManagerService(managerRepo, auditService, notificationDispatch);
  const managerController = new ManagerController(managerService);

  const gradeSubmissionsRepo = new GradeSubmissionsRepository(prisma);
  const gradeSubmissionsService = new GradeSubmissionsService(
    gradeSubmissionsRepo,
    auditService,
    notificationDispatch
  );
  const gradeSubmissionsController = new GradeSubmissionsController(gradeSubmissionsService);

  const activityLogController = new ActivityLogController(auditService);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/uploads', express.static(path.resolve(env.UPLOAD_DIR)));

  app.use('/api/auth', createAuthRouter(authController, authenticate, optionalAuth));
  app.use('/api/users', createUsersRouter(usersController, authenticate));
  app.use('/api/structure', createStructureRouter(structureController));
  app.use('/api/academic', createAcademicRouter(academicController, authenticate));
  app.use(
    '/api/grade-submissions',
    createGradeSubmissionsRouter(gradeSubmissionsController, authenticate)
  );
  app.use('/api/student-services', createStudentServicesRouter(studentController, authenticate, resolve(env.UPLOAD_DIR)));
  app.use('/api/library', createLibraryRouter(libraryController, authenticate, env));
  app.use('/api/news', createNewsRouter(newsController, authenticate, env));
  app.use('/api/admin', createAdminRouter(adminController, authenticate));
  app.use(
    '/api/admin',
    createAdminManagerRequestsRouter(managerController, authenticate)
  );
  app.use('/api/curriculum', createCurriculumRouter(curriculumController, authenticate));
  app.use('/api/manager', createManagerRouter(managerController, authenticate));
  app.use('/api/tuition', createTuitionRouter(tuitionController, authenticate, env));
  app.use('/api/notifications', createNotificationRouter(notificationController, authenticate));
  app.use('/api/activity-log', createActivityLogRouter(activityLogController, authenticate));

  app.use(errorHandler);
  return app;
}
