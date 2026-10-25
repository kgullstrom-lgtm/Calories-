import { useState } from 'react'
import { Sheet } from './Sheet'
import { NutrientGrid } from './NutrientGrid'
import { Photo } from './Photo'
import { MEALS, type LogEntry, type MealType } from '../lib/types'
import { deleteEntry, findFood, toggleFavoriteFood, updateEntryAmount } from '../lib/actions'
import { useStore } from '../lib/store'
import { scale } from '../lib/util'

export function EntrySheet({ entry, onClose }: { entry: LogEntry; onClose: () => void }) {
  const [amount, setAmount] = useState(String(entry.amount))
  const [meal, setMeal] = useState<MealType>(entry.meal)
  const favIds = useStore((s) => s.favoriteFoodIds)
  const n = parseFloat(amount.replace(',', '.')) || 0
  const perUnit = entry.perUnit ?? scale(entry.nutrients, 1 / (entry.amount || 1))
  const food = entry.kind === 'food' && entry.refId ? findFood(entry.refId) : undefined
  const unitLabel = entry.unit === 'g' ? 'gram' : entry.unit === 'portion' ? 'portioner' : 'antal'

  return (
    <Sheet
      title={entry.name}
      onClose={onClose}
      footer={
        <div className="foot-row">
          <button
            className="btn danger"
            onClick={() => {
              deleteEntry(entry.id)
              onClose()
            }}
          >
            Ta bort
          </button>
          <button
            className="btn primary grow"
            disabled={n <= 0}
            onClick={() => {
              updateEntryAmount(entry.id, n, meal)
              onClose()
            }}
          >
            Spara
          </button>
        </div>
      }
    >
      <Photo id={entry.photoId} className="photo-preview small" />
      <NutrientGrid n={scale(perUnit, n)} />
      <label className="field">
        <span>Mängd ({unitLabel})</span>
        <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </label>
      <div className="chips">
        {MEALS.map((m) => (
          <button key={m.id} className={`chip ${meal === m.id ? 'on' : ''}`} onClick={() => setMeal(m.id)}>
            {m.icon} {m.label}
          </button>
        ))}
      </div>
      {food && (
        <button className="btn ghost" onClick={() => toggleFavoriteFood(food)}>
          {favIds.includes(food.id) ? '★ Favorit' : '☆ Spara som favorit'}
        </button>
      )}
    </Sheet>
  )
}
