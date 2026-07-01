'use client';

import { useState } from 'react';
import { ModalShell, Field } from './ui';

export default function ChangePasswordModal({ onClose, onSuccess }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) { setError('Password baru minimal 6 karakter.'); return; }
    if (newPassword !== confirmPassword) { setError('Konfirmasi password baru tidak cocok.'); return; }

    setBusy(true);
    try {
      const res = await fetch('/api/account/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Gagal mengganti password.');
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ModalShell title="Ganti Password" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Field label="Password Saat Ini">
          <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="input" />
        </Field>
        <Field label="Password Baru">
          <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input" />
        </Field>
        <Field label="Konfirmasi Password Baru">
          <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input" />
        </Field>
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary">Batal</button>
          <button type="submit" disabled={busy} className="btn-primary">{busy ? 'Menyimpan...' : 'Simpan'}</button>
        </div>
      </form>
    </ModalShell>
  );
}
