'use client';

import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  ChevronRight,
  Gauge,
  History,
  Home,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  Trophy,
  UserRound,
} from 'lucide-react';

import {
  NyawaShards,
  StatusBadge,
  DeltaTag,
  fmtDate,
  MAX_NYAWA,
  ActivityMeter,
  getActivityZone,
  EmptyState,
  PageBackdrop,
} from '../../components/ui';

import ChangePasswordModal from '../../components/ChangePasswordModal';

function activityMessage(m) {
  if (m.status === 'KICK') {
    return {
      text: 'Status kamu saat ini Kick. Hubungi admin squad untuk kesempatan bergabung kembali.',
      tone: 'text-slate-400',
    };
  }

  if (!m.activityInputted) {
    return {
      text: 'Activity minggu ini belum diinput admin.',
      tone: 'text-slate-400',
    };
  }

  const zone = getActivityZone(m.activityPoint);

  if (zone.key === 'danger') {
    return {
      text: 'Activity kamu masih kurang. Hati-hati, nyawa bisa berkurang saat proses mingguan.',
      tone: 'text-rose-400',
    };
  }

  if (zone.key === 'safe') {
    return {
      text: 'Kamu aman minggu ini. Pertahankan activity kamu.',
      tone: 'text-emerald-400',
    };
  }

  return {
    text: 'Mantap! Kamu berpeluang menambah nyawa minggu ini.',
    tone: 'text-amber-300',
  };
}

