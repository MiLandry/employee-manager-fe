import { setupServer } from 'msw/node'
import { graphqlHandlers } from './handlers/graphql'

export const server = setupServer(...graphqlHandlers)
