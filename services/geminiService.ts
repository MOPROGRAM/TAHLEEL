// FIX: Removed invalid characters from the beginning of the file.
import { GoogleGenAI } from "@google/genai";
import type { StockAnalysisResult } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes a stock ticker using the Gemini API with Google Search grounding.
 * @param ticker The stock ticker to analyze (e.g., 'AAPL').
 * @returns A promise that resolves to a StockAnalysisResult object.
 */
export async function analyzeStock(ticker: string): Promise<StockAnalysisResult> {
  const prompt = `
    بصفتك محللًا فنيًا خبيرًا، قم بتحليل سهم "${ticker}".
    استخدم بحث جوجل للحصول على أحدث المعلومات والأخبار.
    
    يجب أن يستند تحليلك إلى:
    1.  الأخبار الحديثة والأحداث المتعلقة بالشركة.
    2.  التحليل الفني يجب أن يعتمد **حصرياً** على استراتيجية تجمع بين مؤشري MACD و RSI على إطار زمني 4 ساعات.
        - **إشارة الدخول (شراء):** ابحث عن تقاطع خط MACD الأزرق فوق خط الإشارة البرتقالي، ويجب أن يكون هذا التقاطع مدعومًا بوجود مؤشر RSI تحت مستوى 50 ليعكس وجود زخم صاعد محتمل.
        - **إشارة الخروج (بيع/تجنب):** ابحث عن تقاطع خط MACD الأزرق تحت خط الإشارة البرتقالي، خاصة إذا كان مؤشر RSI فوق مستوى 50.
        استخدم هذه الإشارات المجمعة كأساس لتحديد التوصية ونقطة الدخول.
    3.  معنويات السوق العامة تجاه السهم.

    قم بتنسيق إجابتك ككائن JSON صالح ومضمن في كتلة كود JSON. يجب أن يحتوي الكائن على أربعة مفاتيح:
    - "companyName": (سلسلة نصية: الاسم الكامل للشركة)
    - "recommendation": (سلسلة نصية: 'فرصة دخول محتملة' أو 'مراقبة' أو 'تجنب')
    - "entryPoint": (سلسلة نصية: السعر أو النطاق السعري المقترح للدخول بناءً على إشارة MACD و RSI، أو null إذا لم يكن هناك توصية واضحة)
    - "reasoning": (مصفوفة من السلاسل النصية تحتوي على 2-3 نقاط تحليل رئيسية، مع ذكر إشارة MACD و RSI الأخيرة)

    مثال على التنسيق:
    \`\`\`json
    {
      "companyName": "Company Name Inc.",
      "recommendation": "فرصة دخول محتملة",
      "entryPoint": "حول 150.00 دولار",
      "reasoning": [
        "أظهر مؤشر MACD تقاطعًا إيجابيًا على إطار 4 ساعات.",
        "مؤشر القوة النسبية (RSI) عند 45 و يتجه للأعلى، مما يدعم الزخم الصاعد.",
        "الأخبار الأخيرة عن الشركة إيجابية."
      ]
    }
    \`\`\`
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.3,
      },
    });

    const text = response.text;
    
    // Extract JSON from the markdown code block
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        const parsedJson = JSON.parse(jsonMatch[1]);
        if (parsedJson.recommendation && parsedJson.companyName && Array.isArray(parsedJson.reasoning)) {
           // Ensure entryPoint exists, can be null
          return {
            ...parsedJson,
            entryPoint: parsedJson.entryPoint !== undefined ? parsedJson.entryPoint : null,
          } as StockAnalysisResult;
        }
      } catch (e) {
        console.error('Failed to parse JSON from Gemini response for ticker:', ticker, e);
        throw new Error('فشل في تحليل استجابة JSON من النموذج.');
      }
    }

    throw new Error('لم يتم العثور على تنسيق JSON صالح في استجابة النموذج.');

  } catch (error) {
    console.error(`Error analyzing stock ${ticker}:`, error);
    if (error instanceof Error) {
        throw new Error(`فشل تحليل السهم ${ticker}: ${error.message}`);
    }
    throw new Error(`حدث خطأ غير معروف أثناء تحليل السهم ${ticker}.`);
  }
}