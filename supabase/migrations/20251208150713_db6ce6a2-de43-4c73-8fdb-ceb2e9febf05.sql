-- Cập nhật hàm RPC để sử dụng đúng cấu trúc avgStats
-- avgStats: avg1=PAC, avg2=SHO, avg3=PAS, avg4=DRI, avg5=DEF, avg6=PHY

DROP FUNCTION IF EXISTS public.get_top_players_by_stat(TEXT, INTEGER, BOOLEAN);

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
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    avg_key TEXT;
    column_name TEXT;
BEGIN
    -- Ánh xạ stat_key sang avgStats key
    -- avgStats: avg1=PAC, avg2=SHO, avg3=PAS, avg4=DRI, avg5=DEF, avg6=PHY
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

-- Tạo indexes tối ưu cho avgStats
DROP INDEX IF EXISTS idx_players_stats_pac;
DROP INDEX IF EXISTS idx_players_stats_sho;
DROP INDEX IF EXISTS idx_players_stats_pas;
DROP INDEX IF EXISTS idx_players_stats_dri;
DROP INDEX IF EXISTS idx_players_stats_def;
DROP INDEX IF EXISTS idx_players_stats_phy;

CREATE INDEX IF NOT EXISTS idx_players_avgstats_pac ON public.players (
    (CAST(("avgStats"->>'avg1') AS INTEGER)) DESC NULLS LAST
) WHERE is_visible = true AND "avgStats" IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_players_avgstats_sho ON public.players (
    (CAST(("avgStats"->>'avg2') AS INTEGER)) DESC NULLS LAST
) WHERE is_visible = true AND "avgStats" IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_players_avgstats_pas ON public.players (
    (CAST(("avgStats"->>'avg3') AS INTEGER)) DESC NULLS LAST
) WHERE is_visible = true AND "avgStats" IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_players_avgstats_dri ON public.players (
    (CAST(("avgStats"->>'avg4') AS INTEGER)) DESC NULLS LAST
) WHERE is_visible = true AND "avgStats" IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_players_avgstats_def ON public.players (
    (CAST(("avgStats"->>'avg5') AS INTEGER)) DESC NULLS LAST
) WHERE is_visible = true AND "avgStats" IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_players_avgstats_phy ON public.players (
    (CAST(("avgStats"->>'avg6') AS INTEGER)) DESC NULLS LAST
) WHERE is_visible = true AND "avgStats" IS NOT NULL;