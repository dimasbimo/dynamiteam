const bcrypt = require('bcryptjs');
const { prisma } = require('../../../../lib/prisma');
const { getSession } = require('../../../../lib/session');

async function PATCH(req) {
  const session = await getSession();
  if (!session) return Response.json({ error: 'Tidak diizinkan' }, { status: 403 });

  const { currentPassword, newPassword } = await req.json();

  if (!currentPassword || !newPassword) {
    return Response.json({ error: 'Password saat ini dan password baru wajib diisi.' }, { status: 400 });
  }
  if (newPassword.length < 6) {
    return Response.json({ error: 'Password baru minimal 6 karakter.' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return Response.json({ error: 'Akun tidak ditemukan.' }, { status: 404 });

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    return Response.json({ error: 'Password saat ini salah.' }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return Response.json({ ok: true });
}

module.exports = { PATCH };
