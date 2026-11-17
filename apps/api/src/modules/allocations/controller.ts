import type { CreateAllocationInput } from '@housing/shared';
import type { Request, Response } from 'express';
import { currentUser } from '../../utils/currentUser.js';
import { allocateRoom, cancelAllocation, listAllocations } from './service.js';

export async function listAllocationsController(
  _request: Request,
  response: Response
): Promise<void> {
  const allocations = await listAllocations();
  response.json({ data: allocations });
}

export async function allocateRoomController(request: Request, response: Response): Promise<void> {
  const allocation = await allocateRoom(
    request.body as CreateAllocationInput,
    currentUser(request).id
  );
  response.status(201).json({ data: allocation });
}

export async function cancelAllocationController(
  request: Request,
  response: Response
): Promise<void> {
  const allocation = await cancelAllocation(request.params.id ?? '', currentUser(request).id);
  response.json({ data: allocation });
}
