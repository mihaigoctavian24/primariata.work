#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase configuration
const supabaseUrl = 'https://ihwfqsongyaahdtypgnh.supabase.co';
const supabaseServiceKey = 'sb_secret_E6BDaLptbj1BoPV31Sp2Lw_oPVTBYnE';

// Create Supabase client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  try {
    console.log('📋 Reading migration file...');
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20260117224406_create_utilizatori_auto_creation_trigger.sql');
    const sql = readFileSync(migrationPath, 'utf-8');

    console.log('🚀 Applying migration to Supabase...');
    console.log('   Migration: 20260117224406_create_utilizatori_auto_creation_trigger.sql');

    // Execute SQL using Supabase RPC
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error('❌ Migration failed:', error.message);
      process.exit(1);
    }

    console.log('✅ Migration applied successfully!');
    console.log('');
    console.log('Trigger created:');
    console.log('  - Function: public.handle_new_user()');
    console.log('  - Trigger: on_auth_user_created');
    console.log('  - Action: Auto-creates utilizatori record on auth.users INSERT');
    console.log('');
    console.log('New users will now have utilizatori records created automatically!');

  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    process.exit(1);
  }
}

applyMigration();
