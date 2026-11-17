import type { StudentSearch } from '@housing/shared';
import type { Request, Response } from 'express';
import { searchStudents } from './adminService.js';

export async function searchStudentsController(
  request: Request,
  response: Response
): Promise<void> {
  const students = await searchStudents(request.query as StudentSearch);
  response.json({ data: students });
}
