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
        if (p.potential_positions) {
          const altPositions = Array.isArray(p.potential_positions)
            ? p.potential_positions
            : [];
          return altPositions.includes(filters.positionFilter);
        }
        return false;
      });
    }

    // Alternate positions filter
    if (filters.alternatePositions.length > 0) {
      filtered = filtered.filter(p => {
        if (!p.potential_positions) return false;
        const altPositions = Array.isArray(p.potential_positions)
          ? p.potential_positions
          : [];
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
        (p.skill_moves_level || 0) >= filters.skillMovesLevel
      );
    }

    // Weak foot filter
    if (filters.weakFoot > 0) {
      filtered = filtered.filter(p =>
        (p.weak_foot || 0) >= filters.weakFoot
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
      filtered = filtered.filter(p =>
        (p.work_rate_att || 0) === filters.workRateAtt
      );
    }

    // Work rate defense filter
    if (filters.workRateDef > 0) {
      filtered = filtered.filter(p =>
        (p.work_rate_def || 0) === filters.workRateDef
      );
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
