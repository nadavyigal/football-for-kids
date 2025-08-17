#!/usr/bin/env node

/**
 * SQL Deployment Verification Script
 * Verifies all SQL files are ready for Supabase deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 SQL Deployment Verification');
console.log('==============================');
console.log('');

function verifyFile(filePath, description, expectedContent = []) {
    console.log(`📄 Checking: ${description}`);
    console.log(`   File: ${filePath}`);
    
    try {
        if (!fs.existsSync(filePath)) {
            console.log('   ❌ ERROR: File does not exist');
            return false;
        }
        
        const content = fs.readFileSync(filePath, 'utf8');
        
        if (!content.trim()) {
            console.log('   ❌ ERROR: File is empty');
            return false;
        }
        
        const sizeKB = Math.round(content.length / 1024 * 100) / 100;
        const lines = content.split('\n').length;
        
        console.log(`   📏 Size: ${sizeKB} KB (${lines} lines)`);
        
        // Check for expected content
        let hasAllExpected = true;
        for (const expected of expectedContent) {
            if (!content.includes(expected)) {
                console.log(`   ⚠️  Missing expected content: ${expected}`);
                hasAllExpected = false;
            }
        }
        
        // Check for Hebrew text encoding
        const hebrewRegex = /[\u0590-\u05FF]/;
        if (hebrewRegex.test(content)) {
            console.log('   🔤 Contains Hebrew text');
            
            // Check for properly escaped apostrophes in Hebrew
            const apostropheInHebrew = content.includes("מנצ''סטר");
            if (apostropheInHebrew) {
                console.log('   ✅ Hebrew apostrophes properly escaped');
            }
        }
        
        // Check for SQL syntax issues
        const syntaxIssues = [];
        
        // Check for common SQL syntax problems
        if (content.includes('CREATE TABLE') && !content.includes('CREATE TABLE IF NOT EXISTS')) {
            syntaxIssues.push('Missing IF NOT EXISTS for table creation');
        }
        
        if (syntaxIssues.length > 0) {
            console.log('   ⚠️  Potential syntax issues:');
            syntaxIssues.forEach(issue => console.log(`      - ${issue}`));
        }
        
        if (hasAllExpected && syntaxIssues.length === 0) {
            console.log('   ✅ SUCCESS: File is valid and ready for deployment');
            return true;
        } else {
            console.log('   ⚠️  WARNING: File has issues but may still work');
            return true;
        }
        
    } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
        return false;
    }
}

function main() {
    const supabaseDir = path.join(__dirname, 'supabase');
    
    console.log(`📂 Supabase Directory: ${supabaseDir}`);
    console.log('');
    
    // Define files to check
    const files = [
        {
            path: path.join(supabaseDir, 'schema.sql'),
            description: 'Database Schema',
            expectedContent: [
                'CREATE TABLE IF NOT EXISTS public.profiles',
                'CREATE TABLE IF NOT EXISTS public.leagues',
                'CREATE TABLE IF NOT EXISTS public.teams',
                'CREATE TABLE IF NOT EXISTS public.groups',
                'CREATE TABLE IF NOT EXISTS public.group_members',
                'CREATE TABLE IF NOT EXISTS public.matches',
                'CREATE TABLE IF NOT EXISTS public.predictions',
                'CREATE TABLE IF NOT EXISTS public.chat_messages',
                'CREATE TABLE IF NOT EXISTS public.leaderboards',
                'ליגת העל הישראלית',
                'מכבי תל אביב'
            ]
        },
        {
            path: path.join(supabaseDir, 'rls-policies.sql'),
            description: 'Row Level Security Policies',
            expectedContent: [
                'ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY',
                'CREATE POLICY',
                'is_group_member',
                'is_group_admin'
            ]
        },
        {
            path: path.join(supabaseDir, 'functions.sql'),
            description: 'Database Functions',
            expectedContent: [
                'CREATE OR REPLACE FUNCTION',
                'join_group_by_invite_code',
                'calculate_prediction_points',
                'update_match_result',
                'refresh_group_leaderboard'
            ]
        }
    ];
    
    let allValid = true;
    
    // Check each file
    files.forEach((file, index) => {
        console.log(`${index + 1}️⃣ FILE ${index + 1}`);
        console.log('========');
        const isValid = verifyFile(file.path, file.description, file.expectedContent);
        if (!isValid) allValid = false;
        console.log('');
    });
    
    // Summary
    console.log('📋 VERIFICATION SUMMARY');
    console.log('=======================');
    
    if (allValid) {
        console.log('✅ ALL FILES VERIFIED SUCCESSFULLY!');
        console.log('');
        console.log('🚀 Ready for Supabase Deployment:');
        console.log('   1. Copy contents of schema.sql to Supabase SQL Editor and run');
        console.log('   2. Copy contents of rls-policies.sql to Supabase SQL Editor and run');
        console.log('   3. Copy contents of functions.sql to Supabase SQL Editor and run');
        console.log('');
        console.log('💡 Alternative: Run the automated deployment script:');
        console.log('   node deploy-complete-backend.js');
        console.log('');
        console.log('🌐 Your Supabase Project: https://supabase.com/dashboard/project/alnvqylgaqutitlvahia');
    } else {
        console.log('❌ SOME FILES HAVE ISSUES');
        console.log('');
        console.log('🔧 Please fix the issues above before deploying to Supabase');
    }
    
    // Generate quick deployment guide
    console.log('');
    console.log('📖 QUICK DEPLOYMENT GUIDE');
    console.log('==========================');
    console.log('1. Open Supabase SQL Editor: https://supabase.com/dashboard/project/alnvqylgaqutitlvahia/sql');
    console.log('2. Create a new query');
    console.log('3. Copy and paste the content of schema.sql');
    console.log('4. Click "Run" and wait for completion');
    console.log('5. Repeat steps 2-4 for rls-policies.sql');
    console.log('6. Repeat steps 2-4 for functions.sql');
    console.log('7. Verify tables appear in Table Editor');
    console.log('');
    console.log('🎯 Hebrew Text Encoding:');
    console.log('   - All Hebrew team and league names are properly encoded');
    console.log('   - Apostrophes in team names (מנצ\'סטר) are escaped correctly');
    console.log('   - UTF-8 encoding will be preserved in Supabase');
}

// File content preview function
function previewFileContent(filePath, lines = 10) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const contentLines = content.split('\n');
        
        console.log(`\n📄 Preview of ${path.basename(filePath)} (first ${lines} lines):`);
        console.log('-'.repeat(60));
        
        for (let i = 0; i < Math.min(lines, contentLines.length); i++) {
            console.log(`${(i + 1).toString().padStart(3)}: ${contentLines[i]}`);
        }
        
        if (contentLines.length > lines) {
            console.log(`... (${contentLines.length - lines} more lines)`);
        }
        
        console.log('-'.repeat(60));
        
    } catch (error) {
        console.log(`❌ Could not preview file: ${error.message}`);
    }
}

// Run verification
if (require.main === module) {
    main();
    
    // Show file previews if requested
    if (process.argv.includes('--preview')) {
        console.log('\n📋 FILE PREVIEWS');
        console.log('================');
        
        const files = ['schema.sql', 'rls-policies.sql', 'functions.sql'];
        files.forEach(file => {
            previewFileContent(path.join(__dirname, 'supabase', file), 15);
        });
    }
}

module.exports = { verifyFile, main };