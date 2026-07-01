const { prisma } = require('../../../../../lib/prisma');
const { requireAdmin } = require('../../../../../lib/session');

async function POST(req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const member = await prisma.member.findUnique({ where: { id: params.id } });
  if (!member) return Response.json({ error: 'Member tidak ditemukan' }, { status: 404 });

  const lastWeek = await prisma.weeklyHistory.aggregate({ _max: { mingguKe: true } });
  const mingguKe = (lastWeek._max.mingguKe || 0) || 1;

  const [, updated] = await prisma.$transaction([
    prisma.weeklyHistory.create({
      data: {
        memberId: member.id,
        mingguKe,
        activityPoint: member.activityPoint,
        nyawaBefore: member.nyawaCurrent,
        delta: 2 - member.nyawaCurrent,
        nyawaAfter: 2,
        statusAkhir: 'WASPADA',
        note: 'Reset manual oleh admin',
      },
    }),
    prisma.member.update({
      where: { id: member.id },
      data: { nyawaCurrent: 2, status: 'WASPADA', activityInputted: false },
    }),
  ]);

  return Response.json({ member: updated });
}

module.exports = { POST };
