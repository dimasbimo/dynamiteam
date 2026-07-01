const { prisma } = require('../../../../../lib/prisma');
const { getSession } = require('../../../../../lib/session');

async function GET(req, { params }) {
  const session = await getSession();
  if (!session) return Response.json({ error: 'Tidak diizinkan' }, { status: 403 });
  if (session.user.role !== 'ADMIN' && session.user.memberId !== params.id) {
    return Response.json({ error: 'Tidak diizinkan' }, { status: 403 });
  }

  const history = await prisma.weeklyHistory.findMany({
    where: { memberId: params.id },
    orderBy: [{ mingguKe: 'desc' }, { createdAt: 'desc' }],
  });

  return Response.json({ history });
}

module.exports = { GET };
