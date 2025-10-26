export interface StockAnalysisResult {
  recommendation: 'فرصة دخول محتملة' | 'مراقبة' | 'تجنب' | 'فشل التحليل';
  reasoning: string[];
  companyName: string;
  entryPoint: string | null;
}

export interface StockAnalysis extends StockAnalysisResult, StockData {}

export interface StockData {
  ticker: string;
  sector: string;
  country: string;
}

const countryCodeToName: Record<string, string> = {
    'US': 'الولايات المتحدة',
    'CN': 'الصين',
    'HK': 'هونغ كونغ',
    'JP': 'اليابان',
    'GB': 'المملكة المتحدة',
    'DE': 'ألمانيا',
    'FR': 'فرنسا',
    'CA': 'كندا',
    'AU': 'أستراليا',
    'CH': 'سويسرا',
    'NL': 'هولندا',
    'SE': 'السويد',
    'KR': 'كوريا الجنوبية',
    'TW': 'تايوان',
    'IN': 'الهند',
    'BR': 'البرازيل',
    'RU': 'روسيا',
    'IT': 'إيطاليا',
    'ES': 'إسبانيا',
    'SG': 'سنغافورة',
    'IE': 'أيرلندا',
    'NO': 'النرويج',
    'DK': 'الدنمارك',
    'FI': 'فنلندا',
    'BE': 'بلجيكا',
    'AT': 'النمسا',
    'PT': 'البرتغال',
    'IL': 'إسرائيل',
    'SA': 'المملكة العربية السعودية',
    'AE': 'الإمارات العربية المتحدة',
    'ZA': 'جنوب أفريقيا',
    'MX': 'المكسيك',
    'AR': 'الأرجنتين',
    'CL': 'تشيلي',
    'TR': 'تركيا',
    'ID': 'إندونيسيا',
    'MY': 'ماليزيا',
    'TH': 'تايلاند',
    'PH': 'الفلبين',
    'VN': 'فيتنام',
    'PL': 'بولندا',
    'CZ': 'جمهورية التشيك',
    'HU': 'المجر',
    'GR': 'اليونان',
    'NZ': 'نيوزيلندا',
    'BM': 'برمودا',
    'KY': 'جزر كايمان',
    'LU': 'لوكسمبورغ',
};

export const getCountryName = (code: string): string => {
    if (!code) return 'غير معروف';
    const upperCode = code.toUpperCase();
    return countryCodeToName[upperCode] || upperCode;
};
