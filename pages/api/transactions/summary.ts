import { db } from '@/src/db';
import { transactions } from '@/src/db/schema';
import { and, eq, sql } from 'drizzle-orm';

type SummaryInput = {
  userId: number;
  month: number;
  year: number;
};

export async function getTransactionSummary({ userId, month, year }: SummaryInput) {
  const result = await db
    .select({
      category: transactions.category,
      total: sql<number>`SUM(${transactions.amount})`.as('total'),
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        sql`EXTRACT(MONTH FROM ${transactions.date}) = ${month}`,
        sql`EXTRACT(YEAR FROM ${transactions.date}) = ${year}`
      )
    )
    .groupBy(transactions.category);

  return result;
}
