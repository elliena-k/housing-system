import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { env } from './config/env.js';
import { logger } from './config/logger.js';

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

app.use((_request, response) => {
  response.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found.',
    },
  });
});
