# 🚀 Football Prediction League - Backend Deployment Guide

## Overview
This guide will help you deploy the complete backend to your Supabase project: `alnvqylgaqutitlvahia`

**Project Details:**
- **Project URL**: https://supabase.com/dashboard/project/alnvqylgaqutitlvahia  
- **Project ID**: alnvqylgaqutitlvahia
- **Environment**: ✅ Configured in `.env` file

## 🔧 Deployment Steps

### Step 1: Access Supabase SQL Editor
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/alnvqylgaqutitlvahia)
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query** to create a new SQL query

### Step 2: Deploy Database Schema
1. Open `supabase/schema.sql` in your code editor
2. Copy the entire contents (250 lines)
3. Paste into the Supabase SQL Editor
4. Click **Run** to execute
5. ✅ **Expected Result**: Tables, indexes, and triggers created

**Key Components Created:**
- 9 main tables (profiles, groups, matches, predictions, etc.)
- Custom types and enums
- Indexes for performance
- Automatic timestamp triggers
- Default data (leagues and teams)

### Step 3: Apply Row Level Security (RLS) Policies
1. Open `supabase/rls-policies.sql`
2. Copy the entire contents (253 lines)
3. Paste into a new SQL Editor query
4. Click **Run** to execute
5. ✅ **Expected Result**: RLS enabled on all tables with security policies

**Security Features Applied:**
- User authentication-based access control
- Group membership-based permissions
- Admin-only operations (match approval, member management)
- Helper functions for permission checking

### Step 4: Deploy Database Functions
1. Open `supabase/functions.sql`
2. Copy the entire contents (480 lines)  
3. Paste into a new SQL Editor query
4. Click **Run** to execute
5. ✅ **Expected Result**: Custom functions and stored procedures created

**Functions Created:**
- `join_group_by_invite_code()` - Group joining with invite codes
- `calculate_prediction_points()` - Advanced scoring system
- `update_match_result()` - Match result processing
- `refresh_group_leaderboard()` - Leaderboard calculations
- `create_match_with_share_link()` - Match creation with sharing
- System messaging functions

### Step 5: Enable Real-time Subscriptions
1. In Supabase Dashboard, go to **Database** → **Replication**
2. Find the **Publications** section
3. Edit the `supabase_realtime` publication
4. Add these tables to real-time:
   - ✅ `chat_messages`
   - ✅ `matches`  
   - ✅ `predictions`
   - ✅ `leaderboards`
   - ✅ `group_members`

**Alternative: SQL Command**
```sql
-- Run this in SQL Editor to enable real-time
ALTER publication supabase_realtime ADD TABLE public.chat_messages;
ALTER publication supabase_realtime ADD TABLE public.matches;
ALTER publication supabase_realtime ADD TABLE public.predictions;
ALTER publication supabase_realtime ADD TABLE public.leaderboards;
ALTER publication supabase_realtime ADD TABLE public.group_members;
```

### Step 6: Configure Authentication
1. Go to **Authentication** → **Settings**
2. Enable these providers:
   - ✅ Email (default)
   - Optional: Google, Apple, etc.
3. Set **Site URL**: `https://ligat-hanichushim.com`
4. Add redirect URLs if needed

## 🧪 Verification & Testing

### Database Verification
Run this query in SQL Editor to verify deployment:
```sql
-- Check if all tables exist
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if functions exist
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Verify sample data
SELECT name, country FROM public.leagues;
SELECT name, short_name FROM public.teams LIMIT 5;
```

### Authentication Test
1. Go to **Authentication** → **Users**
2. Create a test user or use existing
3. Verify user appears in `auth.users` table
4. Check if profile was auto-created in `public.profiles`

### Real-time Test
1. Open your app (when ready)
2. Join a group and send a chat message
3. Verify real-time updates work

## 🎯 What's Deployed

### Database Schema
- **9 Tables**: Complete relational structure
- **3 Custom Types**: Enums for user roles, match status, message types
- **Multiple Indexes**: Optimized for performance
- **Triggers**: Automatic timestamp updates and profile creation

### Security (RLS)
- **User-based Access**: Users only see their own data and group data
- **Role-based Permissions**: Admin/moderator/member hierarchies
- **Group Isolation**: Users only access their groups
- **Secure Functions**: Helper functions for permission checking

### Business Logic
- **Advanced Scoring**: 5-point system (perfect/result+diff/result/none)
- **Group Management**: Invite codes, member management, admin controls
- **Match Workflow**: Creation → Approval → Live → Finished
- **Real-time Chat**: System messages, replies, editing
- **Leaderboards**: Dynamic ranking with statistics

### Real-time Features
- Live chat messages
- Match status updates  
- Prediction submissions
- Leaderboard changes
- Group member activities

## 🔍 Troubleshooting

### Common Issues
1. **Permission Denied**: Ensure you're using the correct project and have admin access
2. **Function Errors**: Check that schema was deployed first
3. **RLS Blocking**: Verify user authentication and group membership
4. **Real-time Not Working**: Check that tables are added to `supabase_realtime` publication

### Support Resources
- [Supabase Documentation](https://supabase.com/docs)
- [SQL Editor Guide](https://supabase.com/docs/guides/database/overview)
- [RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)

## ✅ Deployment Checklist

- [ ] Database schema deployed (schema.sql)
- [ ] RLS policies applied (rls-policies.sql)  
- [ ] Functions created (functions.sql)
- [ ] Real-time enabled for required tables
- [ ] Authentication configured
- [ ] Environment variables set (.env)
- [ ] Test user created and verified
- [ ] Sample data exists (leagues, teams)

---

**🎉 Once completed, your Football Prediction League backend will be fully operational!**

Next steps: Test the frontend app connectivity and create your first prediction group.