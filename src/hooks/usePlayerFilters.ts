import { useState } from "react";
import { FilterState } from "@/components/PlayerFilters";

export const usePlayerFilters = (initialPosition?: string) => {
  const [filters, setFilters] = useState<FilterState>({
    ratingRange: [0, 125],
    positionFilter: initialPosition || "all",
    alternatePositions: [],
    leagues: [],
    clubs: [],
    nations: [],
    programs: [],
    heightRange: [150, 210],
    weightRange: [50, 110],
    skillMovesLevel: 0,
    weakFoot: 0,
    strongFoot: "all",
    workRateAtt: 0,
    workRateDef: 0,
    traits: []
  });

  const resetFilters = () => {
    setFilters({
      ratingRange: [0, 125],
      positionFilter: initialPosition || "all",
      alternatePositions: [],
      leagues: [],
      clubs: [],
      nations: [],
      programs: [],
      heightRange: [150, 210],
      weightRange: [50, 110],
      skillMovesLevel: 0,
      weakFoot: 0,
      strongFoot: "all",
      workRateAtt: 0,
      workRateDef: 0,
      traits: []
    });
  };

  const applyFiltersToQuery = (players: any[]) => {
    let filtered = [...players];

    // Rating filter
    filtered = filtered.filter(p =>
      p.rating >= filters.ratingRange[0] && p.rating <= filters.ratingRange[1]
    );

    // Position filter
    if (filters.positionFilter !== "all") {
      filtered = filtered.filter(p => {
        if (p.position === filters.positionFilter) return true;
        if (p.potentialPositions) {
          const altPositions = Array.isArray(p.potentialPositions)
            ? p.potentialPositions
            : [];
          return altPositions.includes(filters.positionFilter);
        }
        return false;
      });
    }

    // Alternate positions filter
    if (filters.alternatePositions.length > 0) {
      filtered = filtered.filter(p => {
        // Check both potentialPositions array and main position
        const altPositions: string[] = [];
        
        if (p.potentialPositions) {
          if (Array.isArray(p.potentialPositions)) {
            altPositions.push(...p.potentialPositions);
          } else if (typeof p.potentialPositions === 'object') {
            // Handle if potentialPositions is an object with position properties
            Object.values(p.potentialPositions).forEach((val: any) => {
              if (typeof val === 'string') altPositions.push(val);
            });
          }
        }
        
        // Also include main position
        if (p.position) altPositions.push(p.position);
        
        return filters.alternatePositions.some(pos => altPositions.includes(pos));
      });
    }

    // Height filter
    filtered = filtered.filter(p =>
      (p.height || 175) >= filters.heightRange[0] && (p.height || 175) <= filters.heightRange[1]
    );

    // Weight filter
    filtered = filtered.filter(p =>
      (p.weight || 75) >= filters.weightRange[0] && (p.weight || 75) <= filters.weightRange[1]
    );

    // Skill moves filter
    if (filters.skillMovesLevel > 0) {
      filtered = filtered.filter(p =>
        (p.skillMovesLevel || 0) >= filters.skillMovesLevel
      );
    }

    // Weak foot filter
    if (filters.weakFoot > 0) {
      filtered = filtered.filter(p =>
        (p.weakFoot || 0) >= filters.weakFoot
      );
    }

    // Strong foot filter
    if (filters.strongFoot !== "all") {
      filtered = filtered.filter(p =>
        p.foot?.toString() === filters.strongFoot
      );
    }

    // Work rate attack filter
    if (filters.workRateAtt > 0) {
      filtered = filtered.filter(p => {
        const workRates = p.workRates;
        return (workRates?.attack || workRates?.att || 0) === filters.workRateAtt;
      });
    }

    // Work rate defense filter
    if (filters.workRateDef > 0) {
      filtered = filtered.filter(p => {
        const workRates = p.workRates;
        return (workRates?.defense || workRates?.def || 0) === filters.workRateDef;
      });
    }

    // Leagues filter
    if (filters.leagues.length > 0) {
      filtered = filtered.filter(p => {
        const leagueId = p.league?.id?.toString();
        return leagueId && filters.leagues.includes(leagueId);
      });
    }

    // Clubs filter
    if (filters.clubs.length > 0) {
      filtered = filtered.filter(p => {
        const clubId = p.club?.id?.toString();
        return clubId && filters.clubs.includes(clubId);
      });
    }

    // Nations filter
    if (filters.nations.length > 0) {
      filtered = filtered.filter(p => {
        const nationId = p.nation?.id?.toString();
        return nationId && filters.nations.includes(nationId);
      });
    }

    // Programs filter
    if (filters.programs.length > 0) {
      filtered = filtered.filter(p => {
        if (!p.program) return false;
        // Handle both string and object structures
        const programId = typeof p.program === 'string' 
          ? p.program 
          : (p.program?.id || p.program?.programId);
        return programId && filters.programs.includes(programId.toString());
      });
    }

    // Traits filter
    if (filters.traits.length > 0) {
      filtered = filtered.filter(p => {
        if (!p.traits || !Array.isArray(p.traits)) return false;
        return filters.traits.some(traitId => 
          p.traits.some((t: any) => t.id?.toString() === traitId)
        );
      });
    }

    return filtered;
  };

  return {
    filters,
    setFilters,
    resetFilters,
    applyFiltersToQuery
  };
};
