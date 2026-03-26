# 📋 Kanban Board App

Aplikasi task manager berbasis Kanban Board yang dibangun dengan React + TypeScript dan Supabase sebagai backend.

## 🛠️ Tech Stack

- **Frontend** — React + Vite + TypeScript
- **Styling** — Tailwind CSS v4
- **Backend & Database** — Supabase (PostgreSQL)
- **Auth** — Supabase Auth (Email + Google OAuth)
- **State Management** — React Query (@tanstack/react-query)
- **Routing** — React Router DOM
- **Drag & Drop** — @dnd-kit
- **Icons** — Lucide React

## ✨ Fitur

- Register & Login (Email / Google OAuth)
- Buat, edit, hapus Board
- Kolom To Do, In Progress, Done
- Buat, edit, hapus Task
- Drag & drop task antar kolom
- Prioritas task (Low / Medium / High)
- Deadline task
- Protected route (hanya user login yang bisa akses)

## 🚀 Cara Menjalankan Project

### 1. Clone repository

```bash
git clone https://github.com/username/kanban-board.git
cd kanban-board/client
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup Supabase

1. Buat project baru di [supabase.com](https://supabase.com)
2. Buka **Settings → Data API** untuk mendapatkan Project URL
3. Buka **Settings → API Keys** untuk mendapatkan Publishable Key
4. Buka **SQL Editor** dan jalankan query berikut:

```sql
-- Buat tabel
create table boards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  color text default '#5B4FCF',
  created_at timestamp default now()
);

create table columns (
  id uuid default gen_random_uuid() primary key,
  board_id uuid references boards on delete cascade not null,
  title text not null,
  "order" int default 0
);

create table tasks (
  id uuid default gen_random_uuid() primary key,
  column_id uuid references columns on delete cascade not null,
  title text not null,
  description text,
  priority text default 'low',
  deadline date,
  "order" int default 0,
  created_at timestamp default now()
);

-- Aktifkan RLS
alter table boards enable row level security;
alter table columns enable row level security;
alter table tasks enable row level security;

-- Buat policy
create policy "user boards" on boards
  for all using (auth.uid() = user_id);

create policy "user columns" on columns
  for all using (
    board_id in (
      select id from boards where user_id = auth.uid()
    )
  );

create policy "user tasks" on tasks
  for all using (
    column_id in (
      select id from columns where board_id in (
        select id from boards where user_id = auth.uid()
      )
    )
  );
```

### 4. Setup environment variable

Buat file `.env` di root folder `client/`:

```env
VITE_SUPABASE_URL=https://xxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xxxxxx
```

### 5. Jalankan dev server

```bash
npm run dev
```

Buka [http://localhost:5173](http://localhost:5173) di browser.

## 📁 Struktur Folder

```
client/
├── src/
│   ├── components/
│   │   └── ui/           # Komponen kecil (Button, Badge, Input)
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── hooks/            # Custom hooks (useBoards, useTasks, dll)
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Board.tsx
│   │   └── TaskDetail.tsx
│   ├── services/
│   │   └── supabase.ts   # Konfigurasi Supabase client
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env                  # Tidak di-commit ke GitHub
├── .gitignore
├── package.json
└── vite.config.ts
```

## 🔐 Catatan Keamanan

- File `.env` **tidak boleh** di-commit ke GitHub
- Pastikan `.env` sudah ada di `.gitignore`
- Gunakan **Publishable key** (bukan Secret key) untuk frontend
- Row Level Security (RLS) sudah diaktifkan — setiap user hanya bisa akses data miliknya sendiri

## 📦 Scripts

```bash
npm run dev      # Jalankan development server
npm run build    # Build untuk production
npm run preview  # Preview hasil build
```

## 🗺️ Roadmap

- [x] Setup project & dependencies
- [x] Konfigurasi Supabase
- [x] Auth context (login, register, logout)
- [x] Protected route
- [x] Halaman Login & Register
- [x] Halaman Dashboard
- [ ] Halaman Kanban Board
- [ ] Drag & drop task
- [ ] Halaman Detail Task
- [ ] Dark mode
