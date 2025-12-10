// Sync Service - Handles syncing data from Renderz API to database
import { supabase } from "@/integrations/supabase/client";
import * as renderzApi from "./renderz-api";

interface SyncResult {
  success: boolean;
  synced: number;
  message: string;
  error?: string;
}

// Helper: Get translations from localization_dictionary
async function getTranslations(keys: string[]): Promise<Map<string, string>> {
  if (keys.length === 0) return new Map();
  
  const { data, error } = await supabase
    .from('localization_dictionary')
    .select('key, value_en')
    .in('key', keys);
  
  if (error) {
    console.error('Translation fetch error:', error);
    return new Map();
  }
  
  return new Map((data || []).map(t => [t.key, t.value_en || t.key]));
}

// ===================== PROGRAMS =====================
export async function syncPrograms(): Promise<SyncResult> {
  try {
    console.log('Starting Programs sync...');
    
    // 1. Fetch from Renderz API
    const programsData = await renderzApi.fetchPrograms();
    console.log(`Fetched ${programsData.length} programs`);
    
    // 2. Get translations
    const keys = [...new Set(programsData.map(p => p.name).filter(Boolean))];
    const translations = await getTranslations(keys);
    
    // 3. Transform data
    const transformed = programsData.map(program => ({
      id: program.id,
      displayname: translations.get(program.name) || program.name,
      localizationkey: program.name,
      image: program.image || null,
      rawdata: program,
      updatedat: new Date().toISOString(),
    }));
    
    // 4. Upsert to database
    const { error } = await supabase
      .from('programs')
      .upsert(transformed, { onConflict: 'id' });
    
    if (error) throw error;
    
    return {
      success: true,
      synced: transformed.length,
      message: `Đã đồng bộ ${transformed.length} chương trình`
    };
  } catch (error: any) {
    console.error('Programs sync error:', error);
    return {
      success: false,
      synced: 0,
      message: 'Lỗi khi đồng bộ chương trình',
      error: error.message
    };
  }
}

// ===================== NATIONS =====================
export async function syncNations(): Promise<SyncResult> {
  try {
    console.log('Starting Nations sync...');
    
    const nationsData = await renderzApi.fetchNations();
    console.log(`Fetched ${nationsData.length} nations`);
    
    const keys = [...new Set(nationsData.map(n => n.name).filter(Boolean))];
    const translations = await getTranslations(keys);
    
    const transformed = nationsData.map(nation => ({
      id: nation.id,
      displayname: translations.get(nation.name) || nation.name,
      localizationkey: nation.name,
      image: nation.image || null,
      rawdata: nation,
      updatedat: new Date().toISOString(),
    }));
    
    const { error } = await supabase
      .from('nations')
      .upsert(transformed, { onConflict: 'id' });
    
    if (error) throw error;
    
    return {
      success: true,
      synced: transformed.length,
      message: `Đã đồng bộ ${transformed.length} quốc gia`
    };
  } catch (error: any) {
    console.error('Nations sync error:', error);
    return {
      success: false,
      synced: 0,
      message: 'Lỗi khi đồng bộ quốc gia',
      error: error.message
    };
  }
}

// ===================== LEAGUES =====================
export async function syncLeagues(): Promise<SyncResult> {
  try {
    console.log('Starting Leagues sync...');
    
    const leaguesData = await renderzApi.fetchLeagues();
    console.log(`Fetched ${leaguesData.length} leagues`);
    
    const keys = [...new Set(leaguesData.map(l => l.name).filter(Boolean))];
    const translations = await getTranslations(keys);
    
    const transformed = leaguesData.map(league => ({
      id: league.id,
      displayname: translations.get(league.name) || league.name,
      localizationkey: league.name,
      image: league.image || null,
      rawdata: league,
      updatedat: new Date().toISOString(),
    }));
    
    const { error } = await supabase
      .from('leagues')
      .upsert(transformed, { onConflict: 'id' });
    
    if (error) throw error;
    
    return {
      success: true,
      synced: transformed.length,
      message: `Đã đồng bộ ${transformed.length} giải đấu`
    };
  } catch (error: any) {
    console.error('Leagues sync error:', error);
    return {
      success: false,
      synced: 0,
      message: 'Lỗi khi đồng bộ giải đấu',
      error: error.message
    };
  }
}

