import 'dotenv/config';
import bcrypt from 'bcrypt';
import {
  createTransactionForUser,
  createUser,
  findUserByUsername,
} from '@/src/db';

async function seed() {
  console.log('Memulai proses seed data Dompet Santri...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  let admin = await findUserByUsername('admin');
  if (!admin) {
    admin = await createUser({
      username: 'admin',
      passwordHash: hashedPassword,
      displayName: 'Administrator',
    });
  }

  const testUser = await findUserByUsername('test');
  if (!testUser) {
    await createUser({
      username: 'test',
      passwordHash: hashedPassword,
      displayName: 'Santri Ahmad',
    });
  }

  await createTransactionForUser({
    userId: admin.id,
    title: 'Kiriman Bulanan Orang Tua',
    amount: 350000,
    date: '2025-05-01',
    category: 'pemasukan',
  });

  await createTransactionForUser({
    userId: admin.id,
    title: 'Makan Siang Kantin Asrama',
    amount: 15000,
    date: '2025-05-02',
    category: 'pengeluaran',
  });

  console.log('Proses seed selesai.');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
