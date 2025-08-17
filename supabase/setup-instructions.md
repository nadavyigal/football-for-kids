# Supabase Setup Instructions

## 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/Sign in to your account
3. Click "New Project"
4. Choose your organization
5. Fill in project details:
   - Name: `ligat-hanichushim` (or your preferred name)
   - Database Password: Generate a strong password
   - Region: Choose closest to your users (Europe for Hebrew app)
6. Click "Create new project"
7. Wait for the project to be ready (2-3 minutes)

## 2. Get Project Credentials

1. Go to Settings → API in your Supabase dashboard
2. Copy the following values:
   - Project URL
   - API Key (anon/public)
   - Service Role Key (keep this secret!)

## 3. Configure Environment Variables

Update your `.env` file with your actual Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## 4. Run Database Setup Scripts

Execute the following SQL scripts in order in your Supabase SQL Editor:

### Step 1: Create Schema
Copy and paste the contents of `supabase/schema.sql` into the SQL Editor and run it.

### Step 2: Set Up RLS Policies
Copy and paste the contents of `supabase/rls-policies.sql` into the SQL Editor and run it.

### Step 3: Create Functions
Copy and paste the contents of `supabase/functions.sql` into the SQL Editor and run it.

## 5. Configure Authentication

1. Go to Authentication → Settings in your Supabase dashboard
2. Configure the following settings:

### Email Settings:
- Enable email confirmations if desired
- Set up SMTP (optional, uses Supabase's SMTP by default)

### URL Configuration:
- Site URL: `https://your-app-domain.com` (for production)
- Redirect URLs: Add your app's deep links and web URLs

### Email Templates (Optional):
Customize the email templates in Hebrew:

**Confirm signup:**
```html
<h2>ברוכים הבאים לליגת הניחושים!</h2>
<p>לחצו על הקישור למטה כדי לאשר את האימייל שלכם:</p>
<p><a href="{{ .ConfirmationURL }}">אשר אימייל</a></p>
```

**Reset password:**
```html
<h2>איפוס סיסמה</h2>
<p>לחצו על הקישור למטה כדי לאפס את הסיסמה:</p>
<p><a href="{{ .ConfirmationURL }}">איפוס סיסמה</a></p>
```

## 6. Set Up Storage (Optional)

If you want to store user avatars or team logos:

1. Go to Storage in your Supabase dashboard
2. Create a bucket called `avatars`
3. Create a bucket called `team-logos`
4. Set up storage policies:

```sql
-- Allow users to upload their own avatars
CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view all avatars
CREATE POLICY "Anyone can view avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Allow authenticated users to view team logos
CREATE POLICY "Authenticated users can view team logos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'team-logos' 
  AND auth.role() = 'authenticated'
);
```

## 7. Configure Real-time

1. Go to Settings → API in your Supabase dashboard
2. Scroll down to "Realtime"
3. Enable realtime for the following tables:
   - `chat_messages`
   - `matches`
   - `predictions`
   - `leaderboards`
   - `group_members`

## 8. Test Your Setup

Run the following queries in the SQL Editor to verify everything is working:

```sql
-- Test basic functionality
SELECT * FROM public.leagues LIMIT 5;
SELECT * FROM public.teams LIMIT 5;

-- Test functions
SELECT public.calculate_prediction_points(2, 1, 2, 1); -- Should return 5
SELECT public.calculate_prediction_points(2, 1, 3, 0); -- Should return 1
SELECT public.calculate_prediction_points(2, 1, 1, 2); -- Should return 0
```

## 9. Security Checklist

✅ RLS is enabled on all tables
✅ Proper authentication policies are in place
✅ Service role key is kept secret
✅ Environment variables are not committed to git
✅ Database functions use SECURITY DEFINER where appropriate
✅ Proper indexes are created for performance

## 10. Performance Optimization

### Recommended Indexes (already included in schema):
- Group members by group_id and user_id
- Matches by group_id and status
- Predictions by match_id and user_id
- Chat messages by group_id and created_at

### Database Settings:
Consider upgrading to a paid plan for production with:
- Dedicated compute
- Connection pooling
- Point-in-time recovery
- Read replicas (if needed)

## 11. Monitoring and Maintenance

1. **Monitor Usage**: Check your Supabase dashboard regularly for:
   - Database usage
   - API requests
   - Realtime connections
   - Storage usage

2. **Backup Strategy**: 
   - Enable automated backups in your project settings
   - Consider additional backup solutions for critical data

3. **Performance Monitoring**:
   - Monitor slow queries in the Logs section
   - Set up alerts for high resource usage

## 12. Production Deployment

Before going live:

1. **Environment Variables**:
   - Set up production environment variables
   - Use secure methods to deploy secrets

2. **Domain Configuration**:
   - Set up custom domain (optional)
   - Configure proper CORS settings

3. **Rate Limiting**:
   - Configure rate limits for your API
   - Set up proper error handling in your app

4. **SSL/Security**:
   - Ensure all connections use HTTPS
   - Review and test all RLS policies

## 13. Mobile App Integration

Your React Native app is already configured with:
- Supabase client in `lib/supabase.ts`
- Authentication service in `lib/auth.ts`
- API service layer in `lib/api.ts`
- Real-time subscriptions in `lib/realtime.ts`

To use these services in your components:

```typescript
import { AuthService } from '../lib/auth'
import { APIService } from '../lib/api'
import { RealtimeService } from '../lib/realtime'

// Example usage
const { user } = useAuth()
const { groups } = await APIService.getUserGroups()
const subscription = RealtimeService.subscribeToGroupChat(groupId, onMessage)
```

## Troubleshooting

### Common Issues:

1. **Connection Issues**:
   - Verify your environment variables
   - Check internet connection
   - Ensure project is not paused

2. **Authentication Issues**:
   - Verify RLS policies
   - Check user permissions
   - Ensure proper session handling

3. **Real-time Issues**:
   - Verify realtime is enabled for tables
   - Check subscription limits
   - Monitor connection status

4. **Performance Issues**:
   - Check for missing indexes
   - Monitor query performance
   - Consider upgrading plan

For more help, check the [Supabase Documentation](https://supabase.com/docs) or reach out to support.