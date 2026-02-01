-- Create subscribers table
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  unsubscribe_token UUID DEFAULT gen_random_uuid() UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create newsletters table
CREATE TABLE IF NOT EXISTS newsletters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  content JSONB NOT NULL, -- Store newsletter sections as JSON
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent')),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_token ON subscribers(unsubscribe_token);
CREATE INDEX IF NOT EXISTS idx_newsletters_status ON newsletters(status);
CREATE INDEX IF NOT EXISTS idx_newsletters_sent_at ON newsletters(sent_at);

-- Enable Row Level Security (RLS)
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscribers (allow public inserts for signup, but restrict other operations)
CREATE POLICY "Allow public to subscribe" ON subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read for authenticated users" ON subscribers
  FOR SELECT USING (true);

CREATE POLICY "Allow update for authenticated users" ON subscribers
  FOR UPDATE USING (true);

-- RLS Policies for newsletters (public can read sent newsletters, all operations for authenticated)
CREATE POLICY "Allow public to read sent newsletters" ON newsletters
  FOR SELECT USING (status = 'sent');

CREATE POLICY "Allow all operations for authenticated users" ON newsletters
  FOR ALL USING (true);
