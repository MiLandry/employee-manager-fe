import { test, expect } from 'bun:test'
import { buildHealthUrl, fetchHealthStatus } from '../src/services/healthApi'
import { createMockHealthApi } from '../src/mocks/healthApiMock'

test('buildHealthUrl uses the default base URL when none is provided', () => {
  expect(buildHealthUrl()).toBe('http://localhost:3000/health')
})

test('buildHealthUrl respects an explicit custom base URL', () => {
  expect(buildHealthUrl('https://api.example.com')).toBe('https://api.example.com/health')
})

test('mock health API returns an ok status payload', async () => {
  const mockApi = createMockHealthApi()
  const result = await mockApi.fetchHealthStatus()

  expect(result.status).toBe('ok')
  expect(typeof result.timestamp).toBe('string')
  expect(result.message).toBe('Mock backend connectivity confirmed.')
})

test('fetchHealthStatus throws when the response contract is invalid', async () => {
  const fakeFetch = async () => ({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => ({ bad: 'payload' }),
  }) as Response

  await expect(fetchHealthStatus(fakeFetch as unknown as typeof fetch)).rejects.toThrow(
    'Health API response did not match the expected contract',
  )
})
