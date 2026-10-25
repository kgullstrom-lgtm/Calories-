import { useState } from 'react'
import { useStore } from '../lib/store'
import type { Recipe } from '../lib/types'
import { recipePerPortion, toggleFavoriteRecipe } from '../lib/actions'
import { r0, suggestMeal } from '../lib/util'
import { Photo } from '../components/Photo'
import { RecipeEditor } from '../components/RecipeEditor'
import { RecipeLogSheet } from '../components/RecipeLogSheet'

export function RecipesPage({ date }: { date: string }) {
  const recipes = useStore((s) => s.recipes)
  const favs = useStore((s) => s.favoriteRecipeIds)
  const [editing, setEditing] = useState<Recipe | 'new' | null>(null)
  const [logging, setLogging] = useState<Recipe | null>(null)
  const [onlyFav, setOnlyFav] = useState(false)

  const list = recipes
    .filter((r) => !onlyFav || favs.includes(r.id))
    .sort((a, b) => Number(favs.includes(b.id)) - Number(favs.includes(a.id)) || b.createdAt - a.createdAt)

  return (
    <div className="page">
      <header className="page-head">
        <h1>Recept</h1>
        <button className="btn primary small" onClick={() => setEditing('new')}>
          ＋ Nytt recept
        </button>
      </header>
      <div className="chips">
        <button className={`chip ${!onlyFav ? 'on' : ''}`} onClick={() => setOnlyFav(false)}>
          Alla ({recipes.length})
        </button>
        <button className={`chip ${onlyFav ? 'on' : ''}`} onClick={() => setOnlyFav(true)}>
          ★ Favoriter ({favs.filter((id) => recipes.some((r) => r.id === id)).length})
        </button>
      </div>
      {list.length === 0 && (
        <div className="card empty-state">
          <p className="big">📖</p>
          <p>
            <b>{onlyFav ? 'Inga favoritrecept ännu' : 'Inga recept ännu'}</b>
          </p>
          <p className="muted">Spara dina vanligaste rätter som recept så kan du logga en portion med ett tryck.</p>
        </div>
      )}
      <div className="recipe-grid">
        {list.map((r) => {
          const per = recipePerPortion(r)
          return (
            <article key={r.id} className="card recipe-card">
              <button className="recipe-hit" onClick={() => setEditing(r)}>
                {r.photoId ? <Photo id={r.photoId} className="recipe-img" /> : <div className="recipe-img ph">🍲</div>}
                <h3>{r.name}</h3>
                <p className="muted small">
                  <b className="num">{r0(per.kcal)}</b> kcal/portion · {r.servings} port.
                </p>
                <p className="muted small">
                  P {r0(per.protein)} g · K {r0(per.carbs)} g · F {r0(per.fat)} g
                </p>
              </button>
              <div className="recipe-actions">
                <button className="star" aria-label="Favorit" onClick={() => toggleFavoriteRecipe(r.id)}>
                  {favs.includes(r.id) ? '★' : '☆'}
                </button>
                <button className="btn primary small" onClick={() => setLogging(r)}>
                  Logga
                </button>
              </div>
            </article>
          )
        })}
      </div>
      {editing && <RecipeEditor recipe={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}
      {logging && (
        <RecipeLogSheet
          recipe={logging}
          date={date}
          meal={suggestMeal()}
          onClose={() => setLogging(null)}
          onDone={() => {
            setLogging(null)
            alert('Tillagt i dagboken!')
          }}
        />
      )}
    </div>
  )
}
