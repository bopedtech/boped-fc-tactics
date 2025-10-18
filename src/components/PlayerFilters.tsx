import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

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

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm uppercase text-muted-foreground">Bộ lọc</h3>
          <button
            onClick={onReset}
            className="text-xs text-primary hover:underline"
          >
            Đặt lại
          </button>
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
  );
}
