import type { CreateHostelInput, UpdateHostelInput } from '@housing/shared';
import type { Request, Response } from 'express';
import { createHostel, listHostels, updateHostel } from './service.js';

export async function listHostelsController(_request: Request, response: Response): Promise<void> {
  const hostels = await listHostels();
  response.json({ data: hostels });
}

export async function createHostelController(request: Request, response: Response): Promise<void> {
  const hostel = await createHostel(request.body as CreateHostelInput);
  response.status(201).json({ data: hostel });
}

export async function updateHostelController(request: Request, response: Response): Promise<void> {
  const hostel = await updateHostel(request.params.id ?? '', request.body as UpdateHostelInput);
  response.json({ data: hostel });
}
