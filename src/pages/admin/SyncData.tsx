import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Database, Trophy, Play, ArrowRightLeft, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

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

  const handleSyncPlayers = async (mode: 'test' | 'full' = 'test') => {
    try {
      setSyncingPlayers(true);
      setPlayersResult(null);
      
      let totalSyncedOverall = 0;
      let totalPages = 0;
      let hasMore = true;
      let iterations = 0;
      const MAX_ITERATIONS = 334; // Allow up to 1000 pages (334 iterations × 3 pages)
      
      toast.info(`Đang bắt đầu đồng bộ cầu thủ (${mode === 'test' ? '5 trang test' : 'toàn bộ'})...`);

      while (hasMore && iterations < MAX_ITERATIONS) {
        iterations++;
        
        const { data, error } = await supabase.functions.invoke('sync-players', {
          body: { 
            mode: mode,
            maxPages: mode === 'test' ? 5 : undefined
          }
        });

        if (error) throw error;

        // Update overall totals
        totalSyncedOverall = data.totalPlayers || totalSyncedOverall;
        totalPages += data.totalPages || 0;
        hasMore = data.hasMore && !data.isComplete;
        
        // Show progress
        if (data.isComplete) {
          toast.success(`🎉 Hoàn tất đồng bộ! Tổng cộng ${totalSyncedOverall} cầu thủ đã được đồng bộ.`);
          break;
        } else if (hasMore) {
          toast.info(`Đã đồng bộ ${data.batchPlayers} cầu thủ (Tổng: ${totalSyncedOverall}, ${totalPages} trang). Tiếp tục...`);
          // Small delay between batches
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      if (iterations >= MAX_ITERATIONS && hasMore) {
        toast.warning(`Đã đạt giới hạn ${MAX_ITERATIONS} lần gọi. Vui lòng chạy lại để tiếp tục từ vị trí đã dừng.`);
      }

      setPlayersResult({ 
        success: true, 
        totalPlayers: totalSyncedOverall,
        totalPages: totalPages,
        message: `Đã hoàn thành đồng bộ ${totalSyncedOverall} cầu thủ từ ${totalPages} trang`
      });
    } catch (error) {
      console.error("Error syncing players:", error);
      toast.error("Lỗi khi đồng bộ cầu thủ: " + (error as Error).message);
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
      
      const { data, error } = await supabase.functions.invoke('import-localization-dictionary', {
        body: dictionaryData
      });
      
      if (error) throw error;
      
      setDictSyncResult(data);
      toast.success(`✓ Đã import ${data.totalImported} mục từ điển`);
      setUploadedFile(null);
    } catch (error: any) {
      console.error('Dictionary import error:', error);
      setDictSyncResult({ success: false, error: error.message });
      toast.error('Lỗi khi import từ điển bản địa hóa: ' + error.message);
    } finally {
      setSyncingDict(false);
    }
  };

  const handleSyncLeagues = async () => {
    try {
      setSyncingLeagues(true);
      setLeaguesResult(null);
      toast.info('Đang đồng bộ dữ liệu giải đấu toàn cục...');

      const { data, error } = await supabase.functions.invoke('sync-leagues');

      if (error) throw error;

      setLeaguesResult(data);
      toast.success("Đồng bộ giải đấu thành công!");
    } catch (error) {
      console.error("Error syncing leagues:", error);
      toast.error("Lỗi khi đồng bộ giải đấu: " + (error as Error).message);
    } finally {
      setSyncingLeagues(false);
    }
  };

  const handleSyncNations = async () => {
    try {
      setSyncingNations(true);
      setNationsResult(null);
      toast.info('Đang đồng bộ dữ liệu quốc gia...');

      const { data, error } = await supabase.functions.invoke('sync-renderz-nations');

      if (error) throw error;

      setNationsResult(data);
      toast.success("Đồng bộ quốc gia thành công!");
    } catch (error) {
      console.error("Error syncing nations:", error);
      toast.error("Lỗi khi đồng bộ quốc gia: " + (error as Error).message);
    } finally {
      setSyncingNations(false);
    }
  };

  const handleSyncTeams = async () => {
    try {
      setSyncingTeams(true);
      setTeamsResult(null);
      toast.info('Đang đồng bộ dữ liệu câu lạc bộ...');

      const { data, error } = await supabase.functions.invoke('sync-renderz-teams');

      if (error) throw error;

      setTeamsResult(data);
      toast.success("Đồng bộ câu lạc bộ thành công!");
    } catch (error) {
      console.error("Error syncing teams:", error);
      toast.error("Lỗi khi đồng bộ câu lạc bộ: " + (error as Error).message);
    } finally {
      setSyncingTeams(false);
    }
  };

  const handleSyncTraits = async () => {
    try {
      setSyncingTraits(true);
      setTraitsResult(null);
      toast.info('Đang đồng bộ dữ liệu chỉ số ẩn...');

      const { data, error } = await supabase.functions.invoke('sync-renderz-traits');

      if (error) throw error;

      setTraitsResult(data);
      toast.success("Đồng bộ chỉ số ẩn thành công!");
    } catch (error) {
      console.error("Error syncing traits:", error);
      toast.error("Lỗi khi đồng bộ chỉ số ẩn: " + (error as Error).message);
    } finally {
      setSyncingTraits(false);
    }
  };

  const handleSyncPrograms = async () => {
    try {
      setSyncingPrograms(true);
      setProgramsResult(null);
      toast.info('Đang đồng bộ dữ liệu chương trình/sự kiện...');

      const { data, error } = await supabase.functions.invoke('sync-renderz-programs');

      if (error) throw error;

      setProgramsResult(data);
      toast.success("Đồng bộ chương trình thành công!");
    } catch (error) {
      console.error("Error syncing programs:", error);
      toast.error("Lỗi khi đồng bộ chương trình: " + (error as Error).message);
    } finally {
      setSyncingPrograms(false);
    }
  };

  const handleSyncCelebrations = async () => {
    try {
      setSyncingCelebrations(true);
      setCelebrationsResult(null);
      toast.info('Đang đồng bộ dữ liệu ăn mừng...');

      const { data, error } = await supabase.functions.invoke('sync-renderz-celebrations');

      if (error) throw error;

      setCelebrationsResult(data);
      toast.success("Đồng bộ ăn mừng thành công!");
    } catch (error) {
      console.error("Error syncing celebrations:", error);
      toast.error("Lỗi khi đồng bộ ăn mừng: " + (error as Error).message);
    } finally {
      setSyncingCelebrations(false);
    }
  };

  const handleSyncSkillMoves = async () => {
    try {
      setSyncingSkillMoves(true);
      setSkillMovesResult(null);
      toast.info('Đang đồng bộ dữ liệu kỹ năng...');

      const { data, error } = await supabase.functions.invoke('sync-renderz-skillMoves');

      if (error) throw error;

      setSkillMovesResult(data);
      toast.success("Đồng bộ kỹ năng thành công!");
    } catch (error) {
      console.error("Error syncing skill moves:", error);
      toast.error("Lỗi khi đồng bộ kỹ năng: " + (error as Error).message);
    } finally {
      setSyncingSkillMoves(false);
    }
  };

  const handleTranslateLocalization = async () => {
    try {
      setTranslating(true);
      setTranslationResult(null);
      
      let totalTranslated = 0;
      let hasMore = true;
      let iterations = 0;
      const MAX_ITERATIONS = 10; // Prevent infinite loops
      
      toast.info('Đang bắt đầu dịch từ điển sang tiếng Việt...');

      while (hasMore && iterations < MAX_ITERATIONS) {
        iterations++;
        
        const { data, error } = await supabase.functions.invoke('translate-localization');

        if (error) throw error;

        totalTranslated += data.translated;
        hasMore = data.hasMore;
        
        if (hasMore) {
          toast.info(`Đã dịch ${totalTranslated} bản ghi, còn ${data.remaining} bản ghi. Tiếp tục...`);
          // Small delay between batches
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

  const handleMigrateData = async () => {
    try {
      setMigrating(true);
      setMigrationResult(null);
      toast.info('Đang bắt đầu di chuyển dữ liệu từ Supabase cũ...');

      const { data, error } = await supabase.functions.invoke('migrate-data', {
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
          Quản lý đồng bộ dữ liệu từ Renderz API và các nguồn bên ngoài
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
            Tự động di chuyển toàn bộ dữ liệu từ Supabase project cũ (nhdmgiyoienkixokcoue) sang Lovable Cloud hiện tại
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
                      <p className="text-xs text-muted-foreground mt-1">
                        Format: {`{\\"LeagueName_1\\": \\"3F Superliga\\", ...}`}
                      </p>
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
                  {uploadedFile ? 'Import File Đã Chọn' : 'Import Từ Public Folder'}
                </>
              )}
            </Button>
          </div>
          
          {dictSyncResult && (
            <div className={`p-4 rounded-lg ${dictSyncResult.success ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}`}>
              <p className="text-sm font-medium">
                {dictSyncResult.success ? '✓ Thành công' : '✗ Lỗi'}
              </p>
              <p className="text-xs mt-1">
                {dictSyncResult.message}
              </p>
              {dictSyncResult.totalImported && (
                <p className="text-xs mt-1">
                  Đã import: {dictSyncResult.totalImported} / {dictSyncResult.totalEntries} mục
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Translate Dictionary - Full Width */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            <CardTitle>2. Dịch Từ Điển Sang Tiếng Việt</CardTitle>
          </div>
          <CardDescription>
            Dịch toàn bộ từ điển bản địa hóa từ tiếng Anh sang tiếng Việt bằng AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleTranslateLocalization}
            disabled={translating}
            className="w-full"
          >
            {translating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang dịch...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Dịch Toàn Bộ Sang Tiếng Việt
              </>
            )}
          </Button>
          
          {translationResult && (
            <div className={`p-4 rounded-lg ${translationResult.success ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}`}>
              <p className="text-sm font-medium">
                {translationResult.success ? '✓ Thành công' : '✗ Lỗi'}
              </p>
              <p className="text-xs mt-1">
                {translationResult.message}
              </p>
              {translationResult.translated && (
                <p className="text-xs mt-1">
                  Đã dịch: {translationResult.translated} / {translationResult.totalRecords} bản ghi
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grid Layout for Sync Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sync Players Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              <CardTitle>Đồng Bộ Cầu Thủ</CardTitle>
            </div>
            <CardDescription>
              Đồng bộ dữ liệu cầu thủ từ Renderz API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button 
                onClick={() => handleSyncPlayers('test')}
                disabled={syncingPlayers}
                variant="outline"
                className="flex-1"
              >
                {syncingPlayers ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                Test (5 trang)
              </Button>
              <Button 
                onClick={() => handleSyncPlayers('full')}
                disabled={syncingPlayers}
                className="flex-1"
              >
                {syncingPlayers ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Database className="w-4 h-4 mr-2" />
                )}
                Toàn Bộ
              </Button>
            </div>

            {playersResult && (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="text-sm font-semibold text-green-600">✅ {playersResult.message}</p>
                <div className="text-xs space-y-1">
                  <p>• Tổng cầu thủ: {playersResult.playersProcessed}</p>
                  <p>• Đã import: {playersResult.playersImported}</p>
                  <p>• Đã cập nhật: {playersResult.playersUpdated}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rest of sync cards */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              <CardTitle>Đồng Bộ Giải Đấu</CardTitle>
            </div>
            <CardDescription>
              Đồng bộ dữ liệu giải đấu từ Renderz API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSyncLeagues} disabled={syncingLeagues} className="w-full">
              {syncingLeagues ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Database className="w-4 h-4 mr-2" />
              )}
              Đồng Bộ Giải Đấu
            </Button>
            {leaguesResult && (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="text-sm font-semibold text-green-600">✅ {leaguesResult.message}</p>
                <div className="text-xs space-y-1">
                  <p>• Tổng giải đấu: {leaguesResult.leaguesProcessed}</p>
                  <p>• Đã import: {leaguesResult.leaguesImported}</p>
                  <p>• Đã cập nhật: {leaguesResult.leaguesUpdated}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              <CardTitle>Đồng Bộ Quốc Gia</CardTitle>
            </div>
            <CardDescription>
              Đồng bộ dữ liệu quốc gia từ Renderz API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSyncNations} disabled={syncingNations} className="w-full">
              {syncingNations ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Database className="w-4 h-4 mr-2" />
              )}
              Đồng Bộ Quốc Gia
            </Button>
            {nationsResult && (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="text-sm font-semibold text-green-600">✅ {nationsResult.message}</p>
                <div className="text-xs space-y-1">
                  <p>• Tổng quốc gia: {nationsResult.nationsProcessed}</p>
                  <p>• Đã import: {nationsResult.nationsImported}</p>
                  <p>• Đã cập nhật: {nationsResult.nationsUpdated}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              <CardTitle>Đồng Bộ Câu Lạc Bộ</CardTitle>
            </div>
            <CardDescription>
              Đồng bộ dữ liệu câu lạc bộ từ Renderz API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSyncTeams} disabled={syncingTeams} className="w-full">
              {syncingTeams ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Database className="w-4 h-4 mr-2" />
              )}
              Đồng Bộ Câu Lạc Bộ
            </Button>
            {teamsResult && (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="text-sm font-semibold text-green-600">✅ {teamsResult.message}</p>
                <div className="text-xs space-y-1">
                  <p>• Tổng câu lạc bộ: {teamsResult.teamsProcessed}</p>
                  <p>• Đã import: {teamsResult.teamsImported}</p>
                  <p>• Đã cập nhật: {teamsResult.teamsUpdated}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              <CardTitle>Đồng Bộ Chỉ Số Ẩn</CardTitle>
            </div>
            <CardDescription>
              Đồng bộ dữ liệu chỉ số ẩn từ Renderz API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSyncTraits} disabled={syncingTraits} className="w-full">
              {syncingTraits ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Database className="w-4 h-4 mr-2" />
              )}
              Đồng Bộ Chỉ Số Ẩn
            </Button>
            {traitsResult && (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="text-sm font-semibold text-green-600">✅ {traitsResult.message}</p>
                <div className="text-xs space-y-1">
                  <p>• Tổng chỉ số ẩn: {traitsResult.traitsProcessed}</p>
                  <p>• Đã import: {traitsResult.traitsImported}</p>
                  <p>• Đã cập nhật: {traitsResult.traitsUpdated}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              <CardTitle>Đồng Bộ Chương Trình</CardTitle>
            </div>
            <CardDescription>
              Đồng bộ dữ liệu chương trình từ Renderz API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSyncPrograms} disabled={syncingPrograms} className="w-full">
              {syncingPrograms ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Database className="w-4 h-4 mr-2" />
              )}
              Đồng Bộ Chương Trình
            </Button>
            {programsResult && (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="text-sm font-semibold text-green-600">✅ {programsResult.message}</p>
                <div className="text-xs space-y-1">
                  <p>• Tổng chương trình: {programsResult.programsProcessed}</p>
                  <p>• Đã import: {programsResult.programsImported}</p>
                  <p>• Đã cập nhật: {programsResult.programsUpdated}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              <CardTitle>Đồng Bộ Ăn Mừng</CardTitle>
            </div>
            <CardDescription>
              Đồng bộ dữ liệu ăn mừng từ Renderz API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSyncCelebrations} disabled={syncingCelebrations} className="w-full">
              {syncingCelebrations ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Database className="w-4 h-4 mr-2" />
              )}
              Đồng Bộ Ăn Mừng
            </Button>
            {celebrationsResult && (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="text-sm font-semibold text-green-600">✅ {celebrationsResult.message}</p>
                <div className="text-xs space-y-1">
                  <p>• Tổng ăn mừng: {celebrationsResult.celebrationsProcessed}</p>
                  <p>• Đã import: {celebrationsResult.celebrationsImported}</p>
                  <p>• Đã cập nhật: {celebrationsResult.celebrationsUpdated}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              <CardTitle>Đồng Bộ Kỹ Năng</CardTitle>
            </div>
            <CardDescription>
              Đồng bộ dữ liệu kỹ năng từ Renderz API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSyncSkillMoves} disabled={syncingSkillMoves} className="w-full">
              {syncingSkillMoves ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Database className="w-4 h-4 mr-2" />
              )}
              Đồng Bộ Kỹ Năng
            </Button>
            {skillMovesResult && (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="text-sm font-semibold text-green-600">✅ {skillMovesResult.message}</p>
                <div className="text-xs space-y-1">
                  <p>• Tổng kỹ năng: {skillMovesResult.skillMovesProcessed}</p>
                  <p>• Đã import: {skillMovesResult.skillMovesImported}</p>
                  <p>• Đã cập nhật: {skillMovesResult.skillMovesUpdated}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