// ===================== TEAMS =====================
export async function syncTeams(): Promise<SyncResult> {
  try {
    console.log('Starting Teams sync...');
    
    const teamsData = await renderzApi.fetchTeams();
    console.log(`Fetched ${teamsData.length} teams`);
    
    const keys = [...new Set(teamsData.map(t => t.name).filter(Boolean))];
    const translations = await getTranslations(keys);
    
    const transformed = teamsData.map(team => ({
      id: team.id,
      displayname: translations.get(team.name) || team.name,
      localizationkey: team.name,
      image: team.image || null,
      rawdata: team,
      updatedat: new Date().toISOString(),
    }));
    
    const { error } = await supabase
      .from('teams')
      .upsert(transformed, { onConflict: 'id' });
    
    if (error) throw error;
    
    return {
      success: true,
      synced: transformed.length,
      message: `Đã đồng bộ ${transformed.length} câu lạc bộ`
    };
  } catch (error: any) {
    console.error('Teams sync error:', error);
    return {
      success: false,
      synced: 0,
      message: 'Lỗi khi đồng bộ câu lạc bộ',
      error: error.message
    };
  }
}

// ===================== TRAITS =====================
export async function syncTraits(): Promise<SyncResult> {
  try {
    console.log('Starting Traits sync...');
    
    const traitsData = await renderzApi.fetchTraits();
    console.log(`Fetched ${traitsData.length} traits`);
    
    const nameKeys = traitsData.map(t => t.name).filter(Boolean);
    const descKeys = traitsData.map(t => t.description).filter(Boolean);
    const allKeys = [...new Set([...nameKeys, ...descKeys])];
    const translations = await getTranslations(allKeys);
    
    const transformed = traitsData.map(trait => ({
      id: trait.id,
      "displayName": translations.get(trait.name) || trait.name,
      "localizationKey": trait.name,
      "mediaUrl": trait.mediaUrl || trait.image || trait.video || null,
      "rawData": trait,
      "updatedAt": new Date().toISOString(),
    }));
    
    const { error } = await supabase
      .from('traits')
      .upsert(transformed, { onConflict: 'id' });
    
    if (error) throw error;
    
    return {
      success: true,
      synced: transformed.length,
      message: `Đã đồng bộ ${transformed.length} đặc điểm`
    };
  } catch (error: any) {
    console.error('Traits sync error:', error);
    return {
      success: false,
      synced: 0,
      message: 'Lỗi khi đồng bộ đặc điểm',
      error: error.message
    };
  }
}

// ===================== CELEBRATIONS =====================
export async function syncCelebrations(): Promise<SyncResult> {
  try {
    console.log('Starting Celebrations sync...');
    
    const celebrationsData = await renderzApi.fetchCelebrations();
    console.log(`Fetched ${celebrationsData.length} celebrations`);
    
    const nameKeys = celebrationsData.map(c => c.name).filter(Boolean);
    const descKeys = celebrationsData.map(c => c.description).filter(Boolean);
    const allKeys = [...new Set([...nameKeys, ...descKeys])];
    const translations = await getTranslations(allKeys);
    
    const transformed = celebrationsData.map(celebration => ({
      id: celebration.id,
      "displayName": translations.get(celebration.name) || celebration.name,
      "localizationKey": celebration.name,
      "mediaUrl": celebration.mediaUrl || celebration.image || celebration.video || null,
      "rawData": celebration,
      "updatedAt": new Date().toISOString(),
    }));
    
    const { error } = await supabase
      .from('celebrations')
      .upsert(transformed, { onConflict: 'id' });
    
    if (error) throw error;
    
    return {
      success: true,
      synced: transformed.length,
      message: `Đã đồng bộ ${transformed.length} ăn mừng`
    };
  } catch (error: any) {
    console.error('Celebrations sync error:', error);
    return {
      success: false,
      synced: 0,
      message: 'Lỗi khi đồng bộ ăn mừng',
      error: error.message
    };
  }
}

