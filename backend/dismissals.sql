-- Scholarships a user removed from their dashboard ("Not a match"). Run once in the Supabase SQL editor.
-- Keyed by user + scholarship, so it survives re-matching (matches are rebuilt whenever the profile or the scholarship set changes).
-- The backend writes with the service-role key; RLS is on with a read-own policy for direct access with the anon key.
create table if not exists dismissals (
  user_id uuid not null,
  scholarship_id bigint not null references scholarships(id) on delete cascade,
  reason text not null default 'not_a_match' check (reason in ('not_a_match', 'not_interested')),
  created_at timestamp with time zone default now(),
  primary key (user_id, scholarship_id)
);

create index if not exists idx_dismissals_scholarship on dismissals (scholarship_id);

alter table dismissals enable row level security;

drop policy if exists "Users can see their own dismissals" on dismissals;
create policy "Users can see their own dismissals" on dismissals
  for select using (auth.uid() = user_id);
