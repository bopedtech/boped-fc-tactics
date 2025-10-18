import { getCountryFlagEmoji } from 'country-flag-emoji';

/**
 * Lấy emoji cờ từ mã quốc gia (ISO Alpha-2 hoặc Alpha-3)
 * @param countryCode - Mã quốc gia (VD: "ENG", "GB", "VNM", "VN")
 * @returns Emoji cờ hoặc mã quốc gia nếu không tìm thấy
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
 * Lấy tên quốc gia bằng tiếng Việt từ database
 * Cần gọi với dữ liệu từ countries_vi table
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
 * Cần gọi với dữ liệu từ clubs table
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
