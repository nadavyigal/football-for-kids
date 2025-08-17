const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Testing Supabase Integration for Football Prediction App');
console.log('================================================');

// Test with anon key (client-side)
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

// Test with service role (admin operations)
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

async function testDatabaseConnection() {
    console.log('\n1. Testing Database Connection');
    console.log('------------------------------');
    
    try {
        // Test basic connection with leagues table (should be publicly readable)
        const { data: leagues, error } = await supabaseAnon
            .from('leagues')
            .select('id, name, country')
            .limit(5);
        
        if (error) {
            console.log('❌ Connection Error:', error.message);
            return false;
        } else {
            console.log('✅ Database connection successful');
            console.log(`📊 Found ${leagues.length} leagues:`);
            leagues.forEach(league => {
                console.log(`   - ${league.name} (${league.country})`);
            });
            return true;
        }
    } catch (error) {
        console.log('❌ Connection failed:', error.message);
        return false;
    }
}

async function testTablesExist() {
    console.log('\n2. Testing Database Schema');
    console.log('-------------------------');
    
    const tables = [
        'profiles', 'leagues', 'teams', 'groups', 
        'group_members', 'matches', 'predictions', 
        'chat_messages', 'leaderboards'
    ];
    
    let allTablesExist = true;
    
    for (const table of tables) {
        try {
            const { data, error } = await supabaseAnon
                .from(table)
                .select('*')
                .limit(1);
            
            if (error && error.code === 'PGRST116') {
                console.log(`❌ Table '${table}' does not exist`);
                allTablesExist = false;
            } else if (error && error.message.includes('permission denied')) {
                console.log(`⚠️  Table '${table}' exists but requires authentication`);
            } else if (error) {
                console.log(`⚠️  Table '${table}' - ${error.message}`);
            } else {
                console.log(`✅ Table '${table}' exists and accessible`);
            }
        } catch (error) {
            console.log(`❌ Error checking table '${table}':`, error.message);
            allTablesExist = false;
        }
    }
    
    return allTablesExist;
}

async function testTeamsData() {
    console.log('\n3. Testing Sample Data');
    console.log('---------------------');
    
    try {
        const { data: teams, error } = await supabaseAnon
            .from('teams')
            .select('id, name, short_name')
            .limit(5);
        
        if (error) {
            console.log('❌ Error fetching teams:', error.message);
            return false;
        } else {
            console.log('✅ Teams data accessible');
            console.log(`📊 Found ${teams.length} teams:`);
            teams.forEach(team => {
                console.log(`   - ${team.name} (${team.short_name || 'No short name'})`);
            });
            return true;
        }
    } catch (error) {
        console.log('❌ Error testing teams data:', error.message);
        return false;
    }
}

async function testAuthEndpoint() {
    console.log('\n4. Testing Authentication');
    console.log('-------------------------');
    
    try {
        // Test auth endpoint by attempting to get session
        const { data: { session }, error } = await supabaseAnon.auth.getSession();
        
        if (error) {
            console.log('❌ Auth endpoint error:', error.message);
            return false;
        } else {
            console.log('✅ Auth endpoint accessible');
            console.log(`📱 Current session: ${session ? 'Active' : 'None (expected for test)'}`);
            return true;
        }
    } catch (error) {
        console.log('❌ Auth test failed:', error.message);
        return false;
    }
}

async function testRealtimeConnection() {
    console.log('\n5. Testing Realtime Connection');
    console.log('------------------------------');
    
    try {
        // Create a test subscription
        const channel = supabaseAnon
            .channel('test-channel')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'leagues' }, 
                (payload) => {
                    console.log('📡 Realtime event received:', payload);
                }
            );
        
        // Subscribe and test
        const status = await new Promise((resolve) => {
            channel.subscribe((status, err) => {
                if (err) {
                    console.log('❌ Realtime subscription error:', err);
                    resolve(false);
                } else if (status === 'SUBSCRIBED') {
                    console.log('✅ Realtime connection successful');
                    resolve(true);
                } else if (status === 'CHANNEL_ERROR') {
                    console.log('❌ Realtime channel error');
                    resolve(false);
                }
            });
            
            // Timeout after 5 seconds
            setTimeout(() => {
                console.log('⚠️  Realtime connection timeout');
                resolve(false);
            }, 5000);
        });
        
        // Cleanup
        await supabaseAnon.removeChannel(channel);
        
        return status;
    } catch (error) {
        console.log('❌ Realtime test failed:', error.message);
        return false;
    }
}

async function testFunctions() {
    console.log('\n6. Testing Database Functions');
    console.log('-----------------------------');
    
    try {
        // Test helper function
        const { data, error } = await supabaseAdmin.rpc('is_group_member', {
            group_id: '00000000-0000-0000-0000-000000000000',
            user_id: '00000000-0000-0000-0000-000000000000'
        });
        
        if (error && error.message.includes('function public.is_group_member') && error.message.includes('does not exist')) {
            console.log('❌ Database functions not installed');
            return false;
        } else if (error) {
            console.log('⚠️  Function exists but returned error (expected for test UUIDs):', error.message);
            return true; // This is actually expected since we're using fake UUIDs
        } else {
            console.log('✅ Database functions working');
            console.log(`📊 Function result: ${data}`);
            return true;
        }
    } catch (error) {
        console.log('❌ Function test failed:', error.message);
        return false;
    }
}

async function runFullTest() {
    console.log(`🌐 Supabase URL: ${supabaseUrl}`);
    console.log(`🔑 Using anon key: ${supabaseAnonKey.substring(0, 20)}...`);
    
    const results = {
        connection: await testDatabaseConnection(),
        schema: await testTablesExist(),
        data: await testTeamsData(),
        auth: await testAuthEndpoint(),
        realtime: await testRealtimeConnection(),
        functions: await testFunctions()
    };
    
    console.log('\n📋 Integration Test Summary');
    console.log('===========================');
    
    Object.entries(results).forEach(([test, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${test.charAt(0).toUpperCase() + test.slice(1)}: ${passed ? 'PASS' : 'FAIL'}`);
    });
    
    const totalPassed = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`\n🎯 Overall: ${totalPassed}/${totalTests} tests passed`);
    
    if (totalPassed === totalTests) {
        console.log('🎉 All tests passed! Supabase integration is ready.');
    } else {
        console.log('⚠️  Some tests failed. Check the setup and run again.');
    }
    
    return totalPassed === totalTests;
}

// Run the test
runFullTest().then((success) => {
    process.exit(success ? 0 : 1);
}).catch((error) => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
});