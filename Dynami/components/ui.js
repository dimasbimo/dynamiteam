'use client';

import { ShieldCheck, AlertTriangle, Skull, ArrowUp, ArrowDown, Minus, X, Inbox } from 'lucide-react';

export const MAX_NYAWA = 4;

export const STATUS_STYLES = {
  AMAN: { label: 'Aman', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: ShieldCheck },
  WASPADA: { label: 'Waspada', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: AlertTriangle },
  TERANCAM_KICK: { label: 'Terancam Kick', text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', icon: AlertTriangle },
  KICK: { label: 'Kick', text: 'text-slate-400', bg: 'bg-slate-700/40', border: 'border-slate-600/50', icon: Skull },
};

export function NyawaShards({ n, size = 'md' }) {
  const dims = size === 'lg' ? 'w-6 h-6' : size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  const gap = size === 'lg' ? 'gap-2.5' : 'gap-1.5';
  const critical = n === 1;
  return (
    <div className={`flex items-center ${gap}`}>
      {Array.from({ length: MAX_NYAWA }).map((_, i) => (
        <div
          key={i}
          className={`${dims} rotate-45 rounded-[3px] border ${i < n && critical ? 'anim-pulse-danger' : ''}`}
          style={
            i < n
              ? { background: 'linear-gradient(135deg, #facc15, #f43f5e)', borderColor: 'rgba(250,204,21,0.6)', boxShadow: '0 0 7px rgba(244,63,94,0.5)' }
              : { background: 'rgba(19,26,43,0.8)', borderColor: 'rgba(71,85,105,0.5)' }
          }
        />
      ))}
    </div>
  );
}

export function StatusBadge({ status, size = 'md' }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.WASPADA;
  const Icon = s.icon;
  const pad = size === 'lg' ? 'px-3 py-1.5 text-sm' : 'px-2 py-1 text-xs';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${s.bg} ${s.border} ${s.text} ${pad} font-medium whitespace-nowrap`}>
      <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} />
      {s.label}
    </span>
  );
}

export function DeltaTag({ delta }) {
  if (delta > 0) return <span className="inline-flex items-center gap-0.5 text-emerald-400"><ArrowUp className="w-3.5 h-3.5" />+{delta}</span>;
  if (delta < 0) return <span className="inline-flex items-center gap-0.5 text-rose-400"><ArrowDown className="w-3.5 h-3.5" />{delta}</span>;
  return <span className="inline-flex items-center gap-0.5 text-slate-400"><Minus className="w-3.5 h-3.5" />0</span>;
}

// Zona activity: <1500 bahaya, 1500-3000 aman, >3000 bonus
export function getActivityZone(value) {
  if (value < 1500) return { key: 'danger', label: 'Bahaya', text: 'text-rose-400', fill: '#f43f5e' };
  if (value <= 3000) return { key: 'safe', label: 'Aman', text: 'text-emerald-400', fill: '#34d399' };
  return { key: 'bonus', label: 'Bonus nyawa', text: 'text-cyan-300', fill: '#22d3ee' };
}

// Bar segmented: skala 0..4500, penanda ambang di 1500 dan 3000.
export function ActivityMeter({ value, showLabel = true }) {
  const zone = getActivityZone(value);
  const pct = Math.min(value / 4500, 1) * 100;
  return (
    <div>
      <div className="relative h-2 rounded-full overflow-hidden" style={{ background: '#1a2237' }}>
        <div className="absolute inset-y-0 left-0 rounded-full transition-all" style={{ width: `${pct}%`, background: zone.fill, opacity: 0.85 }} />
        <div className="absolute inset-y-0 w-px bg-slate-500/70" style={{ left: '33.33%' }} />
        <div className="absolute inset-y-0 w-px bg-slate-500/70" style={{ left: '66.66%' }} />
      </div>
      {showLabel && (
        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>0</span><span>1.500</span><span>3.000</span><span>&gt;</span>
        </div>
      )}
    </div>
  );
}

// Latar dekoratif untuk halaman dashboard. Sengaja BEDA dari login:
// statis (tanpa animasi drift) dan lebih redup, karena halaman kerja
// di-scroll lama - layer blur yang beranimasi terus membebani HP kelas
// menengah. position:fixed supaya tidak dirender ulang saat scroll.
export function PageBackdrop() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed -top-32 -left-24 w-96 h-96 rounded-full blur-3xl opacity-[0.13] -z-10"
        style={{ background: 'radial-gradient(circle, #facc15, transparent 65%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -bottom-40 -right-24 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-[0.11] -z-10"
        style={{ background: 'radial-gradient(circle, #22d3ee, transparent 65%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 h-px -z-10"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(250,204,21,0.4), rgba(34,211,238,0.4), transparent)' }}
      />
    </>
  );
}

export function EmptyState({ title, hint }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Inbox className="w-8 h-8 text-slate-600 mb-3" />
      <p className="text-sm text-slate-400">{title}</p>
      {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
    </div>
  );
}

export function ModalShell({ title, children, onClose, wide }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 anim-fade" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className={`dyn-card dyn-card-accent p-5 w-full ${wide ? 'max-w-2xl' : 'max-w-md'} max-h-[85vh] overflow-y-auto anim-slide-up`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs text-slate-400 mb-1">{label}</span>
      {children}
    </label>
  );
}

export function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}
