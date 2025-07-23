-- Fix the admin system by ensuring all columns exist first

-- Add missing columns to users table if they don't exist
DO $$
BEGIN
    -- Add is_admin column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_admin') THEN
        ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add auth_id column if it doesn't exist
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

-- Create shop_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.shop_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category TEXT DEFAULT 'VIP',
  tier TEXT DEFAULT 'bronze',
  is_available BOOLEAN DEFAULT true,
  created_by INTEGER REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vip_packages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.vip_packages (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  tier TEXT NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_by INTEGER REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vip_benefits table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.vip_benefits (
  id SERIAL PRIMARY KEY,
  package_id INTEGER REFERENCES public.vip_packages(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_actions table for audit logging
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id SERIAL PRIMARY KEY,
  admin_user_id INTEGER REFERENCES public.users(id) ON DELETE CASCADE,
  target_user_id INTEGER REFERENCES public.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'assign_vip', 'remove_vip', 'add_item', 'edit_item', etc.
  old_value TEXT,
  new_value TEXT,
  reason TEXT,
  item_data JSONB, -- For storing item details when adding/editing shop items
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

-- Insert or update the admin user (skipscape.dev@gmail.com)
INSERT INTO public.users (email, username, bio, rank, is_admin, email_confirmed, created_at, updated_at)
VALUES (
  'skipscape.dev@gmail.com',
  'skipscape_admin',
  'Server Administrator - Master of the Minecraft Realm',
  'Admin',
  TRUE,
  TRUE,
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  is_admin = TRUE,
  rank = 'Admin',
  email_confirmed = TRUE,
  bio = 'Server Administrator - Master of the Minecraft Realm',
  updated_at = NOW();

-- Create function to handle new user registration with proper error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert new user profile, handling conflicts gracefully
    INSERT INTO public.users (auth_id, email, username, bio, rank, is_admin, email_confirmed, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        CASE 
            WHEN NEW.email = 'skipscape.dev@gmail.com' THEN 'Server Administrator - Master of the Minecraft Realm'
            ELSE 'New crafter in the Private Java SMP world!'
        END,
        CASE 
            WHEN NEW.email = 'skipscape.dev@gmail.com' THEN 'Admin'
            ELSE 'Member'
        END,
        NEW.email = 'skipscape.dev@gmail.com',
        NEW.email_confirmed_at IS NOT NULL,
        NOW(),
        NOW()
    ) ON CONFLICT (auth_id) DO UPDATE SET
        email_confirmed = NEW.email_confirmed_at IS NOT NULL,
        is_admin = CASE WHEN NEW.email = 'skipscape.dev@gmail.com' THEN TRUE ELSE users.is_admin END,
        rank = CASE WHEN NEW.email = 'skipscape.dev@gmail.com' THEN 'Admin' ELSE users.rank END,
        updated_at = NOW();
    
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

-- Create function to assign VIP status
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

-- Create function to add shop item
CREATE OR REPLACE FUNCTION add_shop_item(
    item_name TEXT,
    item_description TEXT,
    item_price DECIMAL,
    item_image_url TEXT,
    item_category TEXT,
    item_tier TEXT,
    admin_user_id INTEGER
)
RETURNS INTEGER AS $$
DECLARE
    new_item_id INTEGER;
    item_data JSONB;
BEGIN
    -- Insert new shop item
    INSERT INTO public.shop_items (name, description, price, image_url, category, tier, created_by)
    VALUES (item_name, item_description, item_price, item_image_url, item_category, item_tier, admin_user_id)
    RETURNING id INTO new_item_id;
    
    -- Prepare item data for logging
    item_data := jsonb_build_object(
        'name', item_name,
        'description', item_description,
        'price', item_price,
        'category', item_category,
        'tier', item_tier
    );
    
    -- Log admin action
    INSERT INTO public.admin_actions (admin_user_id, action_type, new_value, item_data)
    VALUES (admin_user_id, 'add_shop_item', item_name, item_data);
    
    RETURN new_item_id;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in add_shop_item: %', SQLERRM;
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vip_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vip_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vip_benefits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view admin actions" ON public.admin_actions;
DROP POLICY IF EXISTS "Admins can insert admin actions" ON public.admin_actions;
DROP POLICY IF EXISTS "Admins can view vip assignments" ON public.vip_assignments;
DROP POLICY IF EXISTS "Admins can manage vip assignments" ON public.vip_assignments;
DROP POLICY IF EXISTS "Anyone can view shop items" ON public.shop_items;
DROP POLICY IF EXISTS "Admins can manage shop items" ON public.shop_items;
DROP POLICY IF EXISTS "Anyone can view vip packages" ON public.vip_packages;
DROP POLICY IF EXISTS "Admins can manage vip packages" ON public.vip_packages;
DROP POLICY IF EXISTS "Anyone can view vip benefits" ON public.vip_benefits;
DROP POLICY IF EXISTS "Admins can manage vip benefits" ON public.vip_benefits;

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

-- Shop items policies
CREATE POLICY "Anyone can view shop items" ON public.shop_items FOR SELECT USING (true);
CREATE POLICY "Admins can manage shop items" ON public.shop_items FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND is_admin = true)
);

-- VIP packages policies
CREATE POLICY "Anyone can view vip packages" ON public.vip_packages FOR SELECT USING (true);
CREATE POLICY "Admins can manage vip packages" ON public.vip_packages FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND is_admin = true)
);

