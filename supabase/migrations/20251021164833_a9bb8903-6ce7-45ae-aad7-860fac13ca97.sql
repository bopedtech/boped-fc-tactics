-- Drop existing composite primary key and recreate table with simple primary key
DROP TABLE IF EXISTS public.leagues CASCADE;

CREATE TABLE public.leagues (
    -- Simple primary key (Universal ID)
    id BIGINT PRIMARY KEY,

    -- Data fields from API (camelCase convention)
    name TEXT NOT NULL,
    image TEXT,

    -- System fields
    "rawData" JSONB NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Leagues are viewable by everyone" 
ON public.leagues 
FOR SELECT 
USING (true);

COMMENT ON TABLE public.leagues IS 'Stores universal league information from Renderz API (not season-specific).';