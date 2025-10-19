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
 * Chuyển đổi tên quốc gia sang mã quốc gia từ database
 */
export function getNationCode(
  nationName: string,
  countriesData?: Array<{ countryCode: string; nameEn: string }>
): string {
  if (!nationName || !countriesData) return '';
  
  const country = countriesData.find(
    c => c.nameEn.toLowerCase() === nationName.toLowerCase()
  );
  
  return country?.countryCode || '';
}

/**
 * Lấy tên quốc gia bằng tiếng Việt từ database
 */
export function getCountryNameVi(
  countryCode: string, 
  countriesData?: Array<{ countryCode: string; nameVi: string }>
): string {
  if (!countryCode || !countriesData) return '';
  
  const country = countriesData.find(
    c => c.countryCode.toUpperCase() === countryCode.toUpperCase()
  );
  
  return country?.nameVi || '';
}

/**
 * Lấy thông tin club từ database
 */
export function getClubInfo(
  clubId: number,
  clubsData?: Array<{ clubId: number; nameVi: string; logoUrl: string }>
): { nameVi: string; logoUrl: string } | null {
  if (!clubId || !clubsData) return null;
  
  const club = clubsData.find(c => c.clubId === clubId);
  
  return club ? {
    nameVi: club.nameVi || '',
    logoUrl: club.logoUrl || ''
  } : null;
}
