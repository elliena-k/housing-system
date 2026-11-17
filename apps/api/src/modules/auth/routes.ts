import { registerSchema } from '@housing/shared';
import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { getMe, register } from './controller.js';

export const authRouter = Router();

authRouter.post('/register', validateBody(registerSchema), asyncHandler(register));

export const meRouter = Router();

meRouter.get('/me', authenticate, asyncHandler(getMe));
