import type { CreateApplicationInput } from '@housing/shared';
import type { Request, Response } from 'express';
import { currentUser } from '../../utils/currentUser.js';
import { createApplication, getMyApplication, listMyApplications } from './service.js';

export async function submitApplication(request: Request, response: Response): Promise<void> {
  const application = await createApplication(
    currentUser(request).id,
    request.body as CreateApplicationInput
  );
  response.status(201).json({ data: application });
}

export async function listApplications(request: Request, response: Response): Promise<void> {
  const applications = await listMyApplications(currentUser(request).id);
  response.json({ data: applications });
}

export async function getApplication(request: Request, response: Response): Promise<void> {
  const application = await getMyApplication(currentUser(request).id, request.params.id ?? '');
  response.json({ data: application });
}
