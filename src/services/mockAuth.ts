export type MockRole = 'admin' | 'manager' | 'viewer'

export const MOCK_ROLES: MockRole[] = ['admin', 'manager', 'viewer']

let runtimeMockRole: MockRole | null = null

/** UI-selected mock role (overrides env default for Apollo requests). */
export const setRuntimeMockRole = (role: MockRole): void => {
  runtimeMockRole = role
}

export const getMockUserId = (): string =>
  import.meta.env.VITE_MOCK_USER_ID?.trim() || 'u-dev'

export const getMockRole = (): MockRole => {
  const role = import.meta.env.VITE_MOCK_ROLES?.trim() || 'admin'
  return MOCK_ROLES.includes(role as MockRole) ? (role as MockRole) : 'admin'
}

export const getEffectiveMockRole = (): MockRole => runtimeMockRole ?? getMockRole()

export const buildMockAuthHeaders = (
  role: MockRole = getEffectiveMockRole(),
  userId: string = getMockUserId(),
): Record<string, string> => ({
  'x-mock-user-id': userId,
  'x-mock-roles': role,
})

export const canCreateEmployees = (role: MockRole): boolean => role === 'admin'
export const canUpdateEmployees = (role: MockRole): boolean =>
  role === 'admin' || role === 'manager'
export const canDeleteEmployees = (role: MockRole): boolean => role === 'admin'
