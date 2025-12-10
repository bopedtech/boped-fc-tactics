import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Database, Trophy, Play, ArrowRightLeft, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import * as syncService from "@/services/sync-service";

export default function SyncData() {
  const [syncingPlayers, setSyncingPlayers] = useState(false);
  const [playersResult, setPlayersResult] = useState<any>(null);
  const [syncingDict, setSyncingDict] = useState(false);
  const [dictSyncResult, setDictSyncResult] = useState<any>(null);
  const [syncingLeagues, setSyncingLeagues] = useState(false);
  const [leaguesResult, setLeaguesResult] = useState<any>(null);
  const [syncingNations, setSyncingNations] = useState(false);
  const [nationsResult, setNationsResult] = useState<any>(null);
  const [syncingTeams, setSyncingTeams] = useState(false);
  const [teamsResult, setTeamsResult] = useState<any>(null);
  const [syncingTraits, setSyncingTraits] = useState(false);
  const [traitsResult, setTraitsResult] = useState<any>(null);
  const [syncingPrograms, setSyncingPrograms] = useState(false);
  const [programsResult, setProgramsResult] = useState<any>(null);
  const [syncingCelebrations, setSyncingCelebrations] = useState(false);
  const [celebrationsResult, setCelebrationsResult] = useState<any>(null);
  const [syncingSkillMoves, setSyncingSkillMoves] = useState(false);
  const [skillMovesResult, setSkillMovesResult] = useState<any>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [translating, setTranslating] = useState(false);
  const [translationResult, setTranslationResult] = useState<any>(null);
  
  // Migration states
  const [migrating, setMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<any>(null);
  const [clearExisting, setClearExisting] = useState(false);

  // ===================== PLAYERS - Client-Driven Pagination =====================
  const handleSyncPlayers = async () => {
    let cursor = null;
    let isRunning = true;
    let totalSynced = 0;
    let page = 1;

    try {
      setSyncingPlayers(true);
      setPlayersResult(null);
      toast.info('🚀 Đang khởi động đồng bộ cầu thủ...');

      while (isRunning) {
        console.log(`Fetching Page ${page}...`);

        // Gọi Edge Function
        const { data, error } = await supabase.functions.invoke('sync-players', {
          body: { cursor }
        });

        // Xử lý lỗi kết nối
        if (error) {
          console.error("Function Error:", error);
          toast.error(`Lỗi kết nối tại trang ${page}: ${error.message}`);
          setPlayersResult({ success: false, error: error.message });
          break;
        }

        // Xử lý lỗi logic từ Edge Function
        if (data.error) {
          console.error("Logic Error:", data.error);
          toast.error(`Lỗi xử lý: ${data.error}`);
          setPlayersResult({ success: false, error: data.error });
          break;
        }

        // Cập nhật trạng thái
        totalSynced += data.processed;
        cursor = data.nextCursor;

        // Thông báo tiến độ
        if (data.processed > 0) {
          toast.info(`Trang ${page}: Đã đồng bộ ${data.processed} cầu thủ (Tổng: ${totalSynced})`);
        }

        // Logic dừng
        if (data.done || !cursor) {
          isRunning = false;
          toast.success(`🎉 Hoàn tất! Đã đồng bộ ${totalSynced} cầu thủ.`);
          setPlayersResult({ 
            success: true, 
            message: `Đã đồng bộ ${totalSynced} cầu thủ từ ${page} trang`,
            totalPlayers: totalSynced,
            totalPages: page
          });
        } else {
          page++;
          // Delay 500ms để tránh spam server
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } catch (error: any) {
      console.error("System Error:", error);
      toast.error("Lỗi nghiêm trọng: " + error.message);
      setPlayersResult({ success: false, error: error.message });
    } finally {
      setSyncingPlayers(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/json') {
        setUploadedFile(file);
        toast.success(`Đã chọn file: ${file.name}`);
      } else {
        toast.error('Vui lòng chọn file JSON');
      }
    }
  };

  // Import dictionary - still uses edge function for now
  const handleImportDictionary = async () => {
    try {
      setSyncingDict(true);
      setDictSyncResult(null);
      
      let dictionaryData;
      
      if (uploadedFile) {
        toast.info('Đang đọc file tải lên...');
        const text = await uploadedFile.text();
        dictionaryData = JSON.parse(text);
      } else {
        toast.info('Đang tải tệp từ điển mặc định...');
        const response = await fetch('/localization_dictionary_import.json');
        if (!response.ok) {
          throw new Error('Không thể tải tệp từ điển');
        }
        dictionaryData = await response.json();
      }
      
      toast.info(`Đang import ${Object.keys(dictionaryData).length} mục...`);
      
      // Direct import to database
      const entries = Object.entries(dictionaryData).map(([key, value]) => ({
        key,
        value_en: value as string,
        source: 'import',
        updated_at: new Date().toISOString()
      }));
      
      // Batch upsert
      const batchSize = 500;
      let imported = 0;
      
      for (let i = 0; i < entries.length; i += batchSize) {
        const batch = entries.slice(i, i + batchSize);
        const { error } = await supabase
          .from('localization_dictionary')
          .upsert(batch, { onConflict: 'key' });
        
        if (error) throw error;
        imported += batch.length;
      }
      
      setDictSyncResult({ success: true, totalImported: imported });
      toast.success(`✓ Đã import ${imported} mục từ điển`);
      setUploadedFile(null);
    } catch (error: any) {
      console.error('Dictionary import error:', error);
      setDictSyncResult({ success: false, error: error.message });
      toast.error('Lỗi khi import từ điển bản địa hóa: ' + error.message);
    } finally {
      setSyncingDict(false);
    }
  };

  // ===================== LEAGUES - Direct API Call =====================
  const handleSyncLeagues = async () => {
    try {
      setSyncingLeagues(true);
      setLeaguesResult(null);
      toast.info('Đang đồng bộ dữ liệu giải đấu...');

      const result = await syncService.syncLeagues();
      setLeaguesResult(result);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error || result.message);
      }
    } catch (error: any) {
      console.error("Error syncing leagues:", error);
      toast.error("Lỗi khi đồng bộ giải đấu: " + error.message);
      setLeaguesResult({ success: false, error: error.message });
    } finally {
      setSyncingLeagues(false);
    }
  };

  // ===================== NATIONS - Direct API Call =====================
  const handleSyncNations = async () => {
    try {
      setSyncingNations(true);
      setNationsResult(null);
      toast.info('Đang đồng bộ dữ liệu quốc gia...');

      const result = await syncService.syncNations();
      setNationsResult(result);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error || result.message);
      }
    } catch (error: any) {
      console.error("Error syncing nations:", error);
      toast.error("Lỗi khi đồng bộ quốc gia: " + error.message);
      setNationsResult({ success: false, error: error.message });
    } finally {
      setSyncingNations(false);
    }
  };

  // ===================== TEAMS - Direct API Call =====================
  const handleSyncTeams = async () => {
    try {
      setSyncingTeams(true);
      setTeamsResult(null);
      toast.info('Đang đồng bộ dữ liệu câu lạc bộ...');

      const result = await syncService.syncTeams();
      setTeamsResult(result);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error || result.message);
      }
    } catch (error: any) {
      console.error("Error syncing teams:", error);
      toast.error("Lỗi khi đồng bộ câu lạc bộ: " + error.message);
      setTeamsResult({ success: false, error: error.message });
    } finally {
      setSyncingTeams(false);
    }
  };

  // ===================== TRAITS - Direct API Call =====================
  const handleSyncTraits = async () => {
    try {
      setSyncingTraits(true);
      setTraitsResult(null);
      toast.info('Đang đồng bộ dữ liệu đặc điểm...');

      const result = await syncService.syncTraits();
      setTraitsResult(result);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error || result.message);
      }
    } catch (error: any) {
      console.error("Error syncing traits:", error);
      toast.error("Lỗi khi đồng bộ đặc điểm: " + error.message);
      setTraitsResult({ success: false, error: error.message });
    } finally {
      setSyncingTraits(false);
    }
  };

  // ===================== PROGRAMS - Direct API Call =====================
  const handleSyncPrograms = async () => {
    try {
      setSyncingPrograms(true);
      setProgramsResult(null);
      toast.info('Đang đồng bộ dữ liệu chương trình...');

      const result = await syncService.syncPrograms();
      setProgramsResult(result);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error || result.message);
      }
    } catch (error: any) {
      console.error("Error syncing programs:", error);
      toast.error("Lỗi khi đồng bộ chương trình: " + error.message);
      setProgramsResult({ success: false, error: error.message });
    } finally {
      setSyncingPrograms(false);
    }
  };

  // ===================== CELEBRATIONS - Direct API Call =====================
  const handleSyncCelebrations = async () => {
    try {
      setSyncingCelebrations(true);
      setCelebrationsResult(null);
      toast.info('Đang đồng bộ dữ liệu ăn mừng...');

      const result = await syncService.syncCelebrations();
      setCelebrationsResult(result);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error || result.message);
      }
    } catch (error: any) {
      console.error("Error syncing celebrations:", error);
      toast.error("Lỗi khi đồng bộ ăn mừng: " + error.message);
      setCelebrationsResult({ success: false, error: error.message });
    } finally {
      setSyncingCelebrations(false);
    }
  };

  // ===================== SKILL MOVES - Direct API Call =====================
  const handleSyncSkillMoves = async () => {
    try {
      setSyncingSkillMoves(true);
      setSkillMovesResult(null);
      toast.info('Đang đồng bộ dữ liệu kỹ năng...');

      const result = await syncService.syncSkillMoves();
      setSkillMovesResult(result);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error || result.message);
      }
    } catch (error: any) {
      console.error("Error syncing skill moves:", error);
      toast.error("Lỗi khi đồng bộ kỹ năng: " + error.message);
      setSkillMovesResult({ success: false, error: error.message });
    } finally {
      setSyncingSkillMoves(false);
    }
  };

  // Translation - still uses edge function
  const handleTranslateLocalization = async () => {
    try {
      setTranslating(true);
      setTranslationResult(null);
      
      let totalTranslated = 0;
      let hasMore = true;
      let iterations = 0;
      const MAX_ITERATIONS = 10;
      
      toast.info('Đang bắt đầu dịch từ điển sang tiếng Việt...');

      while (hasMore && iterations < MAX_ITERATIONS) {
        iterations++;
        
        const { data, error } = await supabase.functions.invoke('translate-localization');

        if (error) throw error;

        totalTranslated += data.translated;
        hasMore = data.hasMore;
        
        if (hasMore) {
          toast.info(`Đã dịch ${totalTranslated} bản ghi, còn ${data.remaining} bản ghi. Tiếp tục...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      setTranslationResult({ 
        success: true, 
        translated: totalTranslated,
        message: `Đã hoàn thành dịch ${totalTranslated} bản ghi`
      });
      toast.success(`Dịch thành công ${totalTranslated} bản ghi!`);
    } catch (error) {
      console.error("Error translating localization:", error);
      toast.error("Lỗi khi dịch: " + (error as Error).message);
    } finally {
      setTranslating(false);
    }
  };

  // Migration - still uses edge function
  const handleMigrateData = async () => {
    try {
      setMigrating(true);
      setMigrationResult(null);
      toast.info('Đang bắt đầu di chuyển dữ liệu từ Supabase cũ...');

      const { data, error } = await supabase.functions.invoke('data-migration', {
        body: { clearExisting }
      });

      if (error) throw error;

      setMigrationResult(data);
      if (data.success) {
        toast.success(`Di chuyển thành công! Tổng: ${data.message}`);
      } else {
        toast.warning(`Di chuyển hoàn tất với một số lỗi. Xem chi tiết bên dưới.`);
      }
    } catch (error: any) {
      console.error('Migration error:', error);
      setMigrationResult({ success: false, error: error.message });
      toast.error('Lỗi khi di chuyển dữ liệu: ' + error.message);
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Đồng Bộ Dữ Liệu</h1>
        <p className="text-muted-foreground">
          Đồng bộ trực tiếp từ Renderz API đến database (không qua Edge Functions)
        </p>
      </div>

      {/* Migration from Old Supabase - Full Width */}
      <Card className="border-2 border-primary/50 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-primary" />
            <CardTitle className="text-primary">🔥 Di Chuyển Dữ Liệu từ Supabase Cũ</CardTitle>
          </div>
          <CardDescription>
            Tự động di chuyển toàn bộ dữ liệu từ Supabase project cũ sang Lovable Cloud hiện tại
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="clearExisting" 
              checked={clearExisting}
              onCheckedChange={(checked) => setClearExisting(checked as boolean)}
            />
            <label
              htmlFor="clearExisting"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              <span className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-destructive" />
                Xóa dữ liệu cũ trước khi import (cẩn thận!)
              </span>
            </label>
          </div>
          
          <Button
            onClick={handleMigrateData}
            disabled={migrating}
            className="w-full"
            size="lg"
          >
            {migrating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang di chuyển dữ liệu...
              </>
            ) : (
              <>
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                Bắt Đầu Di Chuyển Toàn Bộ Dữ Liệu
              </>
            )}
          </Button>
          
          {migrationResult && (
            <div className={`p-4 rounded-lg ${migrationResult.success ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}`}>
              <p className="text-sm font-medium">
                {migrationResult.success ? '✓ Thành công' : '✗ Có lỗi'}
              </p>
              <p className="text-xs mt-1">
                {migrationResult.message || migrationResult.error}
              </p>
              {migrationResult.results && (
                <div className="mt-3 space-y-1">
                  <p className="text-xs font-medium">Chi tiết theo bảng:</p>
                  {Object.entries(migrationResult.results).map(([table, result]: [string, any]) => (
                    <div key={table} className="text-xs flex justify-between">
                      <span>{table}</span>
                      <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                        {result.success ? `✓ ${result.count} rows` : `✗ ${result.error}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {migrationResult.failedTables && migrationResult.failedTables.length > 0 && (
                <p className="text-xs mt-2 text-red-600">
                  Bảng lỗi: {migrationResult.failedTables.join(', ')}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import Dictionary - Full Width */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            <CardTitle>1. Import Localization Dictionary</CardTitle>
          </div>
          <CardDescription>
            Import từ điển bản địa hóa để dịch tên Leagues, Clubs, Nations, Programs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
                id="json-upload"
              />
              <label
                htmlFor="json-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Database className="w-8 h-8 text-muted-foreground" />
                <div className="text-sm">
                  {uploadedFile ? (
                    <span className="text-green-600 font-medium">
                      ✓ {uploadedFile.name}
                    </span>
                  ) : (
                    <>
                      <span className="text-primary font-medium">Chọn file JSON</span>
                      <span className="text-muted-foreground"> hoặc sử dụng file mặc định</span>
                    </>
                  )}
                </div>
              </label>
            </div>
            
            <Button
              onClick={handleImportDictionary}
              disabled={syncingDict}
              className="w-full"
            >
              {syncingDict ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang import...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  {uploadedFile ? 'Import File Đã Chọn' : 'Import Từ File Mặc Định'}
                </>
              )}
            </Button>
          </div>
          
          {dictSyncResult && (
            <div className={`p-3 rounded-lg ${dictSyncResult.success ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}`}>
              <p className="text-sm">
                {dictSyncResult.success 
                  ? `✓ Đã import ${dictSyncResult.totalImported} mục`
                  : `✗ ${dictSyncResult.error}`}
              </p>
            </div>
          )}

          {/* Translation Section */}
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-3">
              Dịch từ điển sang tiếng Việt bằng AI
            </p>
            <Button
              onClick={handleTranslateLocalization}
              disabled={translating}
              variant="secondary"
              className="w-full"
            >
              {translating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang dịch...
                </>
              ) : (
                'Dịch Sang Tiếng Việt'
              )}
            </Button>
            {translationResult && (
              <div className="mt-2 p-3 rounded-lg bg-green-50 dark:bg-green-950">
                <p className="text-sm">✓ {translationResult.message}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sync Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Programs */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              <CardTitle className="text-lg">2. Chương Trình</CardTitle>
            </div>
            <CardDescription>Đồng bộ programs từ Renderz</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleSyncPrograms}
              disabled={syncingPrograms}
              className="w-full"
            >
              {syncingPrograms ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang đồng bộ...
                </>
              ) : (
                'Đồng Bộ Programs'
              )}
            </Button>
            {programsResult && (
              <div className={`mt-3 p-3 rounded-lg text-sm ${programsResult.success ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}`}>
                {programsResult.success ? `✓ ${programsResult.message}` : `✗ ${programsResult.error}`}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leagues */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              <CardTitle className="text-lg">3. Giải Đấu</CardTitle>
            </div>
            <CardDescription>Đồng bộ leagues từ Renderz</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleSyncLeagues}
              disabled={syncingLeagues}
              className="w-full"
            >
              {syncingLeagues ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang đồng bộ...
                </>
              ) : (
                'Đồng Bộ Leagues'
              )}
            </Button>
            {leaguesResult && (
              <div className={`mt-3 p-3 rounded-lg text-sm ${leaguesResult.success ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}`}>
                {leaguesResult.success ? `✓ ${leaguesResult.message}` : `✗ ${leaguesResult.error}`}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Nations */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              <CardTitle className="text-lg">4. Quốc Gia</CardTitle>
            </div>
            <CardDescription>Đồng bộ nations từ Renderz</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleSyncNations}
              disabled={syncingNations}
              className="w-full"
            >
              {syncingNations ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang đồng bộ...
                </>
              ) : (
                'Đồng Bộ Nations'
              )}
            </Button>
            {nationsResult && (
              <div className={`mt-3 p-3 rounded-lg text-sm ${nationsResult.success ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}`}>
                {nationsResult.success ? `✓ ${nationsResult.message}` : `✗ ${nationsResult.error}`}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Teams */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              <CardTitle className="text-lg">5. Câu Lạc Bộ</CardTitle>
            </div>
            <CardDescription>Đồng bộ teams từ Renderz</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleSyncTeams}
              disabled={syncingTeams}
              className="w-full"
            >
              {syncingTeams ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang đồng bộ...
                </>
              ) : (
                'Đồng Bộ Teams'
              )}
            </Button>
            {teamsResult && (
              <div className={`mt-3 p-3 rounded-lg text-sm ${teamsResult.success ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}`}>
                {teamsResult.success ? `✓ ${teamsResult.message}` : `✗ ${teamsResult.error}`}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Traits */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              <CardTitle className="text-lg">6. Đặc Điểm</CardTitle>
            </div>
            <CardDescription>Đồng bộ traits từ Renderz</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleSyncTraits}
              disabled={syncingTraits}
              className="w-full"
            >
              {syncingTraits ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang đồng bộ...
                </>
              ) : (
                'Đồng Bộ Traits'
              )}
            </Button>
            {traitsResult && (
              <div className={`mt-3 p-3 rounded-lg text-sm ${traitsResult.success ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}`}>
                {traitsResult.success ? `✓ ${traitsResult.message}` : `✗ ${traitsResult.error}`}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Celebrations */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              <CardTitle className="text-lg">7. Ăn Mừng</CardTitle>
            </div>
            <CardDescription>Đồng bộ celebrations từ Renderz</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleSyncCelebrations}
              disabled={syncingCelebrations}
              className="w-full"
            >
              {syncingCelebrations ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang đồng bộ...
                </>
              ) : (
                'Đồng Bộ Celebrations'
              )}
            </Button>
            {celebrationsResult && (
              <div className={`mt-3 p-3 rounded-lg text-sm ${celebrationsResult.success ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}`}>
                {celebrationsResult.success ? `✓ ${celebrationsResult.message}` : `✗ ${celebrationsResult.error}`}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skill Moves */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              <CardTitle className="text-lg">8. Kỹ Năng</CardTitle>
            </div>
            <CardDescription>Đồng bộ skill moves từ Renderz</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleSyncSkillMoves}
              disabled={syncingSkillMoves}
              className="w-full"
            >
              {syncingSkillMoves ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang đồng bộ...
                </>
              ) : (
                'Đồng Bộ Skill Moves'
              )}
            </Button>
            {skillMovesResult && (
              <div className={`mt-3 p-3 rounded-lg text-sm ${skillMovesResult.success ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}`}>
                {skillMovesResult.success ? `✓ ${skillMovesResult.message}` : `✗ ${skillMovesResult.error}`}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Players */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              <CardTitle className="text-lg">9. Cầu Thủ (Cuối cùng)</CardTitle>
            </div>
            <CardDescription>
              Đồng bộ tất cả cầu thủ từ Renderz API - chạy sau khi đã đồng bộ các dữ liệu khác
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleSyncPlayers}
              disabled={syncingPlayers}
              className="w-full"
              size="lg"
            >
              {syncingPlayers ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang đồng bộ cầu thủ...
                </>
              ) : (
                'Đồng Bộ Tất Cả Cầu Thủ'
              )}
            </Button>
            {playersResult && (
              <div className={`mt-3 p-3 rounded-lg text-sm ${playersResult.success ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}`}>
                {playersResult.success ? `✓ ${playersResult.message}` : `✗ ${playersResult.error}`}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
