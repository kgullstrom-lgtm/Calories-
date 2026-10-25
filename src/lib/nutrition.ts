import type { Profile } from './types'

export const ACTIVITY_LEVELS = [
  { value: 1.2, label: 'Stillasittande', hint: 'Kontorsjobb, lite motion' },
  { value: 1.375, label: 'Lätt aktiv', hint: 'Träning 1–3 dagar/vecka' },
  { value: 1.55, label: 'Måttligt aktiv', hint: 'Träning 3–5 dagar/vecka' },
  { value: 1.725, label: 'Mycket aktiv', hint: 'Träning 6–7 dagar/vecka' },
  { value: 1.9, label: 'Extremt aktiv', hint: 'Fysiskt arbete + träning' },
]

/** Basalmetabolism enligt Mifflin-St Jeor */
export function bmr(p: Profile): number {
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age
  return p.sex === 'male' ? base + 5 : base - 161
}

export function tdee(p: Profile): number {
  return bmr(p) * p.activity
}

/** ~7700 kcal per kg kroppsvikt */
export function kcalGoal(p: Profile): number {
  if (p.kcalOverride && p.kcalOverride > 0) return Math.round(p.kcalOverride)
  const daily = (p.rate * 7700) / 7
  let goal = tdee(p)
  if (p.goal === 'lose') goal -= daily
  if (p.goal === 'gain') goal += daily
  const floor = p.sex === 'male' ? 1500 : 1200
  return Math.round(Math.max(goal, floor) / 10) * 10
}

export function macroGoals(p: Profile) {
  const kcal = kcalGoal(p)
  return {
    kcal,
    protein: Math.round((kcal * p.macroPct.protein) / 100 / 4),
    carbs: Math.round((kcal * p.macroPct.carbs) / 100 / 4),
    fat: Math.round((kcal * p.macroPct.fat) / 100 / 9),
    fiber: Math.round((kcal / 1000) * 14),
  }
}

export function bmi(weightKg: number, heightCm: number): number {
  const m = heightCm / 100
  return weightKg / (m * m)
}

export function bmiLabel(v: number): string {
  if (v < 18.5) return 'Undervikt'
  if (v < 25) return 'Normalvikt'
  if (v < 30) return 'Övervikt'
  return 'Fetma'
}
