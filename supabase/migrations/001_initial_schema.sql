-- LaunchPad Initial Database Schema
-- Creates all tables with Row Level Security (RLS) enabled

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('owner', 'va');
CREATE TYPE prospect_status AS ENUM ('new', 'contacted', 'responded', 'converted', 'not_interested');
CREATE TYPE outreach_status AS ENUM ('draft', 'scheduled', 'sent', 'delivered', 'opened', 'replied', 'bounced');
CREATE TYPE outreach_channel AS ENUM ('email', 'linkedin', 'reddit', 'facebook');
CREATE TYPE activity_type AS ENUM ('prospect_added', 'prospect_updated', 'outreach_sent', 'response_received', 'campaign_created', 'template_created');

-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'owner',
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  product_description TEXT,
  target_buyer TEXT,
  price_point TEXT,
  geography TEXT,
  launch_brief JSONB, -- Stores AI-generated launch strategy
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prospects table
CREATE TABLE prospects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  name TEXT,
  company TEXT,
  title TEXT,
  phone TEXT,
  linkedin_url TEXT,
  website TEXT,
  notes TEXT,
  status prospect_status NOT NULL DEFAULT 'new',
  score INTEGER CHECK (score >= 0 AND score <= 100), -- AI-generated prospect score
  custom_fields JSONB, -- Additional flexible data
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Outreach table (emails, messages, social posts)
CREATE TABLE outreach (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  channel outreach_channel NOT NULL,
  status outreach_status NOT NULL DEFAULT 'draft',
  subject TEXT,
  body TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  sequence_step INTEGER DEFAULT 1, -- For drip sequences
  parent_outreach_id UUID REFERENCES outreach(id), -- For follow-ups
  metadata JSONB, -- Channel-specific data (message_id, etc.)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Templates table
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  channel outreach_channel NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  variables JSONB, -- Template variables like {{name}}, {{company}}
  is_active BOOLEAN NOT NULL DEFAULT true,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sequences table (email drip sequences)
CREATE TABLE sequences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  steps JSONB NOT NULL, -- Array of {template_id, delay_days, channel}
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Activity log table
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES auth.users(id), -- Who performed the action (owner or VA)
  activity_type activity_type NOT NULL,
  entity_type TEXT NOT NULL, -- prospects, outreach, campaigns, etc.
  entity_id UUID NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reddit keywords monitor table
CREATE TABLE reddit_monitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  keywords TEXT[] NOT NULL,
  subreddits TEXT[],
  last_checked_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reddit posts found table
CREATE TABLE reddit_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  monitor_id UUID NOT NULL REFERENCES reddit_monitors(id) ON DELETE CASCADE,
  reddit_post_id TEXT NOT NULL UNIQUE,
  subreddit TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  author TEXT NOT NULL,
  url TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  num_comments INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL,
  discovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_prospects_user_id ON prospects(user_id);
CREATE INDEX idx_prospects_campaign_id ON prospects(campaign_id);
CREATE INDEX idx_prospects_email ON prospects(email);
CREATE INDEX idx_prospects_status ON prospects(status);

CREATE INDEX idx_outreach_user_id ON outreach(user_id);
CREATE INDEX idx_outreach_prospect_id ON outreach(prospect_id);
CREATE INDEX idx_outreach_campaign_id ON outreach(campaign_id);
CREATE INDEX idx_outreach_status ON outreach(status);
CREATE INDEX idx_outreach_scheduled_at ON outreach(scheduled_at);

CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_templates_user_id ON templates(user_id);
CREATE INDEX idx_sequences_user_id ON sequences(user_id);
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at DESC);

CREATE INDEX idx_reddit_monitors_user_id ON reddit_monitors(user_id);
CREATE INDEX idx_reddit_posts_monitor_id ON reddit_posts(monitor_id);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE reddit_monitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE reddit_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for campaigns
CREATE POLICY "Users can view own campaigns" ON campaigns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own campaigns" ON campaigns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own campaigns" ON campaigns FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own campaigns" ON campaigns FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for prospects (owner full access, VA read + execute only)
CREATE POLICY "Users can view own prospects" ON prospects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own prospects" ON prospects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own prospects" ON prospects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own prospects" ON prospects FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for outreach
CREATE POLICY "Users can view own outreach" ON outreach FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own outreach" ON outreach FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own outreach" ON outreach FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own outreach" ON outreach FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for templates (owners only)
CREATE POLICY "Users can view own templates" ON templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own templates" ON templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own templates" ON templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own templates" ON templates FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for sequences
CREATE POLICY "Users can view own sequences" ON sequences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sequences" ON sequences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sequences" ON sequences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sequences" ON sequences FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for activity_log
CREATE POLICY "Users can view own activity" ON activity_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert activity" ON activity_log FOR INSERT WITH CHECK (auth.uid() = actor_id);

-- RLS Policies for reddit_monitors
CREATE POLICY "Users can view own monitors" ON reddit_monitors FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own monitors" ON reddit_monitors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own monitors" ON reddit_monitors FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own monitors" ON reddit_monitors FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for reddit_posts
CREATE POLICY "Users can view posts from own monitors" ON reddit_posts FOR SELECT
  USING (EXISTS (SELECT 1 FROM reddit_monitors WHERE reddit_monitors.id = reddit_posts.monitor_id AND reddit_monitors.user_id = auth.uid()));

-- Create trigger functions for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to update updated_at on all relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prospects_updated_at BEFORE UPDATE ON prospects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_outreach_updated_at BEFORE UPDATE ON outreach FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sequences_updated_at BEFORE UPDATE ON sequences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reddit_monitors_updated_at BEFORE UPDATE ON reddit_monitors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
