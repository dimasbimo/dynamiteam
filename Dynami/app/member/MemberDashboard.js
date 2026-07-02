'use client';

import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { LogOut, KeyRound, LayoutDashboard, AlertTriangle } from 'lucide-react';
import {
  NyawaShards, StatusBadge, DeltaTag, fmtDate, MAX_NYAWA, ActivityMeter, getActivityZone, EmptyState, PageBackdrop,
} from '../../components/ui';
import ChangePasswordModal from '../../components/ChangePasswordModal';

function activityMessage(m) {
  if (m.status === 'KICK') return { text: 'Status kamu saat ini Kick. Hubungi admin squad untuk kesempatan bergabung kembali.', tone: 'text-slate-400' };
  if (!m.activityInputted) return { text: 'Activity minggu ini belum diinput admin.', tone: 'text-slate-400' };
  const zone = getActivityZone(m.activityPoint);
  if (zone.key === 'danger') return { text: 'Activity kamu masih kurang — hati-hati, nyawa bisa berkurang saat proses mingguan.', tone: 'text-rose-400' };
  if (zone.key === 'safe') return { text: 'Kamu aman minggu ini. Pertahankan!', tone: 'text-emerald-400' };
  return { text: 'Mantap! Kamu berpeluang menambah nyawa minggu ini.', tone: 'text-cyan-300' };
}

