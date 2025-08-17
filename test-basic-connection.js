const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 Basic Supabase Connection Test');
console.log('=================================');

async function testBasicConnection() {
    console.log(`🌐 Testing connection to: ${supabaseUrl}`);
    console.log(`🔑 Using anon key: ${supabaseAnonKey.substring(0, 20)}...`);
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    try {
        // Test 1: Auth endpoint
        console.log('\n1. Testing Auth Endpoint...');
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        
        if (authError) {
            console.log('❌ Auth endpoint error:', authError.message);
            return false;
        } else {
            console.log('✅ Auth endpoint accessible');
            console.log(`📱 Session status: ${session ? 'Active' : 'None (expected)'}`);
        }
        
        // Test 2: Realtime connection
        console.log('\n2. Testing Realtime Connection...');
        const realtimeStatus = await new Promise((resolve) => {
            const channel = supabase.channel('test-connection');
            
            channel.subscribe((status, err) => {
                if (err) {
                    console.log('❌ Realtime error:', err);
                    resolve(false);
                } else if (status === 'SUBSCRIBED') {
                    console.log('✅ Realtime connection successful');
                    resolve(true);
                } else if (status === 'CHANNEL_ERROR') {
                    console.log('❌ Realtime channel error');
                    resolve(false);
                }
            });
            
            setTimeout(() => {
                console.log('⚠️  Realtime timeout (5s)');
                resolve(false);
            }, 5000);
        });
        
        // Cleanup
        await supabase.removeAllChannels();
        
        // Test 3: API endpoint (should return 404 for non-existent table, not connection error)
        console.log('\n3. Testing API Endpoint...');
        const { data, error } = await supabase
            .from('non_existent_table')
            .select('*')
            .limit(1);
        
        if (error && error.code === 'PGRST116') {
            console.log('✅ API endpoint accessible (table not found as expected)');
        } else if (error) {
            console.log('⚠️  API endpoint returned:', error.message);
        } else {
            console.log('✅ API endpoint accessible');
        }
        
        return true;
        
    } catch (error) {
        console.log('❌ Connection test failed:', error.message);
        return false;
    }
}

testBasicConnection().then((success) => {
    if (success) {
        console.log('\n🎉 Basic connection tests passed!');
        console.log('\n📋 Next Steps:');
        console.log('1. Deploy the database schema via Supabase Dashboard');
        console.log('2. Go to: https://supabase.com/dashboard/project/alnvqylgaqutitlvahia/sql');
        console.log('3. Execute the SQL files in this order:');
        console.log('   a) supabase/schema.sql');
        console.log('   b) supabase/rls-policies.sql');
        console.log('   c) supabase/functions.sql');
        console.log('4. Run the full integration test again');
        process.exit(0);
    } else {
        console.log('\n❌ Basic connection failed - check your credentials');
        process.exit(1);
    }
});