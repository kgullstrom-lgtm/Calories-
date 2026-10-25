import { useMemo, useState } from 'react'
import { useStore } from '../lib/store'
import { FOOD_DB, searchFoods } from '../lib/foods'
import { searchOff, lookupBarcode } from '../lib/off'
import type { Food, Recipe } from '../lib/types'
import { recipePerPortion, toggleFavoriteFood, toggleFavoriteRecipe } from '../lib/actions'
import { r0 } from '../lib/util'

type Tab = 'search' | 'favorites' | 'recent' | 'recipes' | 'mine'

interface Props {
  onPickFood: (food: Food) => void
  onPickRecipe?: (recipe: Recipe) => void
  onCreateFood?: () => void
}

export function FoodPicker({ onPickFood, onPickRecipe, onCreateFood }: Props) {
  const [tab, setTab] = useState<Tab>('search')
  const [q, setQ] = useState('')
  const customFoods = useStore((s) => s.customFoods)
  const favIds = useStore((s) => s.favoriteFoodIds)
  const favRecipeIds = useStore((s) => s.favoriteRecipeIds)
  const recipes = useStore((s) => s.recipes)
  const log = useStore((s) => s.log)
  const [offResults, setOffResults] = useState<Food[] | null>(null)
  const [offLoading, setOffLoading] = useState(false)
  const [offError, setOffError] = useState('')

  const all = useMemo(() => [...customFoods, ...FOOD_DB], [customFoods])
  const byId = useMemo(() => new Map(all.map((f) => [f.id, f])), [all])

  const recent = useMemo(() => {
    const seen = new Set<string>()
    const out: Food[] = []
    for (let i = log.length - 1; i >= 0 && out.length < 30; i--) {
      const e = log[i]
      if (e.kind === 'food' && e.refId && !seen.has(e.refId)) {
        seen.add(e.refId)
        const f = byId.get(e.refId)
        if (f) out.push(f)
      }
    }
    return out
  }, [log, byId])

  const runOff = async () => {
    setOffLoading(true)
    setOffError('')
    try {
      const query = q.trim()
      if (/^\d{8,14}$/.test(query)) {
        const f = await lookupBarcode(query)
        setOffResults(f ? [f] : [])
      } else {
        setOffResults(await searchOff(query))
      }
    } catch (e) {
      setOffError(e instanceof Error ? e.message : 'Sökningen misslyckades')
    } finally {
      setOffLoading(false)
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'search', label: 'Sök' },
    { id: 'favorites', label: '★ Favoriter' },
    { id: 'recent', label: 'Senaste' },
    ...(onPickRecipe ? [{ id: 'recipes' as Tab, label: 'Recept' }] : []),
    { id: 'mine', label: 'Mina' },
  ]

  const filteredRecipes = searchFoods(
    recipes.map((r) => ({ id: r.id, name: r.name, per100: recipePerPortion(r), source: 'custom' as const })),
    q,
  ).map((f) => recipes.find((r) => r.id === f.id)!)

  let list: Food[] = []
  if (tab === 'search') list = q.trim() ? searchFoods(all, q).slice(0, 60) : recent.slice(0, 8)
  if (tab === 'favorites') list = searchFoods(favIds.map((id) => byId.get(id)).filter((f): f is Food => !!f), q)
  if (tab === 'recent') list = searchFoods(recent, q)
  if (tab === 'mine') list = searchFoods(customFoods.filter((f) => f.source === 'custom'), q)

  return (
    <div className="picker">
      <div className="search-box">
        <input
          type="search"
          placeholder="Sök livsmedel eller streckkod…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setOffResults(null)
            setOffError('')
          }}
          autoFocus
          enterKeyHint="search"
          onKeyDown={(e) => e.key === 'Enter' && tab === 'search' && q.trim() && runOff()}
        />
      </div>
      <div className="chips" role="tablist">
        {tabs.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} className={`chip ${tab === t.id ? 'on' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'recipes' && onPickRecipe ? (
        <ul className="list">
          {filteredRecipes.length === 0 && <li className="empty">Inga recept ännu – skapa under fliken Recept.</li>}
          {filteredRecipes
            .sort((a, b) => Number(favRecipeIds.includes(b.id)) - Number(favRecipeIds.includes(a.id)))
            .map((r) => (
              <li key={r.id} className="row">
                <button className="row-main" onClick={() => onPickRecipe(r)}>
                  <span className="row-title">{r.name}</span>
                  <span className="row-sub">
                    {r0(recipePerPortion(r).kcal)} kcal / portion · {r.servings} portioner
                  </span>
                </button>
                <button className="star" aria-label="Favorit" onClick={() => toggleFavoriteRecipe(r.id)}>
                  {favRecipeIds.includes(r.id) ? '★' : '☆'}
                </button>
              </li>
            ))}
        </ul>
      ) : (
        <>
          {tab === 'search' && !q.trim() && recent.length > 0 && <p className="section-label">Senast använda</p>}
          <FoodList foods={list} favIds={favIds} onPick={onPickFood} />
          {list.length === 0 && (
            <p className="empty">
              {tab === 'favorites'
                ? 'Tryck på ☆ vid ett livsmedel för att spara det som favorit.'
                : tab === 'mine'
                  ? 'Du har inte skapat några egna livsmedel ännu.'
                  : q.trim()
                    ? 'Inga träffar i den lokala databasen.'
                    : 'Börja skriva för att söka.'}
            </p>
          )}
          {tab === 'search' && q.trim().length > 1 && (
            <div className="off">
              {offResults === null ? (
                <button className="btn ghost wide" onClick={runOff} disabled={offLoading}>
                  {offLoading ? 'Söker…' : `🌍 Sök "${q.trim()}" i Open Food Facts`}
                </button>
              ) : (
                <>
                  <p className="section-label">Open Food Facts</p>
                  {offResults.length === 0 && <p className="empty">Inga träffar.</p>}
                  <FoodList foods={offResults} favIds={favIds} onPick={onPickFood} />
                </>
              )}
              {offError && <p className="error">{offError}</p>}
            </div>
          )}
        </>
      )}
      {onCreateFood && (
        <button className="btn ghost wide" onClick={onCreateFood}>
          ＋ Skapa eget livsmedel
        </button>
      )}
    </div>
  )
}

function FoodList({ foods, favIds, onPick }: { foods: Food[]; favIds: string[]; onPick: (f: Food) => void }) {
  return (
    <ul className="list">
      {foods.map((f) => (
        <li key={f.id} className="row">
          <button className="row-main" onClick={() => onPick(f)}>
            <span className="row-title">{f.name}</span>
            <span className="row-sub">
              {f.brand ? `${f.brand} · ` : ''}
              {r0(f.per100.kcal)} kcal / 100 g
              {f.servings?.[0] ? ` · ${f.servings[0].label} ${r0(f.servings[0].grams)} g` : ''}
            </span>
          </button>
          <button className="star" aria-label={favIds.includes(f.id) ? 'Ta bort favorit' : 'Spara som favorit'} onClick={() => toggleFavoriteFood(f)}>
            {favIds.includes(f.id) ? '★' : '☆'}
          </button>
        </li>
      ))}
    </ul>
  )
}