-- VIP benefits policies
CREATE POLICY "Anyone can view vip benefits" ON public.vip_benefits FOR SELECT USING (true);
CREATE POLICY "Admins can manage vip benefits" ON public.vip_benefits FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND is_admin = true)
);

-- Insert default VIP packages with Minecraft theming
INSERT INTO public.vip_packages (name, description, price, tier, image_url, is_available)
VALUES 
  ('Bronze VIP', 'Entry level VIP package - Start your adventure with basic perks!', 4.00, 'bronze', '/bronze-vip.jpeg', true),
  ('Silver VIP', 'Mid-tier VIP package - Enhanced benefits for dedicated miners!', 7.00, 'silver', '/silver-vip.jpeg', true),
  ('Gold VIP', 'Premium VIP package - Ultimate power for true Minecraft legends!', 10.00, 'gold', '/gold-vip.jpeg', true)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  updated_at = NOW();

-- Insert VIP benefits with Minecraft theming
DELETE FROM public.vip_benefits; -- Clear existing benefits first

INSERT INTO public.vip_benefits (package_id, description)
SELECT p.id, benefit.description
FROM public.vip_packages p
CROSS JOIN (
  VALUES 
    ('bronze', '⚡ Early access to new minigames and adventures!'),
    ('bronze', '💰 10% discount on all items in the server store'),
    ('bronze', '🎒 Access to exclusive Bronze VIP starter kits'),
    ('bronze', '🚀 Priority queue access for popular minigames'),
    ('bronze', '🏆 Exclusive Bronze emblem in chat - show your status!'),
    ('silver', '✨ All Bronze VIP advantages included'),
    ('silver', '💎 20% discount on all server store purchases'),
    ('silver', '🎮 Access to exclusive Silver-only minigames'),
    ('silver', '🛡️ Enhanced protection and exclusive Silver kits'),
    ('silver', '⭐ Prestigious Silver emblem in chat'),
    ('gold', '🌟 All Silver VIP advantages and more!'),
    ('gold', '💸 50% discount on all items - maximum savings!'),
    ('gold', '🎁 Daily login rewards and special bonuses'),
    ('gold', '🎤 Access to exclusive Gold VIP voice channels'),
    ('gold', '👑 Legendary Gold emblem - ultimate prestige!')
) AS benefit(tier, description)
WHERE p.tier = benefit.tier;

-- Insert some default shop items
INSERT INTO public.shop_items (name, description, price, image_url, category, tier, is_available)
VALUES 
  ('Bronze VIP Rank', 'Entry level VIP package - Start your adventure with basic perks!', 4.00, '/bronze-vip.jpeg', 'VIP', 'bronze', true),
  ('Silver VIP Rank', 'Mid-tier VIP package - Enhanced benefits for dedicated miners!', 7.00, '/silver-vip.jpeg', 'VIP', 'silver', true),
  ('Gold VIP Rank', 'Premium VIP package - Ultimate power for true Minecraft legends!', 10.00, '/gold-vip.jpeg', 'VIP', 'gold', true)
ON CONFLICT DO NOTHING;
