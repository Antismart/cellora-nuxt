export default defineNuxtRouteMiddleware(async () => {
  // Auth check is client-only. SSR renders the dashboard shell without
  // user data; on hydration, /admin/me decides whether to keep the user
  // here or bounce them to /sign-in. This avoids needing to forward the
  // session cookie through the SSR fetch path.
  if (import.meta.server) return

  const { signedIn, ready, refresh } = useAuth()
  if (!ready.value) await refresh()
  if (!signedIn.value) {
    // If we catch them signed out during initial hydration, a soft redirect
    // causes a massive Vue hydration mismatch (server rendered the dashboard,
    // client expects the sign-in page). Force a hard reload.
    return navigateTo('/sign-in', { external: true })
  }
})
