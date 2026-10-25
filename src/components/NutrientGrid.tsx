import type { Nutrients } from '../lib/types'
import { r0, fmt1 } from '../lib/util'

export function NutrientGrid({ n }: { n: Nutrients }) {
  return (
    <div className="nutrient-grid">
      <div>
        <b className="num">{r0(n.kcal)}</b>
        <span>kcal</span>
      </div>
      <div>
        <b className="num c-protein">{fmt1(n.protein)}</b>
        <span>Protein</span>
      </div>
      <div>
        <b className="num c-carbs">{fmt1(n.carbs)}</b>
        <span>Kolhydr.</span>
      </div>
      <div>
        <b className="num c-fat">{fmt1(n.fat)}</b>
        <span>Fett</span>
      </div>
      <div>
        <b className="num">{fmt1(n.fiber)}</b>
        <span>Fiber</span>
      </div>
    </div>
  )
}
