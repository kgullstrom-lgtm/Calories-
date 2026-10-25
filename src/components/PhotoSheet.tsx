import { useRef, useState } from 'react'
import { Sheet } from './Sheet'
import { NutrientGrid } from './NutrientGrid'
import { useStore } from '../lib/store'
import type { Analysis, AnalyzedItem } from '../lib/ai'
import { resizeImage, savePhoto } from '../lib/photos'
import { addEntry, saveRecipe } from '../lib/actions'
import { MEALS, type MealType } from '../lib/types'
import { r0, scale, sumNutrients, uid } from '../lib/util'
import type { Nutrients } from '../lib/types'

const itemNutrients = (i: AnalyzedItem): Nutrients => ({
  kcal: i.kcal,
  protein: i.protein,
  carbs: i.carbs,
  fat: i.fat,
  fiber: i.fiber,
})

interface Props {
  date: string
  meal: MealType
  onClose: () => void
  onOpenSettings: () => void
}

export function PhotoSheet({ date, meal: initialMeal, onClose, onOpenSettings }: Props) {
  const settings = useStore((s) => s.settings)
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const [image, setImage] = useState<string>()
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<Analysis | null>(null)
  const [items, setItems] = useState<AnalyzedItem[]>([])
  const [mealName, setMealName] = useState('')
  const [meal, setMeal] = useState<MealType>(initialMeal)

  const onFile = async (file?: File) => {
    if (!file) return
    setError('')
    try {
      setImage(await resizeImage(file, 1280, 0.85))
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  const analyze = async () => {
    setLoading(true)
    setError('')
    // SDK:t laddas först när det behövs för att hålla appen snabb
    const { analyzeMeal, friendlyError } = await import('../lib/ai')
    try {
      const a = await analyzeMeal({ apiKey: settings.apiKey, model: settings.model, imageDataUrl: image, description })
      if (a.items.length === 0) {
        setError(a.notes || 'Ingen mat kunde identifieras.')
      } else {
        setResult(a)
        setItems(a.items)
        setMealName(a.mealName)
      }
    } catch (e) {
      setError(friendlyError(e))
    } finally {
      setLoading(false)
    }
  }

  const setGrams = (i: number, grams: number) =>
    setItems((list) =>
      list.map((it, j) => {
        if (j !== i) return it
        const f = it.grams > 0 ? grams / it.grams : 0
        return {
          ...it,
          grams,
          kcal: it.kcal * f,
          protein: it.protein * f,
          carbs: it.carbs * f,
          fat: it.fat * f,
          fiber: it.fiber * f,
        }
      }),
    )

  const total = sumNutrients(items.map(itemNutrients))

  const storeThumb = async () => {
    if (!image) return undefined
    const id = `photo-${uid()}`
    const blob = await (await fetch(image)).blob()
    await savePhoto(id, await resizeImage(blob, 480, 0.7))
    return id
  }

  const saveToLog = async () => {
    const photoId = await storeThumb().catch(() => undefined)
    for (const it of items) {
      const n = itemNutrients(it)
      addEntry({
        date,
        meal,
        name: it.name,
        amount: r0(it.grams),
        unit: 'g',
        nutrients: n,
        perUnit: it.grams > 0 ? scale(n, 1 / it.grams) : undefined,
        kind: 'photo',
        photoId,
      })
    }
    onClose()
  }

  const saveAsRecipe = async () => {
    const photoId = await storeThumb().catch(() => undefined)
    saveRecipe({
      id: uid(),
      name: mealName || 'Fotad måltid',
      servings: 1,
      ingredients: items.map((it) => ({
        foodId: `ai-${uid()}`,
        name: it.name,
        grams: r0(it.grams),
        per100: it.grams > 0 ? scale(itemNutrients(it), 100 / it.grams) : itemNutrients(it),
      })),
      photoId,
      createdAt: Date.now(),
    })
    alert('Sparat som recept!')
  }

  if (!settings.apiKey) {
    return (
      <Sheet title="Fotografera måltid" onClose={onClose}>
        <div className="notice">
          <p>
            <b>Bildanalys kräver en API-nyckel.</b>
          </p>
          <p className="muted">
            Kalorikoll använder Claude för att känna igen maten på bilden och uppskatta portioner och näring. Lägg till
            din Anthropic API-nyckel under Profil. Nyckeln sparas bara på den här enheten.
          </p>
          <button className="btn primary" onClick={onOpenSettings}>
            Gå till inställningar
          </button>
        </div>
      </Sheet>
    )
  }

  if (result) {
    return (
      <Sheet
        title="Resultat"
        onClose={onClose}
        footer={
          <div className="foot-row">
            <button className="btn ghost" onClick={saveAsRecipe} disabled={!items.length}>
              Spara som recept
            </button>
            <button className="btn primary grow" onClick={saveToLog} disabled={!items.length}>
              Lägg till · {r0(total.kcal)} kcal
            </button>
          </div>
        }
      >
        {image && <img src={image} alt="" className="photo-preview small" />}
        <label className="field">
          <span>Måltid</span>
          <input value={mealName} onChange={(e) => setMealName(e.target.value)} />
        </label>
        <NutrientGrid n={total} />
        <p className="section-label">Identifierade livsmedel – justera vikten vid behov</p>
        <ul className="list">
          {items.map((it, i) => (
            <li key={i} className="row ai-row">
              <div className="row-main static">
                <span className="row-title">
                  {it.name} {it.confidence === 'låg' && <span className="badge warn">osäker</span>}
                </span>
                <span className="row-sub">
                  {r0(it.kcal)} kcal · P {r0(it.protein)} · K {r0(it.carbs)} · F {r0(it.fat)}
                </span>
              </div>
              <div className="gram-input">
                <input
                  inputMode="numeric"
                  aria-label={`Gram ${it.name}`}
                  value={r0(it.grams)}
                  onChange={(e) => setGrams(i, parseFloat(e.target.value) || 0)}
                />
                <span>g</span>
              </div>
              <button className="icon-btn" aria-label="Ta bort" onClick={() => setItems(items.filter((_, j) => j !== i))}>
                ✕
              </button>
            </li>
          ))}
        </ul>
        {result.notes && <p className="muted small">💡 {result.notes}</p>}
        <div className="chips">
          {MEALS.map((m) => (
            <button key={m.id} className={`chip ${meal === m.id ? 'on' : ''}`} onClick={() => setMeal(m.id)}>
              {m.icon} {m.label}
            </button>
          ))}
        </div>
        <p className="muted small">Värdena är AI-uppskattningar och kan avvika från verkligheten.</p>
      </Sheet>
    )
  }

  return (
    <Sheet
      title="Fotografera måltid"
      onClose={onClose}
      footer={
        <button className="btn primary wide" disabled={loading || (!image && !description.trim())} onClick={analyze}>
          {loading ? 'Analyserar…' : '✨ Analysera'}
        </button>
      }
    >
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => onFile(e.target.files?.[0])} />
      <input ref={galleryRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
      {image ? (
        <div className="photo-wrap">
          <img src={image} alt="Vald bild" className="photo-preview" />
          {loading && <div className="scan-overlay" aria-hidden="true" />}
        </div>
      ) : (
        <button className="photo-drop" onClick={() => cameraRef.current?.click()}>
          <span className="big">📷</span>
          <span>Ta ett foto av din måltid</span>
        </button>
      )}
      <div className="foot-row">
        <button className="btn ghost grow" onClick={() => cameraRef.current?.click()}>
          📷 Kamera
        </button>
        <button className="btn ghost grow" onClick={() => galleryRef.current?.click()}>
          🖼️ Bilder
        </button>
      </div>
      <label className="field">
        <span>Beskrivning (valfritt – hjälper analysen, eller använd utan bild)</span>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="t.ex. pasta carbonara, ca en stor portion, med parmesan"
        />
      </label>
      {error && <p className="error">{error}</p>}
    </Sheet>
  )
}
