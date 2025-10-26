import React, { useState } from 'react';
import type { StockData } from '../types';
import { getCountryName } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { TagIcon, ArrowPathIcon, ChevronDownIcon, GlobeAltIcon, ChartBarIcon, MagnifyingGlassIcon } from './Icons';

interface GroupCardProps {
  groupName: string;
  stocks: StockData[];
  onAnalyzeGroup: (stocks: StockData[], groupName: string) => void;
  onAnalyzeSingle: (stock: StockData) => void;
  disabled: boolean;
  isCurrentlyAnalyzingGroup: boolean;
  loadingTickers: Set<string>;
}

export const GroupCard: React.FC<GroupCardProps> = ({ 
  groupName, 
  stocks, 
  onAnalyzeGroup,
  onAnalyzeSingle,
  disabled, 
  isCurrentlyAnalyzingGroup,
  loadingTickers
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAnalyzeGroupClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAnalyzeGroup(stocks, groupName);
  };

  const handleAnalyzeSingleClick = (e: React.MouseEvent, stock: StockData) => {
    e.stopPropagation();
    onAnalyzeSingle(stock);
  };

  const toggleExpansion = () => {
    if (!isCurrentlyAnalyzingGroup) {
        setIsExpanded(!isExpanded);
    }
  };

  const isCardDimmed = disabled && !isCurrentlyAnalyzingGroup;

  return (
    <div className={`bg-gray-800 border ${isCardDimmed ? 'border-gray-700 opacity-50' : 'border-gray-700 hover:border-cyan-600'} rounded-xl shadow-lg transition-all duration-300 overflow-hidden`}>
      <div 
        className={`p-5 cursor-pointer ${isCardDimmed ? 'cursor-not-allowed' : ''}`}
        onClick={toggleExpansion}
        aria-expanded={isExpanded}
        >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <TagIcon />
              <h3 className="text-xl font-bold text-white mr-2">{groupName}</h3>
            </div>
            <p className="text-gray-400 text-sm">{`يحتوي على ${stocks.length} سهم`}</p>
          </div>
          <div className="flex items-center space-x-4 ml-4">
            <button
              onClick={handleAnalyzeGroupClick}
              disabled={disabled}
              className="flex items-center justify-center w-32 h-10 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              {isCurrentlyAnalyzingGroup ? (
                <>
                  <LoadingSpinner />
                  <span className="mr-2">جارٍ...</span>
                </>
              ) : (
                <>
                  <ArrowPathIcon />
                  <span className="mr-2">تحليل الكل</span>
                </>
              )}
            </button>
             <ChevronDownIcon isRotated={isExpanded} />
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="bg-gray-900/50 p-5 border-t border-gray-700">
            <h4 className="text-md font-semibold text-gray-300 mb-3">الأسهم في هذه المجموعة:</h4>
            <div className="max-h-60 overflow-y-auto pr-2">
                <ul className="space-y-2">
                    {stocks.map(stock => {
                      const isSingleLoading = loadingTickers.has(stock.ticker);
                      return (
                        <li key={stock.ticker} className="flex items-center justify-between p-2 rounded-md bg-gray-800/60">
                            <div className="flex items-center text-sm">
                                <ChartBarIcon />
                                <div className="flex items-center mr-3">
                                    <span className="text-white font-mono font-bold">{stock.ticker}</span>
                                    <span className="text-gray-400 text-xs mr-2">- {getCountryName(stock.country)}</span>
                                </div>
                            </div>
                            <button
                                onClick={(e) => handleAnalyzeSingleClick(e, stock)}
                                disabled={disabled || isSingleLoading}
                                className="flex items-center justify-center w-24 h-8 bg-cyan-600 text-white text-xs font-semibold rounded-md hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSingleLoading ? (
                                    <LoadingSpinner />
                                ) : (
                                    <>
                                        <MagnifyingGlassIcon />
                                        <span className="mr-1.5">تحليل</span>
                                    </>
                                )}
                            </button>
                        </li>
                      );
                    })}
                </ul>
            </div>
        </div>
      )}
    </div>
  );
};
