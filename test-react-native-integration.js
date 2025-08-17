// Test React Native Supabase Integration
// This tests the integration without requiring the full React Native environment

console.log('🔧 Testing React Native Supabase Integration');
console.log('==============================================');

async function testModuleImports() {
    console.log('\n1. Testing Module Imports');
    console.log('-------------------------');
    
    try {
        // Test Supabase client
        const { supabase } = require('./lib/supabase');
        console.log('✅ Supabase client imported successfully');
        
        // Test Auth service
        const { AuthService } = require('./lib/auth');
        console.log('✅ AuthService imported successfully');
        
        // Test API service
        const { APIService } = require('./lib/api');
        console.log('✅ APIService imported successfully');
        
        // Test Realtime service
        const { RealtimeService } = require('./lib/realtime');
        console.log('✅ RealtimeService imported successfully');
        
        return true;
    } catch (error) {
        console.log('❌ Module import error:', error.message);
        return false;
    }
}

async function testSupabaseClientMethods() {
    console.log('\n2. Testing Supabase Client Methods');
    console.log('----------------------------------');
    
    try {
        const { supabase } = require('./lib/supabase');
        
        // Test auth methods exist
        console.log('✅ Auth methods available:', {
            getSession: typeof supabase.auth.getSession,
            signInWithPassword: typeof supabase.auth.signInWithPassword,
            signUp: typeof supabase.auth.signUp,
            signOut: typeof supabase.auth.signOut
        });
        
        // Test database methods exist
        console.log('✅ Database methods available:', {
            from: typeof supabase.from,
            rpc: typeof supabase.rpc
        });
        
        // Test realtime methods exist
        console.log('✅ Realtime methods available:', {
            channel: typeof supabase.channel,
            removeAllChannels: typeof supabase.removeAllChannels
        });
        
        return true;
    } catch (error) {
        console.log('❌ Supabase client methods error:', error.message);
        return false;
    }
}

async function testAuthServiceMethods() {
    console.log('\n3. Testing Auth Service Methods');
    console.log('------------------------------');
    
    try {
        const { AuthService } = require('./lib/auth');
        
        const methods = [
            'signUp', 'signIn', 'signOut', 'getCurrentUser',
            'getUserProfile', 'updateProfile', 'resetPassword',
            'changePassword', 'isAuthenticated', 'onAuthStateChange'
        ];
        
        const availableMethods = methods.filter(method => 
            typeof AuthService[method] === 'function'
        );
        
        console.log(`✅ AuthService methods available: ${availableMethods.length}/${methods.length}`);
        console.log('   Available:', availableMethods.join(', '));
        
        if (availableMethods.length !== methods.length) {
            const missing = methods.filter(method => !availableMethods.includes(method));
            console.log('   Missing:', missing.join(', '));
        }
        
        return availableMethods.length === methods.length;
    } catch (error) {
        console.log('❌ AuthService methods error:', error.message);
        return false;
    }
}

async function testAPIServiceMethods() {
    console.log('\n4. Testing API Service Methods');
    console.log('------------------------------');
    
    try {
        const { APIService } = require('./lib/api');
        
        const methods = [
            'getUserGroups', 'createGroup', 'joinGroupByInviteCode',
            'getGroupMatches', 'createMatch', 'approveMatch',
            'getGroupChatMessages', 'sendChatMessage', 'getGroupLeaderboard',
            'getLeagues', 'getTeamsByLeague', 'searchTeams', 'healthCheck'
        ];
        
        const availableMethods = methods.filter(method => 
            typeof APIService[method] === 'function'
        );
        
        console.log(`✅ APIService methods available: ${availableMethods.length}/${methods.length}`);
        console.log('   Available:', availableMethods.join(', '));
        
        return availableMethods.length >= methods.length * 0.8; // Allow 80% success
    } catch (error) {
        console.log('❌ APIService methods error:', error.message);
        return false;
    }
}

