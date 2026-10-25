import { useState } from 'react'
import { Sheet } from './Sheet'
import { FoodPicker } from './FoodPicker'
import { PortionSheet } from './PortionSheet'
import { CustomFoodSheet } from './CustomFoodSheet'
import { RecipeLogSheet } from './RecipeLogSheet'
import { MEALS, type Food, type MealType, type Recipe } from '../lib/types'
import { addEntry, logFood } from '../lib/actions'

interface Props {
  date: string
  meal: MealType
  onClose: () => void
  onPhoto: () => void
}

export function AddFoodSheet({ date, meal, onClose, onPhoto }: Props) {
  const [food, setFood] = useState<Food | null>(null)
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [creating, setCreating] = useState(false)
  const [quick, setQuick] = useState(false)
  const mealLabel = MEALS.find((m) => m.id === meal)!.label

  if (food)
    return (
      <PortionSheet
        food={food}
        meal={meal}
        onClose={() => setFood(null)}
        onConfirm={(g, m) => {
          logFood(food, g, m, date)
          onClose()
        }}
      />
    )
  if (recipe) return <RecipeLogSheet recipe={recipe} date={date} meal={meal} onClose={() => setRecipe(null)} onDone={onClose} />
  if (creating) return <CustomFoodSheet onClose={() => setCreating(false)} onSaved={(f) => setFood(f)} />
  if (quick) return <QuickAddSheet date={date} meal={meal} onClose={() => setQuick(false)} onDone={onClose} />

  return (
    <Sheet title={`Lägg till · ${mealLabel}`} onClose={onClose}>
      <div className="quick-actions">
        <button className="qa" onClick={onPhoto}>
          <span>📷</span>Fota
        </button>
        <button className="qa" onClick={() => setQuick(true)}>
          <span>⚡</span>Snabb-kcal
        </button>
      </div>
      <FoodPicker onPickFood={setFood} onPickRecipe={setRecipe} onCreateFood={() => setCreating(true)} />
    </Sheet>
  )
}

function QuickAddSheet({ date, meal, onClose, onDone }: { date: string; meal: MealType; onClose: () => void; onDone: () => void }) {
  const [name, setName] = useState('')
  const [kcal, setKcal] = useState('')
  const [p, setP] = useState('')
  const [c, setC] = useState('')
  const [f, setF] = useState('')
  const num = (s: string) => parseFloat(s.replace(',', '.')) || 0
  return (
    <Sheet
      title="Snabbregistrering"
      onClose={onClose}
      footer={
        <button
          className="btn primary wide"
          disabled={num(kcal) <= 0}
          onClick={() => {
            addEntry({
              date,
              meal,
              name: name.trim() || 'Snabbregistrering',
              amount: 1,
              unit: 'st',
              nutrients: { kcal: num(kcal), protein: num(p), carbs: num(c), fat: num(f), fiber: 0 },
              kind: 'quick',
            })
            onDone()
          }}
        >
          Lägg till
        </button>
      }
    >
      <label className="field">
        <span>Beskrivning</span>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="t.ex. Lunch på restaurang" />
      </label>
      <label className="field">
        <span>Kalorier (kcal)</span>
        <input inputMode="decimal" value={kcal} onChange={(e) => setKcal(e.target.value)} autoFocus />
      </label>
      <div className="grid-3">
        <label className="field">
          <span>Protein g</span>
          <input inputMode="decimal" value={p} onChange={(e) => setP(e.target.value)} />
        </label>
        <label className="field">
          <span>Kolhydr. g</span>
          <input inputMode="decimal" value={c} onChange={(e) => setC(e.target.value)} />
        </label>
        <label className="field">
          <span>Fett g</span>
          <input inputMode="decimal" value={f} onChange={(e) => setF(e.target.value)} />
        </label>
      </div>
    </Sheet>
  )
}
