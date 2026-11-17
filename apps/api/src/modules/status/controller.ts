import type { Request, Response } from 'express';
import { currentUser } from '../../utils/currentUser.js';
import { getMyStatus } from './service.js';

export async function getStatus(request: Request, response: Response): Promise<void> {
  const status = await getMyStatus(currentUser(request).id);
  response.json({ data: status });
}
