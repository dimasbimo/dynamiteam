'use client';

import { useState, useEffect, useMemo } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import {
  Plus, Trash2, Pencil, History as HistoryIcon, RotateCcw, Play, Users, LogOut,
  KeyRound, User, Search, Loader2,
} from 'lucide-react';
import {
  NyawaShards, StatusBadge, DeltaTag, ModalShell, Field, fmtDate, MAX_NYAWA,
  ActivityMeter, getActivityZone, EmptyState, STATUS_STYLES,
} from '../../components/ui';
import ChangePasswordModal from '../../components/ChangePasswordModal';

const FILTERS = [
  { key: 'ALL', label: 'Semua' },
  { key: 'AMAN', label: 'Aman' },
  { key: 'WASPADA', label: 'Waspada' },
  { key: 'TERANCAM_KICK', label: 'Terancam' },
  { key: 'KICK', label: 'Kick' },
];

export default function AdminDashboard({ initialMembers, initialWeekNumber }) {
  const [members, setMembers] = useState(initialMembers);
  const [weekNumber, setWeekNumber] = useState(initialWeekNumber);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [form, setForm] = useState({ nama: '', nicknameML: '', idML: '', roleSquad: '', username: '', password: '' });
  const [linkToSelf, setLinkToSelf] = useState(false);
  const [historyItems, setHistoryItems] = useState([]);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  function showError(msg) { setToast({ type: 'error', msg }); }
  function showOk(msg) { setToast({ type: 'ok', msg }); }

  async function api(url, options) {
    const res = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || 'Terjadi kesalahan.');
    return body;
  }

  const openAdd = () => { setForm({ nama: '', nicknameML: '', idML: '', roleSquad: '', username: '', password: '' }); setLinkToSelf(false); setModal({ type: 'add' }); };
  const openEdit = (m) => { setForm({ nama: m.nama, nicknameML: m.nicknameML, idML: m.idML, roleSquad: m.roleSquad, username: '', password: '' }); setModal({ type: 'edit', id: m.id }); };

  async function submitForm() {
    if (!form.nama.trim() || !form.nicknameML.trim()) { showError('Nama dan nickname wajib diisi.'); return; }
    setBusy(true);
    try {
      if (modal.type === 'add') {
        if (!linkToSelf && (!form.username.trim() || !form.password.trim())) { showError('ID login dan password wajib diisi untuk akun member baru.'); setBusy(false); return; }
        const { member } = await api('/api/members', { method: 'POST', body: JSON.stringify({ ...form, linkToSelf }) });
        setMembers((prev) => [...prev, member]);
        showOk(linkToSelf ? 'Data member kamu dibuat dan tertaut ke akun admin ini.' : `${member.nama} ditambahkan ke squad dengan 2 nyawa.`);
      } else {
        const { member } = await api(`/api/members/${modal.id}`, { method: 'PATCH', body: JSON.stringify(form) });
        setMembers((prev) => prev.map((m) => (m.id === member.id ? member : m)));
        showOk('Data member diperbarui.');
      }
      setModal(null);
    } catch (e) {
      showError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    setBusy(true);
    try {
      await api(`/api/members/${modal.id}`, { method: 'DELETE' });
      setMembers((prev) => prev.filter((m) => m.id !== modal.id));
      showOk('Member dihapus dari squad.');
      setModal(null);
    } catch (e) {
      showError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function confirmReset() {
    setBusy(true);
    try {
      const { member } = await api(`/api/members/${modal.id}/reset`, { method: 'POST' });
      setMembers((prev) => prev.map((m) => (m.id === member.id ? member : m)));
      showOk(`Nyawa ${member.nama} direset ke 2.`);
      setModal(null);
    } catch (e) {
      showError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function commitActivity(id) {
    const raw = drafts[id];
    if (raw === undefined) return;
    const val = Math.max(0, parseInt(raw, 10) || 0);
    try {
      const { member } = await api(`/api/members/${id}/activity`, { method: 'PATCH', body: JSON.stringify({ activityPoint: val }) });
      setMembers((prev) => prev.map((m) => (m.id === member.id ? member : m)));
      setDrafts((d) => { const nd = { ...d }; delete nd[id]; return nd; });
    } catch (e) {
      showError(e.message);
    }
  }

  async function openHistory(id) {
    setModal({ type: 'history', id });
    setHistoryItems(null);
    try {
      const { history } = await api(`/api/members/${id}/history`);
      setHistoryItems(history);
    } catch (e) {
      showError(e.message);
    }
  }

  async function openProcessConfirm() {
    setModal({ type: 'processConfirm' });
    setPreview(null);
    try {
      const data = await api('/api/process-week');
      setPreview(data);
    } catch (e) {
      showError(e.message);
      setModal(null);
    }
  }

  async function applyProcessWeek() {
    setBusy(true);
    try {
      const result = await api('/api/process-week', { method: 'POST' });
      const { members: fresh } = await api('/api/members');
      setMembers(fresh);
      setWeekNumber(result.mingguKe + 1);
      showOk(`Minggu ke-${result.mingguKe} diproses. ${result.processed} member diperbarui${result.kicksNow ? `, ${result.kicksNow} member ter-Kick` : ''}.`);
      setModal(null);
    } catch (e) {
      showError(e.message);
    } finally {
      setBusy(false);
    }
  }

  const statCounts = members.reduce((acc, m) => { acc[m.status] = (acc[m.status] || 0) + 1; return acc; }, {});
  const skippedCount = members.filter((m) => m.status !== 'KICK' && !m.activityInputted).length;

  const visibleMembers = useMemo(() => {
    const q = search.toLowerCase().trim();
    return members.filter((m) => {
      if (statusFilter !== 'ALL' && m.status !== statusFilter) return false;
      if (!q) return true;
      return (
        m.nama.toLowerCase().includes(q) ||
        m.nicknameML.toLowerCase().includes(q) ||
        (m.idML || '').toLowerCase().includes(q)
      );
    });
  }, [members, search, statusFilter]);

  function ActionButtons({ m, large = false }) {
    const isKick = m.status === 'KICK';
    const btn = large ? 'p-2' : 'p-1.5';
    return (
      <div className="flex items-center gap-1">
        <button onClick={() => openHistory(m.id)} title="Riwayat" className={`${btn} rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200`}><HistoryIcon className="w-4 h-4" /></button>
        <button onClick={() => openEdit(m)} title="Edit" className={`${btn} rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200`}><Pencil className="w-4 h-4" /></button>
        {(m.nyawaCurrent < MAX_NYAWA || isKick) && (
          <button onClick={() => setModal({ type: 'resetConfirm', id: m.id })} title="Reset nyawa" className={`${btn} rounded-md hover:bg-slate-800 text-slate-400 hover:text-amber-400`}><RotateCcw className="w-4 h-4" /></button>
        )}
        <button onClick={() => setModal({ type: 'deleteConfirm', id: m.id })} title="Hapus" className={`${btn} rounded-md hover:bg-slate-800 text-slate-400 hover:text-rose-400`}><Trash2 className="w-4 h-4" /></button>
      </div>
    );
  }

  function ActivityInput({ m, withMeter = false }) {
    const isKick = m.status === 'KICK';
    const draftVal = drafts[m.id] !== undefined ? drafts[m.id] : m.activityPoint;
    const zone = getActivityZone(m.activityPoint);
    return (
      <div>
        <div className="flex items-center gap-2">
          <input
            type="number" min="0" disabled={isKick} inputMode="numeric"
            value={draftVal}
            onChange={(e) => setDrafts((d) => ({ ...d, [m.id]: e.target.value }))}
            onBlur={() => commitActivity(m.id)}
            onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
            className="input w-28"
          />
          {!isKick && <span className={`text-[11px] font-medium ${zone.text}`}>{zone.label}</span>}
        </div>
        {withMeter && !isKick && <div className="mt-2"><ActivityMeter value={m.activityPoint} showLabel={false} /></div>}
        <div className={`text-[11px] mt-1 ${m.activityInputted ? 'text-emerald-400' : 'text-slate-500'}`}>
          {isKick ? 'Terkunci (Kick)' : m.activityInputted ? 'Siap diproses' : 'Belum diinput minggu ini'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-body text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800/70 bg-[#0d1220]/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <img src="/logo-icon.png" alt="DynamiTeam" className="w-9 h-9 sm:w-10 sm:h-10 object-contain shrink-0" />
            <div className="min-w-0">
              <h1 className="font-display text-lg sm:text-xl font-bold leading-none text-white tracking-wide truncate">Dynami Team</h1>
              <p className="text-[11px] text-slate-400 leading-none mt-0.5">Admin · Minggu ke-{weekNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            <Link href="/member" title="Dashboard Member Saya" className="inline-flex items-center gap-1.5 text-sm text-amber-400 hover:text-amber-300 p-2 sm:p-0">
              <User className="w-4 h-4" /><span className="hidden sm:inline">Dashboard Member Saya</span>
            </Link>
            <button onClick={() => setShowPasswordModal(true)} title="Ganti Password" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 p-2 sm:p-0">
              <KeyRound className="w-4 h-4" /><span className="hidden sm:inline">Ganti Password</span>
            </button>
            <button onClick={() => signOut({ callbackUrl: '/login' })} title="Keluar" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 p-2 sm:p-0">
              <LogOut className="w-4 h-4" /><span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 left-4 sm:left-auto z-50 px-4 py-2.5 rounded-lg border text-sm shadow-lg anim-slide-up ${toast.type === 'error' ? 'bg-rose-950 border-rose-700 text-rose-200' : 'bg-emerald-950 border-emerald-700 text-emerald-200'}`}>
          {toast.msg}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-5 py-5 sm:py-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6 anim-fade">
          <div className="dyn-card dyn-card-accent p-3.5">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1"><Users className="w-3.5 h-3.5" />Total Member</div>
            <div className="text-2xl font-display font-bold text-white">{members.length}</div>
          </div>
          {['AMAN', 'WASPADA', 'TERANCAM_KICK', 'KICK'].map((st) => (
            <div key={st} className="dyn-card p-3.5">
              <div className={`text-xs mb-1 ${STATUS_STYLES[st].text}`}>{STATUS_STYLES[st].label}</div>
              <div className="text-2xl font-display font-bold text-white">{statCounts[st] || 0}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, nickname, atau ID ML..."
              className="input input-iconized"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {FILTERS.map((f) => (
              <button key={f.key} onClick={() => setStatusFilter(f.key)} className={`chip ${statusFilter === f.key ? 'chip-active' : ''}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 mb-4">
          <button onClick={openAdd} className="btn-secondary inline-flex items-center justify-center gap-1.5">
            <Plus className="w-4 h-4" /> Tambah Member
          </button>
          <button onClick={openProcessConfirm} className="btn-primary inline-flex items-center justify-center gap-1.5">
            <Play className="w-4 h-4" /> Proses Minggu Ini
          </button>
        </div>

        {/* ===== Desktop: tabel ===== */}
        <div className="hidden md:block dyn-card overflow-hidden anim-fade">
          {visibleMembers.length === 0 ? (
            <EmptyState
              title={members.length === 0 ? 'Belum ada member di squad.' : 'Tidak ada member yang cocok dengan pencarian/filter.'}
              hint={members.length === 0 ? 'Klik "Tambah Member" untuk mulai.' : 'Coba ubah kata kunci atau filter status.'}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-slate-800 text-xs uppercase tracking-wide">
                    <th className="px-4 py-3 font-medium">Member</th>
                    <th className="px-4 py-3 font-medium">ID ML</th>
                    <th className="px-4 py-3 font-medium">Nyawa</th>
                    <th className="px-4 py-3 font-medium">Activity</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleMembers.map((m) => (
                    <tr key={m.id} className={`border-b border-slate-800/60 last:border-0 ${m.status === 'KICK' ? 'opacity-60' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-100">{m.nama}</div>
                        <div className="text-xs text-slate-400">{m.nicknameML} · {m.roleSquad}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-300 text-xs">{m.idML}</td>
                      <td className="px-4 py-3"><NyawaShards n={m.nyawaCurrent} /></td>
                      <td className="px-4 py-3"><ActivityInput m={m} /></td>
                      <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                      <td className="px-4 py-3"><div className="flex justify-end"><ActionButtons m={m} /></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ===== Mobile: card list ===== */}
        <div className="md:hidden space-y-3 anim-fade">
          {visibleMembers.length === 0 ? (
            <div className="dyn-card">
              <EmptyState
                title={members.length === 0 ? 'Belum ada member di squad.' : 'Tidak ada member yang cocok.'}
                hint={members.length === 0 ? 'Klik "Tambah Member" untuk mulai.' : 'Coba ubah kata kunci atau filter.'}
              />
            </div>
          ) : (
            visibleMembers.map((m) => (
              <div key={m.id} className={`dyn-card p-4 ${m.status === 'KICK' ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <div className="font-medium text-slate-100 truncate">{m.nama}</div>
                    <div className="text-xs text-slate-400 truncate">{m.nicknameML} · {m.roleSquad}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{m.idML}</div>
                  </div>
                  <StatusBadge status={m.status} />
                </div>
                <div className="mb-3"><NyawaShards n={m.nyawaCurrent} /></div>
                <ActivityInput m={m} withMeter />
                <div className="flex justify-end mt-2 pt-2 border-t border-slate-800/60">
                  <ActionButtons m={m} large />
                </div>
              </div>
            ))
          )}
        </div>

        {skippedCount > 0 && (
          <p className="text-xs text-slate-500 mt-3">{skippedCount} member belum diinput activity point minggu ini — tidak akan ikut diproses sampai diinput.</p>
        )}
      </div>

      {/* ===== Modals ===== */}
      {modal && (modal.type === 'add' || modal.type === 'edit') && (
        <ModalShell onClose={() => setModal(null)} title={modal.type === 'add' ? 'Tambah Member' : 'Edit Member'}>
          <div className="space-y-3">
            <Field label="Nama"><input value={form.nama} onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))} className="input" /></Field>
            <Field label="Nickname Mobile Legends"><input value={form.nicknameML} onChange={(e) => setForm((f) => ({ ...f, nicknameML: e.target.value }))} className="input" /></Field>
            <Field label="ID Mobile Legends"><input value={form.idML} onChange={(e) => setForm((f) => ({ ...f, idML: e.target.value }))} placeholder="123456789 (0000)" className="input" /></Field>
            <Field label="Role / Posisi"><input value={form.roleSquad} onChange={(e) => setForm((f) => ({ ...f, roleSquad: e.target.value }))} placeholder="Jungler, Roamer, dsb." className="input" /></Field>
            {modal.type === 'add' && (
              <>
                <label className="flex items-start gap-2 cursor-pointer rounded-lg border border-slate-700 bg-slate-800/50 p-3">
                  <input
                    type="checkbox"
                    checked={linkToSelf}
                    onChange={(e) => setLinkToSelf(e.target.checked)}
                    className="mt-0.5 accent-amber-500"
                  />
                  <span className="text-xs text-slate-300">
                    <span className="font-medium text-slate-100">Ini data saya sendiri (admin)</span><br />
                    Tautkan ke akun admin yang sedang login — tanpa membuat akun login baru.
                  </span>
                </label>
                {!linkToSelf && (
                  <>
                    <Field label="ID login member">
                      <input
                        value={form.username}
                        onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                        className="input"
                        placeholder="contoh: rajahutan atau fajar123"
                        autoCapitalize="none" autoCorrect="off"
                      />
                      <span className="block text-[11px] text-slate-500 mt-1">3-30 karakter, huruf/angka/titik/strip/underscore, tanpa spasi. Ini yang dipakai member untuk login.</span>
                    </Field>
                    <Field label="Password awal"><input type="text" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} className="input" placeholder="Member bisa ganti sendiri nanti" /></Field>
                  </>
                )}
              </>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-5">
            <button onClick={() => setModal(null)} className="btn-secondary">Batal</button>
            <button onClick={submitForm} disabled={busy} className="btn-primary inline-flex items-center gap-1.5">
              {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {modal.type === 'add' ? 'Tambahkan' : 'Simpan'}
            </button>
          </div>
        </ModalShell>
      )}

      {modal && modal.type === 'deleteConfirm' && (
        <ModalShell onClose={() => setModal(null)} title="Hapus Member">
          <p className="text-sm text-slate-300">Yakin hapus <span className="font-semibold text-white">{members.find((m) => m.id === modal.id)?.nama}</span> dari squad? Riwayat dan akun login-nya juga akan terhapus. Tindakan ini tidak bisa dibatalkan.</p>
          <div className="flex justify-end gap-2 mt-5">
            <button onClick={() => setModal(null)} className="btn-secondary">Batal</button>
            <button onClick={confirmDelete} disabled={busy} className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium disabled:opacity-40 inline-flex items-center gap-1.5">
              {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Hapus
            </button>
          </div>
        </ModalShell>
      )}

      {modal && modal.type === 'resetConfirm' && (
        <ModalShell onClose={() => setModal(null)} title="Reset Nyawa">
          <p className="text-sm text-slate-300">Reset nyawa <span className="font-semibold text-white">{members.find((m) => m.id === modal.id)?.nama}</span> ke 2 (default) dan status menjadi Waspada? Dicatat sebagai override manual di riwayat.</p>
          <div className="flex justify-end gap-2 mt-5">
            <button onClick={() => setModal(null)} className="btn-secondary">Batal</button>
            <button onClick={confirmReset} disabled={busy} className="btn-primary inline-flex items-center gap-1.5">
              {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Reset
            </button>
          </div>
        </ModalShell>
      )}

      {modal && modal.type === 'history' && (
        <ModalShell onClose={() => setModal(null)} title={`Riwayat — ${members.find((m) => m.id === modal.id)?.nama || ''}`} wide>
          {historyItems === null ? (
            <div className="flex items-center justify-center py-8 text-slate-400 text-sm gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Memuat riwayat...
            </div>
          ) : historyItems.length === 0 ? (
            <EmptyState title="Belum ada riwayat untuk member ini." hint="Riwayat muncul setelah proses mingguan pertama." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-slate-800 text-xs uppercase tracking-wide">
                    <th className="px-3 py-2 font-medium">Minggu</th>
                    <th className="px-3 py-2 font-medium">Tanggal</th>
                    <th className="px-3 py-2 font-medium">Activity</th>
                    <th className="px-3 py-2 font-medium">Nyawa</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {historyItems.map((h) => (
                    <tr key={h.id} className="border-b border-slate-800/60 last:border-0">
                      <td className="px-3 py-2 text-slate-300">#{h.mingguKe}</td>
                      <td className="px-3 py-2 text-slate-400">{fmtDate(h.tanggal)}</td>
                      <td className="px-3 py-2 text-slate-300">{h.activityPoint.toLocaleString('id-ID')}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{h.nyawaBefore} → {h.nyawaAfter} <DeltaTag delta={h.delta} /></td>
                      <td className="px-3 py-2"><StatusBadge status={h.statusAkhir} /></td>
                      <td className="px-3 py-2 text-slate-500 text-xs">{h.note || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ModalShell>
      )}

      {modal && modal.type === 'processConfirm' && (
        <ModalShell onClose={() => setModal(null)} title={`Proses Minggu ke-${weekNumber}`} wide>
          {!preview ? (
            <div className="flex items-center justify-center py-8 text-slate-400 text-sm gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Memuat preview...
            </div>
          ) : (
            <>
              {preview.preview.length === 0 ? (
                <EmptyState title="Belum ada member dengan activity point yang diinput minggu ini." hint="Input activity dulu, baru jalankan proses." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-400 border-b border-slate-800 text-xs uppercase tracking-wide">
                        <th className="px-3 py-2 font-medium">Member</th>
                        <th className="px-3 py-2 font-medium">Activity</th>
                        <th className="px-3 py-2 font-medium">Nyawa</th>
                        <th className="px-3 py-2 font-medium">Status Baru</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.preview.map((p) => (
                        <tr key={p.id} className="border-b border-slate-800/60 last:border-0">
                          <td className="px-3 py-2 text-slate-200">{p.nama}</td>
                          <td className="px-3 py-2 text-slate-300">{p.activityPoint.toLocaleString('id-ID')}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{p.nyawaBefore} → {p.nyawaAfter} <DeltaTag delta={p.delta} /></td>
                          <td className="px-3 py-2"><StatusBadge status={p.statusAfter} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="text-xs text-slate-500 mt-3 space-y-0.5">
                {preview.skippedCount > 0 && <p>{preview.skippedCount} member dilewati karena belum diinput activity minggu ini.</p>}
                {preview.kickedLockedCount > 0 && <p>{preview.kickedLockedCount} member berstatus Kick dan dikunci sampai direset manual.</p>}
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button onClick={() => setModal(null)} className="btn-secondary">Batal</button>
                <button onClick={applyProcessWeek} disabled={busy || preview.preview.length === 0} className="btn-primary inline-flex items-center gap-1.5">
                  {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Konfirmasi &amp; Proses
                </button>
              </div>
            </>
          )}
        </ModalShell>
      )}

      {showPasswordModal && (
        <ChangePasswordModal
          onClose={() => setShowPasswordModal(false)}
          onSuccess={() => showOk('Password berhasil diganti.')}
        />
      )}
    </div>
  );
}
