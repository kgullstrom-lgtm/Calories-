import type { Food } from './types'

// Open Food Facts – öppen databas med förpackade livsmedel
const BASE = 'https://world.openfoodfacts.org'
const FIELDS = 'code,product_name,product_name_sv,brands,nutriments,serving_quantity,serving_size'

interface OffProduct {
  code?: string
  product_name?: string
  product_name_sv?: string
  brands?: string
  serving_quantity?: number | string
  serving_size?: string
  nutriments?: Record<string, number | string | undefined>
}

function num(v: unknown): number {
  const n = typeof v === 'string' ? parseFloat(v) : typeof v === 'number' ? v : NaN
  return Number.isFinite(n) ? n : 0
}

function toFood(p: OffProduct): Food | null {
  const n = p.nutriments ?? {}
  let kcal = num(n['energy-kcal_100g'])
  if (!kcal && n['energy_100g']) kcal = num(n['energy_100g']) / 4.184
  const name = p.product_name_sv || p.product_name
  if (!name || !kcal) return null
  const sq = num(p.serving_quantity)
  return {
    id: `off-${p.code}`,
    name,
    brand: p.brands?.split(',')[0]?.trim(),
    per100: {
      kcal: Math.round(kcal),
      protein: num(n['proteins_100g']),
      carbs: num(n['carbohydrates_100g']),
      fat: num(n['fat_100g']),
      fiber: num(n['fiber_100g']),
      sugar: num(n['sugars_100g']),
    },
    servings: sq ? [{ label: p.serving_size || '1 portion', grams: sq }] : undefined,
    source: 'off',
  }
}

export async function searchOff(q: string, signal?: AbortSignal): Promise<Food[]> {
  const url = `${BASE}/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=25&fields=${FIELDS}`
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`Open Food Facts svarade ${res.status}`)
  const data = (await res.json()) as { products?: OffProduct[] }
  return (data.products ?? []).map(toFood).filter((f): f is Food => f !== null)
}

export async function lookupBarcode(code: string): Promise<Food | null> {
  const res = await fetch(`${BASE}/api/v2/product/${encodeURIComponent(code)}.json?fields=${FIELDS}`)
  if (!res.ok) return null
  const data = (await res.json()) as { status?: number; product?: OffProduct }
  if (data.status !== 1 || !data.product) return null
  return toFood({ ...data.product, code })
}
