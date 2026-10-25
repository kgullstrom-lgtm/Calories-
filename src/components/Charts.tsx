import { useState } from 'react'

export interface BarDatum {
  label: string
  value: number
  title: string
}

/** Stapeldiagram med mållinje */
export function BarChart({ data, goal, unit }: { data: BarDatum[]; goal?: number; unit: string }) {
  const [active, setActive] = useState<number | null>(null)
  const W = 320
  const H = 160
  const pad = { l: 34, r: 6, t: 10, b: 20 }
  const max = Math.max(goal ?? 0, ...data.map((d) => d.value), 1) * 1.1
  const iw = W - pad.l - pad.r
  const ih = H - pad.t - pad.b
  const bw = iw / data.length
  const y = (v: number) => pad.t + ih - (v / max) * ih
  const ticks = niceTicks(max)
  const labelEvery = Math.ceil(data.length / 8)
  const cur = active !== null ? data[active] : null

  return (
    <div className="chart">
      <div className="chart-readout">
        {cur ? (
          <>
            <b className="num">{Math.round(cur.value)}</b> {unit} · {cur.title}
          </>
        ) : (
          <span className="muted">Tryck på en stapel</span>
        )}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" onMouseLeave={() => setActive(null)}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} className="grid" />
            <text x={pad.l - 4} y={y(t) + 3} className="tick" textAnchor="end">
              {t}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const h = Math.max(0, ih - (y(d.value) - pad.t))
          const over = goal !== undefined && d.value > goal * 1.05
          return (
            <g key={i} onMouseEnter={() => setActive(i)} onClick={() => setActive(i)}>
              <rect x={pad.l + i * bw} y={pad.t} width={bw} height={ih} fill="transparent" />
              <rect
                x={pad.l + i * bw + bw * 0.18}
                y={y(d.value)}
                width={Math.max(1, bw * 0.64)}
                height={h}
                rx={Math.min(4, bw * 0.2)}
                className={over ? 'bar-over' : 'bar-ok'}
                opacity={active === null || active === i ? 1 : 0.5}
              />
              {i % labelEvery === 0 && (
                <text x={pad.l + i * bw + bw / 2} y={H - 6} className="tick" textAnchor="middle">
                  {d.label}
                </text>
              )}
            </g>
          )
        })}
        {goal !== undefined && goal > 0 && (
          <g>
            <line x1={pad.l} x2={W - pad.r} y1={y(goal)} y2={y(goal)} className="goal-line" />
            <text x={W - pad.r} y={y(goal) - 3} className="tick goal-text" textAnchor="end">
              mål {goal}
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}

export interface LinePoint {
  x: number // tidsstämpel
  y: number
  title: string
}

/** Linjediagram för vikt */
export function LineChart({ points, target, unit }: { points: LinePoint[]; target?: number; unit: string }) {
  const [active, setActive] = useState<number | null>(null)
  const W = 320
  const H = 170
  const pad = { l: 34, r: 8, t: 12, b: 20 }
  if (points.length === 0) return <p className="muted center">Ingen data ännu.</p>
  const ys = points.map((p) => p.y).concat(target ? [target] : [])
  let lo = Math.min(...ys)
  let hi = Math.max(...ys)
  if (hi - lo < 2) {
    lo -= 1
    hi += 1
  }
  const span = hi - lo
  lo -= span * 0.1
  hi += span * 0.1
  const x0 = points[0].x
  const x1 = points.at(-1)!.x
  const iw = W - pad.l - pad.r
  const ih = H - pad.t - pad.b
  const x = (v: number) => pad.l + (x1 === x0 ? iw / 2 : ((v - x0) / (x1 - x0)) * iw)
  const y = (v: number) => pad.t + ih - ((v - lo) / (hi - lo)) * ih
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${x(p.x)},${y(p.y)}`).join(' ')
  const area = `${path} L${x(x1)},${pad.t + ih} L${x(x0)},${pad.t + ih} Z`
  const ticks = [lo + (hi - lo) * 0.15, (lo + hi) / 2, hi - (hi - lo) * 0.15]
  const cur = active !== null ? points[active] : points.at(-1)!
  const fmt = (t: number) => new Date(t).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })

  return (
    <div className="chart">
      <div className="chart-readout">
        <b className="num">{cur.y.toFixed(1)}</b> {unit} · {cur.title}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" onMouseLeave={() => setActive(null)}>
        <defs>
          <linearGradient id="wfill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--accent)" stopOpacity="0.25" />
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} className="grid" />
            <text x={pad.l - 4} y={y(t) + 3} className="tick" textAnchor="end">
              {t.toFixed(0)}
            </text>
          </g>
        ))}
        {target !== undefined && target > 0 && (
          <g>
            <line x1={pad.l} x2={W - pad.r} y1={y(target)} y2={y(target)} className="goal-line" />
            <text x={W - pad.r} y={y(target) - 3} className="tick goal-text" textAnchor="end">
              mål {target}
            </text>
          </g>
        )}
        <path d={area} fill="url(#wfill)" />
        <path d={path} className="line" />
        {points.map((p, i) => (
          <g key={i} onMouseEnter={() => setActive(i)} onClick={() => setActive(i)}>
            <circle cx={x(p.x)} cy={y(p.y)} r={12} fill="transparent" />
            <circle cx={x(p.x)} cy={y(p.y)} r={active === i ? 5 : 3} className="dot" />
          </g>
        ))}
        <text x={pad.l} y={H - 6} className="tick">
          {fmt(x0)}
        </text>
        <text x={W - pad.r} y={H - 6} className="tick" textAnchor="end">
          {fmt(x1)}
        </text>
      </svg>
    </div>
  )
}

function niceTicks(max: number): number[] {
  const step = Math.pow(10, Math.floor(Math.log10(max / 3)))
  const s = [1, 2, 5, 10].map((m) => m * step).find((v) => max / v <= 4) ?? step * 10
  const out: number[] = []
  for (let v = s; v < max; v += s) out.push(Math.round(v))
  return out
}
