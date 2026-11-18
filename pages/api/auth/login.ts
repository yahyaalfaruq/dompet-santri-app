import { findUserByUsername } from '@/src/db';
import { loginSchema } from '@/utils/zodSchemas';
import { signAuthToken } from '@/utils/auth';
import bcrypt from 'bcrypt';
import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Metode tidak diizinkan' });
  }

  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message || 'Data login tidak valid';
    return res.status(400).json({ error: firstIssue });
  }

  try {
    const { username, password } = parsed.data;
    const user = await findUserByUsername(username);
    if (!user) {
      return res
        .status(401)
        .json({ error: 'Username atau kata sandi tidak sesuai' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res
        .status(401)
        .json({ error: 'Username atau kata sandi tidak sesuai' });
    }

    const token = signAuthToken({
      userId: user.id,
      username: user.username,
      displayName: user.displayName,
    });

    res.setHeader(
      'Set-Cookie',
      serialize('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/',
      })
    );

    return res.status(200).json({
      message: 'Berhasil masuk',
      userId: user.id,
      user: {
        userId: user.id,
        username: user.username,
        displayName: user.displayName,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res
      .status(500)
      .json({ error: 'Terjadi gangguan pada server saat memproses login' });
  }
}
