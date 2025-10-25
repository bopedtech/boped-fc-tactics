import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export interface FilterState {
  ratingRange: [number, number];
  positionFilter: string;
  alternatePositions: string[];
  leagues: string[];
  clubs: string[];
  nations: string[];
  programs: string[];
  heightRange: [number, number];
  weightRange: [number, number];
  skillMovesLevel: number;
  weakFoot: number;
  strongFoot: string;
  workRateAtt: number;
  workRateDef: number;
  traits: string[];
}

interface PlayerFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
}

const positions = ["GK", "LB", "LWB", "CB", "RB", "RWB", "CDM", "CM", "CAM", "LM", "RM", "LW", "RW", "CF", "ST"];

const positionNames: Record<string, string> = {
  "GK": "Thủ môn",
  "LB": "Hậu vệ trái",
  "LWB": "Tiền vệ cánh trái",
  "CB": "Trung vệ",
  "RB": "Hậu vệ phải",
  "RWB": "Tiền vệ cánh phải",
  "CDM": "Tiền vệ phòng ngự",
  "CM": "Tiền vệ trung tâm",
  "CAM": "Tiền vệ tấn công",
  "LM": "Tiền vệ trái",
  "RM": "Tiền vệ phải",
  "LW": "Tiền đạo cánh trái",
  "RW": "Tiền đạo cánh phải",
  "CF": "Tiền đạo ảo",
  "ST": "Tiền đạo"
};

const workRateNames: Record<number, string> = {
  0: "Tất cả",
  1: "Thấp",
  2: "Trung bình",
  3: "Cao"
};

const footNames: Record<string, string> = {
  "all": "Tất cả",
  "1": "Chân phải",
  "2": "Chân trái"
};

