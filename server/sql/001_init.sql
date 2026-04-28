-- Identity. user_id is the bearer token the client holds (long random UUID).
-- friend_code is a short shareable alias that maps to user_id.
create table if not exists users (
  user_id      uuid primary key,
  friend_code  text unique not null,
  handle       text not null,
  created_at   timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create index if not exists users_friend_code_idx on users (friend_code);

-- One row per user. Re-pushed by the client roughly hourly.
-- payload holds the precomputed weekly summary, level, streaks, etc.
create table if not exists summaries (
  user_id    uuid primary key references users (user_id) on delete cascade,
  payload    jsonb not null,
  updated_at timestamptz not null default now()
);

-- Symmetric edges. Add(A, B) inserts (A,B) and (B,A) in one tx.
create table if not exists friends (
  user_id    uuid not null references users (user_id) on delete cascade,
  friend_id  uuid not null references users (user_id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, friend_id),
  check (user_id <> friend_id)
);

create index if not exists friends_friend_id_idx on friends (friend_id);

-- Inbox. A sends a quest definition to B; B accepts/declines locally.
create table if not exists recommendations (
  id          uuid primary key,
  from_id     uuid not null references users (user_id) on delete cascade,
  to_id       uuid not null references users (user_id) on delete cascade,
  quest       jsonb not null,
  note        text,
  status      text not null default 'pending'
                check (status in ('pending', 'accepted', 'declined')),
  created_at  timestamptz not null default now(),
  responded_at timestamptz
);

create index if not exists recommendations_to_status_idx
  on recommendations (to_id, status, created_at desc);

-- Head-to-head goal between two users. Progress is read from each side's summary.
create table if not exists challenges (
  id         uuid primary key,
  from_id    uuid not null references users (user_id) on delete cascade,
  to_id      uuid not null references users (user_id) on delete cascade,
  stat       text not null,
  goal       integer not null check (goal > 0),
  deadline   timestamptz not null,
  status     text not null default 'pending'
               check (status in ('pending', 'accepted', 'declined', 'completed', 'expired')),
  created_at timestamptz not null default now()
);

create index if not exists challenges_participants_idx
  on challenges (from_id, to_id);
create index if not exists challenges_to_status_idx
  on challenges (to_id, status);
