/**
 * Database types for LaunchPad
 * These types match the database schema from 001_initial_schema.sql
 */

export type UserRole = 'owner' | 'va'

export type ProspectStatus = 'new' | 'contacted' | 'responded' | 'converted' | 'not_interested'

export type OutreachStatus = 'draft' | 'scheduled' | 'sent' | 'delivered' | 'opened' | 'replied' | 'bounced'

export type OutreachChannel = 'email' | 'linkedin' | 'reddit' | 'facebook'

export type ActivityType =
  | 'prospect_added'
  | 'prospect_updated'
  | 'outreach_sent'
  | 'response_received'
  | 'campaign_created'
  | 'template_created'

export interface Profile {
  id: string
  email: string
  role: UserRole
  invited_by: string | null
  created_at: string
  updated_at: string
}

export interface Campaign {
  id: string
  user_id: string
  name: string
  description: string | null
  product_description: string | null
  target_buyer: string | null
  price_point: string | null
  geography: string | null
  launch_brief: Record<string, unknown> | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Prospect {
  id: string
  user_id: string
  campaign_id: string | null
  email: string
  name: string | null
  company: string | null
  title: string | null
  phone: string | null
  linkedin_url: string | null
  website: string | null
  notes: string | null
  status: ProspectStatus
  score: number | null
  custom_fields: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface Outreach {
  id: string
  user_id: string
  prospect_id: string | null
  campaign_id: string | null
  channel: OutreachChannel
  status: OutreachStatus
  subject: string | null
  body: string
  scheduled_at: string | null
  sent_at: string | null
  opened_at: string | null
  replied_at: string | null
  sequence_step: number
  parent_outreach_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface Template {
  id: string
  user_id: string
  name: string
  channel: OutreachChannel
  subject: string | null
  body: string
  variables: Record<string, unknown> | null
  is_active: boolean
  usage_count: number
  created_at: string
  updated_at: string
}

export interface Sequence {
  id: string
  user_id: string
  campaign_id: string | null
  name: string
  steps: Array<{
    template_id: string
    delay_days: number
    channel: OutreachChannel
  }>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ActivityLog {
  id: string
  user_id: string
  actor_id: string
  activity_type: ActivityType
  entity_type: string
  entity_id: string
  description: string
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface RedditMonitor {
  id: string
  user_id: string
  campaign_id: string | null
  keywords: string[]
  subreddits: string[] | null
  last_checked_at: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface RedditPost {
  id: string
  monitor_id: string
  reddit_post_id: string
  subreddit: string
  title: string
  body: string | null
  author: string
  url: string
  score: number
  num_comments: number
  created_at: string
  discovered_at: string
}

// Extended types with relations
export interface ProspectWithCampaign extends Prospect {
  campaign?: Campaign
}

export interface ProspectWithTimeline extends Prospect {
  outreach: Outreach[]
  campaign?: Campaign
}
