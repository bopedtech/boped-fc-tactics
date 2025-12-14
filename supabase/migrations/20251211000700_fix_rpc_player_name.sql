-- Fix RPC function to include cardName, firstName, lastName for player name fallback
-- commonName is often empty, need fallback options

DROP FUNCTION IF EXISTS public.get_top_players_by_stat(TEXT, INTEGER, BOOLEAN);

CREATE OR REPLACE FUNCTION public.get_top_players_by_stat(
    stat_key TEXT,
    limit_count INTEGER DEFAULT 5,
    sort_asc BOOLEAN DEFAULT FALSE
)
RETURNS TABLE(
    "assetId" BIGINT,
    "commonName" TEXT,
    "cardName" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
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
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    avg_key TEXT;
    column_name TEXT;
BEGIN
    -- Ánh xạ stat_key sang avgStats key
    IF stat_key = 'PAC' THEN
        avg_key := 'avg1';
    ELSIF stat_key = 'SHO' THEN
        avg_key := 'avg2';
    ELSIF stat_key = 'PAS' THEN
        avg_key := 'avg3';
    ELSIF stat_key = 'DRI' THEN
        avg_key := 'avg4';
    ELSIF stat_key = 'DEF' THEN
        avg_key := 'avg5';
    ELSIF stat_key = 'PHY' THEN
        avg_key := 'avg6';
    ELSIF stat_key = 'HEIGHT' THEN
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
                p."cardName",
                p."firstName",
                p."lastName",
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
    -- Xử lý avgStats (PAC, SHO, PAS, DRI, DEF, PHY)
    ELSIF avg_key IS NOT NULL THEN
        RETURN QUERY EXECUTE format(
            'SELECT
                p."assetId",
                p."commonName",
                p."cardName",
                p."firstName",
                p."lastName",
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
                CAST((p."avgStats"->>%L) AS INTEGER) as stat_value
            FROM
                public.players p
            WHERE
                p.is_visible = true 
                AND p."avgStats" IS NOT NULL
                AND (p."avgStats"->>%L) IS NOT NULL
            ORDER BY
                stat_value %s NULLS LAST
            LIMIT %s',
            stat_key, avg_key, avg_key,
            CASE WHEN sort_asc THEN 'ASC' ELSE 'DESC' END,
            limit_count
        );
    ELSE
        -- Fallback: không tìm thấy key hợp lệ
        RETURN;
    END IF;
END;
$$;
