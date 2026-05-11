export const SHANNONS_PER_CKB = 100_000_000

export const fmtCKB = (shannons: number) => {
  const ckb = shannons / SHANNONS_PER_CKB
  if (ckb >= 1_000_000) return (ckb / 1_000_000).toFixed(2) + 'M'
  if (ckb >= 1_000) return (ckb / 1_000).toFixed(2) + 'K'
  if (ckb >= 1) return ckb.toFixed(2)
  return ckb.toFixed(4)
}

export const fmtNum = (n: number | null | undefined) =>
  n == null ? '—' : new Intl.NumberFormat('en-US').format(n)

export const fmtCompact = (n: number | null | undefined) => {
  if (n == null) return '—'
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k'
  return String(n)
}

export const truncMid = (s: string, n = 6, m = 6) => {
  if (!s) return ''
  if (s.length <= n + m + 3) return s
  return s.slice(0, n) + '…' + s.slice(-m)
}

export const relTime = (iso: string) => {
  const ms = Date.now() - new Date(iso).getTime()
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 48) return `${h}h ago`
  const d = Math.round(h / 24)
  return `${d}d ago`
}

export const fmtTime = (iso: string) =>
  new Date(iso).toLocaleString('en-US', {
    month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
  })

export const seedRand = (seed: number) => () => {
  seed = (seed * 9301 + 49297) % 233280
  return seed / 233280
}

export const hex = (rand: () => number, n = 64) => {
  let s = '0x'
  const chars = '0123456789abcdef'
  for (let i = 0; i < n; i++) s += chars[Math.floor(rand() * 16)]
  return s
}

export const hl = {
  bash: (s: string) =>
    s
      .replace(/(\\)/g, '<span class="tok-pun">$1</span>')
      .replace(/(--?[a-z-]+)/g, '<span class="tok-key">$1</span>')
      .replace(/("[^"]*")/g, '<span class="tok-str">$1</span>')
      .replace(/(curl|http|https)/g, (m) => `<span class="tok-fn">${m}</span>`),
  json: (s: string) =>
    s
      .replace(/("[\w_]+")(\s*:)/g, '<span class="tok-key">$1</span>$2')
      .replace(/: ("[^"]*")/g, ': <span class="tok-str">$1</span>')
      .replace(/: (true|false|null)/g, ': <span class="tok-kw">$1</span>')
      .replace(/: (-?\d+(?:\.\d+)?)/g, ': <span class="tok-num">$1</span>'),
  graphql: (s: string) =>
    s
      .replace(/(query|mutation|subscription)\b/g, '<span class="tok-kw">$1</span>')
      .replace(/(\b[A-Z][A-Za-z]+)/g, '<span class="tok-fn">$1</span>')
      .replace(/(\b\d+\b)/g, '<span class="tok-num">$1</span>')
      .replace(/(\{|\}|:)/g, '<span class="tok-pun">$1</span>'),
}
