# Minecraft Server Community - Setup Guide

## Fixed Issues
✅ Server IP updated to: `private-java-smp.aternos.me:46436`
✅ Discord links updated to: `https://discord.gg/bqktdUmezj`
✅ Email authentication enabled
✅ New Supabase schema created

## Supabase Setup

### Step 1: Create New Supabase Project
1. Go to https://supabase.com
2. Create a new project (or use existing one)
3. Copy your project URL and anon key

### Step 2: Add Environment Variables
In your Vercel/v0 Settings → Vars, add:
```
NEXT_PUBLIC_SUPABASE_URL=<your_supabase_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_supabase_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key>
```

### Step 3: Create Database Schema
1. Open your Supabase project
2. Go to SQL Editor
3. Copy the entire contents of `supabase-setup.sql` from this project
4. Paste into SQL Editor
5. Run the script

The script will create:
- `profiles` - User profiles and ranks
- `vip_packages` - VIP subscription tiers
- `user_subscriptions` - Track active VIP purchases
- `server_info` - Server status and player count
- `rules` - Server rules
- `gallery` - User-uploaded images
- `announcements` - Server announcements

### Step 4: Enable Email Auth in Supabase
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable "Email" provider
3. Configure email settings if needed

### Step 5: Test the App
- Sign up with email auth
- Login
- Check server status
- View rules and announcements

## Database Schema

### Profiles Table
```
- id (UUID, primary key)
- user_id (UUID, unique, from auth.users)
- username (TEXT, unique)
- bio (TEXT)
- avatar_url (TEXT)
- rank (TEXT: admin, moderator, vip, member)
- created_at, updated_at (timestamps)
```

### VIP Packages Table
```
- id (UUID)
- name (TEXT)
- price (DECIMAL)
- duration_days (INTEGER)
- features (JSONB)
- created_at (timestamp)
```

### User Subscriptions Table
```
- id (UUID)
- user_id (UUID, foreign key)
- package_id (UUID, foreign key)
- purchase_date (timestamp)
- expiry_date (timestamp)
- status (TEXT: active, expired, cancelled)
```

### Server Info Table
```
- id (UUID)
- name (TEXT)
- ip_address (TEXT)
- port (INTEGER)
- status (TEXT: online, offline)
- player_count (INTEGER)
- max_players (INTEGER)
- last_updated (timestamp)
```

### Rules Table
```
- id (UUID)
- title (TEXT)
- description (TEXT)
- category (TEXT)
- order (INTEGER)
- created_at (timestamp)
```

### Gallery Table
```
- id (UUID)
- user_id (UUID, foreign key)
- title (TEXT)
- description (TEXT)
- image_url (TEXT)
- uploaded_at (timestamp)
- likes_count (INTEGER)
```

### Announcements Table
```
- id (UUID)
- title (TEXT)
- content (TEXT)
- author_id (UUID, foreign key)
- published_at (timestamp)
- created_at (timestamp)
```

## API Routes

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/signin` - Login with email/password

### Data Endpoints
- `GET /api/server` - Get server status
- `GET /api/rules` - Get all rules
- `GET /api/vip-packages` - Get VIP packages
- `GET /api/announcements` - Get announcements

## Troubleshooting

### Connection Timeouts
If you see connection timeouts:
1. Check your Supabase project status
2. Verify environment variables are set correctly
3. Ensure your IP is not blocked in Supabase settings

### Email Auth Not Working
1. Verify email provider is enabled in Supabase
2. Check email confirmation settings
3. Ensure SMTP is configured if using custom emails

### Row Level Security (RLS) Errors
- All tables have RLS enabled with public read access
- For write operations, users must be authenticated
- Check the RLS policies in the SQL setup script

## Next Steps
1. Run the SQL setup script in Supabase
2. Configure authentication redirects
3. Update content in admin panel
4. Test all features before going live
