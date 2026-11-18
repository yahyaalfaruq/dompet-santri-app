import { createUser, findUserByUsername } from '@/src/db';
import { registerSchema } from '@/utils/zodSchemas';
import bcrypt from 'bcrypt';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Metode tidak diizinkan' });
  }

  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    const firstIssue =
      parsed.error.issues[0]?.message || 'Data pendaftaran tidak valid';
    return res.status(400).json({ error: firstIssue });
  }

  const { username, password, displayName } = parsed.data;

  try {
    const existing = await findUserByUsername(username);
    if (existing) {
      return res.status(409).json({
        error: 'Username sudah terdaftar, silakan gunakan username lain',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const created = await createUser({
      username,
      passwordHash,
      displayName: displayName || username,
    });

    return res.status(201).json({
      message: 'Pendaftaran berhasil, silakan masuk ke akun Anda',
      userId: created.id,
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      error: 'Gagal mendaftarkan akun. Silakan periksa kembali data Anda.',
    });
  }
}
