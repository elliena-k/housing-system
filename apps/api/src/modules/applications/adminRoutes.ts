import { adminApplicationFilterSchema, reviewApplicationSchema } from '@housing/shared';
import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validateBody, validateParams, validateQuery } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { idParamsSchema } from '../../utils/params.js';
import {
  getApplicationController,
  listApplicationsController,
  reviewApplicationController,
} from './adminController.js';

export const adminApplicationsRouter = Router();

adminApplicationsRouter.use(authenticate, requireRole('admin'));
adminApplicationsRouter.get(
  '/',
  validateQuery(adminApplicationFilterSchema),
  asyncHandler(listApplicationsController)
);
adminApplicationsRouter.get(
  '/:id',
  validateParams(idParamsSchema),
  asyncHandler(getApplicationController)
);
adminApplicationsRouter.patch(
  '/:id',
  validateParams(idParamsSchema),
  validateBody(reviewApplicationSchema),
  asyncHandler(reviewApplicationController)
);
