#!/bin/bash

# Supabase Setup Script for Ligat Hanichushim
# This script helps automate the Supabase setup process

echo "🏈 Setting up Supabase for Ligat Hanichushim..."

# Check if required tools are installed
command -v supabase >/dev/null 2>&1 || {
    echo "❌ Error: Supabase CLI is not installed."
    echo "Please install it first: https://supabase.com/docs/guides/cli"
    exit 1
}

# Initialize Supabase project
if [ ! -f "supabase/config.toml" ]; then
    echo "📋 Initializing Supabase project..."
    supabase init
else
    echo "✅ Supabase project already initialized"
fi

# Check if .env file exists and has required variables
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found"
    echo "Please create .env file with your Supabase credentials:"
    echo "EXPO_PUBLIC_SUPABASE_URL=your_supabase_url"
    echo "EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key"
    exit 1
fi

# Check if environment variables are set
if ! grep -q "EXPO_PUBLIC_SUPABASE_URL" .env || ! grep -q "EXPO_PUBLIC_SUPABASE_ANON_KEY" .env; then
    echo "❌ Error: Missing required environment variables in .env"
    echo "Please add your Supabase credentials to .env file"
    exit 1
fi

echo "✅ Environment variables found"

# Link to remote Supabase project (optional)
read -p "Do you want to link to a remote Supabase project? (y/n): " -r
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔗 Linking to remote Supabase project..."
    supabase link --project-ref YOUR_PROJECT_REF
fi

# Start local Supabase (optional)
read -p "Do you want to start local Supabase for development? (y/n): " -r
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Starting local Supabase..."
    supabase start
    
    echo "📊 Setting up database schema..."
    supabase db reset
    
    # Apply migrations
    echo "🔄 Applying database migrations..."
    if [ -f "supabase/schema.sql" ]; then
        supabase db push --include-all
    fi
fi

# Generate TypeScript types
echo "🔧 Generating TypeScript types..."
supabase gen types typescript --local > lib/database.types.ts

echo "✅ Supabase setup completed!"
echo ""
echo "Next steps:"
echo "1. Update your .env file with actual Supabase credentials"
echo "2. Run the SQL scripts in your Supabase dashboard:"
echo "   - supabase/schema.sql"
echo "   - supabase/rls-policies.sql" 
echo "   - supabase/functions.sql"
echo "3. Enable Realtime for the required tables"
echo "4. Test the setup with: npm run dev"
echo ""
echo "📖 Check supabase/setup-instructions.md for detailed setup guide"