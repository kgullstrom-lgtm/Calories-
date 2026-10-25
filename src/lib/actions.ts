import { setState, getState } from './store'
import type { Food, LogEntry, Recipe, Profile, Settings, MealType, Nutrients } from './types'
import { uid, scale, sumNutrients, todayStr } from './util'
import { FOOD_DB } from './foods'
import { deletePhoto } from './photos'

export function allFoods(): Food[] {
  return [...getState().customFoods, ...FOOD_DB]
}

export function findFood(id: string): Food | undefined {
  return allFoods().find((f) => f.id === id)
}

/** Säkerställer att externa livsmedel (Open Food Facts) sparas lokalt */
function ensureSaved(food: Food) {
  if (food.source === 'off' && !getState().customFoods.some((f) => f.id === food.id)) {
    setState((s) => ({ ...s, customFoods: [food, ...s.customFoods] }))
  }
}

export function addEntry(e: Omit<LogEntry, 'id' | 'createdAt'>) {
  setState((s) => ({ ...s, log: [...s.log, { ...e, id: uid(), createdAt: Date.now() }] }))
}

export function logFood(food: Food, grams: number, meal: MealType, date: string) {
  ensureSaved(food)
  addEntry({
    date,
    meal,
    name: food.brand ? `${food.name} (${food.brand})` : food.name,
    amount: grams,
    unit: 'g',
    nutrients: scale(food.per100, grams / 100),
    perUnit: scale(food.per100, 1 / 100),
    kind: 'food',
    refId: food.id,
  })
}

export function recipeTotals(r: Recipe): Nutrients {
  return sumNutrients(r.ingredients.map((i) => scale(i.per100, i.grams / 100)))
}

export function recipePerPortion(r: Recipe): Nutrients {
  return scale(recipeTotals(r), 1 / Math.max(1, r.servings))
}

export function logRecipe(r: Recipe, portions: number, meal: MealType, date: string) {
  const per = recipePerPortion(r)
  addEntry({
    date,
    meal,
    name: r.name,
    amount: portions,
    unit: 'portion',
    nutrients: scale(per, portions),
    perUnit: per,
    kind: 'recipe',
    refId: r.id,
    photoId: r.photoId,
  })
}

export function updateEntryAmount(id: string, amount: number, meal?: MealType) {
  setState((s) => ({
    ...s,
    log: s.log.map((e) => {
      if (e.id !== id) return e
      const perUnit = e.perUnit ?? scale(e.nutrients, 1 / (e.amount || 1))
      return { ...e, amount, perUnit, nutrients: scale(perUnit, amount), meal: meal ?? e.meal }
    }),
  }))
}

export function deleteEntry(id: string) {
  const entry = getState().log.find((e) => e.id === id)
  setState((s) => ({ ...s, log: s.log.filter((e) => e.id !== id) }))
  // Ta bort fotot om inget annat refererar till det
  if (entry?.photoId) {
    const s = getState()
    const used = s.log.some((e) => e.photoId === entry.photoId) || s.recipes.some((r) => r.photoId === entry.photoId)
    if (!used) deletePhoto(entry.photoId).catch(() => {})
  }
}

export function copyMealFromDay(fromDate: string, toDate: string, meal: MealType) {
  const items = getState().log.filter((e) => e.date === fromDate && e.meal === meal)
  setState((s) => ({
    ...s,
    log: [...s.log, ...items.map((e) => ({ ...e, id: uid(), date: toDate, createdAt: Date.now() }))],
  }))
  return items.length
}

export function toggleFavoriteFood(food: Food) {
  ensureSaved(food)
  setState((s) => ({
    ...s,
    favoriteFoodIds: s.favoriteFoodIds.includes(food.id)
      ? s.favoriteFoodIds.filter((id) => id !== food.id)
      : [food.id, ...s.favoriteFoodIds],
  }))
}

export function toggleFavoriteRecipe(id: string) {
  setState((s) => ({
    ...s,
    favoriteRecipeIds: s.favoriteRecipeIds.includes(id)
      ? s.favoriteRecipeIds.filter((x) => x !== id)
      : [id, ...s.favoriteRecipeIds],
  }))
}

export function saveCustomFood(food: Food) {
  setState((s) => ({
    ...s,
    customFoods: s.customFoods.some((f) => f.id === food.id)
      ? s.customFoods.map((f) => (f.id === food.id ? food : f))
      : [food, ...s.customFoods],
  }))
}

export function deleteCustomFood(id: string) {
  setState((s) => ({
    ...s,
    customFoods: s.customFoods.filter((f) => f.id !== id),
    favoriteFoodIds: s.favoriteFoodIds.filter((x) => x !== id),
  }))
}

export function saveRecipe(r: Recipe) {
  setState((s) => ({
    ...s,
    recipes: s.recipes.some((x) => x.id === r.id) ? s.recipes.map((x) => (x.id === r.id ? r : x)) : [r, ...s.recipes],
  }))
}

export function deleteRecipe(id: string) {
  const r = getState().recipes.find((x) => x.id === id)
  setState((s) => ({
    ...s,
    recipes: s.recipes.filter((x) => x.id !== id),
    favoriteRecipeIds: s.favoriteRecipeIds.filter((x) => x !== id),
  }))
  if (r?.photoId && !getState().log.some((e) => e.photoId === r.photoId)) deletePhoto(r.photoId).catch(() => {})
}

export function addWeight(kg: number, date = todayStr()) {
  setState((s) => ({
    ...s,
    weights: [...s.weights.filter((w) => w.date !== date), { date, kg }].sort((a, b) => a.date.localeCompare(b.date)),
    // Profilvikten följer senaste vägningen
    profile: date >= (s.weights.at(-1)?.date ?? '') ? { ...s.profile, weightKg: kg } : s.profile,
  }))
}

export function deleteWeight(date: string) {
  setState((s) => ({ ...s, weights: s.weights.filter((w) => w.date !== date) }))
}

export function addWater(date: string, ml: number) {
  setState((s) => ({ ...s, water: { ...s.water, [date]: Math.max(0, (s.water[date] ?? 0) + ml) } }))
}

export function updateProfile(p: Partial<Profile>) {
  setState((s) => ({ ...s, profile: { ...s.profile, ...p } }))
}

export function updateSettings(p: Partial<Settings>) {
  setState((s) => ({ ...s, settings: { ...s.settings, ...p } }))
}

export function completeOnboarding() {
  setState((s) => ({
    ...s,
    onboarded: true,
    weights: s.weights.length ? s.weights : [{ date: todayStr(), kg: s.profile.weightKg }],
  }))
}
