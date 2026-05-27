import { useEffect, useState } from 'react'
import {
  buildHealthUrl,
  fetchHealthStatus,
  type HealthStatus,
} from './services/healthApi'
import './App.css'

type HealthViewState =
  | { kind: 'loading' }
  | { kind: 'success'; health: HealthStatus }
  | { kind: 'error'; message: string }

function App() {
  const [healthView, setHealthView] = useState<HealthViewState>({
    kind: 'loading',
  })

  useEffect(() => {
    let cancelled = false

    const loadHealth = async () => {
      setHealthView({ kind: 'loading' })
      try {
        const health = await fetchHealthStatus()
        if (!cancelled) {
          setHealthView({ kind: 'success', health })
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : 'Unknown health check error'
          setHealthView({ kind: 'error', message })
        }
      }
    }

    void loadHealth()

    return () => {
      cancelled = true
    }
  }, [])

  const mswEnabled = import.meta.env.MODE === 'mock'

  return (
    <main className="baseline">
      <header className="baseline__header">
        <h1>Employee Manager</h1>
        <p className="baseline__subtitle">Baseline UI — API connectivity</p>
      </header>

      <section className="baseline__card" aria-live="polite">
        <p className="baseline__endpoint">
          <span className="baseline__label">Health endpoint</span>
          <code>{buildHealthUrl()}</code>
        </p>

        {healthView.kind === 'loading' && (
          <p className="baseline__status baseline__status--loading">
            Checking backend connectivity…
          </p>
        )}

        {healthView.kind === 'success' && (
          <div className="baseline__status baseline__status--ok">
            <p className="baseline__headline">Connected</p>
            <dl className="baseline__details">
              <div>
                <dt>Status</dt>
                <dd>{healthView.health.status}</dd>
              </div>
              <div>
                <dt>Timestamp</dt>
                <dd>{healthView.health.timestamp}</dd>
              </div>
              {healthView.health.message && (
                <div>
                  <dt>Message</dt>
                  <dd>{healthView.health.message}</dd>
                </div>
              )}
              <div>
                <dt>Database</dt>
                <dd>{healthView.health.db.status}</dd>
              </div>
              {healthView.health.db.error && (
                <div>
                  <dt>Database error</dt>
                  <dd>{healthView.health.db.error}</dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {healthView.kind === 'error' && (
          <div className="baseline__status baseline__status--error">
            <p className="baseline__headline">Connection failed</p>
            <p className="baseline__error">{healthView.message}</p>
          </div>
        )}
      </section>

      <footer className="baseline__footer">
        <p>
          {mswEnabled
            ? 'MSW is enabled — health requests are intercepted locally.'
            : 'MSW is off — start the BFF or run `bun run dev:mock`.'}
        </p>
      </footer>
    </main>
  )
}

export default App
