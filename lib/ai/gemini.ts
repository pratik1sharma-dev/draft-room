import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

export function getModel(model = 'gemini-2.0-flash') {
  return genAI.getGenerativeModel({ model })
}

export async function generateJSON<T>(prompt: string, systemPrompt: string): Promise<T> {
  const model = getModel()
  const result = await model.generateContent({
    systemInstruction: systemPrompt,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: 'application/json' },
  })
  return JSON.parse(result.response.text()) as T
}
