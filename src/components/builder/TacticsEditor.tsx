import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useT } from "@/contexts/LocalizationContext";

export interface TacticsData {
  buildUp: {
    speed: number;
    passDistance: number;
    mentality: 'attacking' | 'balanced' | 'defensive';
    positioning: 'organized' | 'free';
  };
  offence: {
    passTendency: number;
    crossTendency: number;
    shootTendency: number;
    positioning: 'organized' | 'free';
  };
  defense: {
    pressure: number;
    width: number;
    aggression: number;
    backLine: 'cover' | 'offside-trap';
  };
}

export const DEFAULT_TACTICS: TacticsData = {
  buildUp: { speed: 2, passDistance: 2, mentality: 'balanced', positioning: 'organized' },
  offence: { passTendency: 2, crossTendency: 2, shootTendency: 2, positioning: 'organized' },
  defense: { pressure: 2, width: 2, aggression: 2, backLine: 'cover' },
};

interface TacticsEditorProps {
  tactics: TacticsData;
  onChange: (tactics: TacticsData) => void;
}

export default function TacticsEditor({ tactics, onChange }: TacticsEditorProps) {
  const { t } = useT();

  const updateTactic = (category: keyof TacticsData, field: string, value: any) => {
    onChange({
      ...tactics,
      [category]: {
        ...tactics[category],
        [field]: value,
      },
    });
  };

  const renderSlider = (label: string, value: number, onChangeVal: (v: number) => void) => (
    <div className="space-y-3 mb-4">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium text-gray-200">{label}</Label>
        <span className="text-xs text-muted-foreground">{value}/3</span>
      </div>
      <Slider
        value={[value]}
        min={1}
        max={3}
        step={1}
        onValueChange={(val) => onChangeVal(val[0])}
        className="[&_.relative]:h-2"
      />
      <div className="flex justify-between text-[10px] text-muted-foreground px-1">
        <span>Thấp</span>
        <span>TB</span>
        <span>Cao</span>
      </div>
    </div>
  );

  return (
    <Card className="p-4 bg-black/40 backdrop-blur-md border border-white/10 text-white h-full overflow-y-auto custom-scrollbar">
      <h3 className="text-lg font-bold mb-4 gradient-primary bg-clip-text text-transparent uppercase tracking-wider">
        {t("tactics.custom", "Chỉnh sửa chiến thuật")}
      </h3>

      <Tabs defaultValue="buildUp" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/5 mb-6">
          <TabsTrigger value="buildUp" className="data-[state=active]:bg-primary/20">Phát động</TabsTrigger>
          <TabsTrigger value="offence" className="data-[state=active]:bg-primary/20">Tấn công</TabsTrigger>
          <TabsTrigger value="defense" className="data-[state=active]:bg-primary/20">Phòng ngự</TabsTrigger>
        </TabsList>

        {/* Build Up */}
        <TabsContent value="buildUp" className="space-y-6 animate-fade-in">
          {renderSlider(t("tactics.speed", "Tốc độ"), tactics.buildUp.speed, (v) => updateTactic('buildUp', 'speed', v))}
          {renderSlider(t("tactics.passDistance", "Khoảng cách chuyền"), tactics.buildUp.passDistance, (v) => updateTactic('buildUp', 'passDistance', v))}
          
          <div className="space-y-2">
             <Label>{t("tactics.mentality", "Tâm lý")}</Label>
             <Select value={tactics.buildUp.mentality} onValueChange={(v) => updateTactic('buildUp', 'mentality', v)}>
               <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
               <SelectContent>
                 <SelectItem value="attacking">Tấn công</SelectItem>
                 <SelectItem value="balanced">Cân bằng</SelectItem>
                 <SelectItem value="defensive">Phòng thủ</SelectItem>
               </SelectContent>
             </Select>
          </div>

          <div className="space-y-2">
             <Label>{t("tactics.positioning", "Chọn vị trí")}</Label>
             <Select value={tactics.buildUp.positioning} onValueChange={(v) => updateTactic('buildUp', 'positioning', v)}>
               <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
               <SelectContent>
                 <SelectItem value="organized">Theo chiến thuật</SelectItem>
                 <SelectItem value="free">Tự do</SelectItem>
               </SelectContent>
             </Select>
          </div>
        </TabsContent>

        {/* Offence */}
        <TabsContent value="offence" className="space-y-6 animate-fade-in">
          {renderSlider(t("tactics.passTendency", "Xu hướng chuyền"), tactics.offence.passTendency, (v) => updateTactic('offence', 'passTendency', v))}
          {renderSlider(t("tactics.crossTendency", "Xu hướng tạt"), tactics.offence.crossTendency, (v) => updateTactic('offence', 'crossTendency', v))}
          {renderSlider(t("tactics.shootTendency", "Xu hướng sút"), tactics.offence.shootTendency, (v) => updateTactic('offence', 'shootTendency', v))}
          
           <div className="space-y-2">
             <Label>{t("tactics.positioning", "Chọn vị trí")}</Label>
             <Select value={tactics.offence.positioning} onValueChange={(v) => updateTactic('offence', 'positioning', v)}>
               <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
               <SelectContent>
                 <SelectItem value="organized">Theo chiến thuật</SelectItem>
                 <SelectItem value="free">Tự do</SelectItem>
               </SelectContent>
             </Select>
          </div>
        </TabsContent>

        {/* Defense */}
        <TabsContent value="defense" className="space-y-6 animate-fade-in">
          {renderSlider(t("tactics.pressure", "Sức ép"), tactics.defense.pressure, (v) => updateTactic('defense', 'pressure', v))}
          {renderSlider(t("tactics.width", "Cự ly đội hình"), tactics.defense.width, (v) => updateTactic('defense', 'width', v))}
          {renderSlider(t("tactics.aggression", "Xông xáo"), tactics.defense.aggression, (v) => updateTactic('defense', 'aggression', v))}

          <div className="space-y-2">
             <Label>{t("tactics.backLine", "Hàng phòng ngự")}</Label>
             <Select value={tactics.defense.backLine} onValueChange={(v) => updateTactic('defense', 'backLine', v)}>
               <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
               <SelectContent>
                 <SelectItem value="cover">Bẫy việt vị</SelectItem>
                 <SelectItem value="offside-trap">Tự do</SelectItem>
               </SelectContent>
             </Select>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
