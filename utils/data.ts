import { seedRand, hex } from './format'

export const TIP_BASE = 14_823_417

export const sampleBlocks = (() => {
  const r = seedRand(42)
  return Array.from({ length: 12 }, (_, i) => ({
    number: TIP_BASE - i,
    hash: hex(r, 64),
    parent_hash: hex(r, 64),
    timestamp_ms: Date.now() - i * 8400,
    epoch: 6213 + Math.floor((TIP_BASE - i) / 1800),
    transactions_count: Math.floor(r() * 80) + 2,
    proposals_count: Math.floor(r() * 30),
    uncles_count: r() < 0.04 ? 1 : 0,
    nonce: hex(r, 16),
    dao: hex(r, 64),
    indexed_at: new Date(Date.now() - i * 8400 + 1200).toISOString(),
  }))
})()

export const sampleCell = (() => {
  const r = seedRand(7)
  return {
    tx_hash: hex(r, 64),
    output_index: 0,
    block_number: TIP_BASE - 12,
    block_hash: hex(r, 64),
    capacity_shannons: 19_900_000_000,
    lock: {
      code_hash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
      hash_type: 'type',
      args: hex(r, 40),
    },
    lock_hash: hex(r, 64),
    type: {
      code_hash: '0x82d76d1b75fe2fd9a27dfbaa65a039221a380d76c926f378d3f81cf3e7e13f2e',
      hash_type: 'type',
      args: hex(r, 40),
    },
    type_hash: hex(r, 64),
    is_live: true,
    consumed_by: null,
  }
})()

export type ApiKey = {
  id: string
  label: string
  prefix: string
  tier: 'free' | 'starter' | 'pro'
  network: 'mainnet' | 'testnet'
  created: string
  last_used: string | null
  status: 'active' | 'rotated' | 'revoked'
  request_24h: number
}

export const apiKeysSeed: ApiKey[] = [
  { id: 'k_01', label: 'production-api', prefix: 'cell_l9k4q2', tier: 'pro', network: 'mainnet', created: '2025-04-12T10:14:00Z', last_used: '2026-05-10T08:42:11Z', status: 'active', request_24h: 412_038 },
  { id: 'k_02', label: 'explorer-frontend', prefix: 'cell_a1b2c3', tier: 'starter', network: 'mainnet', created: '2025-09-03T15:21:00Z', last_used: '2026-05-10T07:11:02Z', status: 'active', request_24h: 81_204 },
  { id: 'k_03', label: 'ci-tests', prefix: 'cell_88fz0r', tier: 'free', network: 'testnet', created: '2026-02-21T09:00:00Z', last_used: '2026-05-09T22:41:50Z', status: 'active', request_24h: 1_204 },
  { id: 'k_04', label: 'indexer-backfill', prefix: 'cell_77p3qx', tier: 'pro', network: 'mainnet', created: '2025-12-01T18:00:00Z', last_used: '2026-04-29T11:09:00Z', status: 'rotated', request_24h: 0 },
  { id: 'k_05', label: 'ramos-laptop', prefix: 'cell_w0r7md', tier: 'free', network: 'testnet', created: '2026-04-30T13:00:00Z', last_used: null, status: 'active', request_24h: 0 },
]

export const buildUsageSeries = (range: '24h' | '7d' | '30d' = '24h') => {
  const points = range === '24h' ? 24 : range === '7d' ? 28 : 30
  const r = seedRand(range === '24h' ? 11 : range === '7d' ? 22 : 33)
  const baseRest = range === '24h' ? 12_000 : range === '7d' ? 240_000 : 980_000
  const baseGql = range === '24h' ? 4_500 : range === '7d' ? 92_000 : 380_000
  return Array.from({ length: points }, (_, i) => {
    const restNoise = (Math.sin(i / 2.4) + 1) * 0.3 + r() * 0.7
    const gqlNoise = (Math.cos(i / 1.8) + 1) * 0.25 + r() * 0.6
    const label =
      range === '24h' ? `${String(i).padStart(2, '0')}:00`
      : range === '7d' ? `D${i + 1}`
      : `${i + 1}`
    return {
      label,
      rest: Math.floor(baseRest * (0.7 + restNoise * 0.6)),
      graphql: Math.floor(baseGql * (0.6 + gqlNoise * 0.7)),
      errors: Math.floor(r() * 24),
    }
  })
}

export const endpointBreakdown = [
  { endpoint: 'GET /v1/cells', requests: 184_204, p95_ms: 41 },
  { endpoint: 'GET /v1/blocks/latest', requests: 92_318, p95_ms: 18 },
  { endpoint: 'GET /v1/blocks/{number}', requests: 62_407, p95_ms: 22 },
  { endpoint: 'POST /graphql', requests: 41_088, p95_ms: 67 },
  { endpoint: 'GET /v1/transactions/{hash}', requests: 28_911, p95_ms: 26 },
  { endpoint: 'GET /v1/scripts/{hash}/cells', requests: 14_512, p95_ms: 53 },
  { endpoint: 'GET /v1/stats', requests: 9_044, p95_ms: 7 },
  { endpoint: 'GET /v1/cells/{tx}/{i}', requests: 6_812, p95_ms: 19 },
  { endpoint: 'GET /v1/scripts/well-known', requests: 3_109, p95_ms: 9 },
  { endpoint: 'GET /v1/health', requests: 1_021, p95_ms: 4 },
]

