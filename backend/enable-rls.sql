-- Re-enable RLS on profiles and matches (backend now uses SERVICE_ROLE_KEY)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Recreate policies (may have been lost when RLS was disabled)
CREATE POLICY IF NOT EXISTS "Users can view own profiles" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own profiles" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own profiles" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can view own matches" ON matches
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM profiles WHERE id = matches.profile_id)
  );

CREATE POLICY IF NOT EXISTS "Users can insert own matches" ON matches
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM profiles WHERE id = matches.profile_id)
  );
