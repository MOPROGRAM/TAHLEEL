import type { StockData } from '../types';

/**
 * Fetches data from a public Google Sheet and returns an array of stock data objects.
 * @param sheetUrl The full URL of the public Google Sheet.
 * @returns A promise that resolves to an array of StockData objects.
 */
export async function fetchStocksData(sheetUrl: string): Promise<StockData[]> {
  const sheetIdMatch = sheetUrl.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!sheetIdMatch || !sheetIdMatch[1]) {
    throw new Error('لم يتم العثور على معرف ورقة جوجل صالح في الرابط.');
  }
  const sheetId = sheetIdMatch[1];
  
  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;

  try {
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`فشل في جلب البيانات من ورقة جوجل: ${response.statusText}`);
    }
    const csvText = await response.text();
    
    const rows = csvText.split('\n').map(row => row.trim()).filter(row => row.length > 0);
    
    // Remove header row
    if (rows.length > 0) {
        rows.shift();
    }
    
    const stocks: StockData[] = rows.map(row => {
      // CSV values are often enclosed in double quotes, remove them.
      const columns = row.split(',').map(col => col.trim().replace(/"/g, ''));
      const [ticker, sector, country] = columns;
      
      // Basic validation
      if (ticker && sector && country && /^[A-Z0-9.]+$/.test(ticker)) {
        return { ticker, sector, country };
      }
      return null;
    }).filter((stock): stock is StockData => stock !== null);

    return stocks;
  } catch (error) {
    console.error("Error fetching or parsing Google Sheet:", error);
    throw new Error('حدث خطأ أثناء جلب أو تحليل بيانات ورقة جوجل.');
  }
}
