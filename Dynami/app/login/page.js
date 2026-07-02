'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <img src="/logo-icon.png" alt="DynamiTeam" className="w-16 h-16 object-contain mb-2" />
          <h1 className="font-display text-2xl font-bold text-white tracking-wide">DynamiTeam</h1>
          <p className="text-xs text-slate-400">Squad Vitality Tracker</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">ID Login</label>
            <input
              type="text" required value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input" placeholder="ID dari admin squad"
              autoCapitalize="none" autoCorrect="off"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Password</label>
            <input
              type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
          </div>
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}
