import { useState } from 'react'
import { Sheet } from './Sheet'
import { NutrientGrid } from './NutrientGrid'
import type { Food, MealType } from '../lib/types'
import { MEALS } from '../lib/types'
import { scale } from '../lib/util'
import { toggleFavoriteFood } from '../lib/actions'
import { useStore } from '../lib/store'

interface Props {
  food: Food
  initialGrams?: number
  meal?: MealType
  confirmLabel?: string
  onConfirm: (grams: number, meal: MealType) => void
  onClose: () => void
}

export function PortionSheet({ food, initialGrams, meal: initialMeal, confirmLabel = 'Lägg till', onConfirm, onClose }: Props) {
  const servings = [...(food.servings ?? []), { label: '100 g', grams: 100 }]
  const [count, setCount] = useState(initialGrams ? String(initialGrams) : '1')
  const [unit, setUnit] = useState<number>(initialGrams ? -1 : 0) // index i servings, -1 = gram
  const [meal, setMeal] = useState<MealType>(initialMeal ?? 'lunch')
  const isFav = useStore((s) => s.favoriteFoodIds.includes(food.id))

  const n = parseFloat(count.replace(',', '.')) || 0
  const grams = unit === -1 ? n : n * servings[unit].grams

  return (
    <Sheet
      title={food.name}
      onClose={onClose}
      footer={
        <button className="btn primary wide" disabled={grams <= 0} onClick={() => onConfirm(Math.round(grams), meal)}>
          {confirmLabel} · {Math.round(grams)} g
        </button>
      }
    >
      {food.brand && <p className="muted">{food.brand}</p>}
      <NutrientGrid n={scale(food.per100, grams / 100)} />
      <div className="field-row">
        <label className="field">
          <span>Mängd</span>
          <input inputMode="decimal" value={count} onChange={(e) => setCount(e.target.value)} />
        </label>
        <label className="field grow">
          <span>Enhet</span>
          <select
            value={unit}
            onChange={(e) => {
              const u = Number(e.target.value)
              // Behåll ungefär samma mängd vid byte av enhet
              if (u === -1 && unit !== -1) setCount(String(Math.round(grams)))
              if (u !== -1 && unit === -1) setCount('1')
              setUnit(u)
            }}
          >
            {servings.map((s, i) => (
              <option key={i} value={i}>
                {s.label} ({Math.round(s.grams)} g)
              </option>
            ))}
            <option value={-1}>gram</option>
          </select>
        </label>
      </div>
      {initialMeal !== undefined && (
        <div className="chips">
          {MEALS.map((m) => (
            <button key={m.id} className={`chip ${meal === m.id ? 'on' : ''}`} onClick={() => setMeal(m.id)}>
              {m.icon} {m.label}
            </button>
          ))}
        </div>
      )}
      <p className="muted small">
        Per 100 g: {Math.round(food.per100.kcal)} kcal · P {food.per100.protein} g · K {food.per100.carbs} g · F {food.per100.fat} g
      </p>
      <button className="btn ghost" onClick={() => toggleFavoriteFood(food)}>
        {isFav ? '★ Favorit' : '☆ Spara som favorit'}
      </button>
    </Sheet>
  )
}
