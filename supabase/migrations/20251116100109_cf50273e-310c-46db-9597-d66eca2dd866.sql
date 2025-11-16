-- Create sync state table for resumable synchronization
CREATE TABLE public.sync_state (
  job_name TEXT PRIMARY KEY,
  last_cursor JSONB,
  is_complete BOOLEAN DEFAULT FALSE,
  total_synced INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.sync_state ENABLE ROW LEVEL SECURITY;

-- Allow admins to view sync state
CREATE POLICY "Admins can view sync state"
ON public.sync_state
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('super_admin', 'admin')
  )
);

-- Allow service role to manage sync state
CREATE POLICY "Service role can manage sync state"
ON public.sync_state
FOR ALL
USING (auth.jwt()->>'role' = 'service_role')
WITH CHECK (auth.jwt()->>'role' = 'service_role');