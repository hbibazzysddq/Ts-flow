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