export default function PlayerFilters({ filters, onFilterChange, onReset }: PlayerFiltersProps) {
  const [leagues, setLeagues] = useState<Array<{ id: number; displayName: string; image?: string }>>([]);
  const [nations, setNations] = useState<Array<{ id: number; displayName: string; image?: string }>>([]);
  const [teams, setTeams] = useState<Array<{ id: number; displayName: string; image?: string }>>([]);
  const [programs, setPrograms] = useState<Array<{ id: string; displayName: string; image?: string }>>([]);
  const [traits, setTraits] = useState<Array<{ id: number; displayName: string }>>([]);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    rating: true,
    position: true,
    alternatePositions: false,
    league: false,
    clubs: false,
    nations: false,
    program: false,
    height: false,
    weight: false,
    skillMoves: false,
    weakFoot: false,
    strongFoot: false,
    workrates: false,
    traits: false
  });

  useEffect(() => {
    fetchLeagues();
    fetchNations();
    fetchTeams();
    fetchPrograms();
    fetchTraits();
  }, []);

  const fetchLeagues = async () => {
    try {
      const { data, error } = await supabase
        .from('leagues')
        .select('id, displayName, image')
        .order('displayName', { ascending: true });
      
      if (error) throw error;
      setLeagues(data || []);
    } catch (error) {
      console.error('Error fetching leagues:', error);
    }
  };

  const fetchNations = async () => {
    try {
      const { data, error } = await supabase
        .from('nations')
        .select('id, displayName, image')
        .order('displayName', { ascending: true });
      
      if (error) throw error;
      setNations(data || []);
    } catch (error) {
      console.error('Error fetching nations:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('id, displayName, image')
        .order('displayName', { ascending: true });
      
      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('id, displayName, image')
        .order('displayName', { ascending: true });
      
      if (error) throw error;
      setPrograms(data || []);
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  const fetchTraits = async () => {
    try {
      const { data, error } = await supabase
        .from('traits')
        .select('id, displayName')
        .order('displayName', { ascending: true });
      
      if (error) throw error;
      setTraits(data || []);
    } catch (error) {
      console.error('Error fetching traits:', error);
    }
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="h-[calc(100vh-240px)]">
      <ScrollArea className="h-full">
        <div className="p-4 space-y-1 pr-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm uppercase text-muted-foreground">Bộ lọc</h3>
          <Button
            onClick={onReset}
            variant="outline"
            size="sm"
            className="h-8 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Đặt lại tất cả
          </Button>
        </div>

        {/* Ratings */}
        <Collapsible open={openSections.rating} onOpenChange={() => toggleSection('rating')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2.5 px-3 hover:bg-muted/50 rounded-md transition-colors">
            <span className="font-medium text-sm">Chỉ số (OVR)</span>
            {openSections.rating ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="px-3 py-3 space-y-3">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{filters.ratingRange[0]}</span>
              <span>{filters.ratingRange[1]}</span>
            </div>
            <Slider
              min={0}
              max={125}
              step={1}
              value={filters.ratingRange}
              onValueChange={(val) => updateFilter('ratingRange', val)}
              className="w-full"
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Position */}
        <Collapsible open={openSections.position} onOpenChange={() => toggleSection('position')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2.5 px-3 hover:bg-muted/50 rounded-md transition-colors">
            <span className="font-medium text-sm">Vị trí</span>
            {openSections.position ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="px-3 py-2">
            <Select value={filters.positionFilter} onValueChange={(val) => updateFilter('positionFilter', val)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="all">Tất cả</SelectItem>
                {positions.map((pos) => (
                  <SelectItem key={pos} value={pos}>
                    {positionNames[pos]} ({pos})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CollapsibleContent>
        </Collapsible>

        {/* Alternate Positions */}
        <Collapsible open={openSections.alternatePositions} onOpenChange={() => toggleSection('alternatePositions')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2.5 px-3 hover:bg-muted/50 rounded-md transition-colors">
            <span className="font-medium text-sm">Vị trí phụ</span>
            {openSections.alternatePositions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="px-3 py-2 space-y-2">
            {positions.map((pos) => (
              <div key={pos} className="flex items-center space-x-2">
                <Checkbox
                  id={`alt-${pos}`}
                  checked={filters.alternatePositions.includes(pos)}
                  onCheckedChange={(checked) => {
                    const newAlt = checked
                      ? [...filters.alternatePositions, pos]
                      : filters.alternatePositions.filter(p => p !== pos);
                    updateFilter('alternatePositions', newAlt);
                  }}
                />
                <label htmlFor={`alt-${pos}`} className="text-xs cursor-pointer">
                  {positionNames[pos]} ({pos})
                </label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Leagues Filter */}
        <Collapsible open={openSections.league} onOpenChange={() => toggleSection('league')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2.5 px-3 hover:bg-muted/50 rounded-md transition-colors">
            <span className="font-medium text-sm">Giải đấu</span>
            {openSections.league ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="px-3 py-2">
            <ScrollArea className="h-[200px]">
              <div className="space-y-2 pr-4">
                {leagues.map((league) => (
                  <div key={league.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`league-${league.id}`}
                      checked={filters.leagues.includes(league.id.toString())}
                      onCheckedChange={(checked) => {
                        const newLeagues = checked
                          ? [...filters.leagues, league.id.toString()]
                          : filters.leagues.filter(l => l !== league.id.toString());
                        updateFilter('leagues', newLeagues);
                      }}
                    />
                    {league.image && (
                      <img src={league.image} alt="" className="w-5 h-5 object-contain" />
                    )}
                    <label htmlFor={`league-${league.id}`} className="text-xs cursor-pointer flex-1">
                      {league.displayName}
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CollapsibleContent>
        </Collapsible>

        {/* Clubs Filter */}
        <Collapsible open={openSections.clubs} onOpenChange={() => toggleSection('clubs')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2.5 px-3 hover:bg-muted/50 rounded-md transition-colors">
            <span className="font-medium text-sm">Câu lạc bộ</span>
            {openSections.clubs ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="px-3 py-2">
            <ScrollArea className="h-[200px]">
              <div className="space-y-2 pr-4">
                {teams.map((team) => (
                  <div key={team.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`team-${team.id}`}
                      checked={filters.clubs.includes(team.id.toString())}
                      onCheckedChange={(checked) => {
                        const newClubs = checked
                          ? [...filters.clubs, team.id.toString()]
                          : filters.clubs.filter(c => c !== team.id.toString());
                        updateFilter('clubs', newClubs);
                      }}
                    />
                    {team.image && (
                      <img src={team.image} alt="" className="w-5 h-5 object-contain" />
                    )}
                    <label htmlFor={`team-${team.id}`} className="text-xs cursor-pointer flex-1">
                      {team.displayName}
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CollapsibleContent>
        </Collapsible>

        {/* Nations Filter */}
        <Collapsible open={openSections.nations} onOpenChange={() => toggleSection('nations')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2.5 px-3 hover:bg-muted/50 rounded-md transition-colors">
            <span className="font-medium text-sm">Quốc tịch</span>
            {openSections.nations ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="px-3 py-2">
            <ScrollArea className="h-[200px]">
              <div className="space-y-2 pr-4">
                {nations.map((nation) => (
                  <div key={nation.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`nation-${nation.id}`}
                      checked={filters.nations.includes(nation.id.toString())}
                      onCheckedChange={(checked) => {
                        const newNations = checked
                          ? [...filters.nations, nation.id.toString()]
                          : filters.nations.filter(n => n !== nation.id.toString());
                        updateFilter('nations', newNations);
                      }}
                    />
                    {nation.image && (
                      <img src={nation.image} alt="" className="w-5 h-5 object-contain" />
                    )}
                    <label htmlFor={`nation-${nation.id}`} className="text-xs cursor-pointer flex-1">
                      {nation.displayName}
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CollapsibleContent>
        </Collapsible>

        {/* Programs Filter */}
        <Collapsible open={openSections.program} onOpenChange={() => toggleSection('program')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2.5 px-3 hover:bg-muted/50 rounded-md transition-colors">
            <span className="font-medium text-sm">Chương trình/Sự kiện</span>
            {openSections.program ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="px-3 py-2">
            <ScrollArea className="h-[200px]">
              <div className="space-y-2 pr-4">
                {programs.map((program) => (
                  <div key={program.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`program-${program.id}`}
                      checked={filters.programs.includes(program.id)}
                      onCheckedChange={(checked) => {
                        const newPrograms = checked
                          ? [...filters.programs, program.id]
                          : filters.programs.filter(p => p !== program.id);
                        updateFilter('programs', newPrograms);
                      }}
                    />
                    {program.image && (
                      <img src={program.image} alt="" className="w-5 h-5 object-contain" />
                    )}
                    <label htmlFor={`program-${program.id}`} className="text-xs cursor-pointer flex-1">
                      {program.displayName}
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CollapsibleContent>
        </Collapsible>

        {/* Traits Filter */}
        <Collapsible open={openSections.traits} onOpenChange={() => toggleSection('traits')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2.5 px-3 hover:bg-muted/50 rounded-md transition-colors">
            <span className="font-medium text-sm">Đặc điểm</span>
            {openSections.traits ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="px-3 py-2">
            <ScrollArea className="h-[200px]">
              <div className="space-y-2 pr-4">
                {traits.map((trait) => (
                  <div key={trait.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`trait-${trait.id}`}
                      checked={filters.traits.includes(trait.id.toString())}
                      onCheckedChange={(checked) => {
                        const newTraits = checked
                          ? [...filters.traits, trait.id.toString()]
                          : filters.traits.filter(t => t !== trait.id.toString());
                        updateFilter('traits', newTraits);
                      }}
                    />
                    <label htmlFor={`trait-${trait.id}`} className="text-xs cursor-pointer flex-1">
                      {trait.displayName}
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CollapsibleContent>
        </Collapsible>

        {/* Height */}
        <Collapsible open={openSections.height} onOpenChange={() => toggleSection('height')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2.5 px-3 hover:bg-muted/50 rounded-md transition-colors">
            <span className="font-medium text-sm">Chiều cao</span>
            {openSections.height ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="px-3 py-3 space-y-3">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{filters.heightRange[0]} cm</span>
              <span>{filters.heightRange[1]} cm</span>
            </div>
            <Slider
              min={150}
              max={210}
              step={1}
              value={filters.heightRange}
              onValueChange={(val) => updateFilter('heightRange', val)}
              className="w-full"
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Weight */}
        <Collapsible open={openSections.weight} onOpenChange={() => toggleSection('weight')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2.5 px-3 hover:bg-muted/50 rounded-md transition-colors">
            <span className="font-medium text-sm">Cân nặng</span>
            {openSections.weight ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="px-3 py-3 space-y-3">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{filters.weightRange[0]} kg</span>
              <span>{filters.weightRange[1]} kg</span>
            </div>
            <Slider
              min={50}
              max={110}
              step={1}
              value={filters.weightRange}
              onValueChange={(val) => updateFilter('weightRange', val)}
              className="w-full"
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Skill Moves Level */}
        <Collapsible open={openSections.skillMoves} onOpenChange={() => toggleSection('skillMoves')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2.5 px-3 hover:bg-muted/50 rounded-md transition-colors">
            <span className="font-medium text-sm">Kỹ năng rê bóng</span>
            {openSections.skillMoves ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="px-3 py-2">
            <Select value={filters.skillMovesLevel.toString()} onValueChange={(val) => updateFilter('skillMovesLevel', parseInt(val))}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="0">Tất cả</SelectItem>
                {[1, 2, 3, 4, 5].map((level) => (
                  <SelectItem key={level} value={level.toString()}>
                    {level} sao trở lên
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CollapsibleContent>
        </Collapsible>

        {/* Weak Foot */}
        <Collapsible open={openSections.weakFoot} onOpenChange={() => toggleSection('weakFoot')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2.5 px-3 hover:bg-muted/50 rounded-md transition-colors">
            <span className="font-medium text-sm">Chân thuận</span>
            {openSections.weakFoot ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="px-3 py-2">
            <Select value={filters.weakFoot.toString()} onValueChange={(val) => updateFilter('weakFoot', parseInt(val))}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="0">Tất cả</SelectItem>
                {[1, 2, 3, 4, 5].map((stars) => (
                  <SelectItem key={stars} value={stars.toString()}>
                    {stars} sao trở lên
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CollapsibleContent>
        </Collapsible>

        {/* Strong Foot */}
        <Collapsible open={openSections.strongFoot} onOpenChange={() => toggleSection('strongFoot')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2.5 px-3 hover:bg-muted/50 rounded-md transition-colors">
            <span className="font-medium text-sm">Chân mạnh</span>
            {openSections.strongFoot ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="px-3 py-2">
            <Select value={filters.strongFoot} onValueChange={(val) => updateFilter('strongFoot', val)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {Object.entries(footNames).map(([key, name]) => (
                  <SelectItem key={key} value={key}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CollapsibleContent>
        </Collapsible>

        {/* Work Rates */}
        <Collapsible open={openSections.workrates} onOpenChange={() => toggleSection('workrates')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2.5 px-3 hover:bg-muted/50 rounded-md transition-colors">
            <span className="font-medium text-sm">Tốc độ làm việc</span>
            {openSections.workrates ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="px-3 py-2 space-y-3">
            <div className="space-y-2">
              <Label className="text-xs">Tấn công</Label>
              <Select value={filters.workRateAtt.toString()} onValueChange={(val) => updateFilter('workRateAtt', parseInt(val))}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {Object.entries(workRateNames).map(([key, name]) => (
                    <SelectItem key={key} value={key}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Phòng ngự</Label>
              <Select value={filters.workRateDef.toString()} onValueChange={(val) => updateFilter('workRateDef', parseInt(val))}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {Object.entries(workRateNames).map(([key, name]) => (
                    <SelectItem key={key} value={key}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CollapsibleContent>
        </Collapsible>
        </div>
      </ScrollArea>
    </div>
  );
}
