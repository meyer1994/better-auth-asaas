import { auth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  console.debug('auth handler started', { path: event.path, method: event.method })
  const response = await auth.handler(toWebRequest(event))
  console.debug('auth handler finished', { path: event.path, method: event.method })
  return response
})
