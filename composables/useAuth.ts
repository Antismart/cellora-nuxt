/**
 * Auth state, fed by `GET /admin/me` (backend-handoff §3).
 *
 * Three states the rest of the app cares about:
 *   - signed in (real or mock):  user.value !== null
 *   - signed out:                user.value === null && !usingMock
 *   - backend unreachable (dev): user.value === null && usingMock
 *
 * `usingMock` flips on after a network-level failure so the prototype keeps
 * working offline. In that mode `signIn()` installs a mock user without doing
 * a real OAuth round-trip — useful for designing pages before the OAuth slice
 * lands. Once `/admin/oauth/github/start` exists, `usingMock` will stay false
 * and the button does a full-page redirect to GitHub.
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
  github_login: 'ramos',
  email: 'ramos@cellora.dev',
  avatar_url: null,
}

const toDisplay = (u: UserView): DisplayUser => ({
  handle: u.github_login,
  email: u.email ?? `${u.github_login}@users.noreply.github.com`,
  plan: 'Pro',
  org: 'cellora-dev',
  avatar: u.avatar_url,
})

export const useAuth = () => {
  const user = useState<UserView | null>('cellora.user', () => null)
  const ready = useState<boolean>('cellora.authReady', () => false)
  const usingMock = useState<boolean>('cellora.authMock', () => false)

  const isUserView = (v: unknown): v is UserView =>
    !!v && typeof v === 'object' &&
    typeof (v as any).id === 'string' &&
    typeof (v as any).github_login === 'string'

  const refresh = async (): Promise<void> => {
    if (import.meta.server) return
    try {
      const res = await apiFetch<{ user: UserView }>('/admin/me')
      // Validate shape — in dev, a proxy might forward to whatever is on :8080
      // (e.g., another project), which won't return our envelope.
      if (res && typeof res === 'object' && isUserView((res as any).user)) {
        user.value = res.user
        usingMock.value = false
      } else {
        user.value = null
        usingMock.value = true
      }
    } catch (e) {
      const err = e as ApiError
      if (err.status === 401) {
        // Definitive signed-out signal from the backend.
        user.value = null
        usingMock.value = false
      } else {
        // Network/CORS/proxy failure — backend likely not running. Enable mock
        // mode but don't auto-sign-in; user still has to click the button so
        // the dev-mode auth UX matches prod.
        user.value = null
        usingMock.value = true
      }
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
    if (usingMock.value) {
      // Dev-only path: backend isn't there, install mock user client-side.
      user.value = MOCK_USER
      navigateTo('/app/overview')
    } else {
      // Hand the browser off to GitHub. The callback redirects back to /app.
      window.location.href = '/admin/oauth/github/start'
    }
  }

  const signOut = async (): Promise<void> => {
    if (import.meta.client && !usingMock.value) {
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
    usingMock,
    refresh,
    signIn,
    signOut,
  }
}
