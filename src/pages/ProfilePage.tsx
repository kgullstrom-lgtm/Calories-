import { useRef, useState } from 'react'
import { DEFAULT_MODEL, getState, replaceState, useStore } from '../lib/store'
import { bmr, macroGoals, tdee } from '../lib/nutrition'
import { deleteCustomFood, updateProfile, updateSettings } from '../lib/actions'
import { ProfileForm } from '../components/ProfileForm'
import { CustomFoodSheet } from '../components/CustomFoodSheet'
import type { AppState, Food } from '../lib/types'
import { r0, todayStr } from '../lib/util'

const MODELS = [
  { id: DEFAULT_MODEL, label: 'Claude Opus 5.5 – bäst precision' },
  { id: 'claude-sonnet-5-5', label: 'Claude Sonnet 5.5 – snabbare' },
  { id: 'claude-haiku-5-5', label: 'Claude Haiku 5.5 – snabbast & billigast' },
]

export function ProfilePage() {
  const profile = useStore((s) => s.profile)
  const settings = useStore((s) => s.settings)
  const customFoods = useStore((s) => s.customFoods)
  const goals = macroGoals(profile)
  const [showKey, setShowKey] = useState(false)
  const [editFood, setEditFood] = useState<Food | 'new' | null>(null)
  const importRef = useRef<HTMLInputElement>(null)
  const pctSum = profile.macroPct.protein + profile.macroPct.carbs + profile.macroPct.fat

  const exportData = () => {
    const blob = new Blob([JSON.stringify(getState(), null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `kalorikoll-${todayStr()}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const importData = async (file?: File) => {
    if (!file) return
    try {
      const data = JSON.parse(await file.text()) as AppState
      if (data.version !== 1 || !Array.isArray(data.log)) throw new Error()
      if (confirm('Ersätta all nuvarande data med den importerade filen?')) replaceState(data)
    } catch {
      alert('Filen kunde inte läsas som en Kalorikoll-export.')
    }
  }

  return (
    <div className="page">
      <header className="page-head">
        <h1>Profil{profile.name ? ` · ${profile.name}` : ''}</h1>
      </header>

      <section className="card goal-card">
        <div>
          <span className="muted small">Dagligt mål</span>
          <b className="num big">{goals.kcal} kcal</b>
        </div>
        <div className="muted small">
          BMR {r0(bmr(profile))} · Förbrukning {r0(tdee(profile))} kcal
          <br />P {goals.protein} g · K {goals.carbs} g · F {goals.fat} g · Fiber {goals.fiber} g
        </div>
      </section>

      <section className="card">
        <h3>Om dig</h3>
        <ProfileForm />
      </section>

      <section className="card">
        <h3>Mål & näring</h3>
        <label className="field">
          <span>Egen kalorigräns (lämna tomt för automatisk)</span>
          <input
            inputMode="numeric"
            value={profile.kcalOverride ?? ''}
            placeholder={String(macroGoals({ ...profile, kcalOverride: undefined }).kcal)}
            onChange={(e) => updateProfile({ kcalOverride: parseInt(e.target.value) || undefined })}
          />
        </label>
        <p className="section-label">Makrofördelning (% av energi)</p>
        <div className="grid-3">
          {(['protein', 'carbs', 'fat'] as const).map((k) => (
            <label className="field" key={k}>
              <span>{k === 'protein' ? 'Protein' : k === 'carbs' ? 'Kolhydrater' : 'Fett'}</span>
              <input
                inputMode="numeric"
                value={profile.macroPct[k]}
                onChange={(e) => updateProfile({ macroPct: { ...profile.macroPct, [k]: parseInt(e.target.value) || 0 } })}
              />
            </label>
          ))}
        </div>
        {pctSum !== 100 && <p className="error">Summan är {pctSum} % – bör vara 100 %.</p>}
        <label className="field">
          <span>Vattenmål (ml)</span>
          <input inputMode="numeric" value={profile.waterGoalMl} onChange={(e) => updateProfile({ waterGoalMl: parseInt(e.target.value) || 0 })} />
        </label>
      </section>

      <section className="card">
        <h3>AI-bildanalys</h3>
        <p className="muted small">
          Fotoanalysen använder Claude från Anthropic. Skapa en API-nyckel på console.anthropic.com. Nyckeln sparas endast
          lokalt i den här webbläsaren och skickas direkt till Anthropic.
        </p>
        <label className="field">
          <span>Anthropic API-nyckel</span>
          <div className="input-row">
            <input
              type={showKey ? 'text' : 'password'}
              value={settings.apiKey}
              onChange={(e) => updateSettings({ apiKey: e.target.value.trim() })}
              placeholder="sk-ant-…"
              autoComplete="off"
            />
            <button className="btn ghost small" onClick={() => setShowKey(!showKey)}>
              {showKey ? 'Dölj' : 'Visa'}
            </button>
          </div>
        </label>
        <label className="field">
          <span>Modell</span>
          <select value={settings.model} onChange={(e) => updateSettings({ model: e.target.value })}>
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="card">
        <header className="meal-head">
          <h3>Mina livsmedel</h3>
          <button className="btn ghost small" onClick={() => setEditFood('new')}>
            ＋ Nytt
          </button>
        </header>
        {customFoods.length === 0 && <p className="muted small">Egna och sparade livsmedel från Open Food Facts visas här.</p>}
        <ul className="list">
          {customFoods.map((f) => (
            <li className="row" key={f.id}>
              <button className="row-main" onClick={() => setEditFood(f)}>
                <span className="row-title">{f.name}</span>
                <span className="row-sub">
                  {f.brand ? `${f.brand} · ` : ''}
                  {r0(f.per100.kcal)} kcal / 100 g · {f.source === 'off' ? 'Open Food Facts' : 'Eget'}
                </span>
              </button>
              <button className="icon-btn" aria-label="Ta bort" onClick={() => confirm(`Ta bort ${f.name}?`) && deleteCustomFood(f.id)}>
                ✕
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h3>Data</h3>
        <p className="muted small">All data sparas lokalt på enheten. Exportera regelbundet för säkerhetskopia.</p>
        <div className="foot-row wrap">
          <button className="btn ghost" onClick={exportData}>
            ⬇ Exportera
          </button>
          <button className="btn ghost" onClick={() => importRef.current?.click()}>
            ⬆ Importera
          </button>
          <input ref={importRef} type="file" accept="application/json" hidden onChange={(e) => importData(e.target.files?.[0])} />
          <button
            className="btn danger"
            onClick={() => {
              if (confirm('Radera ALL data? Detta går inte att ångra.')) {
                localStorage.clear()
                indexedDB.deleteDatabase('kalorikoll-photos')
                location.reload()
              }
            }}
          >
            Radera allt
          </button>
        </div>
      </section>
      <p className="muted small center">Kalorikoll · näringsvärden är ungefärliga och ersätter inte medicinsk rådgivning.</p>

      {editFood && <CustomFoodSheet food={editFood === 'new' ? undefined : editFood} onClose={() => setEditFood(null)} />}
    </div>
  )
}
