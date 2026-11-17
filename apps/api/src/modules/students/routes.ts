import { updateStudentSchema } from '@housing/shared';
import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { getMyProfile, updateMyProfile } from './controller.js';

export const studentsRouter = Router();

studentsRouter.use(authenticate);
studentsRouter.get('/me', asyncHandler(getMyProfile));
studentsRouter.put('/me', validateBody(updateStudentSchema), asyncHandler(updateMyProfile));
