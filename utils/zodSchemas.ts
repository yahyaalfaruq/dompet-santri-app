import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  displayName: z.string().min(3).optional(),
});

export const loginSchema = registerSchema;

export const transactionSchema = z.object({
  title: z.string().min(1),
  amount: z.number(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  category: z.string().min(1),
});

export const userIdQuerySchema = z.object({
  userId: z.string().regex(/^\d+$/).transform(Number),
});

export const idQuerySchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});