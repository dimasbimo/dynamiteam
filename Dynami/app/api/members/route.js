const { prisma } = require('../../../lib/prisma');
const { requireAdmin } = require('../../../lib/session');
const bcrypt = require('bcryptjs');

async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const members = await prisma.member.findMany({ orderBy: { createdAt: 'asc' } });
  return Response.json({ members });
}

async function POST(req) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const { nama, nicknameML, idML, roleSquad, email, password } = body;

  if (!nama?.trim() || !nicknameML?.trim() || !email?.trim() || !password?.trim()) {
    return Response.json({ error: 'Nama, nickname, email, dan password wajib diisi.' }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (existingUser) {
    return Response.json({ error: 'Email tersebut sudah dipakai akun lain.' }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const member = await prisma.member.create({
    data: {
      nama: nama.trim(),
      nicknameML: nicknameML.trim(),
      idML: idML?.trim() || '-',
      roleSquad: roleSquad?.trim() || '-',
      nyawaCurrent: 2,
      status: 'WASPADA',
      user: {
        create: {
          email: email.toLowerCase().trim(),
          passwordHash,
          role: 'MEMBER',
        },
      },
    },
  });

  return Response.json({ member });
}

module.exports = { GET, POST };
