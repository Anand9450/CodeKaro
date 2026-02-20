const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixSchema() {
  console.log("Attempting to fix schema...");

  // 1. Check if 'problems' table has data
  const { count, error: countError } = await supabase
    .from('problems')
    .select('*', { count: 'exact', head: true });

  if (countError) console.error("Error checking problems:", countError.message);
  else console.log(`Found ${count} problems in the database.`);

  // 2. Add 'coins' column to users if missing (using raw SQL if possible, or just informing user to run SQL)
  // Since we can't run DDL easily via JS client without a stored procedure, we might have to use a text file for the user to run in Supabase SQL Editor.
  // HOWEVER, we can try to "invoke" a query if RPC is set up, but likely not.

  // Alternative: We will output the SQL the user needs to run.
  console.log("\n!!! IMPORTANT !!!");
  console.log("It seems your 'users' table is missing columns.");
  console.log("Please go to your Supabase Dashboard -> SQL Editor and run the following:");
  console.log(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 0;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS solved_problems TEXT[] DEFAULT '{}';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS linkedin TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS github TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS leetcode TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS codeforces TEXT;
  `);

}

fixSchema();
