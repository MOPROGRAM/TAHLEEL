import React from 'react';
import type { StockAnalysis } from '../types';
import { getCountryName } from '../types';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon, 
  ExclamationCircleIcon, 
  DocumentTextIcon,
  GlobeAltIcon,
} from './Icons';
import TradingViewWidget from './TradingViewWidget';

interface StockCardProps {
  analysis: StockAnalysis;
}

const recommendationStyles = {
  'فرصة دخول محتملة': {
    bg: 'bg-green-900/50 border-green-700',
    text: 'text-green-300',
    icon: <CheckCircleIcon />,
    label: 'فرصة دخول محتملة',
  },
  'مراقبة': {
    bg: 'bg-yellow-900/50 border-yellow-700',
    text: 'text-yellow-300',
    icon: <ClockIcon />,
    label: 'مراقبة',
  },
  'تجنب': {
    bg: 'bg-red-900/50 border-red-700',
    text: 'text-red-300',
    icon: <XCircleIcon />,
    label: 'تجنب',
  },
  'فشل التحليل': {
    bg: 'bg-gray-800/50 border-gray-600',
    text: 'text-gray-400',
    icon: <ExclamationCircleIcon />,
    label: 'فشل التحليل',
  },
};

export const StockCard: React.FC<StockCardProps> = ({ analysis }) => {
  const styles = recommendationStyles[analysis.recommendation];

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg overflow-hidden transition-all duration-300">
      {/* Header section */}
      <div className="p-4">
        <div className="flex items-start justify-between">
            <div>
                 <h2 className="text-xl font-bold text-white flex items-center">
                    <span className="font-mono">{analysis.ticker}</span>
                </h2>
                <p className="text-sm text-gray-400">{analysis.companyName}</p>
                <div className="flex items-center text-xs text-gray-500 mt-2">
                    <GlobeAltIcon />
                    <span className="mr-1.5">{getCountryName(analysis.country)}</span>
                </div>
            </div>
          <div className={`flex items-center px-3 py-1 rounded-full text-xs font-semibold ${styles.bg} ${styles.text} flex-shrink-0`}>
            {styles.icon}
            <span className="mr-2">{styles.label}</span>
          </div>
        </div>
      </div>

      {/* Chart section - no horizontal padding, increased height */}
      {analysis.recommendation !== 'فشل التحليل' && (
        <div className="h-[400px]">
            <TradingViewWidget ticker={analysis.ticker} />
        </div>
      )}
      
      {/* Details section */}
      <div className="p-4">
        {analysis.entryPoint && (
             <div className="mb-4 p-3 bg-cyan-900/40 border border-cyan-800 rounded-lg">
                <h3 className="text-sm font-semibold text-cyan-300">نقطة الدخول المحتملة</h3>
                <p className="text-lg font-bold text-white">{analysis.entryPoint}</p>
            </div>
        )}

        <div className="space-y-3">
            <h3 className="text-md font-semibold text-gray-300 flex items-center">
                <DocumentTextIcon />
                <span className="mr-2">أسباب التوصية:</span>
            </h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-400">
                {analysis.reasoning.map((reason, index) => (
                    <li key={index} className="leading-relaxed">{reason}</li>
                ))}
            </ul>
        </div>
      </div>
    </div>
  );
};
