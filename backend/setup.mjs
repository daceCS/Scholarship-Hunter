// Setup script: Initialize Supabase and load scholarships
// Usage: node backend/setup.mjs

import 'dotenv/config';
import { initSupabase, loadScholarshipsToDb } from './db.mjs';

async function setup() {
  try {
    console.log('Initializing Supabase...');
    const supabase = initSupabase();

    console.log('Loading scholarships...');
    await loadScholarshipsToDb(supabase);

    console.log('\n✓ Setup complete!');
    console.log('Next: Phase 3c (build endpoints)\n');
  } catch (error) {
    console.error('Setup failed:', error.message);
    process.exit(1);
  }
}

setup();
