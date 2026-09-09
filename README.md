# Streamo AI

Repo Next.js (App Router) tunggal untuk tiga bagian, semuanya sudah aktif:

- `/` — Streamo AI (pendengar) — daftar mandiri, dengarkan, unggah lagu sendiri, playlist, Premium
- `/artists` — Streamo AI for Artists — portal kreator untuk kelola profil & katalog sendiri
- `/internal` — Streamo AI Internal — portal staf: moderasi, verifikasi, dukungan pengguna

Ketiganya membaca dari **satu database Supabase yang sama** — melaporkan lagu
atau mengirim tiket dukungan di app pendengar langsung muncul di antrean
staf; staf men-takedown lagu langsung kelihatan di app pendengar & portal
artis.

---

## 1. Setup Supabase

1. Buka project Supabase kamu → **SQL Editor** → New query.
2. Copy-paste seluruh isi `supabase-schema.sql` (ada di root repo ini) → **Run**.
   Ini membuat semua tabel, RLS policy, trigger auto-profile, storage bucket,
   sedikit data contoh (6 artis + 6 lagu + 2 laporan), dan kolom lirik untuk
   panel lirik di app pendengar.
3. Buat akun staf pertamamu:
   - Dashboard → **Authentication** → **Add user** → isi email + password
     (jangan pakai form signup publik manapun — sengaja tidak ada di app ini).
   - Dashboard → **Table Editor** → tabel `profiles` → cari baris user yang
     baru dibuat → ubah kolom `role` dari `listener` jadi `staff` → Save.
4. Buat akun artis pertamamu (opsional, untuk coba `/artists`):
   - Dashboard → **Authentication** → **Add user** → buat user baru.
   - Table Editor → `profiles` → ubah `role` user itu jadi `artist`.
   - Table Editor → `artists` → pilih salah satu baris artis yang sudah ada
     dari data contoh (mis. "Mira Solheim") → isi kolom `profile_id` dengan
     ID user tadi (bisa disalin dari tabel `profiles` atau Authentication).
     Ini yang "menautkan" login itu ke profil artis tersebut.
5. Ambil kredensial API-mu: Dashboard → **Project Settings** → **API**.
   Kamu butuh **Project URL** dan **anon public key**.

## 2. Setup lokal

```bash
npm install
cp .env.local.example .env.local
# lalu isi .env.local dengan Project URL & anon key dari langkah 1.4
npm run dev
```

Buka `http://localhost:3000/internal/login`, masuk pakai akun staf yang
tadi dibuat. Untuk portal artis, buka `http://localhost:3000/artists/login`
dan masuk pakai akun artis yang sudah ditautkan. Untuk app pendengar, buka
`http://localhost:3000/login` — siapa pun boleh langsung daftar sendiri
lewat tab "Daftar" (kalau email confirmation aktif di project Supabase-mu,
akun baru perlu klik link konfirmasi dulu sebelum bisa masuk).

## 3. Push ke GitHub

```bash
git init
git add .
git commit -m "Initial commit: Streamo AI Internal wired to Supabase"
git branch -M main
git remote add origin https://github.com/<username-kamu>/streamo-ai.git
git push -u origin main
```

## 4. Deploy ke Vercel

1. vercel.com → **Add New Project** → import repo GitHub yang barusan dibuat.
2. Sebelum deploy, buka **Environment Variables**, tambahkan:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   (nilai yang sama seperti di `.env.local`)
3. Deploy. Setelah selesai, portal staf ada di `https://<project-kamu>.vercel.app/internal/login`.

## Catatan keamanan

- Peran (`role`) pengguna **tidak pernah** dikirim dari client atau disimpan
  di localStorage — itu murni kolom database yang cuma bisa diubah manual
  lewat Supabase Dashboard, dan setiap aksi staf di server (verifikasi
  artis, takedown lagu, resolve laporan) dicek ulang oleh RLS policy, bukan
  cuma dipercaya dari UI.
- Anon key aman ditaruh di `NEXT_PUBLIC_*` — itu memang didesain publik.
  Keamanan sungguhannya ada di RLS policy dalam `supabase-schema.sql`.
- Belum ada rate limiting atau logging audit trail untuk aksi staf — kalau
  mau produksi sungguhan, itu langkah selanjutnya yang wajib ditambah.

## Kebijakan konten: khusus musik AI baru

Streamo AI hanya menerima musik baru yang benar-benar dibuat dengan AI versi
Pro — bukan cover, bukan lagu orang lain. Ini ditegakkan secara teknis,
bukan cuma aturan tertulis:

- Saat unggah (baik dari pendengar maupun artis), kolom **AI Pro yang
  dipakai** wajib diisi dan ada **checkbox pernyataan orisinalitas** yang
  wajib dicentang — keduanya divalidasi di server, bukan cuma di tombol.
- Lagu baru masuk status **"menunggu tinjauan"** dan **tidak tampil** di
  katalog publik (Beranda/Cari/Genre/Koleksi) sampai staf menyetujuinya di
  `/internal/review`.
- Pengunggah tetap bisa melihat lagunya sendiri di "Unggahan Saya" /
  "Musik Saya" dengan status Menunggu Tinjauan / Ditolak (lengkap dengan
  alasan penolakan kalau ada).
- Staf bisa Setujui atau Tolak (dengan alasan opsional) dari antrean
  `/internal/review`, dengan badge jumlah yang menunggu di sidebar.

## Yang menyambungkan ketiga app

- **Laporkan lagu** (menu ⋯ di app pendengar) → masuk ke tabel `reports` →
  langsung muncul di `/internal/moderation`.
- **Kirim tiket** (halaman Bantuan di app pendengar) → masuk ke
  `support_tickets` → langsung muncul di `/internal/tickets`.
- **Takedown lagu / cabut verifikasi artis** di `/internal` → langsung
  memengaruhi apa yang tampil di app pendengar dan `/artists`.
- **Langganan Premium** yang dibeli di app pendengar benar-benar
  mengendurkan batas unduhan (5 lagu) dan batas playlist (3) — dicek ulang
  di server lewat Server Action, bukan cuma disembunyikan di UI.

## Yang belum dibangun

- Belum ada koneksi payment gateway sungguhan untuk Premium — checkout-nya
  simulasi UI, walau statusnya tersimpan permanen di database.
- Belum ada UI "klaim profil artis" mandiri — menautkan akun ke profil
  artis masih manual lewat Supabase Table Editor. Ini konsisten dengan
  Spotify for Artists asli: verifikasi identitas artis itu proses manual,
  bukan swalayan.
- Belum ada rekomendasi algoritmik, fitur sosial (follow teman, share),
  atau moderasi otomatis — laporan tetap ditinjau manual oleh staf.
- Durasi lagu yang tampil di daftar lagu bersifat dekoratif (bukan dibaca
  dari metadata file audio sungguhan).
