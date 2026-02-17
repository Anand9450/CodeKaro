const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Ensure these variables are set
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.warn("Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables.");
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
