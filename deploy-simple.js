const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://alnvqylgaqutitlvahia.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsbnZxeWxnYXF1dGl0bHZhaGlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTQxODIxNCwiZXhwIjoyMDcwOTk0MjE0fQ.SrhgfljiDBdZcgBV1P3cdbcHFOm96hRTkzj_GEuBYa4';

async function executeSQL(sql, description) {
  console.log(`\n🚀 ${description}...`);
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Accept': 'application/json'
      },
      body: JSON.stringify({ sql: sql })
    });
    
    if (response.ok) {
      console.log(`✅ ${description} completed successfully`);
      return true;
    } else {
      const error = await response.text();
      console.log(`⚠️  ${description} response:`, response.status, error);
      
      // Try alternative endpoint
      const altResponse = await fetch(`${supabaseUrl}/sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/sql',
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey
        },
        body: sql
      });
      
      if (altResponse.ok) {
        console.log(`✅ ${description} completed via alternative method`);
        return true;
      } else {
        const altError = await altResponse.text();
        console.log(`⚠️  Alternative method also failed:`, altResponse.status, altError);
      }
    }
  } catch (error) {
    console.log(`⚠️  Error in ${description}:`, error.message);
  }
  
  return false;
}

async function deploySchema() {
  console.log('🎯 Deploying Football Prediction League Database Schema');
  console.log('=======================================================');
  
  // Read the schema file
  const schemaPath = path.join(__dirname, 'supabase', 'schema.sql');
  const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
  
  // Split into individual statements
  const statements = schemaSQL
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt && !stmt.startsWith('--') && stmt.length > 5)
    .map(stmt => stmt.replace(/\s+/g, ' ').trim());
  
  console.log(`📄 Found ${statements.length} SQL statements to execute`);
  
  // Execute each statement individually
  let successCount = 0;
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    const description = `Statement ${i + 1}/${statements.length}`;
    
    if (await executeSQL(statement, description)) {
      successCount++;
    }
    
    // Small delay between statements
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n📊 Deployment Summary: ${successCount}/${statements.length} statements executed`);
  
  if (successCount > 0) {
    console.log('\n✅ Database schema deployment initiated!');
    console.log('\n📝 Manual Steps Required:');
    console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/alnvqylgaqutitlvahia');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Execute the following files in order:');
    console.log('   a) schema.sql');
    console.log('   b) rls-policies.sql');
    console.log('   c) functions.sql');
    console.log('4. Enable real-time for: chat_messages, matches, predictions, leaderboards, group_members');
  } else {
    console.log('\n⚠️  API deployment failed. Please use the manual approach:');
    console.log('1. Copy the contents of supabase/schema.sql');
    console.log('2. Paste and run in Supabase SQL Editor');
    console.log('3. Repeat for rls-policies.sql and functions.sql');
  }
}

deploySchema();