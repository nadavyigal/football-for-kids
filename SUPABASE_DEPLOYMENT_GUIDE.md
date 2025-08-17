# Supabase Database Deployment Guide
## Hebrew Football Prediction League

### ✅ SQL Syntax Issues FIXED

The critical SQL syntax errors with Hebrew text have been resolved:

- **Fixed**: Manchester City team name (`מנצ'סטר סיטי`) - apostrophe properly escaped
- **Fixed**: PSG team name (`פריז סן ז'רמן`) - apostrophe properly escaped
- **Verified**: All Hebrew text uses proper UTF-8 encoding
- **Validated**: SQL syntax passes validation checks

### 🔧 Pre-Deployment Checklist

✅ SQL syntax errors fixed
✅ Hebrew text apostrophes properly escaped (`'` → `''`)
✅ UTF-8 encoding verified
✅ Supabase connection tested
✅ All SQL files validated

### 📋 Deployment Steps

#### Option 1: Manual Deployment (Recommended)

1. **Access Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/alnvqylgaqutitlvahia
   - Navigate to SQL Editor

2. **Deploy Schema (First)**
   ```sql
   -- Copy and paste the entire contents of supabase/schema.sql
   -- This creates tables, indexes, triggers, and inserts Hebrew team data
   ```

3. **Deploy RLS Policies (Second)**
   ```sql
   -- Copy and paste the entire contents of supabase/rls-policies.sql
   -- This sets up Row Level Security for data protection
   ```

4. **Deploy Functions (Third)**
   ```sql
   -- Copy and paste the entire contents of supabase/functions.sql
   -- This creates stored procedures and business logic functions
   ```

#### Option 2: Automated Deployment

```bash
# Run the deployment script (handles Unicode issues)
python execute-sql.py
```

### 🎯 What Gets Created

#### Tables with Hebrew Content:
- **Leagues**: Israeli Premier League, Champions League, etc.
- **Teams**: Israeli teams (Maccabi Tel Aviv, Hapoel Tel Aviv, etc.)
- **European Teams**: Real Madrid, Barcelona, Manchester City, PSG, etc.

#### Core Features:
- User profiles and authentication
- Group management with invite codes
- Match creation and approval system
- Prediction system with point calculation
- Real-time chat with Hebrew support
- Leaderboards and statistics

### 🔍 Verification Steps

1. **Check Tables Created**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

2. **Verify Hebrew Team Data**
   ```sql
   SELECT name, short_name FROM public.teams 
   WHERE name LIKE '%מכבי%' OR name LIKE '%הפועל%';
   ```

3. **Test Manchester City Fix**
   ```sql
   SELECT name FROM public.teams WHERE name LIKE '%מנצ%סטר%';
   -- Should return: מנצ'סטר סיטי
   ```

4. **Test PSG Fix**
   ```sql
   SELECT name FROM public.teams WHERE name LIKE '%פריז%';
   -- Should return: פריז סן ז'רמן
   ```

### 🛠️ Test Scripts Available

- `validate-sql.py` - Validates SQL syntax before deployment
- `test-db-connection.py` - Tests Supabase connection
- `execute-sql.py` - Automated deployment script

### 🔐 Security Configuration

The deployment includes:
- Row Level Security (RLS) enabled on all tables
- User authentication integration
- Group-based access control
- Admin permissions for match approval
- Secure API key handling

### 📊 Hebrew Text Encoding

- **Character Set**: UTF-8
- **Language**: Hebrew (right-to-left)
- **Special Characters**: Properly escaped apostrophes
- **Database Collation**: UTF-8 compatible

### 🚨 Error Resolution

The original error:
```
ERROR: 42601: syntax error at or near "סטר"
LINE 246: ('מנצ\'סטר סיטי', 'מסיטי', ...)
```

**Root Cause**: Single apostrophe (`'`) inside SQL string conflicted with string delimiter
**Solution**: Escaped apostrophes using double apostrophe (`''`) convention
**Result**: SQL syntax now valid and Hebrew text preserved

### 📈 Next Steps After Deployment

1. Test basic database operations
2. Verify Hebrew text displays correctly in your app
3. Test user authentication flow
4. Create test groups and matches
5. Validate prediction system works
6. Test real-time chat functionality

### 🆘 Support

If deployment issues occur:
1. Check the Supabase logs in dashboard
2. Verify service role key permissions
3. Ensure UTF-8 encoding in SQL editor
4. Run validation scripts before deployment

**Project Details:**
- Supabase Project ID: `alnvqylgaqutitlvahia`
- Region: Auto-selected
- PostgreSQL Version: Latest stable