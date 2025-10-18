import flag from 'country-code-emoji';

/**
 * Lấy emoji cờ từ mã quốc gia
 */
export function getCountryFlag(countryCode: string): string {
  if (!countryCode) return '';
  
  // Chuyển đổi một số mã đặc biệt sang ISO 3166-1 alpha-2
  const codeMap: Record<string, string> = {
    'ENG': 'GB-ENG',
    'SCO': 'GB-SCT',
    'WAL': 'GB-WLS',
    'NIR': 'GB-NIR',
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
 * Chuyển đổi tên quốc gia sang mã quốc gia từ database
 */
export function getNationCode(
  nationName: string,
  countriesData?: Array<{ country_code: string; name_en: string }>
): string {
  if (!nationName || !countriesData) return '';
  
  const country = countriesData.find(
    c => c.name_en.toLowerCase() === nationName.toLowerCase()
  );
  
  return country?.country_code || '';
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
