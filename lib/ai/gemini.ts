import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function generateJSON<T>(prompt: string, systemPrompt: string): Promise<T> {
  console.log('[Groq] prompt:', prompt)

  const completion = await groq.chat.completions.create({
    model: 'qwen/qwen3-32b',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.4,
  })

  const raw = completion.choices[0].message.content ?? '{}'
  console.log('[Groq] response:', raw)
  return JSON.parse(raw) as T
}
