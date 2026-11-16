import { createApplicationSchema } from '@housing/shared';
import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { getApplication, listApplications, submitApplication } from './controller.js';

export const applicationsRouter = Router();

applicationsRouter.use(authenticate);
applicationsRouter.post(
  '/',
  validateBody(createApplicationSchema),
  asyncHandler(submitApplication)
);
applicationsRouter.get('/me', asyncHandler(listApplications));
applicationsRouter.get('/me/:id', asyncHandler(getApplication));
