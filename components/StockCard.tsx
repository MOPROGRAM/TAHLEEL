import React, { useState } from 'react';
import type { StockAnalysis } from '../types';
import { getCountryName } from '../types';
import { 
    CheckCircleIcon, 
    ClockIcon, 
    XCircleIcon, 
    ExclamationCircleIcon, 
    BuildingOffice2Icon, 
    GlobeAltIcon, 
    DocumentTextIcon, 
    ChevronDownIcon 
} from './Icons';
import { TradingViewWidget } from './TradingViewWidget';

interface StockCardProps {
  analysis: StockAnalysis;
}

const recommendationConfig = {
    'فرصة دخول محتملة': {
        icon: <CheckCircleIcon />,
        color: 'text-green-400',
        bg: 'bg-green-900/50',
        border: 'border-green-700'
    },
    'مراقبة': {
        icon: <ClockIcon />,
        color: 'text-yellow-400',
        bg: 'bg-yellow-900/50',
        border: 'border-yellow-700'
    },
    'تجنب': {
        icon: <XCircleIcon />,
        color: 'text-red-400',
        bg: 'bg-red-900/50',
        border: 'border-red-700'
    },
    'فشل التحليل': {
        icon: <ExclamationCircleIcon />,
        color: 'text-gray-400',
        bg: 'bg-gray-700/50',
        border: 'border-gray-600'
    }
};

export const StockCard: React.FC<StockCardProps> = ({ analysis }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // The recommendation type is constrained, so we fall back for loading states or errors.
    const config = recommendationConfig[analysis.recommendation] || recommendationConfig['فشل التحليل'];
    const isLoading = analysis.companyName === 'جاري التحميل...';

    return (
        <div className={`border rounded-lg shadow-md transition-all duration-300 ${config.bg} ${config.border}`}>
            <div className="p-4">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-white">{isLoading ? `تحليل ${analysis.ticker}...` : analysis.companyName}</h3>
                        <p className="text-sm font-mono text-gray-400">{analysis.ticker}</p>
                        <div className="flex items-center text-xs text-gray-400 mt-2 space-x-4 rtl:space-x-reverse">
                           <span className="flex items-center"><BuildingOffice2Icon /><span className="mr-1.5">{analysis.sector}</span></span>
                           <span className="flex items-center"><GlobeAltIcon /><span className="mr-1.5">{getCountryName(analysis.country)}</span></span>
                        </div>
                    </div>
                    <div className={`flex items-center p-2 rounded-md ${config.bg} ml-2`}>
                        <span className={config.color}>{config.icon}</span>
                        <span className={`mr-2 font-semibold ${config.color}`}>{analysis.recommendation}</span>
                    </div>
                </div>

                {!isLoading && (
                     <div className="mt-4 border-t border-gray-700 pt-4">
                        {analysis.entryPoint && (
                            <div className="mb-3">
                                <p className="text-sm text-gray-300 font-semibold">نقطة الدخول المقترحة:</p>
                                <p className="text-md text-white font-mono">{analysis.entryPoint}</p>
                            </div>
                        )}
                        <div>
                             <p className="text-sm text-gray-300 font-semibold mb-2 flex items-center"><DocumentTextIcon /><span className="mr-2">أسباب التوصية:</span></p>
                             <ul className="list-disc list-inside space-y-1 text-sm text-gray-200 pr-4">
                                {analysis.reasoning.map((reason, index) => (
                                    <li key={index}>{reason}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            {!isLoading && analysis.recommendation !== 'فشل التحليل' && (
                <div 
                    className="border-t border-gray-700 px-4 py-2 cursor-pointer bg-gray-800/50 hover:bg-gray-800 transition-colors"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex justify-between items-center text-sm text-gray-300 font-semibold">
                        <span>{isExpanded ? 'إخفاء الرسم البياني' : 'عرض الرسم البياني'}</span>
                        <ChevronDownIcon isRotated={isExpanded} />
                    </div>
                </div>
            )}
            
            {isExpanded && (
                 <div className="p-2 bg-gray-900">
                    <TradingViewWidget ticker={analysis.ticker} />
                </div>
            )}
        </div>
    );
};
