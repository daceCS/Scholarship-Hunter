-- Test-user feedback on scholarship matches. Run once in the Supabase SQL editor.
-- The backend writes with the service-role key (bypasses RLS); the policies below protect direct access with the anon key.
create table if not exists feedback (
  id bigint primary key generated always as identity,
  user_id uuid not null,
  scholarship_id bigint references scholarships(id) on delete set null,  -- survives scholarship reloads
  scholarship_name text not null,                                         -- kept so a report is still readable after a reload
  scholarship_source_url text,
  kind text not null check (kind in ('wrong_amount', 'wrong_deadline', 'wrong_requirements', 'not_eligible', 'broken_link', 'other')),
  message text not null default '',
  status text not null default 'new' check (status in ('new', 'seen', 'fixed', 'wont_fix')),
  created_at timestamp with time zone default now()
);

create index if not exists idx_feedback_created on feedback(created_at desc);
create index if not exists idx_feedback_user on feedback(user_id, created_at desc);

alter table feedback enable row level security;

drop policy if exists "Users can see their own feedback" on feedback;
create policy "Users can see their own feedback" on feedback
  for select using (auth.uid() = user_id);

drop policy if exists "Users can add their own feedback" on feedback;
create policy "Users can add their own feedback" on feedback
  for insert with check (auth.uid() = user_id);
