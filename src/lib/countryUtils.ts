import flag from 'country-code-emoji';

/**
 * Lấy emoji cờ từ mã quốc gia
 */
export function getCountryFlag(countryCode: string): string {
  if (!countryCode) return '';
  
  // Chuyển đổi một số mã đặc biệt sang ISO 3166-1 alpha-2
  const codeMap: Record<string, string> = {
    'ENG': 'GB',
    'SCO': 'GB',
    'WAL': 'GB',
    'NIR': 'GB',
    'VNM': 'VN',
    'NOR': 'NO',
    'EGY': 'EG',
    'GER': 'DE',
    'NED': 'NL',
    'POR': 'PT',
    'ESP': 'ES',
    'FRA': 'FR',
    'ITA': 'IT',
    'BRA': 'BR',
    'ARG': 'AR',
    'BEL': 'BE',
    'URU': 'UY',
    'CRO': 'HR',
    'POL': 'PL',
    'KOR': 'KR',
    'JPN': 'JP',
    'MEX': 'MX',
    'USA': 'US',
    'CAN': 'CA',
    'CHI': 'CL',
    'COL': 'CO',
    'NGA': 'NG',
    'MAR': 'MA',
  };
  
  const code = codeMap[countryCode.toUpperCase()] || countryCode;
  return flag(code) || '';
}

/**
 * Chuyển đổi tên quốc gia sang mã quốc gia từ database nations
 */
export function getNationInfo(
  nationId: number,
  nationsData?: Array<{ id: number; displayName: string; image?: string }>
): { displayName: string; image?: string } | null {
  if (!nationId || !nationsData) return null;
  
  const nation = nationsData.find(n => n.id === nationId);
  
  return nation ? {
    displayName: nation.displayName,
    image: nation.image
  } : null;
}

/**
 * Lấy thông tin team/club từ database teams
 */
export function getTeamInfo(
  teamId: number,
  teamsData?: Array<{ id: number; displayName: string; image?: string }>
): { displayName: string; image?: string } | null {
  if (!teamId || !teamsData) return null;
  
  const team = teamsData.find(t => t.id === teamId);
  
  return team ? {
    displayName: team.displayName,
    image: team.image
  } : null;
}
