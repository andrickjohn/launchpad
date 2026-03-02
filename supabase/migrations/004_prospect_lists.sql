-- Create prospect_lists table
CREATE TABLE IF NOT EXISTS prospect_lists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create scrape_jobs table
CREATE TABLE IF NOT EXISTS scrape_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    list_id UUID NOT NULL REFERENCES prospect_lists(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    actor_id TEXT NOT NULL,
    run_input JSONB NOT NULL,
    target_count INTEGER,
    cost_usd NUMERIC(10, 4) DEFAULT 0,
    external_run_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add list_id to prospects table
ALTER TABLE prospects
ADD COLUMN list_id UUID REFERENCES prospect_lists(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE prospect_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrape_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for prospect_lists
CREATE POLICY "Users can view their own prospect lists"
    ON prospect_lists FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prospect lists"
    ON prospect_lists FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prospect lists"
    ON prospect_lists FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prospect lists"
    ON prospect_lists FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for scrape_jobs
CREATE POLICY "Users can view their own scrape jobs"
    ON scrape_jobs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scrape jobs"
    ON scrape_jobs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scrape jobs"
    ON scrape_jobs FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scrape jobs"
    ON scrape_jobs FOR DELETE
    USING (auth.uid() = user_id);

-- Create updated_at trigger for prospect_lists
CREATE TRIGGER update_prospect_lists_updated_at
    BEFORE UPDATE ON prospect_lists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create updated_at trigger for scrape_jobs
CREATE TRIGGER update_scrape_jobs_updated_at
    BEFORE UPDATE ON scrape_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
