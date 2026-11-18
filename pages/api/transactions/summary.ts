import { getSummaryByUser } from '@/src/db';
import { getUserFromRequest } from '@/utils/auth';
import { summaryQuerySchema } from '@/utils/zodSchemas';
import { NextApiRequest, NextApiResponse } from 'next';

type SummaryInput = {
  userId: number;
  month?: number;
  year?: number;
};

export async function getTransactionSummary({
  userId,
  month,
  year,
}: SummaryInput) {
  return getSummaryByUser({ userId, month, year });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Metode tidak diizinkan' });
  }

  const user = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Silakan masuk terlebih dahulu' });
  }

  const parsedQuery = summaryQuerySchema.safeParse({
    month: req.query.month || undefined,
    year: req.query.year || undefined,
  });

  if (!parsedQuery.success) {
    return res
      .status(400)
      .json({ error: 'Parameter bulan atau tahun tidak valid' });
  }

  try {
    const summary = await getTransactionSummary({
      userId: user.userId,
      month: parsedQuery.data.month,
      year: parsedQuery.data.year,
    });
    return res.status(200).json(summary);
  } catch (error) {
    console.error('Summary API error:', error);
    return res
      .status(500)
      .json({ error: 'Gagal memuat ringkasan buku kas' });
  }
}
