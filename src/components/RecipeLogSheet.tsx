import { useState } from 'react'
import { Sheet } from './Sheet'
import { NutrientGrid } from './NutrientGrid'
import { MEALS, type MealType, type Recipe } from '../lib/types'
import { logRecipe, recipePerPortion } from '../lib/actions'
import { scale } from '../lib/util'

interface Props {
  recipe: Recipe
  date: string
  meal: MealType
  onClose: () => void
  onDone: () => void
}

export function RecipeLogSheet({ recipe, date, meal: m0, onClose, onDone }: Props) {
  const [portions, setPortions] = useState('1')
  const [meal, setMeal] = useState<MealType>(m0)
  const n = parseFloat(portions.replace(',', '.')) || 0
  return (
    <Sheet
      title={recipe.name}
      onClose={onClose}
      footer={
        <button
          className="btn primary wide"
          disabled={n <= 0}
          onClick={() => {
            logRecipe(recipe, n, meal, date)
            onDone()
          }}
        >
          Lägg till {n} portion{n === 1 ? '' : 'er'}
        </button>
      }
    >
      <NutrientGrid n={scale(recipePerPortion(recipe), n)} />
      <div className="stepper">
        <button className="btn ghost" onClick={() => setPortions(String(Math.max(0.5, n - 0.5)))}>
          −
        </button>
        <label className="field">
          <span>Portioner</span>
          <input inputMode="decimal" value={portions} onChange={(e) => setPortions(e.target.value)} />
        </label>
        <button className="btn ghost" onClick={() => setPortions(String(n + 0.5))}>
          ＋
        </button>
      </div>
      <div className="chips">
        {MEALS.map((x) => (
          <button key={x.id} className={`chip ${meal === x.id ? 'on' : ''}`} onClick={() => setMeal(x.id)}>
            {x.icon} {x.label}
          </button>
        ))}
      </div>
    </Sheet>
  )
}
