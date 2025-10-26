import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchStocksData } from './services/googleSheetService';
import { analyzeStock } from './services/geminiService';
import type { StockAnalysis, StockData } from './types';
import { StockCard } from './components/StockCard';
import { GroupCard } from './components/GroupCard';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ExclamationTriangleIcon, ChartBarIcon } from './components/Icons';

const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1xLbLDnolTc9Cx9AfcNZeAJZ7HXglu-0w58kaDxLrSjc/edit?usp=sharing';

const mapSectorToGroup = (sector: string): string => {
    const lowerCaseSector = sector.toLowerCase().trim();
    const fintechKeywords = ['fintech', 'financial tech', 'تقنية مالية'];
    if (fintechKeywords.some(k => lowerCaseSector.includes(k))) return 'التقنية المالية (Fintech)';
    const renewableEnergyKeywords = ['renewable', 'solar', 'wind', 'clean energy', 'طاقة متجددة', 'طاقة شمسية', 'طاقة نظيفة'];
    if (renewableEnergyKeywords.some(k => lowerCaseSector.includes(k))) return 'الطاقة المتجددة';
    const ecommerceKeywords = ['e-commerce', 'online retail', 'تجارة إلكترونية', 'تسوق عبر الإنترنت'];
    if (ecommerceKeywords.some(k => lowerCaseSector.includes(k))) return 'التجارة الإلكترونية والإعلام الرقمي';
    const biotechKeywords = ['biotech', 'pharmaceutical', 'biopharma', 'تقنية حيوية', 'أدوية', 'صيدلانية'];
    if (biotechKeywords.some(k => lowerCaseSector.includes(k))) return 'التكنولوجيا الحيوية والأدوية';
    const semiconductorKeywords = ['semiconductor', 'chips', 'أشباه الموصلات', 'رقائق'];
    if (semiconductorKeywords.some(k => lowerCaseSector.includes(k))) return 'أشباه الموصلات ومعداتها';
    const softwareKeywords = ['software', 'internet', 'cloud', 'saas', 'cybersecurity', 'برمجيات', 'إنترنت', 'سحابي', 'أمن سيبراني'];
    if (softwareKeywords.some(k => lowerCaseSector.includes(k))) return 'البرمجيات وخدمات الإنترنت';
    const techHardwareKeywords = ['hardware', 'computer', 'electronics', 'consumer electronics', 'أجهزة', 'كمبيوتر', 'إلكترونيات استهلاكية'];
    if (techHardwareKeywords.some(k => lowerCaseSector.includes(k))) return 'الأجهزة والمعدات التقنية';
    const banksKeywords = ['banks', 'banking', 'بنوك', 'مصرفي'];
    if (banksKeywords.some(k => lowerCaseSector.includes(k))) return 'البنوك والخدمات المصرفية';
    const insuranceKeywords = ['insurance', 'تأمين'];
    if (insuranceKeywords.some(k => lowerCaseSector.includes(k))) return 'التأمين';
    const investmentKeywords = ['investment', 'asset management', 'capital markets', 'brokerage', 'استثمار', 'إدارة أصول', 'أسواق رأس المال'];
    if (investmentKeywords.some(k => lowerCaseSector.includes(k))) return 'الاستثمار وإدارة الأصول';
    const medicalDevicesKeywords = ['medical devices', 'medical equipment', 'أجهزة طبية', 'معدات طبية'];
    if (medicalDevicesKeywords.some(k => lowerCaseSector.includes(k))) return 'المعدات واللوازم الطبية';
    const healthcareProvidersKeywords = ['health care providers', 'hospitals', 'clinics', 'مقدمي الرعاية الصحية', 'مستشفيات'];
    if (healthcareProvidersKeywords.some(k => lowerCaseSector.includes(k))) return 'مقدمو خدمات الرعاية الصحية';
    const autoKeywords = ['automotive', 'auto', 'cars', 'tires', 'electric vehicle', 'ev', 'سيارات', 'إطارات', 'مركبات كهربائية'];
    if (autoKeywords.some(k => lowerCaseSector.includes(k))) return 'السيارات وقطع غيارها';
    const retailKeywords = ['retail', 'luxury', 'apparel', 'department stores', 'تجزئة', 'رفاهية', 'ملابس', 'متاجر كبرى'];
    if (retailKeywords.some(k => lowerCaseSector.includes(k))) return 'تجارة التجزئة';
    const leisureKeywords = ['hotels', 'restaurants', 'leisure', 'casinos', 'entertainment', 'travel', 'airlines', 'cruises', 'فنادق', 'مطاعم', 'ترفيه', 'سفر', 'طيران'];
    if (leisureKeywords.some(k => lowerCaseSector.includes(k))) return 'الفنادق والسياحة والترفيه';
    const consumerStaplesKeywords = ['staples', 'food', 'beverage', 'household products', 'supermarket', 'سلع أساسية', 'أغذية', 'مشروبات', 'منتجات منزلية'];
    if (consumerStaplesKeywords.some(k => lowerCaseSector.includes(k))) return 'السلع الاستهلاكية الأساسية';
    const defenseKeywords = ['defense', 'aerospace', 'دفاع', 'فضاء'];
    if (defenseKeywords.some(k => lowerCaseSector.includes(k))) return 'الصناعات الدفاعية والجوية';
    const transportationKeywords = ['transportation', 'logistics', 'shipping', 'railroad', 'delivery', 'نقل', 'خدمات لوجستية', 'شحن', 'سكك حديدية', 'توصيل'];
    if (transportationKeywords.some(k => lowerCaseSector.includes(k))) return 'النقل والخدمات اللوجستية';
    const machineryKeywords = ['industrial', 'machinery', 'manufacturing', 'conglomerate', 'صناع', 'تصنيع', 'آلات', 'تكتل'];
    if (machineryKeywords.some(k => lowerCaseSector.includes(k))) return 'الصناعات والآلات الثقيلة';
    const realEstateKeywords = ['real estate', 'reit', 'property', 'تطوير عقاري', 'صناديق استثمار عقاري'];
    if (realEstateKeywords.some(k => lowerCaseSector.includes(k))) return 'العقارات والتطوير العقاري';
    const constructionKeywords = ['construction', 'building materials', 'engineering', 'بناء', 'مواد بناء', 'هندسة'];
    if (constructionKeywords.some(k => lowerCaseSector.includes(k))) return 'البناء والهندسة';
    const energyKeywords = ['energy', 'oil', 'gas', 'petrochemicals', 'drilling', 'طاقة', 'نفط', 'غاز', 'بتروكيماويات', 'حفر'];
    if (energyKeywords.some(k => lowerCaseSector.includes(k))) return 'الطاقة (النفط والغاز)';
    const communicationKeywords = ['communication', 'telecom', 'media', 'اتصالات', 'إعلام'];
    if (communicationKeywords.some(k => lowerCaseSector.includes(k))) return 'خدمات الاتصالات والإعلام';
    const materialsKeywords = ['materials', 'chemicals', 'mining', 'steel', 'metals', 'مواد', 'كيماويات', 'تعدين', 'صلب', 'معادن'];
    if (materialsKeywords.some(k => lowerCaseSector.includes(k))) return 'المواد الأساسية والتعدين';
    const utilitiesKeywords = ['utilities', 'electric', 'power', 'water', 'مرافق', 'كهرباء', 'ماء'];
    if (utilitiesKeywords.some(k => lowerCaseSector.includes(k))) return 'المرافق العامة';
    const businessServicesKeywords = ['business services', 'professional services', 'consulting', 'staffing', 'outsourcing', 'waste management', 'خدمات تجارية', 'خدمات مهنية', 'استشارات', 'توظيف', 'إدارة نفايات'];
    if (businessServicesKeywords.some(k => lowerCaseSector.includes(k))) return 'الخدمات المهنية والتجارية';
    const agricultureKeywords = ['agriculture', 'agribusiness', 'farming', 'crops', 'fertilizer', 'زراعة', 'أعمال زراعية', 'محاصيل', 'أسمدة'];
    if (agricultureKeywords.some(k => lowerCaseSector.includes(k))) return 'الزراعة';
    return 'قطاعات أخرى متنوعة';
};

