import { createHostelSchema, updateHostelSchema } from '@housing/shared';
import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validateBody, validateParams } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { idParamsSchema } from '../../utils/params.js';
import {
  createHostelController,
  listHostelsController,
  updateHostelController,
} from './controller.js';

export const hostelsRouter = Router();

hostelsRouter.use(authenticate);
hostelsRouter.get('/', asyncHandler(listHostelsController));

export const adminHostelsRouter = Router();

adminHostelsRouter.use(authenticate, requireRole('admin'));
adminHostelsRouter.post(
  '/',
  validateBody(createHostelSchema),
  asyncHandler(createHostelController)
);
adminHostelsRouter.patch(
  '/:id',
  validateParams(idParamsSchema),
  validateBody(updateHostelSchema),
  asyncHandler(updateHostelController)
);
