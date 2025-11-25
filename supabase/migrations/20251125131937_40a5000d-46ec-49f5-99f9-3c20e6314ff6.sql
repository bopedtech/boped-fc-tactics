-- 1. Tạo Indexes cho các cột cơ bản
CREATE INDEX IF NOT EXISTS idx_players_rating ON public.players (rating DESC);
CREATE INDEX IF NOT EXISTS idx_players_height ON public.players (height DESC);
CREATE INDEX IF NOT EXISTS idx_players_position ON public.players (position);

-- 2. Expression Indexes cho các chỉ số trong JSONB stats
CREATE INDEX IF NOT EXISTS idx_players_stats_pac ON public.players (
    (CAST((stats->'PAC'->>'value') AS INTEGER)) DESC NULLS LAST
);

CREATE INDEX IF NOT EXISTS idx_players_stats_sho ON public.players (
    (CAST((stats->'SHO'->>'value') AS INTEGER)) DESC NULLS LAST
);

CREATE INDEX IF NOT EXISTS idx_players_stats_pas ON public.players (
    (CAST((stats->'PAS'->>'value') AS INTEGER)) DESC NULLS LAST
);

CREATE INDEX IF NOT EXISTS idx_players_stats_dri ON public.players (
    (CAST((stats->'DRI'->>'value') AS INTEGER)) DESC NULLS LAST
);

CREATE INDEX IF NOT EXISTS idx_players_stats_def ON public.players (
    (CAST((stats->'DEF'->>'value') AS INTEGER)) DESC NULLS LAST
);

CREATE INDEX IF NOT EXISTS idx_players_stats_phy ON public.players (
    (CAST((stats->'PHY'->>'value') AS INTEGER)) DESC NULLS LAST
);

-- 3. Tạo RPC function để truy vấn top players theo stat
CREATE OR REPLACE FUNCTION public.get_top_players_by_stat(
    stat_key TEXT,
    limit_count INTEGER DEFAULT 5,
    sort_asc BOOLEAN DEFAULT FALSE
)
RETURNS TABLE(
    "assetId" BIGINT,
    "commonName" TEXT,
    "rating" INTEGER,
    "position" TEXT,
    "club" JSONB,
    "nation" JSONB,
    "league" JSONB,
    "images" JSONB,
    "stats" JSONB,
    "avgStats" JSONB,
    "avgGkStats" JSONB,
    "statName" TEXT,
    "statValue" INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
    column_name TEXT;
BEGIN
    -- Xác định tên cột vật lý cho các chỉ số cơ bản
    IF stat_key = 'HEIGHT' THEN
        column_name := 'height';
    ELSIF stat_key = 'RATING' THEN
        column_name := 'rating';
    END IF;

    -- Xử lý các Cột Cơ bản (Height, Rating)
    IF column_name IS NOT NULL THEN
        RETURN QUERY EXECUTE format(
            'SELECT 
                p."assetId", 
                p."commonName", 
                p.rating, 
                p.position,
                p.club,
                p.nation,
                p.league,
                p.images,
                p.stats,
                p."avgStats",
                p."avgGkStats",
                %L::TEXT as stat_name, 
                p.%I as stat_value
            FROM public.players p
            WHERE p.is_visible = true
            ORDER BY p.%I %s NULLS LAST
            LIMIT %s',
            stat_key,
            column_name,
            column_name,
            CASE WHEN sort_asc THEN 'ASC' ELSE 'DESC' END,
            limit_count
        );
    -- Xử lý các Cột JSONB (PAC, SHO,...)
    ELSE
        RETURN QUERY EXECUTE format(
            'SELECT
                p."assetId",
                p."commonName",
                p.rating,
                p.position,
                p.club,
                p.nation,
                p.league,
                p.images,
                p.stats,
                p."avgStats",
                p."avgGkStats",
                %L::TEXT as stat_name,
                CAST((p.stats->%L->>''value'') AS INTEGER) as calculated_stat_value
            FROM
                public.players p
            WHERE
                p.is_visible = true 
                AND (p.stats->%L->>''value'') IS NOT NULL
            ORDER BY
                calculated_stat_value %s NULLS LAST
            LIMIT %s',
            stat_key, stat_key, stat_key,
            CASE WHEN sort_asc THEN 'ASC' ELSE 'DESC' END,
            limit_count
        );
    END IF;
END;
$$;