const App: React.FC = () => {
  const [analysisResults, setAnalysisResults] = useState<Record<string, StockAnalysis>>({});
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);

  const [isGroupsLoading, setIsGroupsLoading] = useState<boolean>(true);
  const [groupsError, setGroupsError] = useState<string | null>(null);
  const [stocksByGroup, setStocksByGroup] = useState<Record<string, StockData[]>>({});

  const [analyzingGroupName, setAnalyzingGroupName] = useState<string | null>(null);
  const [loadingTickers, setLoadingTickers] = useState<Set<string>>(new Set());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isAnalyzing = analyzingGroupName !== null || loadingTickers.size > 0;

  useEffect(() => {
    const loadAndGroupStocks = async () => {
      try {
        const stocks = await fetchStocksData(GOOGLE_SHEET_URL);
        if (stocks.length === 0) throw new Error('لم يتم العثور على أي بيانات أسهم.');
        const grouped = stocks.reduce((acc, stock) => {
          const groupName = mapSectorToGroup(stock.sector.trim());
          if (!acc[groupName]) acc[groupName] = [];
          acc[groupName].push(stock);
          return acc;
        }, {} as Record<string, StockData[]>);
        setStocksByGroup(grouped);
      } catch (e) {
        setGroupsError(`فشل جلب المجموعات: ${e instanceof Error ? e.message : 'خطأ غير متوقع.'}`);
      } finally {
        setIsGroupsLoading(false);
      }
    };
    loadAndGroupStocks();
  }, []);
  
  const performAnalysis = useCallback(async (stock: StockData): Promise<StockAnalysis> => {
    try {
        const analysis = await analyzeStock(stock.ticker);
        return { ...stock, ...analysis };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        return {
            ...stock,
            companyName: 'N/A',
            entryPoint: null,
            recommendation: 'فشل التحليل',
            reasoning: [errorMessage],
        };
    }
  }, []);

  const handleAnalyzeGroup = useCallback(async (stocksToAnalyze: StockData[], groupName: string) => {
    setError(null);
    setProgress(0);
    setTotal(stocksToAnalyze.length);
    setAnalyzingGroupName(groupName);
    setIsSidebarOpen(true);

    const analysisPromises = stocksToAnalyze.map(stock =>
      performAnalysis(stock).then(result => {
        setAnalysisResults(prev => ({ ...prev, [stock.ticker]: result }));
        setProgress(p => p + 1);
        return result;
      })
    );
    await Promise.all(analysisPromises);
    setAnalyzingGroupName(null);
  }, [performAnalysis]);

  const handleAnalyzeSingleStock = useCallback(async (stock: StockData) => {
    setError(null);
    setLoadingTickers(prev => new Set(prev).add(stock.ticker));
    setIsSidebarOpen(true);
    if (!analysisResults[stock.ticker]) {
        // Add a placeholder to make it appear instantly
        setAnalysisResults(prev => ({...prev, [stock.ticker]: { ...stock, companyName: 'جاري التحميل...', recommendation: 'مراقبة', reasoning: [], entryPoint: null }}));
    }

    const result = await performAnalysis(stock);
    setAnalysisResults(prev => ({ ...prev, [stock.ticker]: result }));
    setLoadingTickers(prev => {
        const newSet = new Set(prev);
        newSet.delete(stock.ticker);
        return newSet;
    });
  }, [performAnalysis, analysisResults]);

  const sortedResults = useMemo(() => {
    // FIX: Explicitly type the arguments in the `sort` callback function to resolve the TypeScript error.
    return Object.values(analysisResults).sort((a: StockAnalysis, b: StockAnalysis) => a.ticker.localeCompare(b.ticker));
  }, [analysisResults]);

  const renderGroupContent = () => {
    if (isGroupsLoading) return <div className="flex flex-col items-center justify-center mt-16"><LoadingSpinner /><p className="mt-4 text-lg text-gray-400">جاري تحميل وتصنيف الأسهم...</p></div>;
    if (groupsError) return <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center max-w-2xl mx-auto mt-8" role="alert"><strong className="font-bold flex items-center justify-center"><ExclamationTriangleIcon /><span className="mr-2">خطأ</span></strong><span className="block mt-2">{groupsError}</span></div>;
    return (
      <div className="space-y-4">
        {Object.entries(stocksByGroup).sort(([a], [b]) => a.localeCompare(b)).map(([groupName, stocks]) => (
          <GroupCard 
            key={groupName}
            groupName={groupName}
            stocks={stocks}
            onAnalyzeGroup={handleAnalyzeGroup}
            onAnalyzeSingle={handleAnalyzeSingleStock}
            disabled={isAnalyzing}
            isCurrentlyAnalyzingGroup={analyzingGroupName === groupName}
            loadingTickers={loadingTickers}
          />
        ))}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="flex">
        {/* Main Content */}
        <div className={`flex-1 transition-all duration-500 ${isSidebarOpen ? 'lg:mr-[800px]' : ''}`}>
           <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                <header className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                        محلل الأسهم بالذاء الاصطناعي
                    </h1>
                    <p className="mt-4 text-lg text-gray-400">
                        استعرض المجموعات، اكشف عن الأسهم، ثم قم بتحليلها بشكل فردي أو جماعي.
                    </p>
                </header>
                <main>
                    {renderGroupContent()}
                </main>
           </div>
        </div>

        {/* Sidebar */}
        <aside className={`fixed top-0 right-0 h-full bg-gray-900/80 backdrop-blur-sm border-r border-gray-700 shadow-2xl transition-transform duration-500 ease-in-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} w-full lg:w-[800px] z-40`}>
             <div className="h-full flex flex-col">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-200 flex items-center"><ChartBarIcon /> <span className="mr-2">نتائج التحليل</span></h2>
                    <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                {analyzingGroupName && total > 0 && (
                     <div className="p-4">
                        <p className="text-sm text-center mb-2 text-gray-300">{`تحليل مجموعة: ${analyzingGroupName}`}</p>
                        <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                            <div className="bg-gradient-to-r from-cyan-400 to-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${(progress / total) * 100}%` }}></div>
                        </div>
                        <p className="text-center text-xs mt-2 text-gray-400">{`${progress} / ${total}`}</p>
                    </div>
                )}
                {error && <div className="m-4 bg-red-900/50 text-red-300 p-3 rounded-lg text-sm">{error}</div>}

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {sortedResults.length > 0 ? sortedResults.map((result) => (
                        <StockCard key={result.ticker} analysis={result} />
                    )) : (
                        <div className="text-center text-gray-500 pt-10">
                            <p>لم يتم تحليل أي أسهم بعد.</p>
                            <p className="text-sm">اختر سهماً أو مجموعة لبدء التحليل.</p>
                        </div>
                    )}
                </div>
            </div>
        </aside>
      </div>
    </div>
  );
};

export default App;