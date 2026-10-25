import { useRef, useState } from 'react'
import { Sheet } from './Sheet'
import { FoodPicker } from './FoodPicker'
import { PortionSheet } from './PortionSheet'
import { CustomFoodSheet } from './CustomFoodSheet'
import { NutrientGrid } from './NutrientGrid'
import { Photo } from './Photo'
import type { Food, Ingredient, Recipe } from '../lib/types'
import { deleteRecipe, recipePerPortion, recipeTotals, saveRecipe } from '../lib/actions'
import { resizeImage, savePhoto } from '../lib/photos'
import { r0, scale, uid } from '../lib/util'

export function RecipeEditor({ recipe, onClose }: { recipe?: Recipe; onClose: () => void }) {
  const [name, setName] = useState(recipe?.name ?? '')
  const [servings, setServings] = useState(String(recipe?.servings ?? 4))
  const [ingredients, setIngredients] = useState<Ingredient[]>(recipe?.ingredients ?? [])
  const [instructions, setInstructions] = useState(recipe?.instructions ?? '')
  const [photoId, setPhotoId] = useState(recipe?.photoId)
  const [picking, setPicking] = useState(false)
  const [creating, setCreating] = useState(false)
  const [portionFood, setPortionFood] = useState<Food | null>(null)
  const [editIdx, setEditIdx] = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [meta] = useState(() => ({ id: recipe?.id ?? uid(), createdAt: recipe?.createdAt ?? Date.now() }))

  const draft: Recipe = {
    id: meta.id,
    name: name.trim(),
    servings: Math.max(1, parseFloat(servings.replace(',', '.')) || 1),
    ingredients,
    instructions: instructions.trim() || undefined,
    photoId,
    createdAt: meta.createdAt,
  }

  const onPhoto = async (file?: File) => {
    if (!file) return
    const id = `photo-${uid()}`
    await savePhoto(id, await resizeImage(file, 640, 0.75))
    setPhotoId(id)
  }

  if (portionFood) {
    const existing = editIdx !== null ? ingredients[editIdx] : undefined
    return (
      <PortionSheet
        food={portionFood}
        initialGrams={existing?.grams}
        confirmLabel={existing ? 'Uppdatera' : 'Lägg till ingrediens'}
        onClose={() => {
          setPortionFood(null)
          setEditIdx(null)
        }}
        onConfirm={(grams) => {
          const ing: Ingredient = { foodId: portionFood.id, name: portionFood.name, per100: portionFood.per100, grams }
          setIngredients((list) => (editIdx !== null ? list.map((x, i) => (i === editIdx ? ing : x)) : [...list, ing]))
          setPortionFood(null)
          setEditIdx(null)
          setPicking(false)
        }}
      />
    )
  }
  if (creating) return <CustomFoodSheet onClose={() => setCreating(false)} onSaved={(f) => setPortionFood(f)} />
  if (picking)
    return (
      <Sheet title="Lägg till ingrediens" onClose={() => setPicking(false)}>
        <FoodPicker onPickFood={setPortionFood} onCreateFood={() => setCreating(true)} />
      </Sheet>
    )

  return (
    <Sheet
      title={recipe ? 'Redigera recept' : 'Nytt recept'}
      onClose={onClose}
      footer={
        <div className="foot-row">
          {recipe && (
            <button
              className="btn danger"
              onClick={() => {
                if (confirm(`Ta bort receptet "${recipe.name}"?`)) {
                  deleteRecipe(recipe.id)
                  onClose()
                }
              }}
            >
              Ta bort
            </button>
          )}
          <button
            className="btn primary grow"
            disabled={!draft.name || ingredients.length === 0}
            onClick={() => {
              saveRecipe(draft)
              onClose()
            }}
          >
            Spara recept
          </button>
        </div>
      }
    >
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onPhoto(e.target.files?.[0])} />
      <button className="recipe-photo-btn" onClick={() => fileRef.current?.click()}>
        {photoId ? <Photo id={photoId} className="photo-preview small" /> : <span>📷 Lägg till bild</span>}
      </button>
      <label className="field">
        <span>Namn</span>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="t.ex. Kycklinggryta" />
      </label>
      <label className="field">
        <span>Antal portioner</span>
        <input inputMode="decimal" value={servings} onChange={(e) => setServings(e.target.value)} />
      </label>

      <p className="section-label">Per portion</p>
      <NutrientGrid n={recipePerPortion(draft)} />

      <p className="section-label">
        Ingredienser · totalt {r0(recipeTotals(draft).kcal)} kcal
      </p>
      <ul className="list">
        {ingredients.map((ing, i) => (
          <li className="row" key={i}>
            <button
              className="row-main"
              onClick={() => {
                setEditIdx(i)
                setPortionFood({ id: ing.foodId, name: ing.name, per100: ing.per100, source: 'custom' })
              }}
            >
              <span className="row-title">{ing.name}</span>
              <span className="row-sub">
                {ing.grams} g · {r0(scale(ing.per100, ing.grams / 100).kcal)} kcal
              </span>
            </button>
            <button className="icon-btn" aria-label="Ta bort ingrediens" onClick={() => setIngredients(ingredients.filter((_, j) => j !== i))}>
              ✕
            </button>
          </li>
        ))}
      </ul>
      <button className="btn ghost wide" onClick={() => setPicking(true)}>
        ＋ Lägg till ingrediens
      </button>
      <label className="field">
        <span>Instruktioner (valfritt)</span>
        <textarea rows={4} value={instructions} onChange={(e) => setInstructions(e.target.value)} />
      </label>
    </Sheet>
  )
}
