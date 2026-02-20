const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase;

try {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_KEY");
  }
  supabase = createClient(supabaseUrl, supabaseKey);
} catch (error) {
  console.error("Supabase Initialization Error:", error.message);
  // Create a minimal mock client to prevent crash on import
  supabase = {
    from: () => ({
      select: () => ({ single: () => ({ error: { message: "Supabase not configured" } }) }),
      insert: () => ({ select: () => ({ single: () => ({ error: { message: "Supabase not configured" } }) }) }),
      update: () => ({ eq: () => ({ select: () => ({ single: () => ({ error: { message: "Supabase not configured" } }) }) }) }),
      delete: () => ({ eq: () => ({ error: { message: "Supabase not configured" } }) }),
    })
  };
}

module.exports = supabase;
