import { createAllocationSchema } from '@housing/shared';
import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validateBody, validateParams } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { idParamsSchema } from '../../utils/params.js';
import {
  allocateRoomController,
  cancelAllocationController,
  listAllocationsController,
} from './controller.js';

export const adminAllocationsRouter = Router();

adminAllocationsRouter.use(authenticate, requireRole('admin'));
adminAllocationsRouter.get('/', asyncHandler(listAllocationsController));
adminAllocationsRouter.post(
  '/',
  validateBody(createAllocationSchema),
  asyncHandler(allocateRoomController)
);
adminAllocationsRouter.patch(
  '/:id/cancel',
  validateParams(idParamsSchema),
  asyncHandler(cancelAllocationController)
);
