import type { HealthStatus } from '../services/healthApi'

export type HealthApi = {
  fetchHealthStatus: () => Promise<HealthStatus>
}

export const createMockHealthApi = (): HealthApi => {
  return {
    fetchHealthStatus: async () => ({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Mock backend connectivity confirmed.',
    }),
  }
}
