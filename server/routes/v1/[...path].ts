/**
 * Dev proxy for /v1/** → Rust backend.
 * Mirrors the admin proxy — see server/routes/admin/[...path].ts.
 */
import { proxyRequest, getQuery } from 'h3'

const target = process.env.NUXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8080'

export default defineEventHandler((event) => {
  const path = '/v1/' + (event.context.params?.path ?? '')
  const query = getQuery(event)
  const qs = new URLSearchParams(query as Record<string, string>).toString()
  const url = qs ? `${target}${path}?${qs}` : `${target}${path}`
  return proxyRequest(event, url, {
    headers: {
      cookie: getRequestHeader(event, 'cookie') || '',
    },
    fetchOptions: {
      redirect: 'manual',
    },
  })
})
