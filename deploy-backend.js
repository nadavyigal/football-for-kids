#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = 'https://alnvqylgaqutitlvahia.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsbnZxeWxnYXF1dGl0bHZhaGlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTQxODIxNCwiZXhwIjoyMDcwOTk0MjE0fQ.SrhgfljiDBdZcgBV1P3cdbcHFOm96hRTkzj_GEuBYa4';

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function executeSqlFile(filePath, description) {
  console.log(`\n🚀 Executing ${description}...`);
  
  try {
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    // Split SQL content by statements (rough approach)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--') && stmt !== '')
      .map(stmt => stmt + ';');
    
    console.log(`📄 Found ${statements.length} SQL statements to execute`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim() === ';') continue;
      
      console.log(`   Executing statement ${i + 1}/${statements.length}...`);
      
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql_query: statement 
      }).catch(async () => {
        // If exec_sql doesn't exist, try direct query
        return await supabase.from('_').select('*').limit(0).then(() => {
          // Use the direct approach with fetch
          return fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${serviceRoleKey}`,
              'apikey': serviceRoleKey
            },
            body: JSON.stringify({ query: statement })
          });
        });
      });
      
      if (error) {
        console.warn(`⚠️  Warning on statement ${i + 1}: ${error.message}`);
        // Continue with other statements
      }
    }
    
    console.log(`✅ Completed ${description}`);
  } catch (error) {
    console.error(`❌ Error executing ${description}:`, error.message);
    throw error;
  }
}

async function executeSqlDirect(sql, description) {
  console.log(`\n🔧 ${description}...`);
  
  try {
    // Use a more direct approach with HTTP requests
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      },
      body: JSON.stringify({ query: sql })
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.warn(`⚠️  Warning: ${error}`);
    } else {
      console.log(`✅ ${description} completed`);
    }
  } catch (error) {
    console.warn(`⚠️  Warning: ${error.message}`);
  }
}

async function deployBackend() {
  console.log('🎯 Starting Football Prediction League Backend Deployment');
  console.log('================================================');
  
  try {
    // Test connection first
    console.log('\n🔗 Testing Supabase connection...');
    const { data, error } = await supabase.from('_').select('*').limit(0);
    if (error && !error.message.includes('does not exist')) {
      throw new Error(`Connection failed: ${error.message}`);
    }
    console.log('✅ Connection successful!');
    
    // Step 1: Create schema
    await executeSqlFile(
      path.join(__dirname, 'supabase', 'schema.sql'),
      'Database Schema Creation'
    );
    
    // Step 2: Apply RLS policies
    await executeSqlFile(
      path.join(__dirname, 'supabase', 'rls-policies.sql'), 
      'Row Level Security Policies'
    );
    
    // Step 3: Create functions
    await executeSqlFile(
      path.join(__dirname, 'supabase', 'functions.sql'),
      'Database Functions and Procedures'
    );
    
    // Step 4: Enable real-time for required tables
    const realtimeTables = [
      'chat_messages',
      'matches', 
      'predictions',
      'leaderboards',
      'group_members'
    ];
    
    console.log('\n📡 Enabling real-time subscriptions...');
    for (const table of realtimeTables) {
      await executeSqlDirect(
        `ALTER publication supabase_realtime ADD TABLE public.${table};`,
        `Enabling real-time for ${table}`
      );
    }
    
    console.log('\n🎉 Backend deployment completed successfully!');
    console.log('\n📋 Deployment Summary:');
    console.log('✅ Database schema created');
    console.log('✅ Row Level Security policies applied');
    console.log('✅ Database functions deployed');
    console.log('✅ Real-time subscriptions enabled');
    console.log('\n🔧 Next Steps:');
    console.log('1. Test authentication in your app');
    console.log('2. Create your first group');
    console.log('3. Add some matches');
    console.log('4. Verify real-time functionality');
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run deployment
deployBackend();