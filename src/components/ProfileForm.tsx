import { useStore } from '../lib/store'
import { updateProfile } from '../lib/actions'
import { ACTIVITY_LEVELS } from '../lib/nutrition'
import type { Goal, Sex } from '../lib/types'

const num = (s: string) => parseFloat(s.replace(',', '.')) || 0

export function ProfileForm() {
  const p = useStore((s) => s.profile)
  return (
    <div className="form">
      <label className="field">
        <span>Namn</span>
        <input value={p.name} onChange={(e) => updateProfile({ name: e.target.value })} placeholder="Valfritt" />
      </label>
      <div className="seg" role="radiogroup" aria-label="Kön">
        {(['female', 'male'] as Sex[]).map((s) => (
          <button key={s} role="radio" aria-checked={p.sex === s} className={p.sex === s ? 'on' : ''} onClick={() => updateProfile({ sex: s })}>
            {s === 'female' ? 'Kvinna' : 'Man'}
          </button>
        ))}
      </div>
      <div className="grid-3">
        <label className="field">
          <span>Ålder</span>
          <input inputMode="numeric" value={p.age || ''} onChange={(e) => updateProfile({ age: num(e.target.value) })} />
        </label>
        <label className="field">
          <span>Längd (cm)</span>
          <input inputMode="numeric" value={p.heightCm || ''} onChange={(e) => updateProfile({ heightCm: num(e.target.value) })} />
        </label>
        <label className="field">
          <span>Vikt (kg)</span>
          <input inputMode="decimal" value={p.weightKg || ''} onChange={(e) => updateProfile({ weightKg: num(e.target.value) })} />
        </label>
      </div>
      <label className="field">
        <span>Aktivitetsnivå</span>
        <select value={p.activity} onChange={(e) => updateProfile({ activity: Number(e.target.value) })}>
          {ACTIVITY_LEVELS.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label} – {a.hint}
            </option>
          ))}
        </select>
      </label>
      <div className="seg" role="radiogroup" aria-label="Mål">
        {(
          [
            ['lose', 'Gå ner'],
            ['maintain', 'Behålla'],
            ['gain', 'Gå upp'],
          ] as [Goal, string][]
        ).map(([g, l]) => (
          <button key={g} role="radio" aria-checked={p.goal === g} className={p.goal === g ? 'on' : ''} onClick={() => updateProfile({ goal: g })}>
            {l}
          </button>
        ))}
      </div>
      {p.goal !== 'maintain' && (
        <div className="grid-2">
          <label className="field">
            <span>Målvikt (kg)</span>
            <input inputMode="decimal" value={p.targetWeightKg || ''} onChange={(e) => updateProfile({ targetWeightKg: num(e.target.value) })} />
          </label>
          <label className="field">
            <span>Takt</span>
            <select value={p.rate} onChange={(e) => updateProfile({ rate: Number(e.target.value) })}>
              <option value={0.25}>0,25 kg/vecka</option>
              <option value={0.5}>0,5 kg/vecka</option>
              <option value={0.75}>0,75 kg/vecka</option>
              <option value={1}>1 kg/vecka</option>
            </select>
          </label>
        </div>
      )}
    </div>
  )
}
