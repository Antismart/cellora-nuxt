/**
 * Auth state, fed by `GET /admin/me` (backend-handoff §3).
 *
 * Two states the rest of the app cares about:
 *   - signed in:  user.value !== null
 *   - signed out: user.value === null
 */

import { ApiError, apiFetch } from './useApiFetch'

export type UserView = {
  id: string
  github_login: string
  email: string | null
  avatar_url: string | null
}

// Shape the existing UI components consume. `plan` and `org` aren't part of
// the backend contract yet — they're hardcoded here so the prototype renders
// without holes. Fold real fields in as the backend grows.
export type DisplayUser = {
  handle: string
  email: string
  plan: string
  org: string
  avatar: string | null
}

const MOCK_USER: UserView = {
  id: 'mock_user',
  github_login: 'guest',
  email: 'guest@example.com',
  avatar_url: null,
}

const toDisplay = (u: UserView): DisplayUser => ({
  handle: u.github_login,
  email: u.email ?? `${u.github_login}@users.noreply.github.com`,
  plan: 'Free',
  org: null,
  avatar: u.avatar_url,
})

export const useAuth = () => {
  const user = useState<UserView | null>('cellora.user', () => null)
  const ready = useState<boolean>('cellora.authReady', () => false)

  const isUserView = (v: unknown): v is UserView =>
    !!v && typeof v === 'object' &&
    typeof (v as any).id === 'string' &&
    typeof (v as any).github_login === 'string'

  const refresh = async (): Promise<void> => {
    if (import.meta.server) return
    try {
      const res = await apiFetch<{ user: UserView }>('/admin/me')
      if (res && typeof res === 'object' && isUserView((res as any).user)) {
        user.value = res.user
      } else {
        user.value = null
      }
    } catch (e) {
      user.value = null
    } finally {
      ready.value = true
    }
  }

  const signedIn = computed(() => user.value !== null)

  // Always returns something — falls back to MOCK_USER for layout slots that
  // render before the auth check completes. Pages that need real data should
  // guard on `signedIn.value`.
  const displayUser = computed<DisplayUser>(() => toDisplay(user.value ?? MOCK_USER))

  const signIn = (): void => {
    if (!import.meta.client) return
    // Hand the browser off to GitHub. The callback redirects back to /app.
    window.location.href = '/admin/oauth/github/start'
  }

  const signOut = async (): Promise<void> => {
    if (import.meta.client) {
      try {
        await apiFetch('/admin/sign-out', { method: 'POST' })
      } catch {
        // Server-side session may already be gone; clear local state regardless.
      }
    }
    user.value = null
    await navigateTo('/')
  }

  return {
    user,
    displayUser,
    signedIn,
    ready,
    refresh,
    signIn,
    signOut,
  }
}
