'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User, Lock, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await signIn('credentials', { username, password, redirect: false });

    setLoading(false);
    if (res?.error) {
      setError('ID login atau password salah.');
      return;
    }
    router.push('/');
    router.refresh();
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-grid">
      {/* Glow dekoratif - CSS murni, ringan */}
      <div aria-hidden className="pointer-events-none absolute -top-32 -left-24 w-96 h-96 rounded-full blur-3xl opacity-25 anim-glow-drift"
        style={{ background: 'radial-gradient(circle, #facc15, transparent 65%)' }} />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -right-24 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-20 anim-glow-drift"
        style={{ background: 'radial-gradient(circle, #22d3ee, transparent 65%)', animationDelay: '-4.5s' }} />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(250,204,21,0.5), rgba(34,211,238,0.5), transparent)' }} />

      <div className="w-full max-w-sm relative">
        <div className="flex flex-col items-center mb-6 anim-scale">
          <img src="/logo-icon.png" alt="DynamiTeam" className="w-24 h-24 object-contain mb-3 drop-shadow-[0_0_18px_rgba(250,204,21,0.35)]" />
          <h1 className="font-display text-2xl font-bold text-white tracking-wide text-center">Dynami Team</h1>
          <p className="text-xs text-slate-400 mt-1">Squad Activity &amp; Life Point System</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel p-6 space-y-4 anim-slide-up-delay">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">ID Login</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text" required value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input input-iconized" placeholder="ID dari admin squad"
                autoCapitalize="none" autoCorrect="off"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password" required value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input input-iconized"
              />
            </div>
          </div>
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
          <p className="text-[11px] text-slate-500 text-center pt-1">Manage your squad activity with style.</p>
        </form>
      </div>
    </div>
  );
}
