// Renderz API Service - Uses public CORS proxy to bypass CORS restrictions
// No dependency on edge functions

const RENDERZ_BASE_URL = 'https://renderz.app/api/filter/filter-data';
const PLAYERS_API_URL = 'https://renderz.app/api/players/search';
const SEASON_ID = 24;

// Use multiple CORS proxies as fallback
const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
];

async function fetchWithCorsProxy(url: string, options?: RequestInit): Promise<Response> {
  let lastError: Error | null = null;
  
  for (const proxy of CORS_PROXIES) {
    try {
      const proxyUrl = proxy + encodeURIComponent(url);
      const response = await fetch(proxyUrl, {
        ...options,
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        return response;
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.warn(`CORS proxy failed: ${proxy}`, error);
    }
  }
  
  throw lastError || new Error('All CORS proxies failed');
}

async function postWithCorsProxy(url: string, body: any): Promise<any> {
  // For POST requests, try corsproxy.io which supports POST
  const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
  
  const response = await fetch(proxyUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(body),
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
}

export async function fetchPrograms(): Promise<any[]> {
  const response = await fetchWithCorsProxy(`${RENDERZ_BASE_URL}/programs?seasonId=${SEASON_ID}`);
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.data || data;
}

export async function fetchNations(): Promise<any[]> {
  const response = await fetchWithCorsProxy(`${RENDERZ_BASE_URL}/nations?seasonId=${SEASON_ID}`);
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.data || data;
}

export async function fetchLeagues(): Promise<any[]> {
  const response = await fetchWithCorsProxy(`${RENDERZ_BASE_URL}/leagues?seasonId=${SEASON_ID}`);
  const data = await response.json();
  if (data === "error" || data.error) throw new Error('Invalid response from Renderz');
  return Array.isArray(data) ? data : data.data || [];
}

export async function fetchTeams(): Promise<any[]> {
  const response = await fetchWithCorsProxy(`${RENDERZ_BASE_URL}/clubs?seasonId=${SEASON_ID}`);
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.data || data;
}

export async function fetchTraits(): Promise<any[]> {
  const response = await fetchWithCorsProxy(`${RENDERZ_BASE_URL}/traits?seasonId=${SEASON_ID}`);
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.data || data;
}

export async function fetchCelebrations(): Promise<any[]> {
  const response = await fetchWithCorsProxy(`${RENDERZ_BASE_URL}/celebrations?seasonId=${SEASON_ID}`);
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.data || data;
}

export async function fetchSkillMoves(): Promise<any[]> {
  const response = await fetchWithCorsProxy(`${RENDERZ_BASE_URL}/skillmoves?seasonId=${SEASON_ID}`);
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.data || data;
}

// Players API - more complex with pagination
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
  
  const data = await postWithCorsProxy(PLAYERS_API_URL, payload);
  
  // Extract players from response
  const players = data?.hits?.hits?.map((hit: any) => hit._source) || [];
  const nextCursor = players.length > 0 ? data?.hits?.hits?.[players.length - 1]?.sort : null;
  const total = data?.hits?.total?.value || 0;
  
  return { players, nextCursor, total };
}
