import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';
import { AppError } from '../utils/AppError.js';

export function validateBody(schema: ZodTypeAny): RequestHandler {
  return (request, _response, next) => {
    const result = schema.safeParse(request.body);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const fields: Record<string, string> = {};

      for (const [field, messages] of Object.entries(fieldErrors)) {
        const first = messages?.[0];
        if (first) {
          fields[field] = first;
        }
      }

      next(new AppError(422, 'VALIDATION_ERROR', 'Some fields are invalid.', fields));
      return;
    }

    request.body = result.data;
    next();
  };
}
