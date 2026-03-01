-- Campaign Actions: executable action items generated from launch briefs
-- Each action is tied to a specific day (1-7) and channel

CREATE TABLE campaign_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day INTEGER NOT NULL CHECK (day >= 1 AND day <= 7),
  channel TEXT NOT NULL,              -- 'email', 'linkedin', 'reddit', 'facebook', 'scrape', 'task'
  action_type TEXT NOT NULL,          -- 'email_draft', 'social_post', 'scrape_config', 'manual_task'
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'skipped')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_campaign_actions_campaign ON campaign_actions(campaign_id);
CREATE INDEX idx_campaign_actions_day ON campaign_actions(campaign_id, day);
CREATE INDEX idx_campaign_actions_status ON campaign_actions(campaign_id, status);

-- Add activated_at to campaigns
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ;

-- RLS
ALTER TABLE campaign_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own campaign actions"
  ON campaign_actions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own campaign actions"
  ON campaign_actions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaign actions"
  ON campaign_actions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaign actions"
  ON campaign_actions FOR DELETE
  USING (auth.uid() = user_id);
