import { ApolloProvider } from '@apollo/client/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { apolloClient } from './lib/apolloClient'

/** MSW is enabled only via `bun run dev:mock` (Vite mode: mock). */
const isMswMode = import.meta.env.MODE === 'mock'

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
      <ApolloProvider client={apolloClient}>
        <App />
      </ApolloProvider>
    </StrictMode>,
  )
})
