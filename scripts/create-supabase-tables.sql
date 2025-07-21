-- Create users table with additional fields
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  bio TEXT,
  profile_picture_url TEXT,
  rank TEXT DEFAULT 'Member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gallery table
CREATE TABLE IF NOT EXISTS public.gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create server_status table
CREATE TABLE IF NOT EXISTS public.server_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  server_name TEXT NOT NULL DEFAULT 'Private Java SMP',
  server_ip TEXT NOT NULL DEFAULT 'private-java-smp.aternos.me:42323',
  is_online BOOLEAN DEFAULT true,
  player_count INTEGER DEFAULT 12,
  max_players INTEGER DEFAULT 20,
  version TEXT DEFAULT 'Java 1.20.4',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shop_items table
CREATE TABLE IF NOT EXISTS public.shop_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category TEXT DEFAULT 'VIP',
  tier TEXT DEFAULT 'bronze',
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default server status
INSERT INTO public.server_status (server_name, server_ip, is_online, player_count, max_players, version)
VALUES ('Private Java SMP', 'private-java-smp.aternos.me:42323', true, 12, 20, 'Java 1.20.4')
ON CONFLICT DO NOTHING;

-- Insert default shop items
INSERT INTO public.shop_items (name, description, price, image_url, category, tier)
VALUES 
  ('Bronze VIP', 'Early access to new minigames, 10% store discount, exclusive kits, priority queues, Bronze chat emblem', 4.00, '/bronze-vip.jpeg', 'VIP', 'bronze'),
  ('Silver VIP', 'All Bronze benefits plus 20% store discount, exclusive Silver minigame, Silver chat emblem', 7.00, '/silver-vip.jpeg', 'VIP', 'silver'),
  ('Gold VIP', 'All Silver benefits plus 50% store discount, daily rewards, exclusive voice channel, Gold chat emblem', 10.00, '/gold-vip.jpeg', 'VIP', 'gold')
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.server_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

CREATE POLICY "Users can view all profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for gallery table
DROP POLICY IF EXISTS "Anyone can view gallery" ON public.gallery;
DROP POLICY IF EXISTS "Users can insert own gallery items" ON public.gallery;
DROP POLICY IF EXISTS "Users can update own gallery items" ON public.gallery;
DROP POLICY IF EXISTS "Users can delete own gallery items" ON public.gallery;

CREATE POLICY "Anyone can view gallery" ON public.gallery FOR SELECT USING (true);
CREATE POLICY "Users can insert own gallery items" ON public.gallery FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own gallery items" ON public.gallery FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own gallery items" ON public.gallery FOR DELETE USING (auth.uid() = user_id);

-- Create policies for server_status table
DROP POLICY IF EXISTS "Anyone can view server status" ON public.server_status;
CREATE POLICY "Anyone can view server status" ON public.server_status FOR SELECT USING (true);

-- Create policies for shop_items table
DROP POLICY IF EXISTS "Anyone can view shop items" ON public.shop_items;
CREATE POLICY "Anyone can view shop items" ON public.shop_items FOR SELECT USING (true);
