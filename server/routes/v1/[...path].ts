/**
 * Dev proxy for /v1/** → Rust backend.
 * Mirrors the admin proxy — see server/routes/admin/[...path].ts.
 */
import { proxyRequest } from 'h3'

const target = process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

export default defineEventHandler((event) => {
  const path = '/v1/' + (event.context.params?.path ?? '')
  return proxyRequest(event, `${target}${path}`, {
    headers: {
      cookie: getRequestHeader(event, 'cookie') || '',
    },
    fetchOptions: {
      redirect: 'manual',
    },
  })
})
