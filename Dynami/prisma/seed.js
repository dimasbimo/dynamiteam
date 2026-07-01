// Membuat akun admin pertama. Jalankan: npm run seed
// Bisa atur email & password lewat env ADMIN_EMAIL / ADMIN_PASSWORD,
// kalau tidak diisi akan pakai default di bawah (WAJIB diganti setelah login pertama).
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@squad.local';
  const password = process.env.ADMIN_PASSWORD || 'ubah-password-ini';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Akun admin dengan email ${email} sudah ada, tidak dibuat ulang.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { email, passwordHash, role: 'ADMIN' },
  });

  console.log('Akun admin dibuat:');
  console.log(`  email    : ${email}`);
  console.log(`  password : ${password}`);
  console.log('Segera login dan ganti password lewat database jika perlu.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
