const { prisma } = require('../../../../lib/prisma');
const { requireAdmin, getSession } = require('../../../../lib/session');

async function GET(req, { params }) {
  const session = await getSession();
  if (!session) return Response.json({ error: 'Tidak diizinkan' }, { status: 403 });
  // admin boleh lihat siapa saja, member cuma boleh lihat dirinya sendiri
  if (session.user.role !== 'ADMIN' && session.user.memberId !== params.id) {
    return Response.json({ error: 'Tidak diizinkan' }, { status: 403 });
  }
  const member = await prisma.member.findUnique({ where: { id: params.id } });
  if (!member) return Response.json({ error: 'Member tidak ditemukan' }, { status: 404 });
  return Response.json({ member });
}

async function PATCH(req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const { nama, nicknameML, idML, roleSquad } = body;

  const member = await prisma.member.update({
    where: { id: params.id },
    data: {
      ...(nama !== undefined && { nama: nama.trim() }),
      ...(nicknameML !== undefined && { nicknameML: nicknameML.trim() }),
      ...(idML !== undefined && { idML: idML.trim() }),
      ...(roleSquad !== undefined && { roleSquad: roleSquad.trim() }),
    },
  });

  return Response.json({ member });
}

async function DELETE(req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  // PENTING: relasi User->Member pakai onDelete Cascade, artinya menghapus
  // member ikut menghapus akun login yang tertaut. Untuk akun MEMBER itu memang
  // yang diinginkan. Tapi kalau member ini tertaut ke akun ADMIN (fitur admin
  // merangkap member), akun admin harus dilepas dulu supaya tidak ikut terhapus.
  const linkedAdmin = await prisma.user.findFirst({
    where: { memberId: params.id, role: 'ADMIN' },
  });
  if (linkedAdmin) {
    await prisma.user.update({ where: { id: linkedAdmin.id }, data: { memberId: null } });
  }

  await prisma.member.delete({ where: { id: params.id } });
  return Response.json({ ok: true });
}

module.exports = { GET, PATCH, DELETE };
