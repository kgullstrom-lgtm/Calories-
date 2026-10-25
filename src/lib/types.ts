export interface Nutrients {
  kcal: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar?: number
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export const MEALS: { id: MealType; label: string; icon: string }[] = [
  { id: 'breakfast', label: 'Frukost', icon: '🥣' },
  { id: 'lunch', label: 'Lunch', icon: '🥗' },
  { id: 'dinner', label: 'Middag', icon: '🍽️' },
  { id: 'snack', label: 'Mellanmål', icon: '🍎' },
]

export interface Serving {
  label: string
  grams: number
}

export interface Food {
  id: string
  name: string
  brand?: string
  category?: string
  /** Näringsvärden per 100 g */
  per100: Nutrients
  servings?: Serving[]
  source: 'db' | 'custom' | 'off'
}

export interface Ingredient {
  foodId: string
  name: string
  per100: Nutrients
  grams: number
}

export interface Recipe {
  id: string
  name: string
  servings: number
  ingredients: Ingredient[]
  instructions?: string
  photoId?: string
  createdAt: number
}

export interface LogEntry {
  id: string
  date: string // YYYY-MM-DD
  meal: MealType
  name: string
  /** Mängd: gram för livsmedel, antal portioner för recept */
  amount: number
  unit: 'g' | 'portion' | 'st'
  /** Näring för hela posten */
  nutrients: Nutrients
  kind: 'food' | 'recipe' | 'photo' | 'quick'
  refId?: string
  /** Näring per enhet (per gram / per portion), används vid ändring av mängd */
  perUnit?: Nutrients
  photoId?: string
  createdAt: number
}

export interface WeightEntry {
  date: string
  kg: number
}

export type Sex = 'female' | 'male'
export type Goal = 'lose' | 'maintain' | 'gain'

export interface Profile {
  name: string
  sex: Sex
  age: number
  heightCm: number
  weightKg: number
  targetWeightKg: number
  activity: number // PAL-faktor
  goal: Goal
  /** kg per vecka */
  rate: number
  /** Egen kalorigräns, åsidosätter beräkning */
  kcalOverride?: number
  /** Makrofördelning i procent av energi */
  macroPct: { protein: number; carbs: number; fat: number }
  waterGoalMl: number
}

export interface Settings {
  apiKey: string
  model: string
}

export interface AppState {
  version: 1
  profile: Profile
  settings: Settings
  log: LogEntry[]
  customFoods: Food[]
  favoriteFoodIds: string[]
  favoriteRecipeIds: string[]
  recipes: Recipe[]
  weights: WeightEntry[]
  water: Record<string, number>
  onboarded: boolean
}
