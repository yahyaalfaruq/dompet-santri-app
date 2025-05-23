import { db } from '@/src/db';
import { users } from '@/src/db/schema';
import { registerSchema } from '@/utils/zodSchemas';
import bcrypt from 'bcrypt';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid data' });

  const { username, password, displayName } = parsed.data;
  const hashed = await bcrypt.hash(password, 10);

  try {
    await db.insert(users).values({ username, password: hashed, displayName }); // simpan displayName juga
    res.status(200).json({ message: 'User registered' });
  } catch (err) {
    res.status(500).json({ error: 'Username already exists' });
  }
}
