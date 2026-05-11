/**
 * Cellora API fetch helper.
 *
 * - Always sends the session cookie (`credentials: 'include'`)
 * - Parses the `{ error: { code, message, details } }` envelope on non-2xx and rethrows
 *   as a typed `ApiError` so callers can branch on `err.code` instead of inspecting
 *   `response._data`.
 * - Captures `x-request-id` from error responses so toasts can quote it for support.
 *
 * Backend contract: docs/backend-handoff.md §5.
 */

export type ApiErrorCode =
  | 'bad_request'
  | 'not_found'
  | 'invalid_cursor'
  | 'unauthorized'
  | 'rate_limited'
  | 'upstream_unavailable'
  | 'internal'

export class ApiError extends Error {
  code: ApiErrorCode
  status: number
  details: unknown
  requestId: string | undefined
  retryAfter: number | undefined

  constructor(init: {
    code: ApiErrorCode
    message: string
    status: number
    details?: unknown
    requestId?: string
    retryAfter?: number
  }) {
    super(init.message)
    this.name = 'ApiError'
    this.code = init.code
    this.status = init.status
    this.details = init.details
    this.requestId = init.requestId
    this.retryAfter = init.retryAfter
  }
}

const parseError = (e: any): ApiError => {
  const status = e?.statusCode ?? e?.response?.status ?? 0
  const body = e?.data ?? e?.response?._data
  const envelope = body && typeof body === 'object' ? body.error : null
  const headers = e?.response?.headers
  const headerGet = (k: string): string | undefined =>
    headers?.get ? headers.get(k) ?? undefined : undefined
  const retryAfterRaw = headerGet('retry-after')
  return new ApiError({
    code: (envelope?.code as ApiErrorCode) ?? (status === 0 ? 'upstream_unavailable' : 'internal'),
    message: envelope?.message ?? e?.message ?? 'Request failed',
    status,
    details: envelope?.details,
    requestId: headerGet('x-request-id'),
    retryAfter: retryAfterRaw ? Number(retryAfterRaw) || undefined : undefined,
  })
}

/**
 * One-shot fetch (use inside handlers, not `<script setup>` top-level).
 * Returns the parsed JSON body. Throws `ApiError` on any non-2xx or network failure.
 */
export const apiFetch = async <T = unknown>(
  path: string,
  opts: Parameters<typeof $fetch<T>>[1] = {},
): Promise<T> => {
  try {
    return await $fetch<T>(path, {
      credentials: 'include',
      ...opts,
    })
  } catch (e: any) {
    throw parseError(e)
  }
}

/**
 * SSR/hydration-aware fetch for `<script setup>` top-level. Wraps `useFetch`
 * with the same credentials + error envelope handling.
 */
export const useApiFetch = <T = unknown>(
  path: string | (() => string),
  opts: Parameters<typeof useFetch<T>>[1] = {},
) => {
  return useFetch<T>(path, {
    credentials: 'include',
    ...opts,
  })
}
