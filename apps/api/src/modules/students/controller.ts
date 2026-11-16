import type { UpdateStudentInput } from '@housing/shared';
import type { Request, Response } from 'express';
import { currentUser } from '../../utils/currentUser.js';
import { requireStudentForUser, updateStudentForUser } from './service.js';

export async function getMyProfile(request: Request, response: Response): Promise<void> {
  const student = await requireStudentForUser(currentUser(request).id);
  response.json({ data: student });
}

export async function updateMyProfile(request: Request, response: Response): Promise<void> {
  const student = await updateStudentForUser(
    currentUser(request).id,
    request.body as UpdateStudentInput
  );
  response.json({ data: student });
}
