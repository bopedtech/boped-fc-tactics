-- Drop old function first
DROP FUNCTION IF EXISTS search_players_smart(TEXT, INT, INT, TEXT, TEXT);

-- Create RPC function for smart player search with is_visible filter
CREATE OR REPLACE FUNCTION search_players_smart(
  search_query TEXT,
  page_limit INT DEFAULT 20,
  page_offset INT DEFAULT 0,
  sort_by TEXT DEFAULT 'rating',
  sort_order TEXT DEFAULT 'DESC'
)
RETURNS TABLE (
  "assetId" INT,
  "commonName" TEXT,
  "cardName" TEXT,
  "firstName" TEXT,
  "lastName" TEXT,
  "rating" INT,
  "position" TEXT,
  "nation" JSONB,
  "club" JSONB,
  "league" JSONB,
  "images" JSONB,
  "stats" JSONB,
  "traits" JSONB,
  "auctionable" BOOLEAN,
  "avgStats" JSONB,
  "avgGkStats" JSONB,
  "rank" INT,
  "training" INT,
  "program" JSONB,
  "createdAt" TIMESTAMPTZ,
  "total_count" BIGINT
) AS $$
DECLARE
  normalized_query TEXT;
BEGIN
  normalized_query := lower(unaccent(coalesce(search_query, '')));
  
  RETURN QUERY
  SELECT 
    p."assetId",
    p."commonName",
    p."cardName",
    p."firstName",
    p."lastName",
    p."rating",
    p."position",
    p."nation",
    p."club",
    p."league",
    p."images",
    p."stats",
    p."traits",
    p."auctionable",
    p."avgStats",
    p."avgGkStats",
    p."rank",
    p."training",
    p."program",
    p."createdAt",
    COUNT(*) OVER() as total_count
  FROM players p
  WHERE 
    p.is_visible = true AND
    (
      normalized_query = '' OR
      lower(unaccent(coalesce(p."commonName", ''))) LIKE '%' || normalized_query || '%' OR
      lower(unaccent(coalesce(p."cardName", ''))) LIKE '%' || normalized_query || '%' OR
      lower(unaccent(coalesce(p."firstName", ''))) LIKE '%' || normalized_query || '%' OR
      lower(unaccent(coalesce(p."lastName", ''))) LIKE '%' || normalized_query || '%'
    )
  ORDER BY 
    CASE WHEN sort_by = 'rating' AND sort_order = 'DESC' THEN p."rating" END DESC,
    CASE WHEN sort_by = 'rating' AND sort_order = 'ASC' THEN p."rating" END ASC,
    CASE WHEN sort_by = 'createdAt' AND sort_order = 'DESC' THEN p."createdAt" END DESC,
    CASE WHEN sort_by = 'createdAt' AND sort_order = 'ASC' THEN p."createdAt" END ASC,
    p."rating" DESC
  LIMIT page_limit
  OFFSET page_offset;
END;
$$ LANGUAGE plpgsql;
