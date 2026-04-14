# 🌊 TaskFlow - Modern Kanban Board

TaskFlow adalah aplikasi manajemen tugas (Kanban) yang modern, bersih, dan responsif. Dibangun dengan **React**, **Tailwind CSS**, dan **Supabase**, aplikasi ini mendukung kolaborasi tim secara real-time.

---

## ✨ Fitur Utama

- 📋 **Multipel Board**: Buat board berbeda untuk berbagai proyek.
- 🔄 **Drag & Drop**: Pindahkan tugas antar kolom dengan mulus menggunakan `@dnd-kit`.
- 🤝 **Kolaborasi Tim**: Undang anggota tim lewat email untuk bekerja di board yang sama.
- ⚡ **Real-time Update**: Lihat perubahan tugas, komentar, dan pergerakan secara instan tanpa refresh.
- 💬 **Diskusi Tugas**: Berikan komentar dan diskusi langsung di setiap kartu tugas.
- 🎯 **Penugasan (Assignee)**: Tugaskan tugas ke anggota tim tertentu.
- 🔴 **Prioritas & Deadline**: Atur tingkat kepentingan dan batas waktu tugas.
- 🔐 **Autentikasi Aman**: Login/Register menggunakan email atau Google OAuth.

---

## 🛠️ Tech Stack

- **Frontend**: Vite, React (TypeScript)
- **Styling**: Tailwind CSS v4
- **State Management**: TanStack Query (React Query)
- **Backend & Auth**: Supabase
- **Icons**: Lucide React
- **Drag & Drop**: @dnd-kit

---

## 🚀 Cara Setup & Instalasi

Ikuti langkah-langkah detail ini untuk menjalankan project di lokal Anda:

### 1. Persiapan Awal
Pastikan Anda memiliki [Bun](https://bun.sh/) atau [Node.js](https://nodejs.org/) terinstal di komputer Anda.

### 2. Instalasi Dependensi
Jalankan perintah berikut di terminal:
```bash
bun install
# atau jika menggunakan npm
npm install
```

### 3. Konfigurasi Environment Variables
Buat file bernama `.env` di root direktori project, lalu isi dengan kredensial Supabase Anda:
```env
VITE_SUPABASE_URL=https://url-project-anda.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 🏗️ Setup Database (Supabase)

Aplikasi ini membutuhkan skema database tertentu untuk fitur kolaborasi.

1.  **Buat Project Baru** di [Supabase Dashboard](https://supabase.com).
2.  **Jalankan SQL**: Buka menu **SQL Editor**, lalu jalankan kode SQL yang ada di file `SUPABASE_SETUP.md`.
    *   *Langkah ini akan membuat tabel: `boards`, `columns`, `tasks`, `board_members`, dan `task_comments`.*
    *   *Secara otomatis mengaktifkan Row Level Security (RLS) untuk keamanan data.*
3.  **Aktifkan Realtime**: Di Dashboard Supabase, buka **Database** > **Replication**, lalu aktifkan (enable) tabel-tabel utama (`tasks`, `columns`, `board_members`, `task_comments`) pada publikasi `supabase_realtime`.

---

## 💻 Menjalankan Aplikasi

Setelah setup selesai, jalankan server pengembangan:
```bash
bun dev
# atau
npm run dev
```
Buka [http://localhost:5173](http://localhost:5173) di browser Anda.

---

## 📂 Struktur Project

```text
src/
├── context/      # AuthContext untuk manajemen user
├── hooks/        # Custom hooks (React Query) untuk data fetching
├── pages/        # Halaman utama (Dashboard, Board, TaskDetail, Auth)
├── services/     # API Service untuk komunikasi dengan Supabase
└── components/   # Komponen UI yang reusable
```

---

## 📝 Catatan Sesuai Permintaan User
Aplikasi ini sudah dioptimasi agar:
- UI Clean & Minimalis (Tidak lebay, tapi tidak kosong).
- Responsif (Bagus di Desktop maupun Mobile).
- Aman dengan RLS (User hanya bisa akses board miliknya atau board di mana dia diundang).

---

Dibuat dengan ❤️ oleh Antigravity.
