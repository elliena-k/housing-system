import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { getStatsController } from './controller.js';

export const adminStatsRouter = Router();

adminStatsRouter.use(authenticate, requireRole('admin'));
adminStatsRouter.get('/', asyncHandler(getStatsController));
