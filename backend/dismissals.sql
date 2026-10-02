-- Scholarships a user removed from their dashboard ("Not a match"), with the reason they gave.
-- Run once in the Supabase SQL editor (safe to run again, and safe on top of an earlier version of this file).
-- Keyed by user + scholarship, so it survives re-matching (matches are rebuilt whenever the profile or the scholarship set changes).
-- The backend writes with the service-role key; RLS is on with a read-own policy for direct access with the anon key.
create table if not exists dismissals (
  user_id uuid not null,
  scholarship_id bigint not null references scholarships(id) on delete cascade,
  reason text not null default 'other',
  note text,                                  -- optional free text from the student, at most 500 characters
  created_at timestamp with time zone default now(),
  analysis jsonb,                             -- result of analyze-dismissals.mjs (diagnosis and suggested fix)
  analyzed_at timestamp with time zone,
  primary key (user_id, scholarship_id)
);

alter table dismissals add column if not exists note text;
alter table dismissals add column if not exists analysis jsonb;
alter table dismissals add column if not exists analyzed_at timestamp with time zone;

-- Reason codes. An earlier version only allowed not_a_match / not_interested; those become 'other' / 'not_interested'.
alter table dismissals drop constraint if exists dismissals_reason_check;
update dismissals set reason = 'other' where reason = 'not_a_match';
alter table dismissals add constraint dismissals_reason_check
  check (reason in ('dont_qualify', 'wrong_school_or_level', 'not_interested', 'amount_too_small', 'deadline_too_soon', 'other'));

create index if not exists idx_dismissals_scholarship on dismissals (scholarship_id);
create index if not exists idx_dismissals_unanalyzed on dismissals (created_at) where analyzed_at is null;

alter table dismissals enable row level security;

drop policy if exists "Users can see their own dismissals" on dismissals;
create policy "Users can see their own dismissals" on dismissals
  for select using (auth.uid() = user_id);
