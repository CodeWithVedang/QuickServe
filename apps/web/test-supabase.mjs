import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ikfuutfkrdjabmcvrcia.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrZnV1dGZrcmRqYWJtY3ZyY2lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNjk1ODEsImV4cCI6MjA4OTY0NTU4MX0.IJTvEV0qdOX1xL3avZer5ubf6p2WR8CwIOq_qM5d5-U';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'newuser123@quickserve.com',
    password: 'password123'
  });
  console.log('Login Result:', JSON.stringify({ data, error }, null, 2));
}

test();
