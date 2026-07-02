// Membuat akun admin pertama. Jalankan: npm run seed
// Atur lewat env ADMIN_USERNAME / ADMIN_PASSWORD (nama lama ADMIN_EMAIL juga
// masih diterima untuk kompatibilitas). Kalau kosong, pakai default di bawah.
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const username = (process.env.ADMIN_USERNAME || process.env.ADMIN_EMAIL || 'admin').toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || 'ubah-password-ini';

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    console.log(`Akun admin dengan ID login "${username}" sudah ada, tidak dibuat ulang.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { username, passwordHash, role: 'ADMIN' },
  });

  console.log('Akun admin dibuat:');
  console.log(`  ID login : ${username}`);
  console.log(`  password : ${password}`);
  console.log('Segera login dan ganti password lewat tombol Ganti Password.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
