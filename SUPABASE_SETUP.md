# 🚀 Panduan Setup Supabase - TaskFlow Kanban

Ikuti langkah-langkah di bawah ini untuk mengonfigurasi database Supabase Anda agar fitur Kanban, Kolaborasi, dan Realtime berjalan dengan sempurna.

---

## Langkah 1: Buat Tabel & Konfigurasi Skema

Buka **Supabase Dashboard** > **SQL Editor** > **New Query**, lalu salin dan jalankan (Run) kode SQL di bawah ini:

```sql
-- 1. Tabel Boards
create table if not exists boards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  color text default '#6366f1',
  created_at timestamp default now()
);

-- 2. Tabel Columns
create table if not exists columns (
  id uuid default gen_random_uuid() primary key,
  board_id uuid references boards on delete cascade not null,
  title text not null,
  "order" int default 0
);

-- 3. Tabel Tasks
create table if not exists tasks (
  id uuid default gen_random_uuid() primary key,
  column_id uuid references columns on delete cascade not null,
  title text not null,
  description text,
  priority text default 'low',
  deadline date,
  "order" int default 0,
  assigned_to uuid references auth.users,
  assigned_email text,
  created_at timestamp default now()
);

-- 4. Tabel Board Members (Kolaborasi)
create table if not exists board_members (
  id uuid default gen_random_uuid() primary key,
  board_id uuid references boards on delete cascade not null,
  user_id uuid references auth.users,
  email text not null,
  role text default 'member',       -- 'owner' | 'member'
  status text default 'pending',    -- 'pending' | 'active'
  invited_at timestamp default now(),
  unique(board_id, email)
);

-- 5. Tabel Task Comments
create table if not exists task_comments (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references tasks on delete cascade not null,
  user_id uuid references auth.users not null,
  user_email text not null,
  content text not null,
  created_at timestamp default now()
);
```

---

## Langkah 2: Aktifkan Row Level Security (RLS)

Masih di **SQL Editor**, jalankan kode ini untuk mengatur keamanan data. User hanya bisa akses board mereka sendiri atau board di mana mereka diundang:

```sql
-- Aktifkan RLS untuk semua tabel
alter table boards enable row level security;
alter table columns enable row level security;
alter table tasks enable row level security;
alter table board_members enable row level security;
alter table task_comments enable row level security;

-- Policy untuk Boards
create policy "boards_access" on boards for all using (
  auth.uid() = user_id
  or exists (
    select 1 from board_members
    where board_members.board_id = boards.id
    and board_members.user_id = auth.uid()
    and board_members.status = 'active'
  )
);

-- Policy untuk Columns
create policy "columns_access" on columns for all using (
  exists (
    select 1 from boards
    where boards.id = columns.board_id
    and (
      boards.user_id = auth.uid()
      or exists (
        select 1 from board_members
        where board_members.board_id = boards.id
        and board_members.user_id = auth.uid()
        and board_members.status = 'active'
      )
    )
  )
);

-- Policy untuk Tasks
create policy "tasks_access" on tasks for all using (
  exists (
    select 1 from columns
    join boards on boards.id = columns.board_id
    where columns.id = tasks.column_id
    and (
      boards.user_id = auth.uid()
      or exists (
        select 1 from board_members
        where board_members.board_id = boards.id
        and board_members.user_id = auth.uid()
        and board_members.status = 'active'
      )
    )
  )
);

-- Policy untuk Board Members
create policy "members_access" on board_members for all using (
  user_id = auth.uid()
  or exists (
    select 1 from boards
    where boards.id = board_members.board_id
    and boards.user_id = auth.uid()
  )
);

-- Policy untuk Comments
create policy "comments_access" on task_comments for all using (
  exists (
    select 1 from tasks
    join columns on columns.id = tasks.column_id
    join boards on boards.id = columns.board_id
    where tasks.id = task_comments.task_id
    and (
      boards.user_id = auth.uid()
      or exists (
        select 1 from board_members
        where board_members.board_id = boards.id
        and board_members.user_id = auth.uid()
        and board_members.status = 'active'
      )
    )
  )
);
```

---

## Langkah 3: Aktifkan Realtime (GRATIS)

> [!IMPORTANT]
> **JANGAN klik "Create Destination" atau "Read Replica"** saat di menu Replication. Itu adalah fitur berbayar.
> Ikuti cara SQL di bawah ini yang lebih mudah dan **100% Gratis**.

Buka **SQL Editor**, salin dan jalankan kode ini untuk mengaktifkan fitur update otomatis (Realtime):

```sql
-- Aktifkan Realtime secara instan lewat SQL
begin;
  -- Hapus publikasi lama jika ada untuk menghindari konflik
  drop publication if exists supabase_realtime;
  
  -- Buat publikasi Realtime untuk tabel Kanban kita
  create publication supabase_realtime for table 
    columns, 
    tasks, 
    board_members, 
    task_comments;
commit;
```

*Dengan menjalankan SQL di atas, fitur drag-and-drop dan komentar akan langsung sinkron secara realtime di browser Anda.*

---

## Langkah 4: Environment Variables

Pastikan file `.env` di folder project Anda memiliki data yang benar dari **Project Settings > API**:

```env
VITE_SUPABASE_URL=https://your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

### 🎉 Selesai!
Sekarang aplikasi TaskFlow Anda siap digunakan dengan fitur kolaborasi tim dan update realtime.
