import { useState } from 'react'
import { useStore } from './lib/store'
import type { LogEntry, MealType } from './lib/types'
import { suggestMeal, todayStr } from './lib/util'
import { completeOnboarding } from './lib/actions'
import { macroGoals } from './lib/nutrition'
import { TodayPage } from './pages/TodayPage'
import { RecipesPage } from './pages/RecipesPage'
import { ProgressPage } from './pages/ProgressPage'
import { ProfilePage } from './pages/ProfilePage'
import { AddFoodSheet } from './components/AddFoodSheet'
import { PhotoSheet } from './components/PhotoSheet'
import { EntrySheet } from './components/EntrySheet'
import { ProfileForm } from './components/ProfileForm'

type Tab = 'today' | 'recipes' | 'progress' | 'profile'

type Overlay = { kind: 'add'; meal: MealType } | { kind: 'photo'; meal: MealType } | { kind: 'entry'; entry: LogEntry } | null

export default function App() {
  const onboarded = useStore((s) => s.onboarded)
  const [tab, setTab] = useState<Tab>('today')
  const [date, setDate] = useState(todayStr())
  const [overlay, setOverlay] = useState<Overlay>(null)

  if (!onboarded) return <Onboarding />

  const close = () => setOverlay(null)

  return (
    <div className="app">
      <main>
        {tab === 'today' && (
          <TodayPage
            date={date}
            setDate={setDate}
            onAdd={(meal) => setOverlay({ kind: 'add', meal })}
            onPhoto={(meal) => setOverlay({ kind: 'photo', meal })}
            onEdit={(entry) => setOverlay({ kind: 'entry', entry })}
          />
        )}
        {tab === 'recipes' && <RecipesPage date={date} />}
        {tab === 'progress' && <ProgressPage />}
        {tab === 'profile' && <ProfilePage />}
      </main>

      <nav className="tabbar" aria-label="Huvudmeny">
        <TabButton id="today" icon="🏠" label="Dagbok" tab={tab} setTab={setTab} />
        <TabButton id="recipes" icon="📖" label="Recept" tab={tab} setTab={setTab} />
        <button className="fab" aria-label="Fotografera måltid" onClick={() => setOverlay({ kind: 'photo', meal: suggestMeal() })}>
          📷
        </button>
        <TabButton id="progress" icon="📈" label="Utveckling" tab={tab} setTab={setTab} />
        <TabButton id="profile" icon="👤" label="Profil" tab={tab} setTab={setTab} />
      </nav>

      {overlay?.kind === 'add' && (
        <AddFoodSheet date={date} meal={overlay.meal} onClose={close} onPhoto={() => setOverlay({ kind: 'photo', meal: overlay.meal })} />
      )}
      {overlay?.kind === 'photo' && (
        <PhotoSheet
          date={date}
          meal={overlay.meal}
          onClose={() => {
            close()
            setTab('today')
          }}
          onOpenSettings={() => {
            close()
            setTab('profile')
          }}
        />
      )}
      {overlay?.kind === 'entry' && <EntrySheet entry={overlay.entry} onClose={close} />}
    </div>
  )
}

function TabButton({ id, icon, label, tab, setTab }: { id: Tab; icon: string; label: string; tab: Tab; setTab: (t: Tab) => void }) {
  return (
    <button className={`tab ${tab === id ? 'on' : ''}`} aria-current={tab === id ? 'page' : undefined} onClick={() => setTab(id)}>
      <span aria-hidden="true">{icon}</span>
      {label}
    </button>
  )
}

function Onboarding() {
  const profile = useStore((s) => s.profile)
  const goals = macroGoals(profile)
  return (
    <div className="app onboarding">
      <div className="page">
        <div className="hero">
          <img src="./favicon.svg" alt="" width={72} height={72} />
          <h1>Välkommen till Kalorikoll</h1>
          <p className="muted">Fotografera din mat, spara favoriter och recept och följ din utveckling.</p>
        </div>
        <section className="card">
          <h3>Berätta lite om dig</h3>
          <ProfileForm />
        </section>
        <section className="card goal-card">
          <div>
            <span className="muted small">Ditt dagliga mål</span>
            <b className="num big">{goals.kcal} kcal</b>
          </div>
          <div className="muted small">
            Protein {goals.protein} g · Kolhydrater {goals.carbs} g · Fett {goals.fat} g
          </div>
        </section>
        <button className="btn primary wide" onClick={completeOnboarding}>
          Kom igång
        </button>
      </div>
    </div>
  )
}
