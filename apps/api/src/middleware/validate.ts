import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';
import { AppError } from '../utils/AppError.js';

function fieldErrors(schema: ZodTypeAny, value: unknown): Record<string, string> | null {
  const result = schema.safeParse(value);
  if (result.success) {
    return null;
  }

  const flattened = result.error.flatten().fieldErrors;
  const fields: Record<string, string> = {};

  for (const [field, messages] of Object.entries(flattened)) {
    const first = messages?.[0];
    if (first) {
      fields[field] = first;
    }
  }

  return fields;
}

function validationError(fields: Record<string, string>): AppError {
  return new AppError(422, 'VALIDATION_ERROR', 'Some fields are invalid.', fields);
}

export function validateBody(schema: ZodTypeAny): RequestHandler {
  return (request, _response, next) => {
    const result = schema.safeParse(request.body);
    if (!result.success) {
      next(validationError(fieldErrors(schema, request.body) ?? {}));
      return;
    }
    request.body = result.data;
    next();
  };
}

export function validateParams(schema: ZodTypeAny): RequestHandler {
  return (request, _response, next) => {
    const result = schema.safeParse(request.params);
    if (!result.success) {
      next(validationError(fieldErrors(schema, request.params) ?? {}));
      return;
    }
    request.params = result.data as typeof request.params;
    next();
  };
}

export function validateQuery(schema: ZodTypeAny): RequestHandler {
  return (request, _response, next) => {
    const result = schema.safeParse(request.query);
    if (!result.success) {
      next(validationError(fieldErrors(schema, request.query) ?? {}));
      return;
    }
    request.query = result.data as typeof request.query;
    next();
  };
}
