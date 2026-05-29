/**
 * Dev proxy for /admin/** → Rust backend.
 *
 * Nitro's `devProxy` rewrites headers in a way that drops cookies on
 * some setups. This catch-all server route uses `proxyRequest` from h3,
 * which faithfully forwards every header (including Cookie) to the
 * upstream, fixing the 401 loop the dashboard was hitting.
 */
import { proxyRequest, getQuery } from 'h3'

const target = process.env.NUXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8080'

export default defineEventHandler((event) => {
  const path = '/admin/' + (event.context.params?.path ?? '')
  const query = getQuery(event)
  const qs = new URLSearchParams(query as Record<string, string>).toString()
  const url = qs ? `${target}${path}?${qs}` : `${target}${path}`
  return proxyRequest(event, url, {
    headers: {
      // Explicitly forward the cookie header from the browser request
      cookie: getRequestHeader(event, 'cookie') || '',
    },
    fetchOptions: {
      redirect: 'manual',
    },
  })
})
