-- Create admin system and fix deployment issues

-- First, ensure all required tables exist with proper structure
CREATE TABLE IF NOT EXISTS public.users (
  id SERIAL PRIMARY KEY,
  auth_id UUID UNIQUE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  bio TEXT,
  profile_picture_url TEXT,
  rank TEXT DEFAULT 'Member',
  is_admin BOOLEAN DEFAULT FALSE,
  email_confirmed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_actions table for audit logging
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id SERIAL PRIMARY KEY,
  admin_user_id INTEGER REFERENCES public.users(id) ON DELETE CASCADE,
  target_user_id INTEGER REFERENCES public.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'assign_vip', 'remove_vip', 'ban_user', etc.
  old_value TEXT,
  new_value TEXT,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vip_assignments table for tracking VIP status
CREATE TABLE IF NOT EXISTS public.vip_assignments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES public.users(id) ON DELETE CASCADE,
  vip_tier TEXT NOT NULL, -- 'Bronze VIP', 'Silver VIP', 'Gold VIP'
  assigned_by INTEGER REFERENCES public.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT
);

-- Insert the admin user (skipscape.dev@gmail.com)
INSERT INTO public.users (email, username, bio, rank, is_admin, email_confirmed, created_at, updated_at)
VALUES (
  'skipscape.dev@gmail.com',
  'skipscape_admin',
  'Server Administrator',
  'Admin',
  TRUE,
  TRUE,
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  is_admin = TRUE,
  rank = 'Admin',
  email_confirmed = TRUE,
  updated_at = NOW();

-- Create function to handle new user registration with proper error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert new user profile, handling conflicts gracefully
    INSERT INTO public.users (auth_id, email, username, bio, rank, email_confirmed, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        'New member of the Private Java SMP!',
        CASE 
            WHEN NEW.email = 'skipscape.dev@gmail.com' THEN 'Admin'
            ELSE 'Member'
        END,
        NEW.email_confirmed_at IS NOT NULL,
        NOW(),
        NOW()
    ) ON CONFLICT (auth_id) DO UPDATE SET
        email_confirmed = NEW.email_confirmed_at IS NOT NULL,
        updated_at = NOW();
    
    -- Set admin status for the specific email
    IF NEW.email = 'skipscape.dev@gmail.com' THEN
        UPDATE public.users SET is_admin = TRUE, rank = 'Admin' WHERE auth_id = NEW.id;
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the auth process
        RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to update user VIP status
CREATE OR REPLACE FUNCTION assign_vip_status(
    target_user_id INTEGER,
    vip_tier TEXT,
    admin_user_id INTEGER,
    reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    old_rank TEXT;
BEGIN
    -- Get current rank
    SELECT rank INTO old_rank FROM public.users WHERE id = target_user_id;
    
    -- Update user rank
    UPDATE public.users 
    SET rank = vip_tier, updated_at = NOW() 
    WHERE id = target_user_id;
    
    -- Insert VIP assignment record
    INSERT INTO public.vip_assignments (user_id, vip_tier, assigned_by, notes)
    VALUES (target_user_id, vip_tier, admin_user_id, reason);
    
    -- Log admin action
    INSERT INTO public.admin_actions (admin_user_id, target_user_id, action_type, old_value, new_value, reason)
    VALUES (admin_user_id, target_user_id, 'assign_vip', old_rank, vip_tier, reason);
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in assign_vip_status: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vip_assignments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view admin actions" ON public.admin_actions;
DROP POLICY IF EXISTS "Admins can insert admin actions" ON public.admin_actions;
DROP POLICY IF EXISTS "Admins can view vip assignments" ON public.vip_assignments;
DROP POLICY IF EXISTS "Admins can manage vip assignments" ON public.vip_assignments;

-- Create RLS policies
CREATE POLICY "Users can view all profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (
    auth.uid() = auth_id OR 
    EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = auth_id);

-- Admin action policies
CREATE POLICY "Admins can view admin actions" ON public.admin_actions FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Admins can insert admin actions" ON public.admin_actions FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND is_admin = true)
);

-- VIP assignment policies
CREATE POLICY "Admins can view vip assignments" ON public.vip_assignments FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Admins can manage vip assignments" ON public.vip_assignments FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND is_admin = true)
);

-- Insert sample VIP packages if they don't exist
INSERT INTO public.vip_packages (name, description, price, tier, image_url, is_available)
VALUES 
  ('Bronze VIP', 'Entry level VIP package with basic perks', 4.00, 'bronze', '/bronze-vip.jpeg', true),
  ('Silver VIP', 'Mid-tier VIP package with enhanced benefits', 7.00, 'silver', '/silver-vip.jpeg', true),
  ('Gold VIP', 'Premium VIP package with all benefits', 10.00, 'gold', '/gold-vip.jpeg', true)
ON CONFLICT (name) DO NOTHING;

-- Insert VIP benefits
INSERT INTO public.vip_benefits (package_id, description)
SELECT p.id, benefit.description
FROM public.vip_packages p
CROSS JOIN (
  VALUES 
    ('bronze', 'Early access to new minigames that will be launched in the future.'),
    ('bronze', '10% discount on items in the server store.'),
    ('bronze', 'Access to exclusive kits.'),
    ('bronze', 'Prioritization in the entry queues for popular minigames.'),
    ('bronze', 'An exclusive Bronze emblem in the chat.'),
    ('silver', 'All VIP Bronze advantages.'),
    ('silver', '20% discount on items in the server store.'),
    ('silver', 'Access to exclusive kits.'),
    ('silver', 'Access to an exclusive minigame only for Silver members.'),
    ('silver', 'An exclusive Silver emblem in the chat.'),
    ('gold', 'All VIP Silver advantages.'),
    ('gold', '50% discount on items in the server store.'),
    ('gold', 'Daily rewards for logging in to the server.'),
    ('gold', 'Access to an exclusive voice channel for Gold members.'),
    ('gold', 'An exclusive Gold emblem in the chat.')
) AS benefit(tier, description)
WHERE p.tier = benefit.tier
ON CONFLICT DO NOTHING;
