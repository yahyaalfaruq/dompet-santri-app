import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { createClient, Client as LibsqlClient } from '@libsql/client';
import { and, desc, eq, sql as drizzleSql } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { users, transactions } from './schema';

const rawDatabaseUrl = process.env.DATABASE_URL?.trim() || '';
const isPostgresUrl =
  rawDatabaseUrl.startsWith('postgres://') ||
  rawDatabaseUrl.startsWith('postgresql://');

// Export drizzle instance when Postgres URL is provided
export const db = isPostgresUrl
  ? drizzle({ client: neon(rawDatabaseUrl) })
  : (null as unknown as ReturnType<typeof drizzle>);

let sqliteClient: LibsqlClient | null = null;
let sqliteInitPromise: Promise<void> | null = null;

function getSqliteClient(): LibsqlClient {
  if (!sqliteClient) {
    const url =
      rawDatabaseUrl.startsWith('file:') || rawDatabaseUrl.startsWith('libsql:')
        ? rawDatabaseUrl
        : 'file:./local.db';
    sqliteClient = createClient({ url });
  }
  return sqliteClient;
}

async function ensureSqliteInitialized(): Promise<LibsqlClient> {
  const client = getSqliteClient();
  if (!sqliteInitPromise) {
    sqliteInitPromise = (async () => {
      await client.execute(`
        CREATE TABLE IF NOT EXISTS users_sample (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          display_name TEXT DEFAULT 'Santri'
        )
      `);

      await client.execute(`
        CREATE TABLE IF NOT EXISTS transactions_sample (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          amount INTEGER NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          date TEXT NOT NULL,
          category TEXT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users_sample(id)
        )
      `);

      const existingUsers = await client.execute(
        'SELECT COUNT(*) as count FROM users_sample'
      );
      const count = Number(existingUsers.rows[0]?.count ?? 0);
      if (count === 0) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        const adminInsert = await client.execute({
          sql: 'INSERT INTO users_sample (username, password, display_name) VALUES (?, ?, ?)',
          args: ['admin', hashedPassword, 'Administrator'],
        });
        await client.execute({
          sql: 'INSERT INTO users_sample (username, password, display_name) VALUES (?, ?, ?)',
          args: ['test', hashedPassword, 'Santri Ahmad'],
        });

        const adminId = Number(adminInsert.lastInsertRowid || 1);
        await client.execute({
          sql: 'INSERT INTO transactions_sample (user_id, title, amount, date, category) VALUES (?, ?, ?, ?, ?)',
          args: [adminId, 'Kiriman Bulanan Orang Tua', 350000, '2025-05-01', 'pemasukan'],
        });
        await client.execute({
          sql: 'INSERT INTO transactions_sample (user_id, title, amount, date, category) VALUES (?, ?, ?, ?, ?)',
          args: [adminId, 'Makan Siang Kantin Asrama', 15000, '2025-05-02', 'pengeluaran'],
        });
        await client.execute({
          sql: 'INSERT INTO transactions_sample (user_id, title, amount, date, category) VALUES (?, ?, ?, ?, ?)',
          args: [adminId, 'Beli Kitab Kuning & Alat Tulis', 45000, '2025-05-03', 'pengeluaran'],
        });
      }
    })();
  }
  await sqliteInitPromise;
  return client;
}

export interface UserRecord {
  id: number;
  username: string;
  password: string;
  displayName: string;
}

export interface TransactionRecord {
  id: number;
  userId: number;
  title: string;
  amount: number;
  createdAt: string;
  date: string;
  category: 'pemasukan' | 'pengeluaran';
}

function normalizeDateIso(val: unknown): string {
  if (!val) return new Date().toISOString().split('T')[0];
  if (val instanceof Date) {
    return val.toISOString().split('T')[0];
  }
  const str = String(val);
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.slice(0, 10);
  }
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }
  return str;
}

export async function findUserByUsername(
  username: string
): Promise<UserRecord | null> {
  if (isPostgresUrl) {
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    if (!rows.length) return null;
    return {
      id: rows[0].id,
      username: rows[0].username,
      password: rows[0].password,
      displayName: rows[0].displayName || rows[0].username,
    };
  }

  const client = await ensureSqliteInitialized();
  const res = await client.execute({
    sql: 'SELECT id, username, password, display_name FROM users_sample WHERE username = ? LIMIT 1',
    args: [username],
  });
  if (!res.rows.length) return null;
  const row = res.rows[0];
  return {
    id: Number(row.id),
    username: String(row.username),
    password: String(row.password),
    displayName: String(row.display_name || row.username),
  };
}