export const recent429s = [
  { ts: '2026-05-10T09:14:31Z', key: 'explorer-frontend', endpoint: 'GET /v1/cells', retry_after: 0.42, surface: 'REST' },
  { ts: '2026-05-10T08:51:02Z', key: 'explorer-frontend', endpoint: 'GET /v1/cells', retry_after: 0.31, surface: 'REST' },
  { ts: '2026-05-10T08:33:55Z', key: 'production-api', endpoint: 'POST /graphql', retry_after: 0.18, surface: 'GraphQL' },
  { ts: '2026-05-10T07:09:11Z', key: 'production-api', endpoint: 'GET /v1/blocks/{number}', retry_after: 0.05, surface: 'REST' },
  { ts: '2026-05-09T23:44:09Z', key: 'ci-tests', endpoint: 'POST /graphql', retry_after: 1.20, surface: 'GraphQL' },
]

export const recentActivity = [
  { ts: '2026-05-10T09:14:31Z', method: 'GET', path: '/v1/cells', key: 'explorer-frontend', status: 429, ms: 7 },
  { ts: '2026-05-10T09:14:30Z', method: 'GET', path: '/v1/blocks/14823405', key: 'production-api', status: 200, ms: 18 },
  { ts: '2026-05-10T09:14:28Z', method: 'GET', path: '/v1/cells', key: 'explorer-frontend', status: 200, ms: 32 },
  { ts: '2026-05-10T09:14:27Z', method: 'POST', path: '/graphql', key: 'production-api', status: 200, ms: 64 },
  { ts: '2026-05-10T09:14:26Z', method: 'GET', path: '/v1/blocks/latest', key: 'production-api', status: 200, ms: 11 },
  { ts: '2026-05-10T09:14:24Z', method: 'GET', path: '/v1/transactions/0xab12…', key: 'production-api', status: 200, ms: 26 },
  { ts: '2026-05-10T09:14:21Z', method: 'GET', path: '/v1/cells', key: 'production-api', status: 200, ms: 37 },
  { ts: '2026-05-10T09:14:18Z', method: 'GET', path: '/v1/scripts/well-known', key: 'production-api', status: 200, ms: 9 },
  { ts: '2026-05-10T09:14:14Z', method: 'GET', path: '/v1/blocks/14823404', key: 'ci-tests', status: 200, ms: 19 },
  { ts: '2026-05-10T09:14:11Z', method: 'GET', path: '/v1/cells', key: 'explorer-frontend', status: 200, ms: 33 },
]

export const statusByNetwork = {
  mainnet: {
    snapshot_age_seconds: 4,
    last_reorg: { ts: '2026-05-09T17:42:11Z', depth: 2, block: TIP_BASE - 1820 },
    region: 'us-east-1',
    nodes: [
      { id: 'ckb-node-01', role: 'primary', ok: true, lag: 0 },
      { id: 'ckb-node-02', role: 'secondary', ok: true, lag: 1 },
      { id: 'ckb-node-03', role: 'secondary', ok: true, lag: 2 },
    ],
  },
  testnet: {
    snapshot_age_seconds: 6,
    last_reorg: { ts: '2026-05-10T08:14:09Z', depth: 1, block: TIP_BASE - 412 },
    region: 'us-east-1',
    nodes: [
      { id: 'ckb-pizza-01', role: 'primary', ok: true, lag: 0 },
      { id: 'ckb-pizza-02', role: 'secondary', ok: true, lag: 1 },
    ],
  },
}

export const tiers = {
  free:    { rest_burst: 30,    rest_refill: 1,   gql_burst: 10,    gql_refill: 0.5,  price: 0,    label: 'Free' },
  starter: { rest_burst: 300,   rest_refill: 20,  gql_burst: 100,   gql_refill: 10,   price: null, label: 'Starter' },
  pro:     { rest_burst: 3000,  rest_refill: 200, gql_burst: 1000,  gql_refill: 100,  price: null, label: 'Pro' },
}

export const sample_curl = `curl https://api.cellora.dev/v1/cells \\
  -H "Authorization: Bearer cell_a1b2c3..." \\
  -G --data-urlencode "lock_hash=0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8" \\
  --data-urlencode "limit=20"`

export const sample_response = `{
  "data": [
    {
      "tx_hash": "0xa3c2…81ef",
      "output_index": 0,
      "block_number": 14823405,
      "capacity_shannons": 19900000000,
      "lock": {
        "code_hash": "0x9bd7e06f…3cce8",
        "hash_type": "type",
        "args": "0x59a2…b40c"
      },
      "type": null,
      "is_live": true
    }
  ],
  "next_cursor": "eyJibG9ja19udW1iZXIiOjE0ODIzMzI…",
  "meta": { "indexer_tip": 14823417, "node_tip": 14823420 }
}`

export const sample_graphql = `query LatestBlocks {
  blocksLatest(limit: 5) {
    number
    hash
    transactionsCount
    timestamp
    cellsProduced
  }
}`

export const sample_graphql_response = `{
  "data": {
    "blocksLatest": [
      { "number": 14823417, "hash": "0xc1a0…44e2",
        "transactionsCount": 24, "cellsProduced": 81 },
      { "number": 14823416, "hash": "0xfb7e…0a91",
        "transactionsCount": 17, "cellsProduced": 52 }
    ]
  }
}`

export const NETWORKS = [
  { id: 'mainnet', label: 'Mainnet', short: 'MAIN', accent: 'var(--brand)', tint: 'var(--brand-tint)' },
  { id: 'testnet', label: 'Pizza Testnet', short: 'TEST', accent: 'var(--testnet)', tint: 'var(--testnet-tint)' },
] as const

export type NetworkId = 'mainnet' | 'testnet'
