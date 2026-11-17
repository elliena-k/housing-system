import { createRoomSchema, roomStatusSchema, updateRoomSchema } from '@housing/shared';
import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validateBody, validateParams, validateQuery } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { idParamsSchema } from '../../utils/params.js';
import {
  createRoomController,
  listAvailableRoomsController,
  listRoomsController,
  updateRoomController,
} from './controller.js';

const roomFilterSchema = z.object({
  hostel_id: z.string().uuid().optional(),
  status: roomStatusSchema.optional(),
});

const availableFilterSchema = z.object({
  hostel_id: z.string().uuid().optional(),
});

export const adminRoomsRouter = Router();

adminRoomsRouter.use(authenticate, requireRole('admin'));
adminRoomsRouter.get(
  '/available',
  validateQuery(availableFilterSchema),
  asyncHandler(listAvailableRoomsController)
);
adminRoomsRouter.get('/', validateQuery(roomFilterSchema), asyncHandler(listRoomsController));
adminRoomsRouter.post('/', validateBody(createRoomSchema), asyncHandler(createRoomController));
adminRoomsRouter.patch(
  '/:id',
  validateParams(idParamsSchema),
  validateBody(updateRoomSchema),
  asyncHandler(updateRoomController)
);
