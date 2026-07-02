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
  const { session, error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const { nama, nicknameML, idML, roleSquad, email, password, linkToSelf } = body;

  if (!nama?.trim() || !nicknameML?.trim()) {
    return Response.json({ error: 'Nama dan nickname wajib diisi.' }, { status: 400 });
  }

  // Mode khusus: admin menautkan dirinya sendiri sebagai member.
  // Tidak membuat akun login baru - pakai akun admin yang sedang login.
  if (linkToSelf) {
    const me = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (me.memberId) {
      return Response.json({ error: 'Akun kamu sudah tertaut ke data member.' }, { status: 400 });
    }
    const member = await prisma.member.create({
      data: {
        nama: nama.trim(),
        nicknameML: nicknameML.trim(),
        idML: idML?.trim() || '-',
        roleSquad: roleSquad?.trim() || '-',
        nyawaCurrent: 2,
        status: 'WASPADA',
      },
    });
    await prisma.user.update({ where: { id: me.id }, data: { memberId: member.id } });
    return Response.json({ member });
  }

  if (!email?.trim() || !password?.trim()) {
    return Response.json({ error: 'Email dan password wajib diisi untuk akun member baru.' }, { status: 400 });
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
