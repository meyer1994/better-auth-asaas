import { createSharedComposable } from '@vueuse/core'

const _useDashboard = () => {
  const router = useRouter()

  defineShortcuts({
    'g-h': () => router.push('/'),
    'g-n': () => router.push('/charges/new')
  })

  return {}
}

export const useDashboard = createSharedComposable(_useDashboard)
