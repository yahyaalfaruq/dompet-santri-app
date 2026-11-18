import { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromRequest } from '@/utils/auth';
import { findUserById } from '@/src/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Metode tidak diizinkan' });
  }

  const sessionUser = getUserFromRequest(req);
  if (!sessionUser) {
    return res.status(401).json({ error: 'Sesi tidak ditemukan atau telah berakhir' });
  }

  try {
    const dbUser = await findUserById(sessionUser.userId);
    if (!dbUser) {
      return res.status(401).json({ error: 'Akun pengguna tidak ditemukan' });
    }

    return res.status(200).json({
      user: {
        userId: dbUser.id,
        username: dbUser.username,
        displayName: dbUser.displayName || dbUser.username,
      },
    });
  } catch {
    return res.status(200).json({
      user: {
        userId: sessionUser.userId,
        username: sessionUser.username,
        displayName: sessionUser.displayName || sessionUser.username,
      },
    });
  }
}
