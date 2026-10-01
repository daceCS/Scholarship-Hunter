-- Early-access waitlist. Run once in the Supabase SQL editor.
-- Only the backend (service-role key) touches this table; RLS is on with no policies, so the anon key can't read or write it.
create table if not exists waitlist (
  id bigint primary key generated always as identity,
  email text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone default now(),
  approved_at timestamp with time zone
);

create unique index if not exists idx_waitlist_email on waitlist (lower(email));
create index if not exists idx_waitlist_status on waitlist (status, created_at);

alter table waitlist enable row level security;
