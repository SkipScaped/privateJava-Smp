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
  server_name TEXT NOT NULL,
  server_ip TEXT NOT NULL,
  is_online BOOLEAN DEFAULT false,
  player_count INTEGER DEFAULT 0,
  max_players INTEGER DEFAULT 20,
  version TEXT DEFAULT '1.20.1',
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
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default server status
INSERT INTO public.server_status (server_name, server_ip, is_online, player_count, max_players, version)
VALUES ('Private Java SMP', 'play.private-java-smp.com', true, 12, 20, '1.20.1')
ON CONFLICT DO NOTHING;

-- Insert default shop items
INSERT INTO public.shop_items (name, description, price, image_url, category)
VALUES 
  ('Bronze VIP', 'Access to VIP areas and commands', 9.99, '/bronze-vip.jpeg', 'VIP'),
  ('Silver VIP', 'All Bronze benefits plus exclusive perks', 19.99, '/silver-vip.jpeg', 'VIP'),
  ('Gold VIP', 'Ultimate VIP experience with all perks', 29.99, '/gold-vip.jpeg', 'VIP')
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.server_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view gallery" ON public.gallery FOR SELECT USING (true);
CREATE POLICY "Users can insert own gallery items" ON public.gallery FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own gallery items" ON public.gallery FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own gallery items" ON public.gallery FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view server status" ON public.server_status FOR SELECT USING (true);
CREATE POLICY "Anyone can view shop items" ON public.shop_items FOR SELECT USING (true);
