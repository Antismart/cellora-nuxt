export default defineNuxtRouteMiddleware(() => {
  const { signedIn } = useAuth()
  if (!signedIn.value) {
    return navigateTo('/sign-in')
  }
})
