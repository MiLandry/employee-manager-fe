import type { components } from '../generated/openapi'

export type HealthStatus = components['schemas']['HealthResponse']

export const DEFAULT_API_BASE_URL = 'http://localhost:3000'
export const API_HEALTH_PATH = '/health'

const getEnvApiBaseUrl = (): string => {
  return import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
}

export const buildHealthUrl = (baseUrl?: string): string => {
  const normalizedBaseUrl = (baseUrl || getEnvApiBaseUrl()).replace(/\/$/, '')
  return `${normalizedBaseUrl}${API_HEALTH_PATH}`
}

function isHealthStatus(value: unknown): value is HealthStatus {
  if (!value || typeof value !== 'object') {
    return false
  }

  const record = value as Record<string, unknown>

  const statusOk =
    record.status === 'ok' || record.status === 'error'

  const timestampOk = typeof record.timestamp === 'string'
  const db = record.db
  if (!db || typeof db !== 'object') {
    return false
  }
  const dbRecord = db as Record<string, unknown>
  const dbStatusOk = dbRecord.status === 'up' || dbRecord.status === 'down'
  const dbErrorOk =
    dbRecord.error === undefined || typeof dbRecord.error === 'string'

  return Boolean(statusOk && timestampOk && dbStatusOk && dbErrorOk)
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

  const payload: unknown = await response.json()

  if (!isHealthStatus(payload)) {
    throw new Error('Health API response did not match the expected contract')
  }

  return payload
}
