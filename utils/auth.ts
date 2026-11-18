import jwt from 'jsonwebtoken';
import { parse } from 'cookie';
import { NextApiRequest } from 'next';

const JWT_SECRET = process.env.JWT_SECRET || 'rahasia';

export interface AuthUserPayload {
  userId: number;
  username: string;
  displayName?: string;
}

export function signAuthToken(payload: AuthUserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
}

export function getUserFromRequest(req: NextApiRequest): AuthUserPayload | null {
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  if (!cookies.token) return null;

  try {
    const decoded = jwt.verify(cookies.token, JWT_SECRET);
    if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded) {
      return {
        userId: Number((decoded as Record<string, unknown>).userId),
        username: String((decoded as Record<string, unknown>).username || ''),
        displayName: (decoded as Record<string, unknown>).displayName
          ? String((decoded as Record<string, unknown>).displayName)
          : undefined,
      };
    }
    return null;
  } catch {
    return null;
  }
}
