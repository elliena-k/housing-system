import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { getStatus } from './controller.js';

export const statusRouter = Router();

statusRouter.use(authenticate);
statusRouter.get('/me', asyncHandler(getStatus));
