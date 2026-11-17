import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { adminApplicationsRouter } from './modules/applications/adminRoutes.js';
import { applicationsRouter } from './modules/applications/routes.js';
import { adminAllocationsRouter } from './modules/allocations/routes.js';
import { authRouter, meRouter } from './modules/auth/routes.js';
import { adminHostelsRouter, hostelsRouter } from './modules/hostels/routes.js';
import { adminRoomsRouter } from './modules/rooms/routes.js';
import { adminStatsRouter } from './modules/stats/routes.js';
import { statusRouter } from './modules/status/routes.js';
import { adminStudentsRouter } from './modules/students/adminRoutes.js';
import { studentsRouter } from './modules/students/routes.js';

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());
app.use(pinoHttp({ logger, autoLogging: env.NODE_ENV !== 'test' }));

app.get('/api/health', (_request, response) => {
  response.json({
    status: 'ok',
    session: env.OPEN_SESSION,
    uptime: process.uptime(),
  });
});

app.use('/api/auth', authRouter);
app.use('/api', meRouter);
app.use('/api/students', studentsRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/status', statusRouter);
app.use('/api/hostels', hostelsRouter);
app.use('/api/admin/hostels', adminHostelsRouter);
app.use('/api/admin/rooms', adminRoomsRouter);
app.use('/api/admin/applications', adminApplicationsRouter);
app.use('/api/admin/students', adminStudentsRouter);
app.use('/api/admin/allocations', adminAllocationsRouter);
app.use('/api/admin/stats', adminStatsRouter);

app.use((_request, response) => {
  response.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found.',
    },
  });
});

app.use(errorHandler);