export default function MemberDashboard({ member, history, isAdmin = false }) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const msg = activityMessage(member);
  const isCritical = member.nyawaCurrent === 1 && member.status !== 'KICK';

  return (
    <div className="relative min-h-screen font-body text-slate-100 bg-grid">
      <PageBackdrop />
      {/* Header */}
      <div className="border-b border-slate-800/70 bg-[#0d1220]/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <img src="/logo-icon.png" alt="DynamiTeam" className="w-9 h-9 sm:w-10 sm:h-10 object-contain shrink-0" />
            <div className="min-w-0">
              <h1 className="font-display text-lg sm:text-xl font-bold leading-none text-white tracking-wide truncate">DynamiTeam</h1>
              <p className="text-[11px] text-slate-400 leading-none mt-0.5">Dashboard Member</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            {isAdmin && (
              <Link href="/admin" title="Dashboard Admin" className="inline-flex items-center gap-1.5 text-sm text-amber-400 hover:text-amber-300 p-2 sm:p-0">
                <LayoutDashboard className="w-4 h-4" /><span className="hidden sm:inline">Dashboard Admin</span>
              </Link>
            )}
            <button onClick={() => setShowPasswordModal(true)} title="Ganti Password" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 p-2 sm:p-0">
              <KeyRound className="w-4 h-4" /><span className="hidden sm:inline">Ganti Password</span>
            </button>
            <button onClick={() => signOut({ callbackUrl: '/login' })} title="Keluar" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 p-2 sm:p-0">
              <LogOut className="w-4 h-4" /><span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 px-4 py-2.5 rounded-lg border text-sm shadow-lg anim-slide-up bg-emerald-950 border-emerald-700 text-emerald-200">
          {toast}
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-5 py-5 sm:py-6">
        {/* Peringatan nyawa kritis */}
        {isCritical && (
          <div className="rounded-xl border border-rose-500/50 bg-rose-500/10 px-4 py-3 mb-4 flex items-start gap-2.5 anim-pulse-danger">
            <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
            <p className="text-sm text-rose-300">
              <span className="font-semibold">Nyawa kritis!</span> Sisa 1 nyawa — tingkatkan activity minggu depan atau kamu akan ter-Kick.
            </p>
          </div>
        )}

        {/* Hero card */}
        <div className="dyn-card dyn-card-accent p-5 sm:p-6 mb-5 anim-slide-up">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="min-w-0">
              <h2 className="font-display text-2xl font-bold text-white truncate">{member.nama}</h2>
              <p className="text-sm text-slate-400 mt-0.5">{member.nicknameML} · {member.idML} · {member.roleSquad}</p>
              <div className="mt-4"><StatusBadge status={member.status} size="lg" /></div>
            </div>
            <div className="text-center sm:text-right shrink-0">
              <div className="inline-block">
                <NyawaShards n={member.nyawaCurrent} size="lg" />
                <p className="text-xs text-slate-400 mt-2">{member.nyawaCurrent} / {MAX_NYAWA} Nyawa</p>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-slate-800">
            <div className="flex items-baseline justify-between mb-2">
              <p className="text-xs text-slate-400">Activity Point Minggu Ini</p>
              <p className="text-xl font-display font-bold text-white">{member.activityPoint.toLocaleString('id-ID')}</p>
            </div>
            {member.status !== 'KICK' && <ActivityMeter value={member.activityPoint} />}
            <p className={`text-xs mt-2 ${msg.tone}`}>{msg.text}</p>
            <p className="text-[11px] text-slate-500 mt-2">
              &lt; 1.500 = nyawa berkurang · 1.500-3.000 = aman · &gt; 3.000 = nyawa bertambah
            </p>
          </div>
        </div>

        {/* Riwayat */}
        <h3 className="font-display text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wide">Riwayat Mingguan</h3>

        {history.length === 0 ? (
          <div className="dyn-card">
            <EmptyState title="Belum ada riwayat proses mingguan." hint="Riwayat muncul setelah admin menjalankan proses minggu pertama." />
          </div>
        ) : (
          <>
            {/* Desktop: tabel */}
            <div className="hidden sm:block dyn-card overflow-hidden anim-fade">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-slate-800 text-xs uppercase tracking-wide">
                    <th className="px-4 py-2.5 font-medium">Minggu</th>
                    <th className="px-4 py-2.5 font-medium">Tanggal</th>
                    <th className="px-4 py-2.5 font-medium">Activity</th>
                    <th className="px-4 py-2.5 font-medium">Nyawa</th>
                    <th className="px-4 py-2.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id} className="border-b border-slate-800/60 last:border-0">
                      <td className="px-4 py-2.5 text-slate-300">#{h.mingguKe}</td>
                      <td className="px-4 py-2.5 text-slate-400">{fmtDate(h.tanggal)}</td>
                      <td className="px-4 py-2.5 text-slate-300">{h.activityPoint.toLocaleString('id-ID')}</td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span className="text-slate-400">{h.nyawaBefore}</span>
                        <span className="mx-1.5 text-slate-600">→</span>
                        <span className="text-slate-100 font-medium">{h.nyawaAfter}</span>
                        <span className="ml-2"><DeltaTag delta={h.delta} /></span>
                      </td>
                      <td className="px-4 py-2.5"><StatusBadge status={h.statusAkhir} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: card list */}
            <div className="sm:hidden space-y-2.5 anim-fade">
              {history.map((h) => (
                <div key={h.id} className="dyn-card p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">Minggu #{h.mingguKe} · {fmtDate(h.tanggal)}</span>
                    <StatusBadge status={h.statusAkhir} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">Activity: <span className="text-slate-100 font-medium">{h.activityPoint.toLocaleString('id-ID')}</span></span>
                    <span className="whitespace-nowrap">
                      <span className="text-slate-400">{h.nyawaBefore}</span>
                      <span className="mx-1 text-slate-600">→</span>
                      <span className="text-slate-100 font-medium">{h.nyawaAfter}</span>
                      <span className="ml-1.5"><DeltaTag delta={h.delta} /></span>
                    </span>
                  </div>
                  {h.note && <p className="text-[11px] text-slate-500 mt-1.5">{h.note}</p>}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {showPasswordModal && (
        <ChangePasswordModal
          onClose={() => setShowPasswordModal(false)}
          onSuccess={() => setToast('Password berhasil diganti.')}
        />
      )}
    </div>
  );
}
