import Anthropic from '@anthropic-ai/sdk'

export interface AnalyzedItem {
  name: string
  grams: number
  kcal: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  confidence: 'hög' | 'medel' | 'låg'
}

export interface Analysis {
  mealName: string
  items: AnalyzedItem[]
  notes: string
}

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['mealName', 'items', 'notes'],
  properties: {
    mealName: { type: 'string', description: 'Kort svenskt namn på måltiden' },
    notes: { type: 'string', description: 'Kort kommentar på svenska, t.ex. osäkerheter eller tips' },
    items: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'grams', 'kcal', 'protein', 'carbs', 'fat', 'fiber', 'confidence'],
        properties: {
          name: { type: 'string' },
          grams: { type: 'number', description: 'Uppskattad vikt i gram' },
          kcal: { type: 'number', description: 'Energi för hela mängden' },
          protein: { type: 'number', description: 'Gram protein för hela mängden' },
          carbs: { type: 'number', description: 'Gram kolhydrater för hela mängden' },
          fat: { type: 'number', description: 'Gram fett för hela mängden' },
          fiber: { type: 'number', description: 'Gram fiber för hela mängden' },
          confidence: { type: 'string', enum: ['hög', 'medel', 'låg'] },
        },
      },
    },
  },
} as const

const SYSTEM = `Du är en erfaren dietist som uppskattar näringsinnehåll i måltider.
Identifiera varje separat livsmedel eller komponent (inklusive sås, dressing, matolja och dryck om de syns eller nämns).
Uppskatta portionsstorlek i gram utifrån tallrikens storlek, bestick och andra referenser i bilden.
Använd svenska livsmedelsnamn och typiska näringsvärden från Livsmedelsverkets databas.
Om bilden inte visar mat, returnera en tom lista och förklara i notes.`

export async function analyzeMeal(opts: {
  apiKey: string
  model: string
  imageDataUrl?: string
  description?: string
}): Promise<Analysis> {
  const client = new Anthropic({ apiKey: opts.apiKey, dangerouslyAllowBrowser: true })

  const content: Anthropic.Beta.BetaContentBlockParam[] = []
  if (opts.imageDataUrl) {
    const [meta, data] = opts.imageDataUrl.split(',')
    const media = meta.match(/data:(.*);base64/)?.[1] ?? 'image/jpeg'
    content.push({
      type: 'image',
      source: { type: 'base64', media_type: media as 'image/jpeg', data },
    })
  }
  content.push({
    type: 'text',
    text: opts.description?.trim()
      ? `Analysera måltiden. Användarens beskrivning: ${opts.description.trim()}`
      : 'Analysera måltiden på bilden.',
  })

  const response = await client.beta.messages.create({
    model: opts.model,
    max_tokens: 16000,
    system: SYSTEM,
    messages: [{ role: 'user', content }],
    output_config: { format: { type: 'json_schema', schema: SCHEMA } },
    // Om en förfrågan nekas körs den om på en rekommenderad reservmodell
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
  })

  if (response.stop_reason === 'refusal') {
    throw new Error('Analysen nekades av modellen. Prova en annan bild eller beskriv måltiden i text.')
  }
  if (response.stop_reason === 'max_tokens') {
    throw new Error('Svaret blev för långt. Försök igen.')
  }
  const text = response.content.flatMap((b) => (b.type === 'text' ? [b.text] : [])).join('')
  try {
    return JSON.parse(text) as Analysis
  } catch {
    throw new Error('Kunde inte tolka svaret från AI:n.')
  }
}

export function friendlyError(e: unknown): string {
  if (e instanceof Anthropic.AuthenticationError) return 'Ogiltig API-nyckel. Kontrollera den under Profil.'
  if (e instanceof Anthropic.RateLimitError) return 'För många förfrågningar just nu – vänta en stund och försök igen.'
  if (e instanceof Anthropic.APIConnectionError) return 'Ingen anslutning till AI-tjänsten. Kontrollera internet.'
  if (e instanceof Anthropic.APIError) return `AI-tjänsten svarade med fel (${e.status}): ${e.message}`
  return e instanceof Error ? e.message : String(e)
}
