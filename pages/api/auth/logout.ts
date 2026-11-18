import { serialize } from 'cookie';
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Metode tidak diizinkan' });
  }

  res.setHeader(
    'Set-Cookie',
    serialize('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0),
      path: '/',
    })
  );

  return res.status(200).json({ message: 'Berhasil keluar dari sesi' });
}
