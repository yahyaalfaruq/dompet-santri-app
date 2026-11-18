import { z } from 'zod';

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username minimal 3 karakter')
    .max(50, 'Username maksimal 50 karakter')
    .regex(
      /^[a-zA-Z0-9_.-]+$/,
      'Username hanya boleh berisi huruf, angka, titik, garis bawah, atau tanda hubung'
    ),
  password: z
    .string()
    .min(6, 'Kata sandi minimal 6 karakter')
    .max(100, 'Kata sandi terlalu panjang'),
  displayName: z
    .string()
    .trim()
    .min(2, 'Nama tampilan minimal 2 karakter')
    .max(80, 'Nama tampilan maksimal 80 karakter')
    .optional(),
});

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username wajib diisi'),
  password: z.string().min(1, 'Kata sandi wajib diisi'),
});

export const transactionSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Keterangan transaksi wajib diisi')
    .max(120, 'Keterangan maksimal 120 karakter'),
  amount: z.coerce
    .number()
    .int('Nominal harus berupa angka bulat')
    .positive('Nominal harus lebih besar dari 0')
    .max(1_000_000_000, 'Nominal melebihi batas maksimum'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  category: z
    .string()
    .trim()
    .transform((val) => val.toLowerCase())
    .pipe(
      z.enum(['pemasukan', 'pengeluaran'], {
        errorMap: () => ({
          message: 'Kategori harus berupa pemasukan atau pengeluaran',
        }),
      })
    ),
});

export const userIdQuerySchema = z.object({
  userId: z.string().regex(/^\d+$/).transform(Number),
});

export const idQuerySchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});

export const summaryQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
});
