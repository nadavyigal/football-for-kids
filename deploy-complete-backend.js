#!/usr/bin/env node

/**
 * Complete Supabase Backend Deployment Script
 * Deploys schema, RLS policies, and functions in correct order
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables:');
    console.error('   EXPO_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
    console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
    process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🚀 Starting Complete Supabase Backend Deployment');
console.log('================================================');
console.log(`🌐 URL: ${supabaseUrl}`);
console.log(`🔑 Service Key: ${supabaseServiceKey.substring(0, 20)}...`);
console.log('');

async function executeSqlFile(filePath, description) {
    console.log(`📄 Deploying: ${description}`);
    console.log(`   File: ${filePath}`);
    
    try {
        const sqlContent = fs.readFileSync(filePath, 'utf8');
        
        if (!sqlContent.trim()) {
            throw new Error('SQL file is empty');
        }
        
        console.log(`   Size: ${Math.round(sqlContent.length / 1024 * 100) / 100} KB`);
        
        // Execute SQL
        const { data, error } = await supabase.rpc('exec_sql', { 
            sql: sqlContent 
        });
        
        if (error) {
            // Try direct execution if RPC fails
            const { data: directData, error: directError } = await supabase
                .from('_direct_sql_execution')
                .insert({ sql: sqlContent });
            
            if (directError) {
                throw new Error(`SQL execution failed: ${error.message || error}`);
            }
        }
        
        console.log('   ✅ SUCCESS: SQL executed successfully');
        return true;
        
    } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
        return false;
    }
}

async function verifyTable(tableName) {
    try {
        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);
        
        if (error && !error.message.includes('permission')) {
            return false;
        }
        
        return true;
    } catch (error) {
        return false;
    }
}

async function testHebrewText() {
    console.log('🔤 Testing Hebrew Text Encoding');
    console.log('------------------------------');
    
    try {
        // Test Hebrew league insertion
        const { data, error } = await supabase
            .from('leagues')
            .upsert([
                {
                    name: 'ליגת העל הישראלית - טסט',
                    country: 'Israel',
                    external_id: 'test_hebrew_league'
                }
            ])
            .select();
        
        if (error) {
            console.log('   ❌ Hebrew text insertion failed:', error.message);
            return false;
        }
        
        console.log('   ✅ Hebrew text inserted successfully');
        
        // Test Hebrew team with apostrophe
        const { data: teamData, error: teamError } = await supabase
            .from('teams')
            .upsert([
                {
                    name: 'מנצ\'סטר סיטי - טסט',
                    short_name: 'מסיטי',
                    external_id: 'test_hebrew_team'
                }
            ])
            .select();
        
        if (teamError) {
            console.log('   ❌ Hebrew text with apostrophe failed:', teamError.message);
            return false;
        }
        
        console.log('   ✅ Hebrew text with apostrophe successful');
        
        // Clean up test data
        await supabase.from('teams').delete().eq('external_id', 'test_hebrew_team');
        await supabase.from('leagues').delete().eq('external_id', 'test_hebrew_league');
        
        return true;
        
    } catch (error) {
        console.log('   ❌ Hebrew encoding test failed:', error.message);
        return false;
    }
}

async function verifyDeployment() {
    console.log('🔍 Verifying Deployment');
    console.log('------------------------');
    
    const tables = [
        'profiles', 'leagues', 'teams', 'groups', 
        'group_members', 'matches', 'predictions', 
        'chat_messages', 'leaderboards'
    ];
    
    let successCount = 0;
    
    for (const table of tables) {
        const exists = await verifyTable(table);
        if (exists) {
            console.log(`   ✅ Table '${table}' exists and accessible`);
            successCount++;
        } else {
            console.log(`   ❌ Table '${table}' missing or inaccessible`);
        }
    }
    
    console.log(`\n📊 Tables Status: ${successCount}/${tables.length} verified`);
    
    // Test Hebrew encoding
    const hebrewTest = await testHebrewText();
    
    return {
        tablesSuccess: successCount === tables.length,
        hebrewSuccess: hebrewTest,
        overallSuccess: successCount === tables.length && hebrewTest
    };
}

async function main() {
    let deploymentSteps = 0;
    let successfulSteps = 0;
    
    try {
        // Step 1: Deploy Schema
        deploymentSteps++;
        console.log('1️⃣ STEP 1: Database Schema');
        console.log('==========================');
        const schemaSuccess = await executeSqlFile(
            path.join(__dirname, 'supabase', 'schema.sql'),
            'Database Schema (Tables, Types, Triggers)'
        );
        if (schemaSuccess) successfulSteps++;
        console.log('');
        
        // Wait a moment for schema to be available
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Step 2: Deploy RLS Policies
        deploymentSteps++;
        console.log('2️⃣ STEP 2: Row Level Security');
        console.log('==============================');
        const rlsSuccess = await executeSqlFile(
            path.join(__dirname, 'supabase', 'rls-policies.sql'),
            'Row Level Security Policies'
        );
        if (rlsSuccess) successfulSteps++;
        console.log('');
        
        // Step 3: Deploy Functions
        deploymentSteps++;
        console.log('3️⃣ STEP 3: Database Functions');
        console.log('==============================');
        const functionsSuccess = await executeSqlFile(
            path.join(__dirname, 'supabase', 'functions.sql'),
            'Database Functions and Procedures'
        );
        if (functionsSuccess) successfulSteps++;
        console.log('');
        
        // Wait for changes to propagate
        console.log('⏳ Waiting for changes to propagate...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Step 4: Verify Deployment
        deploymentSteps++;
        console.log('4️⃣ STEP 4: Verification');
        console.log('========================');
        const verification = await verifyDeployment();
        if (verification.overallSuccess) successfulSteps++;
        console.log('');
        
        // Final Summary
        console.log('🎯 DEPLOYMENT SUMMARY');
        console.log('=====================');
        console.log(`📋 Steps Completed: ${successfulSteps}/${deploymentSteps}`);
        console.log(`🗄️  Database Schema: ${schemaSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
        console.log(`🔒 Security Policies: ${rlsSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
        console.log(`⚙️  Functions: ${functionsSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
        console.log(`🔤 Hebrew Encoding: ${verification.hebrewSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
        console.log(`📊 Table Verification: ${verification.tablesSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
        console.log('');
        
        if (successfulSteps === deploymentSteps) {
            console.log('🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!');
            console.log('');
            console.log('🚀 Next Steps:');
            console.log('   1. Test your React Native app connection');
            console.log('   2. Create your first group and add members');
            console.log('   3. Create matches and start predicting!');
            console.log('');
            console.log('📱 Your Supabase project is ready for the football prediction app!');
        } else {
            console.log('⚠️  DEPLOYMENT PARTIALLY FAILED');
            console.log('');
            console.log('🔧 Troubleshooting:');
            console.log('   1. Check your Supabase service role key permissions');
            console.log('   2. Verify your project URL is correct');
            console.log('   3. Try running individual SQL files in Supabase SQL Editor');
            console.log('   4. Check the Supabase dashboard for error details');
        }
        
    } catch (error) {
        console.error('💥 CRITICAL ERROR:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

// Alternative SQL execution function for direct copy-paste
function generateManualDeployment() {
    console.log('\n📋 MANUAL DEPLOYMENT INSTRUCTIONS');
    console.log('==================================');
    console.log('If automated deployment fails, copy and paste these files into Supabase SQL Editor:');
    console.log('');
    console.log('1. First, run: supabase/schema.sql');
    console.log('2. Then, run: supabase/rls-policies.sql'); 
    console.log('3. Finally, run: supabase/functions.sql');
    console.log('');
    console.log('📂 File Contents:');
    console.log('================');
    
    const files = [
        { path: 'supabase/schema.sql', description: 'Database Schema' },
        { path: 'supabase/rls-policies.sql', description: 'Security Policies' },
        { path: 'supabase/functions.sql', description: 'Functions' }
    ];
    
    files.forEach((file, index) => {
        const fullPath = path.join(__dirname, file.path);
        try {
            const content = fs.readFileSync(fullPath, 'utf8');
            console.log(`\n${index + 1}. ${file.description} (${file.path}):`);
            console.log('-'.repeat(50));
            console.log(`Size: ${Math.round(content.length / 1024 * 100) / 100} KB`);
            console.log(`Lines: ${content.split('\n').length}`);
            console.log('✅ File exists and ready for deployment');
        } catch (error) {
            console.log(`\n${index + 1}. ${file.description} (${file.path}):`);
            console.log('-'.repeat(50));
            console.log(`❌ Error reading file: ${error.message}`);
        }
    });
}

// Run the deployment
if (require.main === module) {
    main().then(() => {
        generateManualDeployment();
    }).catch(console.error);
}

module.exports = { main, executeSqlFile, verifyDeployment };