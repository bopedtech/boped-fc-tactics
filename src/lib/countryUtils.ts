import { getCountryFlagEmoji } from 'country-flag-emoji';

// Mapping tên quốc gia (tiếng Anh) sang mã quốc gia
const NATION_NAME_TO_CODE: Record<string, string> = {
  'England': 'ENG',
  'France': 'FRA', 
  'Germany': 'GER',
  'Spain': 'ESP',
  'Italy': 'ITA',
  'Brazil': 'BRA',
  'Argentina': 'ARG',
  'Portugal': 'POR',
  'Netherlands': 'NED',
  'Belgium': 'BEL',
  'Uruguay': 'URU',
  'Croatia': 'CRO',
  'Poland': 'POL',
  'South Korea': 'KOR',
  'Korea Republic': 'KOR',
  'Japan': 'JPN',
  'Mexico': 'MEX',
  'United States': 'USA',
  'Canada': 'CAN',
  'Chile': 'CHI',
  'Colombia': 'COL',
  'Vietnam': 'VNM',
  'Norway': 'NOR',
  'Egypt': 'EGY',
};

/**
 * Lấy emoji cờ từ mã quốc gia (ISO Alpha-2 hoặc Alpha-3)
 */
export function getCountryFlag(countryCode: string): string {
  if (!countryCode) return '';
  
  // Chuyển đổi một số mã đặc biệt
  const codeMap: Record<string, string> = {
    'ENG': 'GB',
    'SCO': 'GB',
    'WAL': 'GB',
    'NIR': 'GB',
    'VNM': 'VN',
    'NOR': 'NO',
    'EGY': 'EG',
  };
  
  const code = codeMap[countryCode.toUpperCase()] || countryCode;
  
  try {
    const flag = getCountryFlagEmoji(code);
    return flag?.emoji || countryCode;
  } catch {
    return countryCode;
  }
}

/**
 * Chuyển đổi tên quốc gia sang mã quốc gia
 */
export function getNationCode(nationName: string): string {
  if (!nationName) return '';
  return NATION_NAME_TO_CODE[nationName] || '';
}

/**
 * Lấy tên quốc gia bằng tiếng Việt từ database
 */
export function getCountryNameVi(
  countryCode: string, 
  countriesData?: Array<{ country_code: string; name_vi: string }>
): string {
  if (!countryCode || !countriesData) return '';
  
  const country = countriesData.find(
    c => c.country_code.toUpperCase() === countryCode.toUpperCase()
  );
  
  return country?.name_vi || '';
}

/**
 * Lấy thông tin club từ database
 */
export function getClubInfo(
  clubId: number,
  clubsData?: Array<{ club_id: number; name_vi: string; logo_url: string }>
): { nameVi: string; logoUrl: string } | null {
  if (!clubId || !clubsData) return null;
  
  const club = clubsData.find(c => c.club_id === clubId);
  
  return club ? {
    nameVi: club.name_vi || '',
    logoUrl: club.logo_url || ''
  } : null;
}
