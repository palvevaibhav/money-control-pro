import { GoogleGenAI, Type } from '@google/genai';

const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';

let aiClient: GoogleGenAI | null = null;

function getAiClient() {
  if (!geminiApiKey) {
    return null;
  }

  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: geminiApiKey });
  }

  return aiClient;
}

function getMissingKeyMessage() {
  return 'AI features are unavailable because VITE_GEMINI_API_KEY is not configured.';
}

/**
 * API Gateway for all Gemini AI calls.
 * Consolidates the request logic so there's only one integration point triggering api calls.
 */
async function callAiGateway(requestPayload: any, errorContext: string) {
  const ai = getAiClient();
  if (!ai) {
    return { error: 'AIClient_Not_Initialized' };
  }

  try {
    const response = await ai.models.generateContent(requestPayload);
    return { data: response };
  } catch (error) {
    console.error(`${errorContext} Error:`, error);
    return { error };
  }
}

export async function getFinancialAdvice(prompt: string) {
  const result = await callAiGateway(
    {
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `You are an expert financial advisor for Money Control Pro. Provide concise, actionable advice for the following query: ${prompt}`,
            },
          ],
        },
      ],
    },
    'AI'
  );

  if (result.error === 'AIClient_Not_Initialized') return getMissingKeyMessage();
  if (result.error) return 'I’m having trouble connecting to my financial brain right now. Please try again later!';
  
  return result.data.text;
}

export async function analyzeReceipt(base64Image: string) {
  const result = await callAiGateway(
    {
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image,
              },
            },
            {
              text: 'Extract the following details from this receipt in JSON format: amount (number), date (YYYY-MM-DD), category (one of: Food, Shopping, Transport, Rent, Salary, Investment, Other), description (short string).',
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            date: { type: Type.STRING },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
          },
          required: ['amount', 'date', 'category', 'description'],
        },
      },
    },
    'Receipt Analysis'
  );

  if (result.error) return null;
  return JSON.parse(result.data.text || '{}');
}

interface AiFileInput {
  mimeType: string;
  data: string;
}

export async function chatWithAI(prompt: string, files?: AiFileInput[]) {
  const parts: Array<{ text: string } | { inlineData: AiFileInput }> = [{ text: prompt }];

  files?.forEach((file) => {
    parts.push({
      inlineData: {
        mimeType: file.mimeType,
        data: file.data,
      },
    });
  });

  const result = await callAiGateway(
    {
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts }],
      config: {
        systemInstruction:
          "You are Money Control Pro's AI Assistant. You can analyze financial documents, receipts, and provide advice. Be concise and helpful.",
      },
    },
    'AI Chat'
  );

  if (result.error === 'AIClient_Not_Initialized') return getMissingKeyMessage();
  if (result.error) return 'I encountered an error while processing your request.';

  return result.data.text;
}
