import type { MealType, Nutrients } from './types'

export const uid = () =>
  (crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`)

export function todayStr(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(s: string, n: number): string {
  const d = parseDate(s)
  d.setDate(d.getDate() + n)
  return todayStr(d)
}

export function formatDay(s: string): string {
  const t = todayStr()
  if (s === t) return 'Idag'
  if (s === addDays(t, -1)) return 'Igår'
  if (s === addDays(t, 1)) return 'Imorgon'
  return parseDate(s).toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'short' })
}

export const ZERO: Nutrients = { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 }

export function sumNutrients(list: Nutrients[]): Nutrients {
  return list.reduce<Nutrients>(
    (a, n) => ({
      kcal: a.kcal + (n.kcal || 0),
      protein: a.protein + (n.protein || 0),
      carbs: a.carbs + (n.carbs || 0),
      fat: a.fat + (n.fat || 0),
      fiber: a.fiber + (n.fiber || 0),
      sugar: (a.sugar ?? 0) + (n.sugar ?? 0),
    }),
    { ...ZERO },
  )
}

export function scale(n: Nutrients, factor: number): Nutrients {
  return {
    kcal: n.kcal * factor,
    protein: n.protein * factor,
    carbs: n.carbs * factor,
    fat: n.fat * factor,
    fiber: (n.fiber || 0) * factor,
    sugar: (n.sugar ?? 0) * factor,
  }
}

export const r0 = (n: number) => Math.round(n)
export const r1 = (n: number) => Math.round(n * 10) / 10
/** Svensk decimalformatering, t.ex. 12,5 */
export const fmt1 = (n: number) => r1(n).toLocaleString('sv-SE')

/** Föreslår måltid utifrån klockslaget */
export function suggestMeal(): MealType {
  const h = new Date().getHours()
  if (h < 10) return 'breakfast'
  if (h < 14) return 'lunch'
  if (h < 17) return 'snack'
  if (h < 21) return 'dinner'
  return 'snack'
}
