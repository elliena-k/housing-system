import type { RegisterInput } from '@housing/shared';
import type { Request, Response } from 'express';
import { env } from '../../config/env.js';
import { currentUser } from '../../utils/currentUser.js';
import { getStudentForUser } from '../students/service.js';
import { registerStudent } from './service.js';

export async function register(request: Request, response: Response): Promise<void> {
  const account = await registerStudent(request.body as RegisterInput);
  response.status(201).json({ data: account });
}

export async function getMe(request: Request, response: Response): Promise<void> {
  const user = currentUser(request);
  const student = await getStudentForUser(user.id);
  response.json({
    data: {
      user: { id: user.id, role: user.role, isActive: user.isActive },
      student,
      session: env.OPEN_SESSION,
    },
  });
}
