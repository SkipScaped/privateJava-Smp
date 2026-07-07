-- ============================================================================
-- Minecraft Server Community Database Setup
-- ============================================================================
-- Instructions: Run this entire script in Supabase SQL Editor

-- ============================================================================
-- 1. CREATE PROFILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  rank TEXT DEFAULT 'member' CHECK (rank IN ('admin', 'moderator', 'vip', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. CREATE VIP PACKAGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS vip_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  duration_days INTEGER NOT NULL,
  features JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE vip_packages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. CREATE USER SUBSCRIPTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES vip_packages(id) ON DELETE CASCADE,
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  UNIQUE(user_id, package_id)
);

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. CREATE SERVER INFO TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS server_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  port INTEGER NOT NULL,
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline')),
  player_count INTEGER DEFAULT 0,
  max_players INTEGER DEFAULT 20,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE server_info ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. CREATE RULES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE rules ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 6. CREATE GALLERY TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  likes_count INTEGER DEFAULT 0
);

ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 7. CREATE ANNOUNCEMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 8. CREATE ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Rules policies (public read)
CREATE POLICY "Public can read rules" ON rules FOR SELECT USING (true);
CREATE POLICY "Admin can write rules" ON rules FOR INSERT WITH CHECK (false);

-- VIP Packages policies (public read)
CREATE POLICY "Public can read VIP packages" ON vip_packages FOR SELECT USING (true);
CREATE POLICY "Admin can manage packages" ON vip_packages FOR INSERT WITH CHECK (false);

-- Server Info policies (public read)
CREATE POLICY "Public can read server info" ON server_info FOR SELECT USING (true);
CREATE POLICY "Admin can update server info" ON server_info FOR UPDATE WITH CHECK (false);

-- Announcements policies
CREATE POLICY "Public can read announcements" ON announcements FOR SELECT USING (true);
CREATE POLICY "Admin can create announcements" ON announcements FOR INSERT WITH CHECK (false);

-- Gallery policies
CREATE POLICY "Public can read gallery" ON gallery FOR SELECT USING (true);
CREATE POLICY "Users can upload to gallery" ON gallery FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Profiles policies
CREATE POLICY "Public can read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions FOR SELECT USING (auth.uid()::text = user_id::text);

-- ============================================================================
-- 9. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_gallery_user_id ON gallery(user_id);
CREATE INDEX IF NOT EXISTS idx_announcements_author_id ON announcements(author_id);
CREATE INDEX IF NOT EXISTS idx_rules_order ON rules("order");

-- ============================================================================
-- 10. INSERT SAMPLE DATA (Optional)
-- ============================================================================

-- Insert sample server info
INSERT INTO server_info (name, ip_address, port, status, player_count, max_players)
VALUES ('Private Java SMP', 'private-java-smp.aternos.me', 46436, 'online', 5, 20)
ON CONFLICT DO NOTHING;

-- Insert sample VIP packages
INSERT INTO vip_packages (name, price, duration_days, features)
VALUES 
  ('Basic VIP', 9.99, 30, '{"perks": ["custom-skin", "priority-join"]}'),
  ('Premium VIP', 19.99, 30, '{"perks": ["custom-skin", "priority-join", "home-teleport"]}'),
  ('Deluxe VIP', 29.99, 30, '{"perks": ["custom-skin", "priority-join", "home-teleport", "shop-discount"]}')
ON CONFLICT DO NOTHING;

-- Insert sample rules
INSERT INTO rules (title, description, category, "order")
VALUES 
  ('No Griefing', 'Do not destroy other players\' builds without permission', 'General', 1),
  ('Be Respectful', 'Treat all players with respect and kindness', 'General', 2),
  ('No Hacking', 'Using hacks or cheats is strictly prohibited', 'General', 3),
  ('No Spam', 'Do not spam chat or abuse the communication system', 'Chat', 4)
ON CONFLICT DO NOTHING;
