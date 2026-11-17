import type { Request, Response } from 'express';
import { getAdminStats } from './service.js';

export async function getStatsController(_request: Request, response: Response): Promise<void> {
  const stats = await getAdminStats();
  response.json({ data: stats });
}
