import {
  createTransactionForUser,
  deleteTransactionForUser,
  getTransactionByIdForUser,
  listTransactionsByUser,
  updateTransactionForUser,
} from '@/src/db';
import { idQuerySchema, transactionSchema } from '@/utils/zodSchemas';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromRequest } from '@/utils/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Silakan masuk terlebih dahulu' });
  }

  const userId = user.userId;

  try {
    if (req.method === 'GET') {
      if (req.query.id !== undefined) {
        const rawId = Array.isArray(req.query.id)
          ? req.query.id[0]
          : req.query.id;
        const parsedId = idQuerySchema.safeParse({ id: rawId });
        if (!parsedId.success) {
          return res.status(400).json({ error: 'ID transaksi tidak valid' });
        }

        const tx = await getTransactionByIdForUser(parsedId.data.id, userId);
        if (!tx) {
          return res
            .status(404)
            .json({ error: 'Catatan transaksi tidak ditemukan' });
        }
        return res.status(200).json(tx);
      }

      const result = await listTransactionsByUser(userId);
      return res.status(200).json(result);
    }

    if (req.method === 'POST') {
      const parsed = transactionSchema.safeParse(req.body);
      if (!parsed.success) {
        const firstIssue =
          parsed.error.issues[0]?.message || 'Data transaksi tidak valid';
        return res.status(400).json({ error: firstIssue });
      }

      const created = await createTransactionForUser({
        userId,
        ...parsed.data,
      });
      return res.status(201).json({
        message: 'Catatan transaksi berhasil disimpan',
        transaction: created,
      });
    }

    if (req.method === 'PUT') {
      const rawId = Array.isArray(req.query.id)
        ? req.query.id[0]
        : req.query.id;
      const parsedId = idQuerySchema.safeParse({ id: rawId });
      if (!parsedId.success) {
        return res.status(400).json({ error: 'ID transaksi tidak valid' });
      }

      const parsedBody = transactionSchema.safeParse(req.body);
      if (!parsedBody.success) {
        const firstIssue =
          parsedBody.error.issues[0]?.message || 'Data transaksi tidak valid';
        return res.status(400).json({ error: firstIssue });
      }

      const updated = await updateTransactionForUser(
        parsedId.data.id,
        userId,
        parsedBody.data
      );
      if (!updated) {
        return res.status(404).json({
          error: 'Catatan transaksi tidak ditemukan atau bukan milik Anda',
        });
      }

      return res.status(200).json({
        message: 'Catatan transaksi berhasil diperbarui',
        transaction: updated,
      });
    }

    if (req.method === 'DELETE') {
      const rawId = Array.isArray(req.query.id)
        ? req.query.id[0]
        : req.query.id;
      const parsedId = idQuerySchema.safeParse({ id: rawId });
      if (!parsedId.success) {
        return res.status(400).json({ error: 'ID transaksi tidak valid' });
      }

      const deleted = await deleteTransactionForUser(parsedId.data.id, userId);
      if (!deleted) {
        return res.status(404).json({
          error: 'Catatan transaksi tidak ditemukan atau bukan milik Anda',
        });
      }

      return res.status(200).json({ message: 'Catatan transaksi dihapus' });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).json({ error: 'Metode tidak diizinkan' });
  } catch (error) {
    console.error('Transactions API error:', error);
    return res
      .status(500)
      .json({ error: 'Terjadi kesalahan pada server saat memproses transaksi' });
  }
}
