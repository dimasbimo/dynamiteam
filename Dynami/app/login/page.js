'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  User,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Username atau password wajib diisi.');
      return;
    }

    setLoading(true);

    const res = await signIn('credentials', {
      username,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError('Login gagal, periksa kembali akun kamu.');
      return;
    }

    router.push('/');
    router.refresh();
  }

  return (
    <main className="auth-page">
      {/* Background dekoratif */}
      <div className="auth-bg-layer" aria-hidden="true" />
      <div className="auth-gold-line auth-gold-line-1" aria-hidden="true" />
      <div className="auth-gold-line auth-gold-line-2" aria-hidden="true" />
      <div className="auth-orb auth-orb-left" aria-hidden="true" />
      <div className="auth-orb auth-orb-right" aria-hidden="true" />
      <div className="auth-embers" aria-hidden="true" />

      {/* Silhouette kanan bawah */}
      <div className="auth-trophy-scene" aria-hidden="true">
        <div className="auth-trophy-glow" />
        <div className="auth-trophy-base" />
        <div className="auth-trophy-mark" />
      </div>

      <section className="auth-card anim-auth-card">
        <div className="auth-card-glow" aria-hidden="true" />

        <div className="auth-brand anim-auth-logo">
          <img
            src="/logo-icon.png"
            alt="DynamiTeam"
            className="auth-logo"
          />

          <div>
            <h1 className="auth-brand-title">Dynami Team</h1>
            <p className="auth-brand-subtitle">ACTIVITY SYSTEM</p>
          </div>
        </div>

        <div className="auth-heading">
          <h2>
            <span>Welcome Back,</span> Dynami Team
          </h2>
          <p>
            Squad Activity & Life Point System
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field-group">
            <label htmlFor="username" className="auth-label">
              <User className="auth-label-icon" />
              Username
            </label>

            <div className="auth-input-wrap">
              <User className="auth-input-icon" />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="auth-input"
                placeholder="Masukkan username, nickname, atau ID ML"
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="username"
              />
            </div>
          </div>

          <div className="auth-field-group">
            <label htmlFor="password" className="auth-label">
              <Lock className="auth-label-icon" />
              Password
            </label>

            <div className="auth-input-wrap">
              <Lock className="auth-input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input auth-input-password"
                placeholder="Masukkan password"
                autoComplete="current-password"
              />

              <button
                type="button"
                className="auth-eye-button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? (
                  <EyeOff className="auth-eye-icon" />
                ) : (
                  <Eye className="auth-eye-icon" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="auth-error">
              <ShieldCheck className="auth-error-icon" />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading} className="auth-login-button">
            <span>
              {loading ? (
                <>
                  <Loader2 className="auth-loading-icon" />
                  Memproses...
                </>
              ) : (
                'Login'
              )}
            </span>

            {!loading && <ArrowRight className="auth-button-icon" />}
          </button>

          <div className="auth-links auth-links-single">
              <a href="#" onClick={(e) => e.preventDefault()}>
                Lupa password?
              </a>
          </div>
        </form>
      </section>
    </main>
  );
}