export async function findUserById(id: number): Promise<UserRecord | null> {
  if (isPostgresUrl) {
    const rows = await db.select().from(users).where(eq(users.id, id));
    if (!rows.length) return null;
    return {
      id: rows[0].id,
      username: rows[0].username,
      password: rows[0].password,
      displayName: rows[0].displayName || rows[0].username,
    };
  }

  const client = await ensureSqliteInitialized();
  const res = await client.execute({
    sql: 'SELECT id, username, password, display_name FROM users_sample WHERE id = ? LIMIT 1',
    args: [id],
  });
  if (!res.rows.length) return null;
  const row = res.rows[0];
  return {
    id: Number(row.id),
    username: String(row.username),
    password: String(row.password),
    displayName: String(row.display_name || row.username),
  };
}

export async function createUser(input: {
  username: string;
  passwordHash: string;
  displayName?: string;
}): Promise<UserRecord> {
  const cleanDisplayName = input.displayName?.trim() || input.username;
  if (isPostgresUrl) {
    const inserted = await db
      .insert(users)
      .values({
        username: input.username,
        password: input.passwordHash,
        displayName: cleanDisplayName,
      })
      .returning();
    return {
      id: inserted[0].id,
      username: inserted[0].username,
      password: inserted[0].password,
      displayName: inserted[0].displayName || inserted[0].username,
    };
  }

  const client = await ensureSqliteInitialized();
  const res = await client.execute({
    sql: 'INSERT INTO users_sample (username, password, display_name) VALUES (?, ?, ?)',
    args: [input.username, input.passwordHash, cleanDisplayName],
  });
  return {
    id: Number(res.lastInsertRowid),
    username: input.username,
    password: input.passwordHash,
    displayName: cleanDisplayName,
  };
}

export async function listTransactionsByUser(
  userId: number
): Promise<TransactionRecord[]> {
  if (isPostgresUrl) {
    const rows = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date), desc(transactions.id));
    return rows.map((r) => ({
      id: r.id,
      userId: Number(r.userId),
      title: r.title,
      amount: Number(r.amount),
      createdAt: normalizeDateIso(r.createdAt),
      date: normalizeDateIso(r.date),
      category:
        String(r.category).toLowerCase() === 'pemasukan'
          ? 'pemasukan'
          : 'pengeluaran',
    }));
  }

  const client = await ensureSqliteInitialized();
  const res = await client.execute({
    sql: 'SELECT id, user_id, title, amount, created_at, date, category FROM transactions_sample WHERE user_id = ? ORDER BY date DESC, id DESC',
    args: [userId],
  });
  return res.rows.map((r) => ({
    id: Number(r.id),
    userId: Number(r.user_id),
    title: String(r.title),
    amount: Number(r.amount),
    createdAt: normalizeDateIso(r.created_at),
    date: normalizeDateIso(r.date),
    category:
      String(r.category).toLowerCase() === 'pemasukan'
        ? 'pemasukan'
        : 'pengeluaran',
  }));
}

export async function getTransactionByIdForUser(
  id: number,
  userId: number
): Promise<TransactionRecord | null> {
  if (isPostgresUrl) {
    const rows = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
    if (!rows.length) return null;
    const r = rows[0];
    return {
      id: r.id,
      userId: Number(r.userId),
      title: r.title,
      amount: Number(r.amount),
      createdAt: normalizeDateIso(r.createdAt),
      date: normalizeDateIso(r.date),
      category:
        String(r.category).toLowerCase() === 'pemasukan'
          ? 'pemasukan'
          : 'pengeluaran',
    };
  }

  const client = await ensureSqliteInitialized();
  const res = await client.execute({
    sql: 'SELECT id, user_id, title, amount, created_at, date, category FROM transactions_sample WHERE id = ? AND user_id = ? LIMIT 1',
    args: [id, userId],
  });
  if (!res.rows.length) return null;
  const r = res.rows[0];
  return {
    id: Number(r.id),
    userId: Number(r.user_id),
    title: String(r.title),
    amount: Number(r.amount),
    createdAt: normalizeDateIso(r.created_at),
    date: normalizeDateIso(r.date),
    category:
      String(r.category).toLowerCase() === 'pemasukan'
        ? 'pemasukan'
        : 'pengeluaran',
  };
}

