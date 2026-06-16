-- ============================================================
-- TABLES AWAL (jalankan jika belum ada)
-- ============================================================
create table if not exists boards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  color text default '#6366f1',
  created_at timestamp default now()
);

create table if not exists columns (
  id uuid default gen_random_uuid() primary key,
  board_id uuid references boards on delete cascade not null,
  title text not null,
  "order" int default 0
);

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

-- ============================================================
-- KOLABORASI: board_members
-- ============================================================
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

-- ============================================================
-- KOLABORASI: task_comments
-- ============================================================
create table if not exists task_comments (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references tasks on delete cascade not null,
  user_id uuid references auth.users not null,
  user_email text not null,
  content text not null,
  created_at timestamp default now()
);

-- ============================================================
-- UPDATE tasks: tambah kolom assigned jika belum ada
-- ============================================================
alter table tasks add column if not exists assigned_to uuid references auth.users;
alter table tasks add column if not exists assigned_email text;

-- ============================================================
-- UPDATE tasks: tambah kolom created_by (siapa yg membuat task)
-- ============================================================
alter table tasks add column if not exists created_by uuid references auth.users;
alter table tasks add column if not exists created_by_email text;

-- ============================================================
-- ROW LEVEL SECURITY (aktifkan di Supabase Dashboard > Auth > Policies)
-- ============================================================

-- boards: user bisa lihat board miliknya ATAU board tempat dia jadi member
alter table boards enable row level security;

create policy "boards_select" on boards for select using (
  auth.uid() = user_id
  or exists (
    select 1 from board_members
    where board_members.board_id = boards.id
    and board_members.user_id = auth.uid()
    and board_members.status = 'active'
  )
  or exists (
    select 1 from board_members
    where board_members.board_id = boards.id
    and board_members.email = auth.email()
    and board_members.status = 'pending'
  )
);
create policy "boards_insert" on boards for insert with check (auth.uid() = user_id);
create policy "boards_update" on boards for update using (auth.uid() = user_id);
create policy "boards_delete" on boards for delete using (auth.uid() = user_id);

-- columns
alter table columns enable row level security;
create policy "columns_all" on columns using (
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

-- tasks
alter table tasks enable row level security;
create policy "tasks_all" on tasks using (
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

-- board_members: bisa lihat member board miliknya / board tempat dia aktif
alter table board_members enable row level security;
-- Note: `email = auth.email()` allows users to see their own pending invites (where user_id is null)
create policy "board_members_select" on board_members for select using (
  user_id = auth.uid()
  or email = auth.email()
  or exists (
    select 1 from boards
    where boards.id = board_members.board_id
    and boards.user_id = auth.uid()
  )
);
create policy "board_members_insert" on board_members for insert with check (
  exists (select 1 from boards where boards.id = board_members.board_id and boards.user_id = auth.uid())
);
create policy "board_members_update" on board_members for update using (
  user_id = auth.uid()
  or exists (select 1 from boards where boards.id = board_members.board_id and boards.user_id = auth.uid())
);
create policy "board_members_delete" on board_members for delete using (
  exists (select 1 from boards where boards.id = board_members.board_id and boards.user_id = auth.uid())
);

-- task_comments
alter table task_comments enable row level security;
create policy "comments_select" on task_comments for select using (
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
create policy "comments_insert" on task_comments for insert with check (user_id = auth.uid());
create policy "comments_delete" on task_comments for delete using (user_id = auth.uid());

-- ============================================================
-- RPC FUNCTIONS: bypass RLS untuk undangan collab
-- Dipanggil dari client via supabase.rpc()
-- ============================================================

-- Get pending invites untuk current user (by email match)
create or replace function get_pending_invites()
returns table (
  id uuid,
  board_id uuid,
  email text,
  role text,
  status text,
  invited_at timestamptz,
  board_title text,
  board_color text
)
language sql
security definer
stable
as $$
  select
    bm.id, bm.board_id, bm.email, bm.role, bm.status, bm.invited_at,
    b.title, b.color
  from board_members bm
  join boards b on b.id = bm.board_id
  where bm.email = auth.email()
    and bm.status = 'pending'
  order by bm.invited_at desc;
$$;

-- Terima undangan (set status active + link user_id)
create or replace function accept_board_invite(invite_id uuid)
returns void
language sql
security definer
as $$
  update board_members
  set user_id = auth.uid(), status = 'active'
  where id = invite_id
    and email = auth.email()
    and status = 'pending';
$$;

-- Tolak undangan (hapus record)
create or replace function decline_board_invite(invite_id uuid)
returns void
language sql
security definer
as $$
  delete from board_members
  where id = invite_id
    and email = auth.email()
    and status = 'pending';
$$;

-- ============================================================
-- REALTIME: aktifkan di Supabase Dashboard > Database > Replication
-- Tambahkan: tasks, columns, board_members, task_comments
-- ============================================================