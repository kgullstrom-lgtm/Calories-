import { useSyncExternalStore } from 'react'
import type { AppState } from './types'

const KEY = 'kalorikoll:v1'

export const DEFAULT_MODEL = 'claude-opus-5-5'

export const defaultState: AppState = {
  version: 1,
  profile: {
    name: '',
    sex: 'female',
    age: 35,
    heightCm: 168,
    weightKg: 70,
    targetWeightKg: 65,
    activity: 1.375,
    goal: 'lose',
    rate: 0.5,
    macroPct: { protein: 25, carbs: 45, fat: 30 },
    waterGoalMl: 2000,
  },
  settings: { apiKey: '', model: DEFAULT_MODEL },
  log: [],
  customFoods: [],
  favoriteFoodIds: [],
  favoriteRecipeIds: [],
  recipes: [],
  weights: [],
  water: {},
  onboarded: false,
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultState
    const parsed = JSON.parse(raw) as Partial<AppState>
    return {
      ...defaultState,
      ...parsed,
      profile: { ...defaultState.profile, ...parsed.profile },
      settings: { ...defaultState.settings, ...parsed.settings },
    }
  } catch {
    return defaultState
  }
}

let state: AppState = load()
const listeners = new Set<() => void>()

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch (e) {
    console.error('Kunde inte spara data', e)
    alert('Lagringsutrymmet är fullt – exportera och rensa gammal data under Profil.')
  }
}

export function getState(): AppState {
  return state
}

export function setState(updater: (s: AppState) => AppState) {
  state = updater(state)
  persist()
  listeners.forEach((l) => l())
}

export function replaceState(next: AppState) {
  setState(() => ({ ...defaultState, ...next }))
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useStore<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state))
}
