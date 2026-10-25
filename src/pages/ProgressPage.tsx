import { useMemo, useState } from 'react'
import { useStore } from '../lib/store'
import { macroGoals, bmi, bmiLabel } from '../lib/nutrition'
import { addDays, parseDate, r0, r1, sumNutrients, todayStr } from '../lib/util'
import { addWeight, deleteWeight } from '../lib/actions'
import { BarChart, LineChart } from '../components/Charts'
import { Sheet } from '../components/Sheet'

const PERIODS = [
  { days: 7, label: 'Vecka' },
  { days: 30, label: 'Månad' },
  { days: 90, label: '3 mån' },
]

export function ProgressPage() {
  const log = useStore((s) => s.log)
  const profile = useStore((s) => s.profile)
  const weights = useStore((s) => s.weights)
  const [days, setDays] = useState(7)
  const [weighing, setWeighing] = useState(false)
  const goals = macroGoals(profile)
  const today = todayStr()

  const daily = useMemo(() => {
    const byDate = new Map<string, ReturnType<typeof sumNutrients>>()
    const groups = new Map<string, typeof log>()
    for (const e of log) {
      if (!groups.has(e.date)) groups.set(e.date, [])
      groups.get(e.date)!.push(e)
    }
    groups.forEach((list, d) => byDate.set(d, sumNutrients(list.map((e) => e.nutrients))))
    return byDate
  }, [log])

  const range = Array.from({ length: days }, (_, i) => addDays(today, i - days + 1))
  const bars = range.map((d) => {
    const dt = parseDate(d)
    return {
      label: days <= 7 ? dt.toLocaleDateString('sv-SE', { weekday: 'short' }) : `${dt.getDate()}/${dt.getMonth() + 1}`,
      value: daily.get(d)?.kcal ?? 0,
      title: dt.toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'short' }),
    }
  })
  const logged = range.filter((d) => (daily.get(d)?.kcal ?? 0) > 0)
  const avg = sumNutrients(logged.map((d) => daily.get(d)!))
  const n = Math.max(1, logged.length)
  const avgKcal = avg.kcal / n
  const macroKcal = avg.protein * 4 + avg.carbs * 4 + avg.fat * 9 || 1
  const onTarget = logged.filter((d) => Math.abs(daily.get(d)!.kcal - goals.kcal) <= goals.kcal * 0.1).length

  // Antal dagar i rad med registreringar
  let streak = 0
  for (let d = (daily.get(today)?.kcal ?? 0) > 0 ? today : addDays(today, -1); (daily.get(d)?.kcal ?? 0) > 0; d = addDays(d, -1)) streak++

  const wStart = addDays(today, -Math.max(days, 30) + 1)
  const wPoints = weights
    .filter((w) => w.date >= wStart)
    .map((w) => ({
      x: parseDate(w.date).getTime(),
      y: w.kg,
      title: parseDate(w.date).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' }),
    }))
  const first = weights[0]
  const last = weights.at(-1)
  const change = first && last ? last.kg - first.kg : 0
  const toGoal = last ? last.kg - profile.targetWeightKg : 0
  const curBmi = bmi(last?.kg ?? profile.weightKg, profile.heightCm)

  return (
    <div className="page">
      <header className="page-head">
        <h1>Utveckling</h1>
      </header>
      <div className="chips">
        {PERIODS.map((p) => (
          <button key={p.days} className={`chip ${days === p.days ? 'on' : ''}`} onClick={() => setDays(p.days)}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="stat-row">
        <div className="card stat">
          <span className="muted small">Snitt/dag</span>
          <b className="num">{r0(avgKcal)}</b>
          <span className="muted small">kcal</span>
        </div>
        <div className="card stat">
          <span className="muted small">Inom mål ±10 %</span>
          <b className="num">
            {onTarget}/{logged.length}
          </b>
          <span className="muted small">dagar</span>
        </div>
        <div className="card stat">
          <span className="muted small">Svit</span>
          <b className="num">{streak} 🔥</b>
          <span className="muted small">dagar i rad</span>
        </div>
      </div>

      <section className="card">
        <h3>Kaloriintag</h3>
        <BarChart data={bars} goal={goals.kcal} unit="kcal" />
      </section>

      <section className="card">
        <h3>Näringsfördelning (snitt)</h3>
        <div className="stack-bar" role="img" aria-label="Fördelning av energi från protein, kolhydrater och fett">
          <div style={{ width: `${((avg.protein * 4) / macroKcal) * 100}%`, background: 'var(--protein)' }} />
          <div style={{ width: `${((avg.carbs * 4) / macroKcal) * 100}%`, background: 'var(--carbs)' }} />
          <div style={{ width: `${((avg.fat * 9) / macroKcal) * 100}%`, background: 'var(--fat)' }} />
        </div>
        <table className="macro-table">
          <thead>
            <tr>
              <th></th>
              <th>Snitt</th>
              <th>Mål</th>
              <th>Energi</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <i className="dot-key" style={{ background: 'var(--protein)' }} /> Protein
              </td>
              <td className="num">{r0(avg.protein / n)} g</td>
              <td className="num">{goals.protein} g</td>
              <td className="num">{r0(((avg.protein * 4) / macroKcal) * 100)} %</td>
            </tr>
            <tr>
              <td>
                <i className="dot-key" style={{ background: 'var(--carbs)' }} /> Kolhydrater
              </td>
              <td className="num">{r0(avg.carbs / n)} g</td>
              <td className="num">{goals.carbs} g</td>
              <td className="num">{r0(((avg.carbs * 4) / macroKcal) * 100)} %</td>
            </tr>
            <tr>
              <td>
                <i className="dot-key" style={{ background: 'var(--fat)' }} /> Fett
              </td>
              <td className="num">{r0(avg.fat / n)} g</td>
              <td className="num">{goals.fat} g</td>
              <td className="num">{r0(((avg.fat * 9) / macroKcal) * 100)} %</td>
            </tr>
            <tr>
              <td>
                <i className="dot-key" style={{ background: 'var(--fiber)' }} /> Fiber
              </td>
              <td className="num">{r0(avg.fiber / n)} g</td>
              <td className="num">{goals.fiber} g</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="card">
        <header className="meal-head">
          <h3>Vikt</h3>
          <button className="btn primary small" onClick={() => setWeighing(true)}>
            ＋ Väg in
          </button>
        </header>
        <div className="stat-row inner">
          <div>
            <span className="muted small">Nu</span>
            <b className="num">{last ? r1(last.kg) : '–'} kg</b>
          </div>
          <div>
            <span className="muted small">Förändring</span>
            <b className={`num ${change < 0 ? 'c-good' : ''}`}>
              {change > 0 ? '+' : ''}
              {r1(change)} kg
            </b>
          </div>
          <div>
            <span className="muted small">Kvar till mål</span>
            <b className="num">{r1(Math.abs(toGoal))} kg</b>
          </div>
          <div>
            <span className="muted small">BMI</span>
            <b className="num">{r1(curBmi)}</b>
            <span className="muted small">{bmiLabel(curBmi)}</span>
          </div>
        </div>
        <LineChart points={wPoints} target={profile.targetWeightKg} unit="kg" />
      </section>

      {weighing && <WeightSheet onClose={() => setWeighing(false)} />}
      {weights.length > 0 && (
        <details className="card">
          <summary>Alla vägningar ({weights.length})</summary>
          <ul className="list">
            {[...weights].reverse().map((w) => (
              <li key={w.date} className="row">
                <span className="row-main static">
                  <span className="row-title num">{r1(w.kg)} kg</span>
                  <span className="row-sub">{parseDate(w.date).toLocaleDateString('sv-SE', { dateStyle: 'medium' })}</span>
                </span>
                <button className="icon-btn" aria-label="Ta bort vägning" onClick={() => deleteWeight(w.date)}>
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}

function WeightSheet({ onClose }: { onClose: () => void }) {
  const current = useStore((s) => s.weights.at(-1)?.kg ?? s.profile.weightKg)
  const [kg, setKg] = useState(String(current))
  const [date, setDate] = useState(todayStr())
  const v = parseFloat(kg.replace(',', '.'))
  return (
    <Sheet
      title="Registrera vikt"
      onClose={onClose}
      footer={
        <button
          className="btn primary wide"
          disabled={!(v > 20 && v < 400)}
          onClick={() => {
            addWeight(v, date)
            onClose()
          }}
        >
          Spara
        </button>
      }
    >
      <label className="field">
        <span>Vikt (kg)</span>
        <input inputMode="decimal" value={kg} onChange={(e) => setKg(e.target.value)} autoFocus />
      </label>
      <label className="field">
        <span>Datum</span>
        <input type="date" value={date} max={todayStr()} onChange={(e) => setDate(e.target.value)} />
      </label>
    </Sheet>
  )
}