function getMemberInitial(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function getWeeklyAverage(history) {
  if (!history?.length) return 0;
  const total = history.reduce((sum, item) => sum + Number(item.activityPoint || 0), 0);
  return Math.round(total / history.length);
}

export default function MemberDashboard({ member, history = [], isAdmin = false }) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const msg = activityMessage(member);
  const isCritical = member.nyawaCurrent === 1 && member.status !== 'KICK';
  const weeklyAverage = getWeeklyAverage(history);
  const lastHistory = history?.[0];

  return (
    <div className="member-prototype-shell">
      <PageBackdrop />

      {toast && (
        <div className="member-toast">
          {toast}
        </div>
      )}

      {/* Mobile Header */}
      <header className="member-mobile-header">
        <div className="flex items-center gap-2.5 min-w-0">
          <img src="/logo-icon.png" alt="DynamiTeam" className="w-10 h-10 object-contain shrink-0" />
          <div className="min-w-0">
            <h1 className="font-display text-lg font-bold text-white leading-none truncate">
              DynamiTeam
            </h1>
            <p className="text-[11px] text-slate-400 mt-1">
              Member Dashboard
            </p>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="member-mobile-logout"
          title="Keluar"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      <div className="member-prototype-layout">
        {/* Sidebar Desktop */}
        <aside className="member-sidebar">
          <div className="member-sidebar-brand">
            <img src="/logo-icon.png" alt="DynamiTeam" className="w-11 h-11 object-contain" />
            <div>
              <h1 className="font-display text-xl font-bold text-white leading-none">
                DynamiTeam
              </h1>
              <p className="text-[11px] text-slate-500 mt-1">
                Member Panel
              </p>
            </div>
          </div>

          <nav className="member-sidebar-nav">
            <a className="member-sidebar-link member-sidebar-link-active" href="#dashboard">
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </a>

            <a className="member-sidebar-link" href="#activity">
              <Activity className="w-4 h-4" />
              <span>Aktivitas Saya</span>
            </a>

            <a className="member-sidebar-link" href="#history">
              <History className="w-4 h-4" />
              <span>Riwayat Mingguan</span>
            </a>

            <a className="member-sidebar-link" href="#profile">
              <UserRound className="w-4 h-4" />
              <span>Profile</span>
            </a>

            {isAdmin && (
              <Link href="/admin" className="member-sidebar-link">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard Admin</span>
              </Link>
            )}

            <button
              onClick={() => setShowPasswordModal(true)}
              className="member-sidebar-link text-left"
            >
              <Settings className="w-4 h-4" />
              <span>Pengaturan</span>
            </button>
          </nav>

          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="member-sidebar-logout"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </aside>

        {/* Main Content */}
        <main className="member-main">
          {isCritical && (
            <div className="member-alert">
              <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              <p>
                <span>Nyawa kritis!</span> Sisa 1 nyawa. Tingkatkan activity minggu ini supaya tidak terancam kick.
              </p>
            </div>
          )}

          <section id="dashboard" className="member-hero-grid">
            {/* Profile + Status */}
            <div className="member-profile-card">
              <div className="member-profile-top">
                <div className="member-avatar-ring">
                  <div className="member-avatar">
                    {getMemberInitial(member.nama || member.nicknameML)}
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="member-welcome">Welcome back,</p>
                  <h2 className="member-name">
                    {member.nama || member.nicknameML}
                  </h2>
                  <p className="member-meta">
                    {member.roleSquad} · {member.idML}
                  </p>
                </div>

                <div className="member-status-desktop">
                  <StatusBadge status={member.status} size="lg" />
                </div>
              </div>

              <div className="member-status-mobile">
                <StatusBadge status={member.status} size="lg" />
              </div>

              <div className="member-life-section">
                <div>
                  <p className="member-section-label">Status Minggu Ini</p>
                  <div className="mt-3">
                    <NyawaShards n={member.nyawaCurrent} size="lg" />
                  </div>
                  <p className="member-life-text">
                    {member.nyawaCurrent} / {MAX_NYAWA} Nyawa
                  </p>
                </div>

                <div className="member-life-note">
                  <Shield className="w-4 h-4" />
                  <p>
                    Sistem nyawa diperbarui setiap proses mingguan oleh admin.
                  </p>
                </div>
              </div>

              <div id="activity" className="member-activity-block">
                <div className="flex items-baseline justify-between gap-4 mb-3">
                  <div>
                    <p className="member-section-label">Activity Point</p>
                    <h3 className="member-activity-number">
                      {Number(member.activityPoint || 0).toLocaleString('id-ID')}
                    </h3>
                  </div>

                  <div className="member-mini-chip">
                    <Gauge className="w-3.5 h-3.5" />
                    Minggu Ini
                  </div>
                </div>

                {member.status !== 'KICK' && (
                  <ActivityMeter value={Number(member.activityPoint || 0)} />
                )}

                <p className={`member-message ${msg.tone}`}>
                  {msg.text}
                </p>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="member-summary-stack">
              <div className="member-summary-card">
                <div className="member-summary-icon">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p>Total Riwayat</p>
                  <h3>{history.length}</h3>
                  <span>minggu tercatat</span>
                </div>
              </div>

              <div className="member-summary-card">
                <div className="member-summary-icon">
                  <Gauge className="w-5 h-5" />
                </div>
                <div>
                  <p>Rata-rata</p>
                  <h3>{weeklyAverage.toLocaleString('id-ID')}</h3>
                  <span>activity/minggu</span>
                </div>
              </div>

              <div className="member-summary-card member-summary-card-gold">
                <div className="member-summary-icon">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <p>Target Aman</p>
                  <h3>1.500+</h3>
                  <span>minimal activity</span>
                </div>
              </div>
            </div>
          </section>

          <section id="profile" className="member-content-grid">
            <div className="member-panel">
              <div className="member-panel-header">
                <div>
                  <p className="member-eyebrow">Profile Saya</p>
                  <h3>Informasi Member</h3>
                </div>
                <UserRound className="w-5 h-5 text-amber-300" />
              </div>

              <div className="member-info-list">
                <div>
                  <span>Nama</span>
                  <strong>{member.nama || '-'}</strong>
                </div>
                <div>
                  <span>Nickname ML</span>
                  <strong>{member.nicknameML || '-'}</strong>
                </div>
                <div>
                  <span>ID ML</span>
                  <strong>{member.idML || '-'}</strong>
                </div>
                <div>
                  <span>Role Squad</span>
                  <strong>{member.roleSquad || '-'}</strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong><StatusBadge status={member.status} /></strong>
                </div>
              </div>
            </div>

            <div className="member-panel">
              <div className="member-panel-header">
                <div>
                  <p className="member-eyebrow">Rules Activity</p>
                  <h3>Aturan Nyawa</h3>
                </div>
                <Shield className="w-5 h-5 text-amber-300" />
              </div>

              <div className="member-rules">
                <div>
                  <span className="member-rule-danger">&lt; 1.500</span>
                  <p>Nyawa berkurang 1</p>
                </div>
                <div>
                  <span className="member-rule-safe">1.500 - 3.000</span>
                  <p>Nyawa tetap aman</p>
                </div>
                <div>
                  <span className="member-rule-bonus">&gt; 3.000</span>
                  <p>Nyawa bertambah 1</p>
                </div>
              </div>

              {lastHistory && (
                <div className="member-last-process">
                  <CalendarDays className="w-4 h-4" />
                  <p>
                    Proses terakhir: Minggu #{lastHistory.mingguKe}, {fmtDate(lastHistory.tanggal)}
                  </p>
                </div>
              )}
            </div>
          </section>

          <section id="history" className="member-panel member-history-panel">
            <div className="member-panel-header">
              <div>
                <p className="member-eyebrow">Riwayat Mingguan</p>
                <h3>Perubahan Activity & Nyawa</h3>
              </div>
              <History className="w-5 h-5 text-amber-300" />
            </div>

            {history.length === 0 ? (
              <EmptyState
                title="Belum ada riwayat proses mingguan."
                hint="Riwayat muncul setelah admin menjalankan proses minggu pertama."
              />
            ) : (
              <>
                <div className="member-history-table-wrap">
                  <table className="member-history-table">
                    <thead>
                      <tr>
                        <th>Minggu</th>
                        <th>Tanggal</th>
                        <th>Activity</th>
                        <th>Nyawa</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {history.map((h) => (
                        <tr key={h.id}>
                          <td>#{h.mingguKe}</td>
                          <td>{fmtDate(h.tanggal)}</td>
                          <td>{Number(h.activityPoint || 0).toLocaleString('id-ID')}</td>
                          <td>
                            <span className="text-slate-400">{h.nyawaBefore}</span>
                            <span className="mx-1.5 text-slate-600">→</span>
                            <span className="text-white font-semibold">{h.nyawaAfter}</span>
                            <span className="ml-2">
                              <DeltaTag delta={h.delta} />
                            </span>
                          </td>
                          <td>
                            <StatusBadge status={h.statusAkhir} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="member-history-mobile">
                  {history.map((h) => (
                    <div key={h.id} className="member-history-card">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            Minggu #{h.mingguKe}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {fmtDate(h.tanggal)}
                          </p>
                        </div>

                        <StatusBadge status={h.statusAkhir} />
                      </div>

                      <div className="member-history-card-body">
                        <div>
                          <span>Activity</span>
                          <strong>{Number(h.activityPoint || 0).toLocaleString('id-ID')}</strong>
                        </div>

                        <div>
                          <span>Nyawa</span>
                          <strong>
                            {h.nyawaBefore} <ChevronRight className="inline w-3 h-3" /> {h.nyawaAfter}
                            <span className="ml-1.5">
                              <DeltaTag delta={h.delta} />
                            </span>
                          </strong>
                        </div>
                      </div>

                      {h.note && (
                        <p className="text-[11px] text-slate-500 mt-2">
                          {h.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        </main>
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