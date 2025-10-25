import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Users, Play, Trophy, Database } from "lucide-react";
import Header from "@/components/Header";

export default function Admin() {
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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleSyncPlayers = async (mode: 'test' | 'full' = 'test') => {
    try {
      setSyncingPlayers(true);
      setPlayersResult(null);
      toast.info(`Đang đồng bộ cầu thủ (${mode === 'test' ? '5 trang test' : 'toàn bộ'})...`);

      const { data, error } = await supabase.functions.invoke('sync-players', {
        body: { 
          mode: mode,
          maxPages: 5
        }
      });

      if (error) throw error;

      setPlayersResult(data);
      toast.success("Đồng bộ cầu thủ thành công!");
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
        // Read uploaded file
        toast.info('Đang đọc file tải lên...');
        const text = await uploadedFile.text();
        dictionaryData = JSON.parse(text);
      } else {
        // Fallback: Fetch the JSON file from public folder
        toast.info('Đang tải tệp từ điển mặc định...');
        const response = await fetch('/localization_dictionary_import.json');
        if (!response.ok) {
          throw new Error('Không thể tải tệp từ điển');
        }
        dictionaryData = await response.json();
      }
      
      toast.info(`Đang import ${Object.keys(dictionaryData).length} mục...`);
      
      // Send the dictionary data to the edge function
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Quản Trị Hệ Thống</h1>
          <p className="text-muted-foreground">Quản lý đồng bộ dữ liệu từ Renderz API</p>
        </div>

        <div className="space-y-6">
          {/* Import Dictionary Card */}
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
                            Format: {`{"LeagueName_1": "3F Superliga", ...}`}
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

          {/* Sync Leagues Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                <CardTitle>2. Đồng Bộ Giải Đấu</CardTitle>
              </div>
              <CardDescription>
                Đồng bộ dữ liệu giải đấu toàn cục (sử dụng dictionary để dịch tên)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleSyncLeagues}
                disabled={syncingLeagues}
                className="w-full"
              >
                {syncingLeagues ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                Đồng Bộ Leagues
              </Button>

              {leaguesResult && (
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p className="text-sm font-semibold text-green-600">✅ {leaguesResult.message}</p>
                  <div className="text-xs space-y-1">
                    <p>• Tổng giải đấu: {leaguesResult.synced || leaguesResult.totalLeagues}</p>
                    <p>• Đã dịch: {leaguesResult.translated}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sync Nations Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                <CardTitle>3. Đồng Bộ Quốc Gia</CardTitle>
              </div>
              <CardDescription>
                Đồng bộ dữ liệu quốc gia (sử dụng dictionary để dịch tên)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleSyncNations}
                disabled={syncingNations}
                className="w-full"
              >
                {syncingNations ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                Đồng Bộ Nations
              </Button>

              {nationsResult && (
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p className="text-sm font-semibold text-green-600">✅ {nationsResult.message}</p>
                  <div className="text-xs space-y-1">
                    <p>• Tổng quốc gia: {nationsResult.synced}</p>
                    <p>• Đã dịch: {nationsResult.translated}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sync Teams Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                <CardTitle>4. Đồng Bộ Câu Lạc Bộ</CardTitle>
              </div>
              <CardDescription>
                Đồng bộ dữ liệu câu lạc bộ (sử dụng dictionary để dịch tên)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleSyncTeams}
                disabled={syncingTeams}
                className="w-full"
              >
                {syncingTeams ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                Đồng Bộ Teams
              </Button>

              {teamsResult && (
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p className="text-sm font-semibold text-green-600">✅ {teamsResult.message}</p>
                  <div className="text-xs space-y-1">
                    <p>• Tổng câu lạc bộ: {teamsResult.synced}</p>
                    <p>• Đã dịch: {teamsResult.translated}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sync Traits Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                <CardTitle>5. Đồng Bộ Chỉ Số Ẩn (Traits)</CardTitle>
              </div>
              <CardDescription>
                Đồng bộ dữ liệu chỉ số ẩn của cầu thủ (sử dụng dictionary để dịch tên và mô tả)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleSyncTraits}
                disabled={syncingTraits}
                className="w-full"
              >
                {syncingTraits ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                Đồng Bộ Traits
              </Button>

              {traitsResult && (
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p className="text-sm font-semibold text-green-600">✅ {traitsResult.message}</p>
                  <div className="text-xs space-y-1">
                    <p>• Tổng chỉ số ẩn: {traitsResult.synced}</p>
                    <p>• Đã dịch: {traitsResult.translated}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sync Programs Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                <CardTitle>6. Đồng Bộ Chương Trình/Sự Kiện</CardTitle>
              </div>
              <CardDescription>
                Đồng bộ dữ liệu các chương trình và sự kiện (TOTY, UCL, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleSyncPrograms}
                disabled={syncingPrograms}
                className="w-full"
              >
                {syncingPrograms ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                Đồng Bộ Programs
              </Button>

              {programsResult && (
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p className="text-sm font-semibold text-green-600">✅ {programsResult.message}</p>
                  <div className="text-xs space-y-1">
                    <p>• Tổng chương trình: {programsResult.synced}</p>
                    <p>• Đã dịch: {programsResult.translated}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sync Players Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <CardTitle>7. Đồng Bộ Cầu Thủ</CardTitle>
              </div>
              <CardDescription>
                Đồng bộ dữ liệu cầu thủ từ mùa 24, 25, 26
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
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  Toàn Bộ
                </Button>
              </div>

              {playersResult && (
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p className="text-sm font-semibold text-green-600">✅ {playersResult.message}</p>
                  <div className="text-xs space-y-1">
                    <p>• Tổng cầu thủ: {playersResult.totalPlayers}</p>
                    <p>• Tổng trang: {playersResult.totalPages}</p>
                    <p>• Chế độ: {playersResult.mode}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Hướng Dẫn</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Bước 1:</strong> Import Localization Dictionary trước (chỉ cần 1 lần).</p>
            <p><strong>Bước 2-6:</strong> Đồng bộ Leagues, Nations, Teams, Traits và Programs để áp dụng dictionary và dịch tên.</p>
            <p><strong>Bước 7:</strong> Test đồng bộ cầu thủ (5 trang ~50 cầu thủ), sau đó chạy full sync.</p>
            <p className="text-yellow-600 mt-4"><strong>⚠️ Lưu ý:</strong> Full sync có thể mất vài phút. Không tắt trình duyệt trong lúc đồng bộ.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
