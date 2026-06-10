import { z } from 'zod';

export const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, '"{{label}}" must be a valid mongo id');

export const password = z
  .string()
  .min(8, 'password must be at least 8 characters')
  .regex(/\d/, 'password must contain at least 1 letter and 1 number')
  .regex(/[a-zA-Z]/, 'password must contain at least 1 letter and 1 number');
