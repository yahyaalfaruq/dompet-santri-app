import "dotenv/config";
import { users, transactions } from "@/src/db/schema";
import bcrypt from "bcrypt";
import { db } from "@/src/db";
import { send, title } from "process";

async function seed() {
  console.log("Seeding started...");

  const hashedPassword = await bcrypt.hash("password123", 10);

  // Seed user
  const insertedUsers = await db
    .insert(users)
    .values([
      {
        username: "admin",
        password: hashedPassword,
        displayName: "Administrator",
      },
      { username: "test", password: hashedPassword, displayName: "Test User" },
    ])
    .returning();

  const admin = insertedUsers[0];

  // Seed untuk transaksi admin
  await db.insert(transactions).values([
    {
      userId: admin.id,
      title: "Makan",
      amount: 15000,
      date: new Date("2024-05-01"),
      category: "pemasukan",
    },
    {
      userId: admin.id,
      title: "Transportasi",
      amount: 20000,
      date: new Date("2024-05-02"),
      category: "pengeluaran",
    },
  ]);

  console.log("Seeding complete");
  process.exit();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
