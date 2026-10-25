import { useState } from 'react'
import { Sheet } from './Sheet'
import type { Food } from '../lib/types'
import { saveCustomFood } from '../lib/actions'
import { uid } from '../lib/util'

export function CustomFoodSheet({ food, onClose, onSaved }: { food?: Food; onClose: () => void; onSaved?: (f: Food) => void }) {
  const [name, setName] = useState(food?.name ?? '')
  const [brand, setBrand] = useState(food?.brand ?? '')
  const [vals, setVals] = useState({
    kcal: String(food?.per100.kcal ?? ''),
    protein: String(food?.per100.protein ?? ''),
    carbs: String(food?.per100.carbs ?? ''),
    fat: String(food?.per100.fat ?? ''),
    fiber: String(food?.per100.fiber ?? ''),
  })
  const [servLabel, setServLabel] = useState(food?.servings?.[0]?.label ?? '')
  const [servGrams, setServGrams] = useState(String(food?.servings?.[0]?.grams ?? ''))

  const num = (s: string) => parseFloat(s.replace(',', '.')) || 0
  const valid = name.trim() && num(vals.kcal) > 0

  const save = () => {
    const f: Food = {
      id: food?.id ?? `custom-${uid()}`,
      name: name.trim(),
      brand: brand.trim() || undefined,
      per100: {
        kcal: num(vals.kcal),
        protein: num(vals.protein),
        carbs: num(vals.carbs),
        fat: num(vals.fat),
        fiber: num(vals.fiber),
      },
      servings: servLabel.trim() && num(servGrams) > 0 ? [{ label: servLabel.trim(), grams: num(servGrams) }] : undefined,
      source: 'custom',
    }
    saveCustomFood(f)
    onSaved?.(f)
    onClose()
  }

  const fields: [keyof typeof vals, string][] = [
    ['kcal', 'Energi (kcal)'],
    ['protein', 'Protein (g)'],
    ['carbs', 'Kolhydrater (g)'],
    ['fat', 'Fett (g)'],
    ['fiber', 'Fiber (g)'],
  ]

  return (
    <Sheet
      title={food ? 'Redigera livsmedel' : 'Eget livsmedel'}
      onClose={onClose}
      footer={
        <button className="btn primary wide" disabled={!valid} onClick={save}>
          Spara
        </button>
      }
    >
      <label className="field">
        <span>Namn</span>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="t.ex. Mammas köttbullar" />
      </label>
      <label className="field">
        <span>Märke (valfritt)</span>
        <input value={brand} onChange={(e) => setBrand(e.target.value)} />
      </label>
      <p className="section-label">Näringsvärde per 100 g</p>
      <div className="grid-2">
        {fields.map(([k, label]) => (
          <label className="field" key={k}>
            <span>{label}</span>
            <input inputMode="decimal" value={vals[k]} onChange={(e) => setVals({ ...vals, [k]: e.target.value })} />
          </label>
        ))}
      </div>
      <p className="section-label">Portion (valfritt)</p>
      <div className="grid-2">
        <label className="field">
          <span>Benämning</span>
          <input value={servLabel} onChange={(e) => setServLabel(e.target.value)} placeholder="1 st" />
        </label>
        <label className="field">
          <span>Gram</span>
          <input inputMode="decimal" value={servGrams} onChange={(e) => setServGrams(e.target.value)} />
        </label>
      </div>
    </Sheet>
  )
}
