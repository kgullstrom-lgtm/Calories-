import { useMemo, useState } from 'react'
import { useStore } from '../lib/store'
import { MEALS, type LogEntry, type MealType } from '../lib/types'
import { macroGoals } from '../lib/nutrition'
import { addDays, formatDay, r0, sumNutrients, todayStr } from '../lib/util'
import { addWater, copyMealFromDay } from '../lib/actions'
import { Ring } from '../components/Ring'
import { MacroBar } from '../components/MacroBar'
import { Photo } from '../components/Photo'

interface Props {
  date: string
  setDate: (d: string) => void
  onAdd: (meal: MealType) => void
  onPhoto: (meal: MealType) => void
  onEdit: (e: LogEntry) => void
}

export function TodayPage({ date, setDate, onAdd, onPhoto, onEdit }: Props) {
  const profile = useStore((s) => s.profile)
  const log = useStore((s) => s.log)
  const water = useStore((s) => s.water[date] ?? 0)
  const goals = macroGoals(profile)
  const entries = useMemo(() => log.filter((e) => e.date === date), [log, date])
  const total = sumNutrients(entries.map((e) => e.nutrients))
  const left = goals.kcal - total.kcal
  const [openMenu, setOpenMenu] = useState<MealType | null>(null)

  return (
    <div className="page">
      <header className="day-nav">
        <button className="icon-btn" aria-label="Föregående dag" onClick={() => setDate(addDays(date, -1))}>
          ‹
        </button>
        <button className="day-title" onClick={() => setDate(todayStr())}>
          {formatDay(date)}
        </button>
        <button className="icon-btn" aria-label="Nästa dag" onClick={() => setDate(addDays(date, 1))}>
          ›
        </button>
      </header>

      <section className="card summary">
        <div className="summary-side">
          <b className="num">{r0(total.kcal)}</b>
          <span>ätit</span>
        </div>
        <Ring value={total.kcal} goal={goals.kcal}>
          <b className={`num big ${left < 0 ? 'c-danger' : ''}`}>{r0(Math.abs(left))}</b>
          <span>{left < 0 ? 'kcal över' : 'kcal kvar'}</span>
        </Ring>
        <div className="summary-side">
          <b className="num">{goals.kcal}</b>
          <span>mål</span>
        </div>
        <div className="macros">
          <MacroBar label="Protein" value={total.protein} goal={goals.protein} color="var(--protein)" />
          <MacroBar label="Kolhydrater" value={total.carbs} goal={goals.carbs} color="var(--carbs)" />
          <MacroBar label="Fett" value={total.fat} goal={goals.fat} color="var(--fat)" />
          <MacroBar label="Fiber" value={total.fiber} goal={goals.fiber} color="var(--fiber)" />
        </div>
      </section>

      {MEALS.map((m) => {
        const items = entries.filter((e) => e.meal === m.id)
        const kcal = sumNutrients(items.map((e) => e.nutrients)).kcal
        return (
          <section className="card meal" key={m.id}>
            <header className="meal-head">
              <h3>
                <span aria-hidden="true">{m.icon}</span> {m.label}
              </h3>
              <span className="muted num">{r0(kcal)} kcal</span>
              <button className="icon-btn" aria-label={`Fler val för ${m.label}`} onClick={() => setOpenMenu(openMenu === m.id ? null : m.id)}>
                ⋯
              </button>
              <button className="icon-btn" aria-label={`Fota ${m.label}`} onClick={() => onPhoto(m.id)}>
                📷
              </button>
              <button className="add-btn" aria-label={`Lägg till i ${m.label}`} onClick={() => onAdd(m.id)}>
                ＋
              </button>
            </header>
            {openMenu === m.id && (
              <div className="meal-menu">
                <button
                  className="btn ghost small"
                  onClick={() => {
                    const n = copyMealFromDay(addDays(date, -1), date, m.id)
                    setOpenMenu(null)
                    if (!n) alert(`Inget registrerat för ${m.label.toLowerCase()} dagen innan.`)
                  }}
                >
                  Kopiera från dagen innan
                </button>
              </div>
            )}
            {items.length > 0 && (
              <ul className="list">
                {items.map((e) => (
                  <li key={e.id} className="row">
                    <button className="row-main with-thumb" onClick={() => onEdit(e)}>
                      {e.photoId ? <Photo id={e.photoId} className="thumb" /> : <span className="thumb ph">{kindIcon(e.kind)}</span>}
                      <span className="row-text">
                        <span className="row-title">{e.name}</span>
                        <span className="row-sub">
                          {amountLabel(e)} · P {r0(e.nutrients.protein)} · K {r0(e.nutrients.carbs)} · F {r0(e.nutrients.fat)}
                        </span>
                      </span>
                      <span className="row-kcal num">{r0(e.nutrients.kcal)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}

      <section className="card water">
        <header className="meal-head">
          <h3>💧 Vatten</h3>
          <span className="muted num">
            {(water / 1000).toFixed(2).replace('.', ',')} / {(profile.waterGoalMl / 1000).toFixed(1).replace('.', ',')} l
          </span>
        </header>
        <div className="glasses">
          {Array.from({ length: Math.ceil(profile.waterGoalMl / 250) }).map((_, i) => (
            <button
              key={i}
              className={`glass ${i < Math.floor(water / 250) ? 'full' : ''}`}
              aria-label={`Glas ${i + 1}`}
              onClick={() => addWater(date, i < Math.floor(water / 250) ? -250 : 250)}
            />
          ))}
        </div>
        <div className="foot-row">
          <button className="btn ghost small" onClick={() => addWater(date, -250)} disabled={water <= 0}>
            − 25 cl
          </button>
          <button className="btn ghost small" onClick={() => addWater(date, 250)}>
            + 25 cl
          </button>
          <button className="btn ghost small" onClick={() => addWater(date, 500)}>
            + 50 cl
          </button>
        </div>
      </section>
    </div>
  )
}

function kindIcon(k: LogEntry['kind']) {
  return k === 'recipe' ? '📖' : k === 'quick' ? '⚡' : k === 'photo' ? '📷' : '🍴'
}

function amountLabel(e: LogEntry) {
  if (e.unit === 'g') return `${r0(e.amount)} g`
  if (e.unit === 'portion') return `${e.amount} port.`
  return `${e.amount} st`
}