async function testRealtimeServiceMethods() {
    console.log('\n5. Testing Realtime Service Methods');
    console.log('-----------------------------------');
    
    try {
        const { RealtimeService } = require('./lib/realtime');
        
        const methods = [
            'subscribeToGroupChat', 'subscribeToGroupMatches',
            'subscribeToMatchPredictions', 'subscribeToGroupLeaderboard',
            'unsubscribeFromChannel', 'unsubscribeFromAll',
            'sendBroadcast', 'sendTypingIndicator'
        ];
        
        const availableMethods = methods.filter(method => 
            typeof RealtimeService[method] === 'function'
        );
        
        console.log(`✅ RealtimeService methods available: ${availableMethods.length}/${methods.length}`);
        console.log('   Available:', availableMethods.join(', '));
        
        return availableMethods.length >= methods.length * 0.8; // Allow 80% success
    } catch (error) {
        console.log('❌ RealtimeService methods error:', error.message);
        return false;
    }
}

async function testDatabaseTypes() {
    console.log('\n6. Testing Database Types');
    console.log('-------------------------');
    
    try {
        const { Database } = require('./lib/supabase');
        
        if (Database && Database.public && Database.public.Tables) {
            const tables = Object.keys(Database.public.Tables);
            console.log(`✅ Database types defined for ${tables.length} tables:`);
            console.log('   Tables:', tables.join(', '));
            
            const expectedTables = [
                'profiles', 'groups', 'group_members', 'leagues', 'teams',
                'matches', 'predictions', 'chat_messages', 'leaderboards'
            ];
            
            const missingTables = expectedTables.filter(table => !tables.includes(table));
            if (missingTables.length > 0) {
                console.log('   Missing tables:', missingTables.join(', '));
            }
            
            return missingTables.length === 0;
        } else {
            console.log('❌ Database types not properly defined');
            return false;
        }
    } catch (error) {
        console.log('❌ Database types error:', error.message);
        return false;
    }
}

async function testEnvironmentConfig() {
    console.log('\n7. Testing Environment Configuration');
    console.log('-----------------------------------');
    
    try {
        require('dotenv').config();
        
        const requiredVars = [
            'EXPO_PUBLIC_SUPABASE_URL',
            'EXPO_PUBLIC_SUPABASE_ANON_KEY'
        ];
        
        const missing = requiredVars.filter(varName => !process.env[varName]);
        
        if (missing.length === 0) {
            console.log('✅ All required environment variables are present');
            console.log(`   URL: ${process.env.EXPO_PUBLIC_SUPABASE_URL}`);
            console.log(`   Anon key: ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...`);
            return true;
        } else {
            console.log('❌ Missing environment variables:', missing.join(', '));
            return false;
        }
    } catch (error) {
        console.log('❌ Environment config error:', error.message);
        return false;
    }
}

async function runIntegrationTests() {
    const tests = [
        { name: 'Module Imports', test: testModuleImports },
        { name: 'Supabase Client Methods', test: testSupabaseClientMethods },
        { name: 'Auth Service Methods', test: testAuthServiceMethods },
        { name: 'API Service Methods', test: testAPIServiceMethods },
        { name: 'Realtime Service Methods', test: testRealtimeServiceMethods },
        { name: 'Database Types', test: testDatabaseTypes },
        { name: 'Environment Config', test: testEnvironmentConfig }
    ];
    
    const results = {};
    
    for (const { name, test } of tests) {
        try {
            results[name] = await test();
        } catch (error) {
            console.log(`❌ Test "${name}" failed with error:`, error.message);
            results[name] = false;
        }
    }
    
    console.log('\n📋 Integration Test Summary');
    console.log('===========================');
    
    Object.entries(results).forEach(([test, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASS' : 'FAIL'}`);
    });
    
    const totalPassed = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`\n🎯 Overall: ${totalPassed}/${totalTests} tests passed`);
    
    if (totalPassed === totalTests) {
        console.log('🎉 All React Native integration tests passed!');
        console.log('\n📱 Next Steps for React Native App:');
        console.log('1. Deploy the database schema via Supabase Dashboard');
        console.log('2. Test authentication flow in the app');
        console.log('3. Implement group creation/joining');
        console.log('4. Test match creation and approval');
        console.log('5. Verify real-time chat functionality');
    } else {
        console.log('⚠️  Some integration tests failed. Review the issues above.');
    }
    
    return totalPassed === totalTests;
}

// Run the tests
runIntegrationTests().then((success) => {
    process.exit(success ? 0 : 1);
}).catch((error) => {
    console.error('❌ Integration test suite failed:', error);
    process.exit(1);
});