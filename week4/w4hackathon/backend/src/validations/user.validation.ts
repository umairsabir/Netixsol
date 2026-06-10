import { z } from 'zod';
import { password, objectId } from './custom.validation';

export const createUser = {
  body: z.object({
    email: z.string().email(),
    password: password,
    name: z.string().min(1),
    role: z.enum(['user', 'admin']),
  }),
};

export const getUsers = {
  query: z.object({
    name: z.string().optional(),
    role: z.string().optional(),
    sortBy: z.string().optional(),
    limit: z.coerce.number().int().optional(),
    page: z.coerce.number().int().optional(),
  }),
};

export const getUser = {
  params: z.object({
    userId: objectId,
  }),
};

export const updateUser = {
  params: z.object({
    userId: objectId,
  }),
  body: z
    .object({
      email: z.string().email().optional(),
      password: password.optional(),
      name: z.string().optional(),
    })
    .refine(
      (data) => Object.keys(data).length > 0,
      { message: 'At least one field must be provided' }
    ),
};

export const deleteUser = {
  params: z.object({
    userId: objectId,
  }),
};

// Inferred types
export type CreateUserBody = z.infer<typeof createUser.body>;
export type GetUsersQuery = z.infer<typeof getUsers.query>;
export type GetUserParams = z.infer<typeof getUser.params>;
export type UpdateUserParams = z.infer<typeof updateUser.params>;
export type UpdateUserBody = z.infer<typeof updateUser.body>;
export type DeleteUserParams = z.infer<typeof deleteUser.params>;
