-- Update the existing database to work with Supabase Auth
-- This script will modify your existing tables to be compatible with Supabase

-- First, let's add missing columns to users table if they don't exist
DO $$
BEGIN
    -- Add auth_id column to link with Supabase Auth
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'auth_id') THEN
        ALTER TABLE users ADD COLUMN auth_id UUID UNIQUE;
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'updated_at') THEN
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add email_confirmed column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email_confirmed') THEN
        ALTER TABLE users ADD COLUMN email_confirmed BOOLEAN DEFAULT FALSE;
    END IF;
END
$$;

-- Update server_status table to match expected structure
DO $$
BEGIN
    -- Add server_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'server_status' AND column_name = 'server_name') THEN
        ALTER TABLE server_status ADD COLUMN server_name VARCHAR(255) DEFAULT 'Private Java SMP';
    END IF;
    
    -- Add server_ip column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'server_status' AND column_name = 'server_ip') THEN
        ALTER TABLE server_status ADD COLUMN server_ip VARCHAR(255) DEFAULT 'private-java-smp.aternos.me:42323';
    END IF;
    
    -- Rename 'online' to 'is_online' if needed
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'server_status' AND column_name = 'online') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'server_status' AND column_name = 'is_online') THEN
        ALTER TABLE server_status RENAME COLUMN online TO is_online;
    END IF;
    
    -- Rename 'last_updated' to 'updated_at' if needed
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'server_status' AND column_name = 'last_updated') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'server_status' AND column_name = 'updated_at') THEN
        ALTER TABLE server_status RENAME COLUMN last_updated TO updated_at;
    END IF;
END
$$;

-- Insert default server status if table is empty
INSERT INTO server_status (server_name, server_ip, is_online, player_count, max_players, version, updated_at)
SELECT 'Private Java SMP', 'private-java-smp.aternos.me:42323', true, 12, 20, 'Java 1.20.4', NOW()
WHERE NOT EXISTS (SELECT 1 FROM server_status);

-- Create a function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (auth_id, email, username, bio, rank, email_confirmed, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        'New member of the Private Java SMP!',
        'Member',
        NEW.email_confirmed_at IS NOT NULL,
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION handle_new_user();
    END IF;
END
$$;

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE vip_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE vip_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_rules ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

DROP POLICY IF EXISTS "Anyone can view gallery" ON gallery;
DROP POLICY IF EXISTS "Users can insert own gallery items" ON gallery;
DROP POLICY IF EXISTS "Users can update own gallery items" ON gallery;
DROP POLICY IF EXISTS "Users can delete own gallery items" ON gallery;

DROP POLICY IF EXISTS "Anyone can view server status" ON server_status;
DROP POLICY IF EXISTS "Anyone can view vip packages" ON vip_packages;
DROP POLICY IF EXISTS "Anyone can view vip benefits" ON vip_benefits;
DROP POLICY IF EXISTS "Anyone can view server rules" ON server_rules;
DROP POLICY IF EXISTS "Users can view own purchases" ON purchases;

-- Create RLS policies for users table
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = auth_id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = auth_id);

-- Create RLS policies for gallery table
CREATE POLICY "Anyone can view gallery" ON gallery FOR SELECT USING (true);
CREATE POLICY "Users can insert own gallery items" ON gallery FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND id = user_id)
);
CREATE POLICY "Users can update own gallery items" ON gallery FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND id = user_id)
);
CREATE POLICY "Users can delete own gallery items" ON gallery FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND id = user_id)
);

-- Create RLS policies for other tables
CREATE POLICY "Anyone can view server status" ON server_status FOR SELECT USING (true);
CREATE POLICY "Anyone can view vip packages" ON vip_packages FOR SELECT USING (true);
CREATE POLICY "Anyone can view vip benefits" ON vip_benefits FOR SELECT USING (true);
CREATE POLICY "Anyone can view server rules" ON server_rules FOR SELECT USING (true);
CREATE POLICY "Users can view own purchases" ON purchases FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND id = user_id)
);
