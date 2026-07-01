'use client';

import { ShieldCheck, AlertTriangle, Skull, ArrowUp, ArrowDown, Minus, X } from 'lucide-react';

export const MAX_NYAWA = 4;

export const STATUS_STYLES = {
  AMAN: { label: 'Aman', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: ShieldCheck },
  WASPADA: { label: 'Waspada', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: AlertTriangle },
  TERANCAM_KICK: { label: 'Terancam Kick', text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', icon: AlertTriangle },
  KICK: { label: 'Kick', text: 'text-slate-400', bg: 'bg-slate-700/40', border: 'border-slate-600/50', icon: Skull },
};

export function NyawaShards({ n, size = 'md' }) {
  const dims = size === 'lg' ? 'w-6 h-6' : size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  const gap = size === 'lg' ? 'gap-2' : 'gap-1.5';
  return (
    <div className={`flex items-center ${gap}`}>
      {Array.from({ length: MAX_NYAWA }).map((_, i) => (
        <div
          key={i}
          className={`${dims} rotate-45 rounded-[3px] border`}
          style={
            i < n
              ? { background: 'linear-gradient(135deg, #fbbf24, #f43f5e)', borderColor: 'rgba(251,191,36,0.6)', boxShadow: '0 0 6px rgba(244,63,94,0.55)' }
              : { background: 'rgba(30,41,59,0.6)', borderColor: 'rgba(71,85,105,0.6)' }
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

export function ModalShell({ title, children, onClose, wide }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-slate-900 border border-slate-700 rounded-xl p-5 w-full ${wide ? 'max-w-2xl' : 'max-w-md'} max-h-[85vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-slate-800 text-slate-400">
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
