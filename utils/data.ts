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
