import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

/** MSW is enabled only via `bun run dev:mock` (Vite mode: mock). */
const isMswMode = import.meta.env.MODE === 'mock'

const queryClient = new QueryClient()

async function enableMocking(): Promise<void> {
  if (!isMswMode) {
    return
  }

  const { worker } = await import('./mocks/browser.ts')
  await worker.start({
    onUnhandledRequest: 'bypass',
  })
}

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element #root not found')
}

void enableMocking().then(() => {
  createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>,
  )
})
