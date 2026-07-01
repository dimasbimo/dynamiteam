# DynamiTeam — Squad Vitality Tracker

Aplikasi manajemen keaktifan member squad Mobile Legends berbasis sistem nyawa.
Stack: Next.js (App Router) · PostgreSQL · Prisma · NextAuth · Tailwind CSS.

Panduan ini asumsikan kamu sudah familiar dasar-dasar: terminal, `npm`, dan `git`.

---

## 0. Yang perlu disiapkan

- [Node.js](https://nodejs.org) versi 18 ke atas — cek dengan `node -v`
- Akun [GitHub](https://github.com)
- Akun [Vercel](https://vercel.com) (bisa daftar pakai akun GitHub, gratis)
- Akun database PostgreSQL gratis — rekomendasi **[Neon](https://neon.tech)** (gampang, langsung kasih connection string yang cocok untuk serverless/Vercel)

---

## 1. Setup Lokal

```bash
# masuk ke folder project ini (hasil extract zip)
cd pulse-squad-tracker

# install semua dependency
npm install
```

Kalau `npm install` sukses, `prisma generate` otomatis jalan lewat script `postinstall`
di `package.json` — ini yang bikin `@prisma/client` siap dipakai.

## 2. Buat Database di Neon

1. Daftar/login ke https://neon.tech, buat project baru (pilih region terdekat, misal Singapore).
2. Di dashboard project, buka **Connection Details**, salin connection string yang
   **pooled** (biasanya ada tulisan "Pooled connection" — penting dipakai ini,
   bukan yang direct, supaya tidak kehabisan koneksi saat di-deploy ke Vercel).
3. Connection string-nya bentuknya seperti:
   ```
   postgresql://user:password@ep-xxxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

## 3. Konfigurasi Environment Variable Lokal

Salin `.env.example` jadi `.env`:

```bash
cp .env.example .env
```

Isi `.env`:

```
DATABASE_URL="<connection string pooled dari Neon>"
NEXTAUTH_SECRET="<hasil generate di bawah>"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAIL="admin@squadkamu.com"
ADMIN_PASSWORD="password-kuat-sementara"
```

Generate `NEXTAUTH_SECRET` yang aman:

```bash
openssl rand -base64 32
```

(Kalau tidak ada `openssl`, bisa juga generate string random panjang lewat
https://generate-secret.vercel.app/32)

## 4. Migrasi Database & Buat Akun Admin

```bash
# bikin tabel-tabel di database sesuai prisma/schema.prisma
npx prisma migrate dev --name init

# bikin akun admin pertama (pakai ADMIN_EMAIL & ADMIN_PASSWORD dari .env)
npm run seed
```

Kalau berhasil, akan muncul konfirmasi email & password admin di terminal.

## 5. Jalankan Lokal

```bash
npm run dev
```

Buka http://localhost:3000 — login pakai email/password admin dari langkah 4.
Coba tambah beberapa member, input activity point, lalu klik "Proses Minggu Ini"
untuk pastikan alurnya sesuai yang kamu mau sebelum di-deploy.

---

## 6. Push ke GitHub

```bash
git init
git add .
git commit -m "Initial commit - PULSE squad tracker"
```

Buat repository baru di GitHub (lewat web, jangan centang "initialize with README"),
lalu:

```bash
git remote add origin https://github.com/USERNAME/NAMA-REPO.git
git branch -M main
git push -u origin main
```

`.env` **tidak akan ikut ter-push** karena sudah ada di `.gitignore` — memang
harus begitu, jangan pernah commit file `.env` berisi secret.

## 7. Deploy ke Vercel

1. Login ke https://vercel.com, klik **Add New → Project**.
2. Pilih repo GitHub yang barusan kamu push.
3. Di bagian **Environment Variables**, isi persis seperti `.env` lokal kamu:
   - `DATABASE_URL` — connection string pooled dari Neon
   - `NEXTAUTH_SECRET` — boleh sama atau generate baru khusus production
   - `NEXTAUTH_URL` — isi dengan URL Vercel kamu, contoh `https://pulse-squad.vercel.app`
     (kalau belum tahu URL-nya, deploy dulu sekali, lalu update env var ini dan redeploy)
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD` — tidak wajib di Vercel kecuali kamu mau
     jalankan seed lewat production juga (lihat langkah 8)
4. Klik **Deploy**.

Vercel otomatis menjalankan `npm install` (yang men-trigger `prisma generate`)
lalu `next build`. Kalau `DATABASE_URL` sudah benar, ini akan sukses.

## 8. Migrasi & Seed di Database Production

Migrasi yang kamu jalankan di langkah 4 tadi (`prisma migrate dev`) sudah
langsung membuat tabel di database Neon yang sama dipakai production (karena
`DATABASE_URL` di `.env` lokal dan di Vercel mengarah ke database yang sama).
Jadi kalau kamu pakai satu database yang sama untuk lokal & production, **tidak
perlu migrasi ulang**.

Kalau kamu bikin database Neon terpisah untuk production, jalankan dari
komputer kamu (arahkan `DATABASE_URL` sementara ke database production):

```bash
npx prisma migrate deploy
npm run seed
```

## 9. Selesai

Buka URL Vercel kamu, login dengan akun admin, mulai tambah member squad.
Tiap kali kamu tambah member baru lewat dashboard admin, akun login
member (email + password) otomatis dibuat bareng data membernya.

---

## Struktur Project

```
app/
  api/                    -> semua endpoint backend (REST-style)
    auth/[...nextauth]/   -> login/logout (NextAuth)
    account/password/     -> ganti password (admin & member)
    members/               -> CRUD member
    members/[id]/activity/ -> input activity point mingguan
    members/[id]/reset/    -> reset nyawa manual
    members/[id]/history/  -> riwayat mingguan per member
    process-week/          -> jalankan perhitungan nyawa mingguan
  admin/                  -> dashboard admin
  member/                 -> dashboard member
  login/                  -> halaman login
lib/
  rules.js      -> SATU-SATUNYA tempat aturan nyawa didefinisikan
  prisma.js     -> koneksi database
  auth.js       -> konfigurasi NextAuth
  session.js    -> helper cek role di API routes
components/
  ui.js                   -> komponen visual (ikon nyawa, badge status, modal, dst)
  ChangePasswordModal.js  -> form ganti password
public/
  logo.png, logo-icon.png, favicon.png  -> aset logo DynamiTeam
prisma/schema.prisma -> struktur database
prisma/seed.js        -> pembuat akun admin pertama
middleware.js          -> proteksi /admin dan /member berdasar role
```

## Mengubah Aturan Nyawa atau Mapping Status

Semua angka aturan (ambang activity point, mapping nyawa→status) ada di
**satu file**: `lib/rules.js`. Ubah di situ saja, tidak perlu sentuh file lain.

## Menambahkan Fitur "Multi-Squad" Nanti

Skema saat ini mengasumsikan satu squad. Kalau nanti perlu kelola banyak squad:
tambah model `Squad` di `prisma/schema.prisma`, tambah kolom `squadId` di model
`Member`, lalu filter query di setiap API route berdasarkan squad milik admin
yang login. Lebih mudah dilakukan sebelum ada banyak data production.

## Reset / Ganti Password

Member dan admin bisa ganti password sendiri kapan saja lewat tombol
**"Ganti Password"** di header dashboard (butuh tahu password lama). Kalau
member benar-benar lupa password (tidak tahu password lama sama sekali),
admin bisa reset lewat SQL editor di Neon dengan meng-hash password baru
pakai bcrypt — belum ada halaman "lupa password" mandiri di versi ini.
