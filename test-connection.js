const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://alnvqylgaqutitlvahia.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsbnZxeWxnYXF1dGl0bHZhaGlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTQxODIxNCwiZXhwIjoyMDcwOTk0MjE0fQ.SrhgfljiDBdZcgBV1P3cdbcHFOm96hRTkzj_GEuBYa4';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test simple query
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);
    
    if (error) {
      console.log('Connection test error:', error.message);
    } else {
      console.log('✅ Connection successful!');
      console.log('Available tables query works');
    }
    
    // Test creating a simple table to verify permissions
    const { data: createResult, error: createError } = await supabase.rpc('sql', {
      query: 'CREATE TABLE IF NOT EXISTS test_connection (id serial primary key);'
    });
    
    if (createError) {
      console.log('Create test:', createError.message);
      
      // Try alternative method - direct SQL execution
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/sql',
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey
        },
        body: 'CREATE TABLE IF NOT EXISTS test_connection (id serial primary key);'
      });
      
      console.log('Direct SQL response status:', response.status);
      const result = await response.text();
      console.log('Direct SQL result:', result);
      
    } else {
      console.log('✅ Table creation successful!');
    }
    
  } catch (error) {
    console.error('Connection failed:', error.message);
  }
}

testConnection();