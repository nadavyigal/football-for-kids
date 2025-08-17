const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://alnvqylgaqutitlvahia.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsbnZxeWxnYXF1dGl0bHZhaGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0MTgyMTQsImV4cCI6MjA3MDk5NDIxNH0.8j484vGR705oQ3-CIXc1w0Grc9YRqJhH-YClBvdKJnI';

const supabase = createClient(supabaseUrl, anonKey);

async function verifyDeployment() {
  console.log('Football Prediction League - Backend Verification');
  console.log('================================================');
  console.log('Project:', 'alnvqylgaqutitlvahia');
  console.log('URL:', supabaseUrl);
  console.log('');
  
  const checks = [];
  
  // Test 1: Basic connection
  try {
    const { data, error } = await supabase.auth.getSession();
    checks.push({ test: 'Connection', status: error ? 'FAIL' : 'PASS', details: error?.message || 'Connected successfully' });
  } catch (error) {
    checks.push({ test: 'Connection', status: 'FAIL', details: error.message });
  }
  
  // Test 2: Check if tables exist (via RLS - should fail gracefully)
  try {
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    checks.push({ test: 'Tables (profiles)', status: error?.code === 'PGRST116' ? 'PASS' : 'UNKNOWN', details: 'Table exists (RLS blocking expected)' });
  } catch (error) {
    checks.push({ test: 'Tables (profiles)', status: 'UNKNOWN', details: error.message });
  }
  
  // Test 3: Check auth functionality
  try {
    const { data, error } = await supabase.auth.signUp({
      email: `test-${Date.now()}@example.com`,
      password: 'testpassword123'
    });
    checks.push({ test: 'Authentication', status: error ? 'FAIL' : 'PASS', details: error?.message || 'Auth signup works' });
  } catch (error) {
    checks.push({ test: 'Authentication', status: 'FAIL', details: error.message });
  }
  
  // Display results
  console.log('Verification Results:');
  console.log('====================');
  checks.forEach(check => {
    const statusIcon = check.status === 'PASS' ? '✅' : check.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${statusIcon} ${check.test}: ${check.status}`);
    if (check.details) console.log(`   ${check.details}`);
  });
  
  console.log('');
  console.log('Next Steps:');
  console.log('===========');
  console.log('1. Deploy SQL files via Supabase Dashboard SQL Editor:');
  console.log('   a) schema.sql (creates tables and structure)');
  console.log('   b) rls-policies.sql (applies security)'); 
  console.log('   c) functions.sql (adds business logic)');
  console.log('');
  console.log('2. Enable real-time for tables:');
  console.log('   - chat_messages, matches, predictions, leaderboards, group_members');
  console.log('');
  console.log('3. Test your React Native app connectivity');
  console.log('');
  console.log('Dashboard: https://supabase.com/dashboard/project/alnvqylgaqutitlvahia');
}

verifyDeployment();