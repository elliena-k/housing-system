import type { AdminApplicationFilter, ReviewApplicationInput } from '@housing/shared';
import type { Request, Response } from 'express';
import { currentUser } from '../../utils/currentUser.js';
import { getApplicationForAdmin, listApplications, reviewApplication } from './adminService.js';

export async function listApplicationsController(
  request: Request,
  response: Response
): Promise<void> {
  const applications = await listApplications(request.query as AdminApplicationFilter);
  response.json({ data: applications });
}

export async function getApplicationController(
  request: Request,
  response: Response
): Promise<void> {
  const application = await getApplicationForAdmin(request.params.id ?? '');
  response.json({ data: application });
}

export async function reviewApplicationController(
  request: Request,
  response: Response
): Promise<void> {
  const application = await reviewApplication(
    request.params.id ?? '',
    request.body as ReviewApplicationInput,
    currentUser(request).id
  );
  response.json({ data: application });
}
