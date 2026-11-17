import { studentSearchSchema } from '@housing/shared';
import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validateQuery } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { searchStudentsController } from './adminController.js';

export const adminStudentsRouter = Router();

adminStudentsRouter.use(authenticate, requireRole('admin'));
adminStudentsRouter.get(
  '/',
  validateQuery(studentSearchSchema),
  asyncHandler(searchStudentsController)
);
