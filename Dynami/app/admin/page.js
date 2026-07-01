import { redirect } from 'next/navigation';
import { getSession } from '../../lib/session';
import { prisma } from '../../lib/prisma';
import AdminDashboard from './AdminDashboard';

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.user.role !== 'ADMIN') redirect('/login');

  const members = await prisma.member.findMany({ orderBy: { createdAt: 'asc' } });
  const lastWeek = await prisma.weeklyHistory.aggregate({ _max: { mingguKe: true } });
  const weekNumber = (lastWeek._max.mingguKe || 0) + 1;

  return <AdminDashboard initialMembers={members} initialWeekNumber={weekNumber} />;
}
