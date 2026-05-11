/**
 * Mock auth state for the prototype. In a real build this would back onto
 * a server-side session cookie / Nuxt server route.
 */
export const useAuth = () => {
  const signedIn = useState<boolean>('cellora.signedIn', () => false)
  const user = useState('cellora.user', () => ({
    handle: 'ramos',
    email: 'ramos@cellora.dev',
    plan: 'Pro',
    org: 'cellora-dev',
    avatar: null as string | null,
  }))
  return { signedIn, user }
}
