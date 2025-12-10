// Renderz API Service - Direct frontend calls to Renderz API
// Note: May encounter CORS issues if the API doesn't support cross-origin requests

const RENDERZ_BASE_URL = 'https://renderz.app/api/filter/filter-data';
const SEASON_ID = 24;

interface RenderzResponse<T> {
  data?: T[];
  error?: string;
}

// Common headers to simulate browser request
const getHeaders = (): HeadersInit => ({
  'Accept': 'application/json',
  'Referer': 'https://renderz.app/24/players',
});

export async function fetchPrograms(): Promise<any[]> {
  const response = await fetch(
    `${RENDERZ_BASE_URL}/programs?seasonId=${SEASON_ID}`,
    { headers: getHeaders() }
  );
  
  if (!response.ok) {
    throw new Error(`Renderz API error: ${response.status}`);
  }
  
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.data || data;
}

export async function fetchNations(): Promise<any[]> {
  const response = await fetch(
    `${RENDERZ_BASE_URL}/nations?seasonId=${SEASON_ID}`,
    { headers: getHeaders() }
  );
  
  if (!response.ok) {
    throw new Error(`Renderz API error: ${response.status}`);
  }
  
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.data || data;
}

export async function fetchLeagues(): Promise<any[]> {
  const response = await fetch(
    `${RENDERZ_BASE_URL}/leagues?seasonId=${SEASON_ID}`,
    { headers: getHeaders() }
  );
  
  if (!response.ok) {
    throw new Error(`Renderz API error: ${response.status}`);
  }
  
  const data = await response.json();
  if (data === "error" || data.error) throw new Error('Invalid response from Renderz');
  return Array.isArray(data) ? data : data.data || [];
}

export async function fetchTeams(): Promise<any[]> {
  const response = await fetch(
    `${RENDERZ_BASE_URL}/clubs?seasonId=${SEASON_ID}`,
    { headers: getHeaders() }
  );
  
  if (!response.ok) {
    throw new Error(`Renderz API error: ${response.status}`);
  }
  
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.data || data;
}

export async function fetchTraits(): Promise<any[]> {
  const response = await fetch(
    `${RENDERZ_BASE_URL}/traits?seasonId=${SEASON_ID}`,
    { headers: getHeaders() }
  );
  
  if (!response.ok) {
    throw new Error(`Renderz API error: ${response.status}`);
  }
  
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.data || data;
}

export async function fetchCelebrations(): Promise<any[]> {
  const response = await fetch(
    `${RENDERZ_BASE_URL}/celebrations?seasonId=${SEASON_ID}`,
    { headers: getHeaders() }
  );
  
  if (!response.ok) {
    throw new Error(`Renderz API error: ${response.status}`);
  }
  
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.data || data;
}

export async function fetchSkillMoves(): Promise<any[]> {
  const response = await fetch(
    `${RENDERZ_BASE_URL}/skillmoves?seasonId=${SEASON_ID}`,
    { headers: getHeaders() }
  );
  
  if (!response.ok) {
    throw new Error(`Renderz API error: ${response.status}`);
  }
  
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.data || data;
}

// Players API - more complex with pagination
const PLAYERS_API_URL = 'https://renderz.app/api/players/search';

export interface PlayersSearchResult {
  players: any[];
  nextCursor: any[] | null;
  total: number;
}

export async function fetchPlayers(cursor?: any[]): Promise<PlayersSearchResult> {
  const payload: any = {
    size: 100,
    search: "",
    sort: [],
    filters: {
      tags: ["24"] // Season 24
    }
  };
  
  if (cursor) {
    payload.search_after = cursor;
  }
  
  const response = await fetch(PLAYERS_API_URL, {
    method: 'POST',
    headers: {
      ...getHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    throw new Error(`Renderz API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Extract players from response
  const players = data?.hits?.hits?.map((hit: any) => hit._source) || [];
  const nextCursor = players.length > 0 ? data?.hits?.hits?.[players.length - 1]?.sort : null;
  const total = data?.hits?.total?.value || 0;
  
  return { players, nextCursor, total };
}