// ===================== SKILL MOVES =====================
export async function syncSkillMoves(): Promise<SyncResult> {
  try {
    console.log('Starting SkillMoves sync...');
    
    const skillMovesData = await renderzApi.fetchSkillMoves();
    console.log(`Fetched ${skillMovesData.length} skill moves`);
    
    const nameKeys = skillMovesData.map(s => s.name).filter(Boolean);
    const descKeys = skillMovesData.map(s => s.description).filter(Boolean);
    const allKeys = [...new Set([...nameKeys, ...descKeys])];
    const translations = await getTranslations(allKeys);
    
    const transformed = skillMovesData.map(skillMove => ({
      id: skillMove.id,
      "displayName": translations.get(skillMove.name) || skillMove.name || 'Unknown',
      "localizationKey": skillMove.name,
      "mediaUrl": skillMove.mediaUrl || skillMove.image || skillMove.video || null,
      "rawData": skillMove,
      "updatedAt": new Date().toISOString(),
    }));
    
    const { error } = await supabase
      .from('skillmoves')
      .upsert(transformed, { onConflict: 'id' });
    
    if (error) throw error;
    
    return {
      success: true,
      synced: transformed.length,
      message: `Đã đồng bộ ${transformed.length} kỹ năng`
    };
  } catch (error: any) {
    console.error('SkillMoves sync error:', error);
    return {
      success: false,
      synced: 0,
      message: 'Lỗi khi đồng bộ kỹ năng',
      error: error.message
    };
  }
}

// ===================== PLAYERS =====================
export interface PlayersSyncProgress {
  totalSynced: number;
  batchSynced: number;
  hasMore: boolean;
  isComplete: boolean;
}

export async function syncPlayers(
  onProgress?: (progress: PlayersSyncProgress) => void
): Promise<SyncResult> {
  try {
    console.log('Starting Players sync...');
    
    let cursor: any[] | undefined = undefined;
    let totalSynced = 0;
    let hasMore = true;
    const maxIterations = 500; // Safety limit
    let iteration = 0;
    
    while (hasMore && iteration < maxIterations) {
      iteration++;
      
      // Fetch batch from API
      const { players, nextCursor, total } = await renderzApi.fetchPlayers(cursor);
      
      if (players.length === 0) {
        hasMore = false;
        break;
      }
      
      console.log(`Batch ${iteration}: Fetched ${players.length} players`);
      
      // Transform player data
      const transformed = players.map(player => ({
        playerId: player.id || player.playerId,
        assetId: player.assetId || player.id,
        firstName: player.firstName,
        lastName: player.lastName,
        commonName: player.commonName,
        cardName: player.cardName,
        rating: player.rating,
        position: player.position,
        nation: player.nation,
        club: player.club,
        league: player.league,
        images: player.images,
        stats: player.stats,
        avgStats: player.avgStats,
        avgGkStats: player.avgGkStats,
        traits: player.traits,
        skillMoves: player.skillMoves,
        skillMovesLevel: player.skillMovesLevel,
        weakFoot: player.weakFoot,
        foot: player.foot,
        height: player.height,
        weight: player.weight,
        birthday: player.birthday,
        celebration: player.celebration,
        auctionable: player.auctionable,
        rank: player.rank,
        tags: player.tags?.join(','),
        rawData: player,
        updatedAt: new Date().toISOString(),
      }));
      
      // Upsert batch
      const { error } = await supabase
        .from('players')
        .upsert(transformed, { onConflict: 'playerId' });
      
      if (error) {
        console.error('Upsert error:', error);
        throw error;
      }
      
      totalSynced += players.length;
      cursor = nextCursor || undefined;
      hasMore = !!nextCursor && players.length > 0;
      
      // Report progress
      if (onProgress) {
        onProgress({
          totalSynced,
          batchSynced: players.length,
          hasMore,
          isComplete: !hasMore
        });
      }
      
      // Small delay to avoid overwhelming the API
      if (hasMore) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return {
      success: true,
      synced: totalSynced,
      message: `Đã đồng bộ ${totalSynced} cầu thủ`
    };
  } catch (error: any) {
    console.error('Players sync error:', error);
    return {
      success: false,
      synced: 0,
      message: 'Lỗi khi đồng bộ cầu thủ',
      error: error.message
    };
  }
}
