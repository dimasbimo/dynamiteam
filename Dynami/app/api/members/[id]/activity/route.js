const { prisma } = require('../../../../../lib/prisma');
const { requireAdmin } = require('../../../../../lib/session');

async function PATCH(req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const activityPoint = parseInt(body.activityPoint, 10);
  if (Number.isNaN(activityPoint) || activityPoint < 0) {
    return Response.json({ error: 'Activity point harus angka >= 0.' }, { status: 400 });
  }

  const existing = await prisma.member.findUnique({ where: { id: params.id } });
  if (!existing) return Response.json({ error: 'Member tidak ditemukan' }, { status: 404 });
  if (existing.status === 'KICK') {
    return Response.json({ error: 'Member berstatus Kick, reset nyawa dulu sebelum input activity baru.' }, { status: 400 });
  }

  const member = await prisma.member.update({
    where: { id: params.id },
    data: { activityPoint, activityInputted: true },
  });

  return Response.json({ member });
}

module.exports = { PATCH };
