import { z, ZodType } from 'zod';
import httpStatus from 'http-status';
import pick from '../utils/pick';
import ApiError from '../utils/ApiError';
import { Request, Response, NextFunction } from 'express';

type SchemaMap = {
  params?: ZodType<any>;
  query?: ZodType<any>;
  body?: ZodType<any>;
};

const validate = (schema: SchemaMap) => (req: Request, res: Response, next: NextFunction) => {
  const validSchema = pick(schema, ['params', 'query', 'body']) as SchemaMap;
  const keys = Object.keys(validSchema) as Array<keyof SchemaMap>;

  const errors: string[] = [];
  const merged: Record<string, unknown> = {};

  for (const key of keys) {
    const zodSchema = validSchema[key];
    if (!zodSchema) continue;

    const result = zodSchema.safeParse(req[key]);
    if (!result.success) {
      const messages = result.error.issues.map((e: z.ZodIssue) => e.message);
      errors.push(...messages);
    } else {
      merged[key] = result.data;
    }
  }

  if (errors.length > 0) {
    return next(new ApiError(httpStatus.BAD_REQUEST, errors.join(', ')));
  }

  // Merge validated values back into req
  Object.assign(req, merged);
  return next();
};

export default validate;
