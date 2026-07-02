import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '../../lib/session';
import { prisma } from '../../lib/prisma';
import MemberDashboard from './MemberDashboard';

export default async function MemberPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  // Baca tautan member langsung dari database, BUKAN dari session token.
  // Token dibuat saat login - kalau admin baru saja menautkan dirinya sebagai
  // member, token lamanya belum tahu. Query langsung menghindari harus logout-login.
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  const isAdmin = session.user.role === 'ADMIN';

  if (!user?.memberId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-slate-400 text-sm px-6 text-center">
        {isAdmin ? (
          <>
            <p>Akun admin kamu belum tertaut ke data member.</p>
            <p>Buka dashboard admin, klik "Tambah Member", lalu centang opsi <span className="text-slate-200">"Ini data saya sendiri (admin)"</span>.</p>
            <Link href="/admin" className="btn-primary mt-2">Ke Dashboard Admin</Link>
          </>
        ) : (
          <p>Akun ini belum terhubung ke data member. Hubungi admin squad.</p>
        )}
      </div>
    );
  }

  const member = await prisma.member.findUnique({ where: { id: user.memberId } });
  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">
        Data member tidak ditemukan. Hubungi admin squad.
      </div>
    );
  }

  const history = await prisma.weeklyHistory.findMany({
    where: { memberId: member.id },
    orderBy: [{ mingguKe: 'desc' }, { createdAt: 'desc' }],
  });

  return <MemberDashboard member={member} history={history} isAdmin={isAdmin} />;
}
