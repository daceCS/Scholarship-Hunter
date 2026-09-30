-- Scholarship Hunter schema for Supabase
-- Run this in the SQL editor after creating your project

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table: one row per version per user
-- core_json: geo, academic, affiliations, effort (always present)
-- sensitive_json: financial, medical (only when consented)
create table if not exists profiles (
  id bigint primary key generated always as identity,
  user_id uuid not null,
  version int not null,
  core_json jsonb not null,
  sensitive_json jsonb,
  consented_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, version)
);

-- Scholarships table: static data loaded once
create table if not exists scholarships (
  id bigint primary key generated always as identity,
  page_id text not null unique,
  name text not null,
  provider_org text not null,
  apply_url text not null,
  source_url text not null,
  amount jsonb not null,
  deadline text,
  cycle_status text not null,
  geo_scope jsonb,
  levels text[],
  effort jsonb,
  eligibility jsonb not null,
  provenance jsonb,
  verified_at date,
  confidence numeric(3, 2),
  full_data jsonb not null,  -- Store complete scholarship for rules evaluation
  created_at timestamp with time zone default now()
);

-- Matches table: results of evaluating a profile against all scholarships
create table if not exists matches (
  id bigint primary key generated always as identity,
  user_id uuid not null,
  profile_id bigint not null references profiles(id) on delete cascade,
  scholarship_id bigint not null references scholarships(id) on delete cascade,
  status text not null check (status in ('eligible', 'possible', 'ineligible')),
  score numeric(10, 2),
  created_at timestamp with time zone default now(),
  unique(profile_id, scholarship_id)
);

-- Row-level security: users see only their own profiles and matches
alter table profiles enable row level security;
alter table matches enable row level security;

-- Policy: users see their own profiles
create policy "Users can view own profiles" on profiles
  for select using (auth.uid() = user_id);

-- Policy: users can insert their own profiles
create policy "Users can insert own profiles" on profiles
  for insert with check (auth.uid() = user_id);

-- Policy: users can update their own profiles (new version)
create policy "Users can update own profiles" on profiles
  for update using (auth.uid() = user_id);

-- Policy: users see their own matches
create policy "Users can view own matches" on matches
  for select using (
    auth.uid() = (select user_id from profiles where id = matches.profile_id)
  );

-- Policy: users can insert their own matches
create policy "Users can insert own matches" on matches
  for insert with check (
    auth.uid() = (select user_id from profiles where id = matches.profile_id)
  );

-- Indexes for common queries
create index idx_profiles_user_id on profiles(user_id);
create index idx_profiles_user_version on profiles(user_id, version desc);
create index idx_matches_user_profile on matches(user_id, profile_id);
create index idx_matches_profile_scholarship on matches(profile_id, scholarship_id);
create index idx_scholarships_page_id on scholarships(page_id);
