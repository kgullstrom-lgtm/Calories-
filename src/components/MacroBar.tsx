import { r0 } from '../lib/util'

interface Props {
  label: string
  value: number
  goal: number
  color: string
  unit?: string
}

export function MacroBar({ label, value, goal, color, unit = 'g' }: Props) {
  const pct = goal > 0 ? Math.min((value / goal) * 100, 100) : 0
  return (
    <div className="macro">
      <div className="macro-top">
        <span>{label}</span>
        <span className="muted">
          <b className="num">{r0(value)}</b> / {r0(goal)} {unit}
        </span>
      </div>
      <div className="bar">
        <div className="bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}
