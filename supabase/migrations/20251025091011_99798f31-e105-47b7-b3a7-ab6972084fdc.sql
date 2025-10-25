-- Create localization_dictionary table
CREATE TABLE IF NOT EXISTS public.localization_dictionary (
    "key" TEXT PRIMARY KEY,
    "value_en" TEXT NOT NULL,
    "source" TEXT DEFAULT 'Renderz_Runtime_Extraction',
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.localization_dictionary IS 'Static localization dictionary extracted from Renderz runtime for translating leagues, clubs, nations, and programs.';

-- Enable RLS
ALTER TABLE public.localization_dictionary ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Localization dictionary is viewable by everyone"
ON public.localization_dictionary
FOR SELECT
USING (true);

-- Migrate leagues table: rename 'name' to 'localizationKey' and add 'displayName'
DO $$
BEGIN
    -- Rename 'name' column to 'localizationKey' if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leagues' 
        AND column_name = 'name'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leagues' 
        AND column_name = 'localizationKey'
    ) THEN
        ALTER TABLE public.leagues RENAME COLUMN "name" TO "localizationKey";
    END IF;
END $$;

-- Add displayName column for translated names
ALTER TABLE public.leagues ADD COLUMN IF NOT EXISTS "displayName" TEXT;

-- Create index on localizationKey for better lookup performance
CREATE INDEX IF NOT EXISTS idx_leagues_localization_key ON public.leagues("localizationKey");