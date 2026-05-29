/**
 * Dev proxy for POST /graphql → Rust backend.
 * Mirrors the admin proxy — see server/routes/admin/[...path].ts.
 */
import { proxyRequest } from 'h3'

const target = process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

export default defineEventHandler((event) => {
  return proxyRequest(event, `${target}/graphql`, {
    headers: {
      cookie: getRequestHeader(event, 'cookie') || '',
    },
  })
})
