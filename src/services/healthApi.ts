export type HealthStatus = {
  status: 'ok' | 'error'
  timestamp: string
  message?: string
}

export const DEFAULT_API_BASE_URL = 'http://localhost:3000'
export const API_HEALTH_PATH = '/health'

const getEnvApiBaseUrl = (): string => {
  if (typeof import.meta !== 'undefined' && 'env' in import.meta) {
    const env = (import.meta as any).env
    return env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
  }
  return DEFAULT_API_BASE_URL
}

export const buildHealthUrl = (baseUrl?: string): string => {
  const normalizedBaseUrl = (baseUrl || getEnvApiBaseUrl()).replace(/\/$/, '')
  return `${normalizedBaseUrl}${API_HEALTH_PATH}`
}

export const fetchHealthStatus = async (
  fetchFn: typeof fetch = fetch,
  baseUrl?: string,
): Promise<HealthStatus> => {
  const url = buildHealthUrl(baseUrl)
  const response = await fetchFn(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Health API request failed: ${response.status} ${response.statusText} - ${body}`)
  }

  const payload = (await response.json()) as HealthStatus

  if (!payload || typeof payload.status !== 'string' || typeof payload.timestamp !== 'string') {
    throw new Error('Health API response did not match the expected contract')
  }

  return payload
}