export async function createTransactionForUser(input: {
  userId: number;
  title: string;
  amount: number;
  date: string;
  category: 'pemasukan' | 'pengeluaran';
}): Promise<TransactionRecord> {
  const normalizedCategory =
    input.category.toLowerCase() === 'pemasukan' ? 'pemasukan' : 'pengeluaran';
  const cleanDate = normalizeDateIso(input.date);

  if (isPostgresUrl) {
    const inserted = await db
      .insert(transactions)
      .values({
        userId: input.userId,
        title: input.title,
        amount: input.amount,
        date: new Date(`${cleanDate}T00:00:00.000Z`),
        category: normalizedCategory,
      })
      .returning();
    const r = inserted[0];
    return {
      id: r.id,
      userId: Number(r.userId),
      title: r.title,
      amount: Number(r.amount),
      createdAt: normalizeDateIso(r.createdAt),
      date: normalizeDateIso(r.date),
      category: normalizedCategory,
    };
  }

  const client = await ensureSqliteInitialized();
  const res = await client.execute({
    sql: 'INSERT INTO transactions_sample (user_id, title, amount, date, category) VALUES (?, ?, ?, ?, ?)',
    args: [
      input.userId,
      input.title,
      input.amount,
      cleanDate,
      normalizedCategory,
    ],
  });
  return {
    id: Number(res.lastInsertRowid),
    userId: input.userId,
    title: input.title,
    amount: input.amount,
    createdAt: new Date().toISOString().split('T')[0],
    date: cleanDate,
    category: normalizedCategory,
  };
}

export async function updateTransactionForUser(
  id: number,
  userId: number,
  input: {
    title: string;
    amount: number;
    date: string;
    category: 'pemasukan' | 'pengeluaran';
  }
): Promise<TransactionRecord | null> {
  const existing = await getTransactionByIdForUser(id, userId);
  if (!existing) return null;

  const normalizedCategory =
    input.category.toLowerCase() === 'pemasukan' ? 'pemasukan' : 'pengeluaran';
  const cleanDate = normalizeDateIso(input.date);

  if (isPostgresUrl) {
    const updated = await db
      .update(transactions)
      .set({
        title: input.title,
        amount: input.amount,
        date: new Date(`${cleanDate}T00:00:00.000Z`),
        category: normalizedCategory,
      })
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .returning();
    if (!updated.length) return null;
    const r = updated[0];
    return {
      id: r.id,
      userId: Number(r.userId),
      title: r.title,
      amount: Number(r.amount),
      createdAt: normalizeDateIso(r.createdAt),
      date: normalizeDateIso(r.date),
      category: normalizedCategory,
    };
  }

  const client = await ensureSqliteInitialized();
  await client.execute({
    sql: 'UPDATE transactions_sample SET title = ?, amount = ?, date = ?, category = ? WHERE id = ? AND user_id = ?',
    args: [
      input.title,
      input.amount,
      cleanDate,
      normalizedCategory,
      id,
      userId,
    ],
  });

  return {
    ...existing,
    title: input.title,
    amount: input.amount,
    date: cleanDate,
    category: normalizedCategory,
  };
}

export async function deleteTransactionForUser(
  id: number,
  userId: number
): Promise<boolean> {
  const existing = await getTransactionByIdForUser(id, userId);
  if (!existing) return false;

  if (isPostgresUrl) {
    await db
      .delete(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
    return true;
  }

  const client = await ensureSqliteInitialized();
  await client.execute({
    sql: 'DELETE FROM transactions_sample WHERE id = ? AND user_id = ?',
    args: [id, userId],
  });
  return true;
}

export async function getSummaryByUser(params: {
  userId: number;
  month?: number;
  year?: number;
}): Promise<{ category: 'pemasukan' | 'pengeluaran'; total: number }[]> {
  if (isPostgresUrl && params.month && params.year) {
    const result = await db
      .select({
        category: transactions.category,
        total: drizzleSql<number>`COALESCE(SUM(${transactions.amount}), 0)`.as(
          'total'
        ),
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, params.userId),
          drizzleSql`EXTRACT(MONTH FROM ${transactions.date}) = ${params.month}`,
          drizzleSql`EXTRACT(YEAR FROM ${transactions.date}) = ${params.year}`
        )
      )
      .groupBy(transactions.category);

    const totals: Record<'pemasukan' | 'pengeluaran', number> = {
      pemasukan: 0,
      pengeluaran: 0,
    };
    for (const row of result) {
      const cat =
        String(row.category).toLowerCase() === 'pemasukan'
          ? 'pemasukan'
          : 'pengeluaran';
      totals[cat] += Number(row.total || 0);
    }
    return [
      { category: 'pemasukan', total: totals.pemasukan },
      { category: 'pengeluaran', total: totals.pengeluaran },
    ];
  }

  const allTx = await listTransactionsByUser(params.userId);
  let pemasukan = 0;
  let pengeluaran = 0;

  for (const tx of allTx) {
    const [yyyy, mm] = tx.date.split('-').map(Number);
    if (params.year && yyyy !== params.year) continue;
    if (params.month && mm !== params.month) continue;
    if (tx.category === 'pemasukan') {
      pemasukan += tx.amount;
    } else {
      pengeluaran += tx.amount;
    }
  }

  return [
    { category: 'pemasukan', total: pemasukan },
    { category: 'pengeluaran', total: pengeluaran },
  ];
}
