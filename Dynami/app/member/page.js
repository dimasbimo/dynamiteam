import { redirect } from 'next/navigation';
import { getSession } from '../../lib/session';
import { prisma } from '../../lib/prisma';
import MemberDashboard from './MemberDashboard';

export default async function MemberPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.user.role !== 'MEMBER') redirect('/admin');

  const member = await prisma.member.findUnique({ where: { id: session.user.memberId } });
  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">
        Akun ini belum terhubung ke data member. Hubungi admin squad.
      </div>
    );
  }

  const history = await prisma.weeklyHistory.findMany({
    where: { memberId: member.id },
    orderBy: [{ mingguKe: 'desc' }, { createdAt: 'desc' }],
  });

  return <MemberDashboard member={member} history={history} />;
}
