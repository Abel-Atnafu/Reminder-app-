-- ============================================================
-- RemindMe App — Initial Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard
-- ============================================================

-- 1. Todos table
create table if not exists todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text not null default '',
  completed boolean not null default false,
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  category text not null default 'General',
  due_date date,
  due_time time,
  reminder boolean not null default false,
  reminder_minutes integer not null default 30,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for fast per-user queries
create index if not exists todos_user_id_idx on todos (user_id);
-- Index for the cron reminder query
create index if not exists todos_reminder_idx on todos (user_id, reminder, completed, due_date, due_time);

-- Row Level Security: users see only their own todos
alter table todos enable row level security;

create policy "todos_own" on todos
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 2. Push subscriptions table
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  endpoint text unique not null,
  p256dh text not null,
  auth_key text not null,
  created_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_id_idx on push_subscriptions (user_id);

alter table push_subscriptions enable row level security;

create policy "subs_own" on push_subscriptions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 3. Sent reminders table (prevents duplicate push sends)
-- Accessed only by the Edge Function using the service role key (bypasses RLS)
create table if not exists sent_reminders (
  todo_id uuid primary key references todos(id) on delete cascade,
  sent_at timestamptz not null default now()
);

-- 4. Helper function used by the Edge Function to find due reminders
-- Returns todos whose reminder fires between now-1min and now, not yet sent
create or replace function get_due_reminders()
returns table (
  id uuid, user_id uuid, title text, description text,
  due_date date, due_time time, reminder_minutes integer
)
language sql
security definer
as $$
  select t.id, t.user_id, t.title, t.description, t.due_date, t.due_time, t.reminder_minutes
  from todos t
  where t.reminder = true
    and t.completed = false
    and t.due_date is not null
    and t.due_time is not null
    and (t.due_date + t.due_time)::timestamptz
        - (t.reminder_minutes || ' minutes')::interval
        between now() - interval '1 minute' and now()
    and t.id not in (select todo_id from sent_reminders)
$$;

-- ============================================================
-- pg_cron setup (run AFTER enabling pg_cron extension in Dashboard)
-- Dashboard → Database → Extensions → search "pg_cron" → Enable
-- Dashboard → Database → Extensions → search "pg_net"  → Enable
--
-- Then run this separately, replacing the placeholders:
-- ============================================================
--
-- select cron.schedule(
--   'send-reminders',
--   '* * * * *',
--   $$
--     select net.http_post(
--       url    := 'https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/send-reminders',
--       headers := jsonb_build_object(
--         'Content-Type', 'application/json',
--         'Authorization', 'Bearer <YOUR_SERVICE_ROLE_KEY>'
--       ),
--       body   := '{}'::jsonb
--     )
--   $$
-- );
