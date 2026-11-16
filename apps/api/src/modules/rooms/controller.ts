import type { CreateRoomInput, UpdateRoomInput } from '@housing/shared';
import type { Request, Response } from 'express';
import {
  createRoom,
  listAvailableRooms,
  listRooms,
  updateRoom,
  type RoomFilters,
} from './service.js';

export async function listRoomsController(request: Request, response: Response): Promise<void> {
  const filters = request.query as RoomFilters;
  const rooms = await listRooms({
    hostel_id: filters.hostel_id,
    status: filters.status,
  });
  response.json({ data: rooms });
}

export async function listAvailableRoomsController(
  request: Request,
  response: Response
): Promise<void> {
  const hostelId =
    typeof request.query.hostel_id === 'string' ? request.query.hostel_id : undefined;
  const rooms = await listAvailableRooms(hostelId);
  response.json({ data: rooms });
}

export async function createRoomController(request: Request, response: Response): Promise<void> {
  const room = await createRoom(request.body as CreateRoomInput);
  response.status(201).json({ data: room });
}

export async function updateRoomController(request: Request, response: Response): Promise<void> {
  const room = await updateRoom(request.params.id ?? '', request.body as UpdateRoomInput);
  response.json({ data: room });
}
