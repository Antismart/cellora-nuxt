<script setup lang="ts">
import { hl } from '~/utils/format'

definePageMeta({ layout: 'dashboard' })

const e = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// ── Active-section tracking ───────────────────────────────────────────────────
const activeSection = ref('why')
let _observer: IntersectionObserver | null = null

onMounted(() => {
  _observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) activeSection.value = entry.target.id
      }
    },
    { rootMargin: '-10% 0px -78% 0px', threshold: 0 },
  )
  document.querySelectorAll('section[data-doc]').forEach((el) => _observer!.observe(el))
})
onUnmounted(() => _observer?.disconnect())

// ── Raw code strings ──────────────────────────────────────────────────────────
const RAW = {
  exportKey: `export CELLORA_KEY="cell_<prefix>_<secret>"`,

  firstRequest:
`curl -s \\
  -H "Authorization: Bearer $CELLORA_KEY" \\
  https://api.cellora.dev/v1/blocks/latest | jq`,

  authHeader: `Authorization: Bearer cell_<prefix>_<secret>`,

  health: `curl -s https://api.cellora.dev/v1/health | jq`,
  healthResp: `{ "status": "ok", "version": "0.1.0" }`,

  latest:
`curl -s \\
  -H "Authorization: Bearer $CELLORA_KEY" \\
  https://api.cellora.dev/v1/blocks/latest | jq`,
  latestResp: JSON.stringify({
    number: 14823417,
    hash: '0x4a9fd3c8b2e1f07a3d5c9e2b4f6a8d0c1e3b5a7f9d2c4e6b8a0c2e4f6a8d0c2',
    parent_hash: '0x3b8ec1a9f2d4e6b8c0a2d4f6b8e0a2c4f6e8b0d2f4a6c8e0a2c4d6f8b0e2a4',
    timestamp_ms: 1749513600000,
    epoch: 9182,
    transactions_count: 14,
    proposals_count: 3,
    uncles_count: 0,
    indexed_at: '2026-06-10T08:00:00.000Z',
  }, null, 2),

  blockNum:
`curl -s \\
  -H "Authorization: Bearer $CELLORA_KEY" \\
  https://api.cellora.dev/v1/blocks/1000000 | jq`,

  cellsQuery:
`curl -s \\
  -H "Authorization: Bearer $CELLORA_KEY" \\
  "https://api.cellora.dev/v1/cells?lock_hash=0xabc...&is_live=true&limit=10" | jq`,
  cellsResp: JSON.stringify({
    data: [{
      tx_hash: '0xd4f29c3a1e8b7f6d2a5c9e3b1f7a4d8c2e6b0f4a8d2c6e0b4f8a2d6c0e4b8f2',
      output_index: 0,
      block_number: 14823400,
      capacity_shannons: 10000000000,
      lock: { code_hash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9d5cefa...', hash_type: 'type', args: '0xdeadbeef' },
      lock_hash: '0xabc...',
      type: null,
      is_live: true,
      consumed_by: null,
    }],
    next_cursor: 'eyJibiI6MTQ4MjM0MDAsInR4IjoiMHhkNGYyOWMzYTFlOGI3ZjZkMiIsIm9pIjowfQ',
    meta: { indexer_tip: 14823417, node_tip: 14823420 },
  }, null, 2),

  stats:
`curl -s \\
  -H "Authorization: Bearer $CELLORA_KEY" \\
  https://api.cellora.dev/v1/stats | jq`,
  statsResp: JSON.stringify({
    indexer_tip: 14823417,
    node_tip: 14823420,
    lag_blocks: 3,
    snapshot_age_seconds: 1,
    is_stale: false,
  }, null, 2),

  gqlBasic:
`curl -s -X POST https://api.cellora.dev/graphql \\
  -H "Authorization: Bearer $CELLORA_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"query":"{ blocksLatest { number hash transactionsCount } stats { lagBlocks isStale } }"}' | jq`,

  gqlSchema:
`type Query {
  blocksLatest: Block
  block(number: Int!): Block
  cells(input: CellsInput!): CellsConnection!
  stats: Stats!
}

input CellsInput {
  lockHash: String
  typeHash: String
  isLive: Boolean
  limit: Int
  cursor: String
  includeData: Boolean
}

type Block {
  number: Int!        hash: String!
  parentHash: String! timestampMs: Int!
  transactionsCount: Int!
  indexedAt: String!
}

type Cell {
  txHash: String!     outputIndex: Int!
  blockNumber: Int!   capacityShannons: Int!
  lock: Script!       lockHash: String!
  type: Script        typeHash: String
  isLive: Boolean!    consumedBy: ConsumedBy
}

type Script {
  codeHash: String!  hashType: String!  args: String!
}

type CellsConnection {
  data: [Cell!]!
  nextCursor: String
  meta: Meta!
}`,

  gqlCells:
`curl -s -X POST https://api.cellora.dev/graphql \\
  -H "Authorization: Bearer $CELLORA_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "query Q($lock: String!) { cells(input: { lockHash: $lock, isLive: true, limit: 20 }) { data { txHash outputIndex blockNumber capacityShannons isLive } nextCursor meta { indexerTip nodeTip } } }",
    "variables": { "lock": "0x..." }
  }' | jq`,

  pagination:
`cursor=""
while :; do
  url="https://api.cellora.dev/v1/cells?lock_hash=0x...&limit=100"
  [ -n "$cursor" ] && url="\${url}&cursor=\${cursor}"

  resp=$(curl -s -H "Authorization: Bearer $CELLORA_KEY" "$url")
  echo "$resp" | jq '.data[]'

  cursor=$(echo "$resp" | jq -r '.next_cursor // empty')
  [ -z "$cursor" ] && break
done`,

  errorResp: JSON.stringify({
    error: { code: 'not_found', message: 'block not found', details: null },
  }, null, 2),

  // ── Migration: check chain tip ────────────────────────────────────────────
  nodeTip:
`# Requires a CKB full node running locally
curl -s http://localhost:8114 \\
  -H 'Content-Type: application/json' \\
  -d '{"id":1,"jsonrpc":"2.0","method":"get_tip_block_number","params":[]}' | jq
# Response: {"jsonrpc":"2.0","result":"0xe24ee9","id":1}
# Result is a hex string — convert it yourself: parseInt("0xe24ee9", 16) = 14831337`,

  celloraTip:
`curl -s \\
  -H "Authorization: Bearer $CELLORA_KEY" \\
  https://api.cellora.dev/v1/stats | jq '{tip: .node_tip, lag: .lag_blocks}'
# Response: {"tip": 14831337, "lag": 2}  — plain decimal, no conversion needed`,

  // ── Migration: get a block ────────────────────────────────────────────────
  nodeBlock:
`# Block number must be hex-encoded before sending
curl -s http://localhost:8114 \\
  -H 'Content-Type: application/json' \\
  -d '{"id":1,"jsonrpc":"2.0","method":"get_block_by_number","params":["0xf4240"]}' | jq`,

  celloraBlock:
`# Pass the decimal number directly — no encoding
curl -s \\
  -H "Authorization: Bearer $CELLORA_KEY" \\
  https://api.cellora.dev/v1/blocks/1000000 | jq`,

  // ── Migration: live cells ─────────────────────────────────────────────────
  nodeCells:
`# Requires TWO running services:
#   - CKB full node on port 8114
#   - CKB indexer on port 8116 (separate binary, separate sync process)
#   see: https://github.com/nervosnetwork/ckb-indexer

curl -s http://localhost:8116 \\
  -H 'Content-Type: application/json' \\
  -d '{
    "id": 2,
    "jsonrpc": "2.0",
    "method": "get_cells",
    "params": [
      {
        "script": {
          "code_hash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9d5cefa3b...",
          "hash_type": "type",
          "args": "0xdeadbeef"
        },
        "script_type": "lock",
        "filter": null
      },
      "asc",
      "0x64"
    ]
  }' | jq`,

  celloraCells:
`# One service, one endpoint, no JSON-RPC envelope
curl -s \\
  -H "Authorization: Bearer $CELLORA_KEY" \\
  "https://api.cellora.dev/v1/cells?lock_hash=0x...&is_live=true&limit=100" | jq`,

  // ── Migration: JavaScript ─────────────────────────────────────────────────
  nodeJS:
`// Requires: CKB node on :8114 + CKB indexer on :8116

const NODE    = 'http://localhost:8114'
const INDEXER = 'http://localhost:8116'

const rpc = async (url, method, params = []) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: 1, jsonrpc: '2.0', method, params }),
  })
  const { result, error } = await res.json()
  if (error) throw new Error(error.message)
  return result
}

// Tip comes back as a hex string — must convert to decimal
const tip = parseInt(await rpc(NODE, 'get_tip_block_number'), 16)

// Block number must be hex-encoded before sending
const block = await rpc(NODE, 'get_block_by_number', ['0xf4240'])

// Live cells require the indexer RPC at a different port,
// a different request shape, and page size expressed as hex
const { objects: cells, last_cursor } = await rpc(INDEXER, 'get_cells', [
  {
    script: { code_hash: '0x9bd7...', hash_type: 'type', args: '0x...' },
    script_type: 'lock',
  },
  'asc',
  '0x64',
])`,

  celloraJS:
`// Requires: an API key from cellora-nuxt.vercel.app

const BASE = 'https://api.cellora.dev'
const KEY  = process.env.CELLORA_KEY

const get = (path) =>
  fetch(\`\${BASE}\${path}\`, {
    headers: { Authorization: \`Bearer \${KEY}\` },
  }).then((r) => r.json())

// Tip — plain decimal integer, no conversion
const { node_tip: tip } = await get('/v1/stats')

// Block — decimal number, no encoding
const block = await get('/v1/blocks/1000000')

// Live cells — no separate service, no RPC envelope
const { data: cells, next_cursor } = await get(
  '/v1/cells?lock_hash=0x...&is_live=true&limit=100',
)`,

  // ── Migration: Python ─────────────────────────────────────────────────────
  nodePython:
`# Requires: CKB node on :8114 + CKB indexer on :8116
import requests

NODE    = "http://localhost:8114"
INDEXER = "http://localhost:8116"

def rpc(url, method, params=None):
    r = requests.post(url, json={
        "id": 1, "jsonrpc": "2.0",
        "method": method, "params": params or [],
    })
    data = r.json()
    if "error" in data:
        raise RuntimeError(data["error"]["message"])
    return data["result"]

# Tip is a hex string — must convert
tip = int(rpc(NODE, "get_tip_block_number"), 16)

# Block number must be hex-encoded
block = rpc(NODE, "get_block_by_number", [hex(1_000_000)])

# Live cells — indexer at a different port, different RPC shape
result = rpc(INDEXER, "get_cells", [
    {
        "script": {"code_hash": "0x9bd7...", "hash_type": "type", "args": "0x..."},
        "script_type": "lock",
    },
    "asc", "0x64",
])
cells = result["objects"]`,

  celloraPython:
`# Requires: an API key from cellora-nuxt.vercel.app
import requests, os

BASE    = "https://api.cellora.dev"
HEADERS = {"Authorization": f"Bearer {os.environ['CELLORA_KEY']}"}

def get(path):
    return requests.get(f"{BASE}{path}", headers=HEADERS).json()

# Tip — plain decimal
tip = get("/v1/stats")["node_tip"]

# Block — decimal number, no encoding needed
block = get("/v1/blocks/1000000")

# Live cells — no indexer to run, no RPC wrapper
result = get("/v1/cells?lock_hash=0x...&is_live=true&limit=100")
cells, cursor = result["data"], result["next_cursor"]`,
}

// Pre-rendered HTML for CodeBlock — escaped first, then highlighted
// JavaScript and Python use plain escaping (no highlighter available)
const C = {
  exportKey:      hl.bash(e(RAW.exportKey)),
  firstRequest:   hl.bash(e(RAW.firstRequest)),
  authHeader:     hl.bash(e(RAW.authHeader)),
  health:         hl.bash(e(RAW.health)),
  healthResp:     hl.json(e(RAW.healthResp)),
  latest:         hl.bash(e(RAW.latest)),
  latestResp:     hl.json(e(RAW.latestResp)),
  blockNum:       hl.bash(e(RAW.blockNum)),
  cellsQuery:     hl.bash(e(RAW.cellsQuery)),
  cellsResp:      hl.json(e(RAW.cellsResp)),
  stats:          hl.bash(e(RAW.stats)),
  statsResp:      hl.json(e(RAW.statsResp)),
  gqlBasic:       hl.bash(e(RAW.gqlBasic)),
  gqlSchema:      hl.graphql(e(RAW.gqlSchema)),
  gqlCells:       hl.bash(e(RAW.gqlCells)),
  pagination:     hl.bash(e(RAW.pagination)),
  errorResp:      hl.json(e(RAW.errorResp)),
  // Migration
  nodeTip:        hl.bash(e(RAW.nodeTip)),
  celloraTip:     hl.bash(e(RAW.celloraTip)),
  nodeBlock:      hl.bash(e(RAW.nodeBlock)),
  celloraBlock:   hl.bash(e(RAW.celloraBlock)),
  nodeCells:      hl.bash(e(RAW.nodeCells)),
  celloraCells:   hl.bash(e(RAW.celloraCells)),
  nodeJS:         e(RAW.nodeJS),
  celloraJS:      e(RAW.celloraJS),
  nodePython:     e(RAW.nodePython),
  celloraPython:  e(RAW.celloraPython),
}
</script>

<template>
  <div class="docs">

    <!-- ── Left navigation ──────────────────────────────────────────────────── -->
    <nav class="docs__nav">
      <div class="docs__nav-group">
        <div class="micro docs__nav-label">Getting started</div>
        <a href="#why"            class="docs__nav-link" :class="{ 'docs__nav-link--active': activeSection === 'why' }">Why Cellora</a>
        <a href="#quickstart"     class="docs__nav-link" :class="{ 'docs__nav-link--active': activeSection === 'quickstart' }">Quickstart</a>
        <a href="#authentication" class="docs__nav-link" :class="{ 'docs__nav-link--active': activeSection === 'authentication' }">Authentication</a>
      </div>
      <div class="docs__nav-group">
        <div class="micro docs__nav-label">Migration</div>
        <a href="#migration"        class="docs__nav-link" :class="{ 'docs__nav-link--active': activeSection === 'migration' }">Replacing your node</a>
        <a href="#migration-js"     class="docs__nav-link" :class="{ 'docs__nav-link--active': activeSection === 'migration-js' }">JavaScript</a>
        <a href="#migration-python" class="docs__nav-link" :class="{ 'docs__nav-link--active': activeSection === 'migration-python' }">Python</a>
      </div>
      <div class="docs__nav-group">
        <div class="micro docs__nav-label">REST API</div>
        <a href="#health"         class="docs__nav-link" :class="{ 'docs__nav-link--active': activeSection === 'health' }">Health</a>
        <a href="#blocks-latest"  class="docs__nav-link" :class="{ 'docs__nav-link--active': activeSection === 'blocks-latest' }">Latest block</a>
        <a href="#block-number"   class="docs__nav-link" :class="{ 'docs__nav-link--active': activeSection === 'block-number' }">Block by number</a>
        <a href="#cells"          class="docs__nav-link" :class="{ 'docs__nav-link--active': activeSection === 'cells' }">Cells</a>
        <a href="#stats"          class="docs__nav-link" :class="{ 'docs__nav-link--active': activeSection === 'stats' }">Stats</a>
      </div>
      <div class="docs__nav-group">
        <div class="micro docs__nav-label">GraphQL</div>
        <a href="#graphql"        class="docs__nav-link" :class="{ 'docs__nav-link--active': activeSection === 'graphql' }">Overview</a>
        <a href="#gql-schema"     class="docs__nav-link" :class="{ 'docs__nav-link--active': activeSection === 'gql-schema' }">Schema</a>
        <a href="#gql-examples"   class="docs__nav-link" :class="{ 'docs__nav-link--active': activeSection === 'gql-examples' }">Examples</a>
      </div>
      <div class="docs__nav-group">
        <div class="micro docs__nav-label">Guides</div>
        <a href="#pagination"     class="docs__nav-link" :class="{ 'docs__nav-link--active': activeSection === 'pagination' }">Pagination</a>
        <a href="#rate-limiting"  class="docs__nav-link" :class="{ 'docs__nav-link--active': activeSection === 'rate-limiting' }">Rate Limiting</a>
        <a href="#errors"         class="docs__nav-link" :class="{ 'docs__nav-link--active': activeSection === 'errors' }">Error Handling</a>
      </div>
    </nav>

    <!-- ── Main content ─────────────────────────────────────────────────────── -->
    <div class="docs__main">

      <div class="docs__page-header">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px;">
          <Badge variant="brand" mono dot="pulse">live</Badge>
          <span class="mono" style="font-size: 12px; color: var(--text-dim)">REST + GraphQL · Mainnet + Pizza Testnet</span>
        </div>
        <h1 class="docs__title">API Reference</h1>
        <p class="docs__subtitle">
          Everything you need to query indexed CKB data. No node to run, no sync to wait for, no infrastructure to manage.
        </p>
        <div style="display: flex; gap: 10px; margin-top: 20px;">
          <Button variant="primary" size="md" @click="navigateTo('/app/explorer')">
            <template #leftIcon><Icon name="terminal" :size="14" /></template>
            Try it in the Explorer
          </Button>
          <Button variant="outline" size="md" @click="navigateTo('/app/keys')">
            <template #leftIcon><Icon name="key" :size="14" /></template>
            Get an API key
          </Button>
        </div>
      </div>

      <!-- ── Why Cellora ──────────────────────────────────────────────────── -->
      <section id="why" data-doc class="docs__section">
        <h2 class="docs__h2">Why Cellora</h2>
        <p class="docs__body">
          CKB's native JSON-RPC is a low-level interface built for node operators, not application developers.
          Getting useful data out of it means running a fully-synced node, a separate indexer service alongside it,
          and keeping both operational. That is weeks of setup before you write a single line of your application.
        </p>
        <p class="docs__body">
          Cellora indexes the chain for you and exposes the result over a clean REST and GraphQL API.
          You skip straight to building.
        </p>

        <div class="docs__compare">
          <div class="docs__compare-col docs__compare-col--before">
            <div class="docs__compare-head">
              <Badge variant="amber" mono size="sm">Running your own node</Badge>
            </div>
            <ul class="docs__compare-list">
              <li>100 GB+ of disk space, growing every day</li>
              <li>2 to 4 days to sync from genesis before your first query</li>
              <li>Maintain the node: upgrades, monitoring, crash recovery</li>
              <li>Run a second indexer service for cell queries (separate binary, separate port)</li>
              <li>Write and maintain your own pagination, filtering, and aggregation</li>
              <li>JSON-RPC only — hex-encoded numbers, no standard REST or GraphQL</li>
              <li>Separate infrastructure for Mainnet vs Testnet</li>
            </ul>
          </div>
          <div class="docs__compare-col docs__compare-col--after">
            <div class="docs__compare-head">
              <Badge variant="brand" mono size="sm">Cellora</Badge>
            </div>
            <ul class="docs__compare-list">
              <li>Zero disk space. Zero infrastructure</li>
              <li>Data available immediately — no sync step</li>
              <li>Fully managed. No ops burden whatsoever</li>
              <li>Cell queries by lock hash and type hash, built in, one endpoint</li>
              <li>Cursor-based pagination and live vs consumed filtering, built in</li>
              <li>REST and GraphQL, decimal numbers, works with any HTTP client</li>
              <li>Mainnet and Pizza Testnet on the same API, switched with one param</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- ── Quickstart ───────────────────────────────────────────────────── -->
      <section id="quickstart" data-doc class="docs__section">
        <h2 class="docs__h2">Quickstart</h2>
        <p class="docs__body">Three steps from zero to your first live query.</p>

        <div class="docs__steps">
          <div class="docs__step">
            <div class="docs__step-num">1</div>
            <div class="docs__step-body">
              <div class="docs__step-title">Create an API key</div>
              <p class="docs__step-desc">
                Sign in at the <a class="docs__link" href="/sign-in">dashboard</a>, navigate to <strong>API Keys</strong>,
                and click <strong>Create key</strong>. Choose a tier and network, then copy the full secret immediately.
                It is shown exactly once and cannot be recovered.
              </p>
            </div>
          </div>

          <div class="docs__step">
            <div class="docs__step-num">2</div>
            <div class="docs__step-body">
              <div class="docs__step-title">Export your key</div>
              <p class="docs__step-desc">Save it as an environment variable so you can reuse it across requests.</p>
              <UiCodeBlock :html="C.exportKey" :copy-value="RAW.exportKey" language="bash" />
            </div>
          </div>

          <div class="docs__step">
            <div class="docs__step-num">3</div>
            <div class="docs__step-body">
              <div class="docs__step-title">Make your first request</div>
              <p class="docs__step-desc">Query the latest indexed block. You should get a response in under 100 ms.</p>
              <UiCodeBlock :html="C.firstRequest" :copy-value="RAW.firstRequest" language="bash" />
            </div>
          </div>
        </div>
      </section>

      <!-- ── Authentication ───────────────────────────────────────────────── -->
      <section id="authentication" data-doc class="docs__section">
        <h2 class="docs__h2">Authentication</h2>
        <p class="docs__body">
          All data endpoints require a Bearer token in the <span class="mono docs__inline-code">Authorization</span> header.
          Your key was issued from the <a class="docs__link" href="/app/keys">API Keys</a> page.
        </p>
        <UiCodeBlock :html="C.authHeader" :copy-value="RAW.authHeader" language="bash" filename="request header" />

        <div class="docs__callout">
          <strong>Public paths (no auth required)</strong>
          <ul class="docs__callout-list">
            <li><span class="mono">GET /v1/health</span> and <span class="mono">GET /v1/health/ready</span></li>
            <li><span class="mono">GET /v1/openapi.json</span></li>
          </ul>
          Everything else returns <span class="mono">401 unauthorized</span> without a valid token.
          Unauthenticated requests to unknown routes also return 401, not 404, to avoid leaking the route surface.
        </div>
      </section>

      <!-- ── Migration ────────────────────────────────────────────────────── -->
      <section id="migration" data-doc class="docs__section">
        <h2 class="docs__h2">Replacing your local node</h2>
        <p class="docs__body">
          If you have been querying a local CKB node directly, this section shows you the exact Cellora
          equivalent for each operation. The pattern is consistent: replace the JSON-RPC call with a
          standard HTTP GET, drop the hex encoding, and remove the dependency on the local indexer service.
        </p>

        <!-- Check chain tip -->
        <h3 class="docs__h3">Check the chain tip</h3>
        <p class="docs__body">
          The CKB RPC returns the tip as a hex string. Cellora returns it as a plain decimal integer
          alongside the indexer lag, so you know not just the tip but how fresh your data is.
        </p>
        <div class="docs__side-by-side">
          <div>
            <div class="docs__side-label"><Badge variant="amber" mono size="sm">Before</Badge> CKB JSON-RPC</div>
            <UiCodeBlock :html="C.nodeTip" :copy-value="RAW.nodeTip" language="bash" />
          </div>
          <div>
            <div class="docs__side-label"><Badge variant="brand" mono size="sm">After</Badge> Cellora</div>
            <UiCodeBlock :html="C.celloraTip" :copy-value="RAW.celloraTip" language="bash" />
          </div>
        </div>

        <!-- Get a block -->
        <h3 class="docs__h3">Get a block by number</h3>
        <p class="docs__body">
          The CKB RPC requires the block number to be hex-encoded in the request payload.
          Cellora accepts the decimal number directly in the URL path.
        </p>
        <div class="docs__side-by-side">
          <div>
            <div class="docs__side-label"><Badge variant="amber" mono size="sm">Before</Badge> CKB JSON-RPC</div>
            <UiCodeBlock :html="C.nodeBlock" :copy-value="RAW.nodeBlock" language="bash" />
          </div>
          <div>
            <div class="docs__side-label"><Badge variant="brand" mono size="sm">After</Badge> Cellora</div>
            <UiCodeBlock :html="C.celloraBlock" :copy-value="RAW.celloraBlock" language="bash" />
          </div>
        </div>

        <!-- Query live cells -->
        <h3 class="docs__h3">Query live cells for a lock script</h3>
        <p class="docs__body">
          This is the operation that causes the most friction with a self-hosted setup.
          The CKB indexer is a separate binary you run alongside the node — it has its own sync process,
          its own port, and its own RPC format. If the indexer falls behind or crashes, your cell queries break
          independently of the node.
        </p>
        <p class="docs__body">
          With Cellora, cell queries are a single GET request to the same API you use for everything else.
        </p>
        <div class="docs__side-by-side">
          <div>
            <div class="docs__side-label"><Badge variant="amber" mono size="sm">Before</Badge> CKB indexer RPC</div>
            <UiCodeBlock :html="C.nodeCells" :copy-value="RAW.nodeCells" language="bash" />
          </div>
          <div>
            <div class="docs__side-label"><Badge variant="brand" mono size="sm">After</Badge> Cellora</div>
            <UiCodeBlock :html="C.celloraCells" :copy-value="RAW.celloraCells" language="bash" />
          </div>
        </div>
      </section>

      <!-- ── Migration: JavaScript ─────────────────────────────────────────── -->
      <section id="migration-js" data-doc class="docs__section">
        <h3 class="docs__h3">JavaScript / TypeScript</h3>
        <p class="docs__body">
          The before example below is the pattern most CKB JavaScript projects use today — a hand-rolled
          JSON-RPC helper, two service URLs, and manual hex conversion at every boundary.
          The after example is what replacing it with Cellora looks like.
        </p>
        <div class="docs__side-by-side">
          <div>
            <div class="docs__side-label"><Badge variant="amber" mono size="sm">Before</Badge> CKB RPC + indexer</div>
            <UiCodeBlock :html="C.nodeJS" :copy-value="RAW.nodeJS" language="javascript" />
          </div>
          <div>
            <div class="docs__side-label"><Badge variant="brand" mono size="sm">After</Badge> Cellora</div>
            <UiCodeBlock :html="C.celloraJS" :copy-value="RAW.celloraJS" language="javascript" />
          </div>
        </div>
        <div class="docs__callout" style="margin-top: 16px;">
          The <span class="mono">get()</span> helper above is all you need as a starting point.
          For production use, wrap it with your preferred HTTP client (axios, ky, got) and add
          retry logic that respects the <span class="mono">Retry-After</span> header on 429 responses.
        </div>
      </section>

      <!-- ── Migration: Python ─────────────────────────────────────────────── -->
      <section id="migration-python" data-doc class="docs__section">
        <h3 class="docs__h3">Python</h3>
        <div class="docs__side-by-side">
          <div>
            <div class="docs__side-label"><Badge variant="amber" mono size="sm">Before</Badge> CKB RPC + indexer</div>
            <UiCodeBlock :html="C.nodePython" :copy-value="RAW.nodePython" language="python" />
          </div>
          <div>
            <div class="docs__side-label"><Badge variant="brand" mono size="sm">After</Badge> Cellora</div>
            <UiCodeBlock :html="C.celloraPython" :copy-value="RAW.celloraPython" language="python" />
          </div>
        </div>
        <div class="docs__callout" style="margin-top: 16px;">
          For async Python, swap <span class="mono">requests</span> for <span class="mono">httpx</span> and
          await the calls. The Cellora API surface does not change — only the HTTP client does.
        </div>
      </section>

      <!-- ── REST: Health ─────────────────────────────────────────────────── -->
      <section id="health" data-doc class="docs__section">
        <h2 class="docs__h2">REST API</h2>
        <p class="docs__body">
          The base URL for all REST endpoints is <span class="mono docs__inline-code">https://api.cellora.dev</span>.
          All responses are JSON. Hashes are <span class="mono">0x</span>-prefixed lowercase hex throughout.
        </p>

        <div class="docs__endpoint-head">
          <Badge variant="neutral" mono>GET</Badge>
          <span class="mono docs__endpoint-path">/v1/health</span>
          <span class="docs__endpoint-desc">Liveness probe. Returns 200 if the process is running. No auth required.</span>
        </div>
        <UiCodeBlock :html="C.health" :copy-value="RAW.health" language="bash" />
        <UiCodeBlock :html="C.healthResp" :copy-value="RAW.healthResp" language="json" filename="response" />
      </section>

      <!-- ── REST: Latest block ───────────────────────────────────────────── -->
      <section id="blocks-latest" data-doc class="docs__section">
        <div class="docs__endpoint-head">
          <Badge variant="neutral" mono>GET</Badge>
          <span class="mono docs__endpoint-path">/v1/blocks/latest</span>
          <span class="docs__endpoint-desc">The highest-numbered block Cellora has indexed.</span>
        </div>
        <UiCodeBlock :html="C.latest" :copy-value="RAW.latest" language="bash" />
        <UiCodeBlock :html="C.latestResp" :copy-value="RAW.latestResp" language="json" filename="response" />
        <p class="docs__body" style="margin-top: 12px;">
          Returns <span class="mono">404 not_found</span> if the indexer has not yet written its first block.
        </p>
      </section>

      <!-- ── REST: Block by number ────────────────────────────────────────── -->
      <section id="block-number" data-doc class="docs__section">
        <div class="docs__endpoint-head">
          <Badge variant="neutral" mono>GET</Badge>
          <span class="mono docs__endpoint-path">/v1/blocks/{number}</span>
          <span class="docs__endpoint-desc">A specific block by its height.</span>
        </div>
        <UiCodeBlock :html="C.blockNum" :copy-value="RAW.blockNum" language="bash" />

        <div class="docs__param-table-wrap">
          <table class="docs__param-table">
            <thead><tr><th>Path param</th><th>Type</th><th>Notes</th></tr></thead>
            <tbody>
              <tr>
                <td class="mono">number</td>
                <td class="mono">integer</td>
                <td>Non-negative decimal integer. Returns 400 for non-numeric, negative, or overflowing values.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="docs__body">
          Returns <span class="mono">404 not_found</span> for blocks that have not been indexed yet.
        </p>
      </section>

      <!-- ── REST: Cells ──────────────────────────────────────────────────── -->
      <section id="cells" data-doc class="docs__section">
        <div class="docs__endpoint-head">
          <Badge variant="neutral" mono>GET</Badge>
          <span class="mono docs__endpoint-path">/v1/cells</span>
          <span class="docs__endpoint-desc">Paginated list of cells matching a lock or type script hash.</span>
        </div>
        <p class="docs__body">
          Exactly one of <span class="mono docs__inline-code">lock_hash</span> or <span class="mono docs__inline-code">type_hash</span> must be supplied.
          Both must be <span class="mono">0x</span>-prefixed 32-byte hex (64 hex characters after the prefix).
        </p>

        <div class="docs__param-table-wrap">
          <table class="docs__param-table">
            <thead><tr><th>Query param</th><th>Type</th><th>Default</th><th>Notes</th></tr></thead>
            <tbody>
              <tr>
                <td class="mono">lock_hash</td><td class="mono">string</td><td class="mono">—</td>
                <td>Required if <span class="mono">type_hash</span> is absent. 0x-prefixed 32-byte hex.</td>
              </tr>
              <tr>
                <td class="mono">type_hash</td><td class="mono">string</td><td class="mono">—</td>
                <td>Required if <span class="mono">lock_hash</span> is absent.</td>
              </tr>
              <tr>
                <td class="mono">is_live</td><td class="mono">boolean</td><td class="mono">—</td>
                <td><span class="mono">true</span> for unspent cells, <span class="mono">false</span> for consumed. Omit to return both.</td>
              </tr>
              <tr>
                <td class="mono">limit</td><td class="mono">integer</td><td class="mono">50</td>
                <td>Page size. Maximum 500.</td>
              </tr>
              <tr>
                <td class="mono">cursor</td><td class="mono">string</td><td class="mono">—</td>
                <td>Pass the <span class="mono">next_cursor</span> from the previous response to fetch the next page.</td>
              </tr>
              <tr>
                <td class="mono">include_data</td><td class="mono">boolean</td><td class="mono">false</td>
                <td>Include the raw cell data blob. Off by default since data can be large.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <UiCodeBlock :html="C.cellsQuery" :copy-value="RAW.cellsQuery" language="bash" />
        <UiCodeBlock :html="C.cellsResp" :copy-value="RAW.cellsResp" language="json" filename="response" />

        <div class="docs__callout">
          <strong>Common validation errors</strong>
          <ul class="docs__callout-list">
            <li>Supplying both or neither of <span class="mono">lock_hash</span> / <span class="mono">type_hash</span>: 400</li>
            <li>Hash not exactly 64 hex chars after the prefix: 400</li>
            <li><span class="mono">limit</span> of 0 or above 500: 400</li>
            <li>Malformed or tampered <span class="mono">cursor</span>: 400 <span class="mono">invalid_cursor</span></li>
          </ul>
        </div>
      </section>

      <!-- ── REST: Stats ──────────────────────────────────────────────────── -->
      <section id="stats" data-doc class="docs__section">
        <div class="docs__endpoint-head">
          <Badge variant="neutral" mono>GET</Badge>
          <span class="mono docs__endpoint-path">/v1/stats</span>
          <span class="docs__endpoint-desc">Indexer progress and chain lag. Served from an in-memory snapshot — safe to poll frequently.</span>
        </div>
        <UiCodeBlock :html="C.stats" :copy-value="RAW.stats" language="bash" />
        <UiCodeBlock :html="C.statsResp" :copy-value="RAW.statsResp" language="json" filename="response" />

        <div class="docs__param-table-wrap" style="margin-top: 16px;">
          <table class="docs__param-table">
            <thead><tr><th>Field</th><th>Notes</th></tr></thead>
            <tbody>
              <tr><td class="mono">indexer_tip</td><td>Highest block Cellora has fully indexed.</td></tr>
              <tr><td class="mono">node_tip</td><td>Current head of the CKB chain as seen by the node.</td></tr>
              <tr><td class="mono">lag_blocks</td><td>Difference between node tip and indexer tip. A lag of 0 to 5 is normal.</td></tr>
              <tr><td class="mono">is_stale</td><td><span class="mono">true</span> when the snapshot has not refreshed in the last 5 seconds. Indicates a connectivity issue between the API and Postgres or the CKB node.</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ── GraphQL overview ─────────────────────────────────────────────── -->
      <section id="graphql" data-doc class="docs__section">
        <h2 class="docs__h2">GraphQL</h2>
        <p class="docs__body">
          The GraphQL endpoint at <span class="mono docs__inline-code">POST /graphql</span> exposes the same data as the REST surface through a single typed schema.
          Auth is identical — send your Bearer token in the <span class="mono">Authorization</span> header.
          The rate limit bucket is separate from REST, so GraphQL and REST do not consume each other's quota.
        </p>
        <p class="docs__body">
          GraphQL errors use the standard protocol shape: a top-level <span class="mono">errors</span> array on a
          <span class="mono">200 OK</span> response. Auth failures (401) and rate limit refusals (429) still return
          their HTTP status codes with the REST error envelope — those checks happen before the GraphQL handler runs.
        </p>
        <UiCodeBlock :html="C.gqlBasic" :copy-value="RAW.gqlBasic" language="bash" filename="quick example" />
      </section>

      <section id="gql-schema" data-doc class="docs__section">
        <h3 class="docs__h3">Schema</h3>
        <UiCodeBlock :html="C.gqlSchema" :copy-value="RAW.gqlSchema" language="graphql" filename="schema (abridged)" />
      </section>

      <section id="gql-examples" data-doc class="docs__section">
        <h3 class="docs__h3">Querying cells with variables</h3>
        <p class="docs__body">
          Using variables instead of inline literals keeps queries reusable and prevents injection.
          Pass them as a separate <span class="mono">variables</span> object alongside the <span class="mono">query</span> field.
        </p>
        <UiCodeBlock :html="C.gqlCells" :copy-value="RAW.gqlCells" language="bash" />
      </section>

      <!-- ── Pagination ────────────────────────────────────────────────────── -->
      <section id="pagination" data-doc class="docs__section">
        <h2 class="docs__h2">Pagination</h2>
        <p class="docs__body">
          List endpoints return a <span class="mono docs__inline-code">next_cursor</span> field alongside the
          <span class="mono">data</span> array. When non-null, pass it back as <span class="mono">?cursor=...</span>
          to fetch the next page. A null <span class="mono">next_cursor</span> means you are on the last page.
          Cursors are opaque — do not parse or construct them.
        </p>
        <UiCodeBlock :html="C.pagination" :copy-value="RAW.pagination" language="bash" filename="walk all pages" />
      </section>

      <!-- ── Rate limiting ─────────────────────────────────────────────────── -->
      <section id="rate-limiting" data-doc class="docs__section">
        <h2 class="docs__h2">Rate Limiting</h2>
        <p class="docs__body">
          Limits are enforced per API key using a token bucket. REST and GraphQL have independent buckets.
        </p>

        <div class="docs__param-table-wrap">
          <table class="docs__param-table">
            <thead><tr><th>Tier</th><th>REST burst</th><th>REST refill</th><th>GraphQL burst</th><th>GraphQL refill</th></tr></thead>
            <tbody>
              <tr>
                <td><Badge variant="neutral" mono size="sm">free</Badge></td>
                <td class="mono">30</td><td class="mono">1 / sec</td><td class="mono">10</td><td class="mono">0.5 / sec</td>
              </tr>
              <tr>
                <td><Badge variant="blue" mono size="sm">starter</Badge></td>
                <td class="mono">300</td><td class="mono">20 / sec</td><td class="mono">100</td><td class="mono">10 / sec</td>
              </tr>
              <tr>
                <td><Badge variant="brand" mono size="sm">pro</Badge></td>
                <td class="mono">3,000</td><td class="mono">200 / sec</td><td class="mono">1,000</td><td class="mono">100 / sec</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 class="docs__h3">Response headers</h3>
        <div class="docs__param-table-wrap">
          <table class="docs__param-table">
            <thead><tr><th>Header</th><th>Present on</th><th>Value</th></tr></thead>
            <tbody>
              <tr><td class="mono">X-RateLimit-Limit</td><td>2xx</td><td>Bucket capacity for this key and surface.</td></tr>
              <tr><td class="mono">X-RateLimit-Remaining</td><td>2xx</td><td>Tokens remaining after this request.</td></tr>
              <tr><td class="mono">X-RateLimit-Reset</td><td>2xx, 429</td><td>Unix timestamp of the next bucket refill.</td></tr>
              <tr><td class="mono">Retry-After</td><td>429 only</td><td>Seconds to wait before retrying.</td></tr>
            </tbody>
          </table>
        </div>

        <div class="docs__callout">
          When you receive a 429, read <span class="mono">Retry-After</span> and wait that many seconds before retrying.
          For production workloads, implement exponential backoff with jitter rather than a fixed delay.
        </div>
      </section>

      <!-- ── Error handling ─────────────────────────────────────────────────── -->
      <section id="errors" data-doc class="docs__section">
        <h2 class="docs__h2">Error Handling</h2>
        <p class="docs__body">
          Every non-2xx REST response uses a single consistent envelope.
          Parse on <span class="mono">code</span> for programmatic handling; use <span class="mono">message</span> for display.
        </p>
        <UiCodeBlock :html="C.errorResp" :copy-value="RAW.errorResp" language="json" filename="error envelope" />

        <div class="docs__param-table-wrap" style="margin-top: 20px;">
          <table class="docs__param-table">
            <thead><tr><th>code</th><th>HTTP status</th><th>Meaning</th></tr></thead>
            <tbody>
              <tr><td class="mono">unauthorized</td><td class="mono">401</td><td>Missing, invalid, or revoked Bearer token.</td></tr>
              <tr><td class="mono">bad_request</td><td class="mono">400</td><td>Invalid parameters. Check <span class="mono">message</span> for specifics.</td></tr>
              <tr><td class="mono">invalid_cursor</td><td class="mono">400</td><td>The cursor value is malformed or tampered.</td></tr>
              <tr><td class="mono">not_found</td><td class="mono">404</td><td>The requested resource does not exist or has not been indexed yet.</td></tr>
              <tr><td class="mono">rate_limited</td><td class="mono">429</td><td>Token bucket empty. Respect the <span class="mono">Retry-After</span> header.</td></tr>
              <tr><td class="mono">upstream_unavailable</td><td class="mono">503</td><td>Cellora cannot reach the CKB node. Retry with backoff.</td></tr>
              <tr><td class="mono">internal</td><td class="mono">500</td><td>Unexpected server error. Include <span class="mono">x-request-id</span> when reporting.</td></tr>
            </tbody>
          </table>
        </div>

        <h3 class="docs__h3">The x-request-id header</h3>
        <p class="docs__body">
          Every response carries an <span class="mono docs__inline-code">x-request-id</span> header with a unique UUID.
          If you hit an unexpected error, include this value in your bug report.
          It lets the team find the exact request in server logs.
        </p>
      </section>

    </div>
  </div>
</template>

<style scoped>
.docs {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 48px;
  align-items: start;
}

.docs__nav {
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-top: 4px;
}
.docs__nav-group { display: flex; flex-direction: column; gap: 2px; }
.docs__nav-label { color: var(--text-dim); padding: 0 8px 6px; }
.docs__nav-link {
  display: block;
  padding: 5px 8px;
  font-size: 13px;
  color: var(--text-muted);
  border-radius: var(--radius-1);
  border-left: 2px solid transparent;
  transition: color 120ms, border-color 120ms, background 120ms;
}
.docs__nav-link:hover { color: var(--text); background: var(--surface-2); }
.docs__nav-link--active {
  color: var(--text);
  border-left-color: var(--net-accent);
  background: var(--surface-2);
}

.docs__page-header {
  padding-bottom: 36px;
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: 8px;
}
.docs__title {
  font-size: 30px; font-weight: 700;
  letter-spacing: -0.025em;
  margin: 0 0 10px;
  color: var(--text);
}
.docs__subtitle {
  font-size: 15px;
  color: var(--text-muted);
  line-height: 1.6;
  max-width: 600px;
  margin: 0;
}

.docs__section { padding: 36px 0 0; }
.docs__h2 {
  font-size: 20px; font-weight: 600;
  letter-spacing: -0.015em;
  margin: 0 0 14px;
  color: var(--text);
}
.docs__h3 {
  font-size: 14px; font-weight: 600;
  letter-spacing: -0.01em;
  margin: 24px 0 10px;
  color: var(--text);
}
.docs__body {
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-muted);
  margin: 0 0 14px;
  max-width: 680px;
}
.docs__link { color: var(--net-accent); text-decoration: underline; text-underline-offset: 2px; }
.docs__inline-code {
  font-family: var(--font-mono);
  font-size: 12.5px;
  background: var(--surface-2);
  border: 1px solid var(--border-subtle);
  padding: 1px 5px;
  border-radius: 4px;
  color: var(--text);
}

/* ── Comparison ──────────────────────────────────────────────────────────── */
.docs__compare {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 20px;
}
.docs__compare-col {
  border-radius: var(--radius-3);
  border: 1px solid var(--border-subtle);
  padding: 20px;
}
.docs__compare-col--before { background: var(--bg-elev); }
.docs__compare-col--after  { background: var(--surface); border-color: var(--net-accent); }
.docs__compare-head { margin-bottom: 14px; }
.docs__compare-list {
  margin: 0; padding: 0 0 0 16px;
  display: flex; flex-direction: column; gap: 8px;
  font-size: 13px; color: var(--text-muted); line-height: 1.5;
}
.docs__compare-col--after .docs__compare-list { color: var(--text); }

/* ── Side-by-side code blocks ────────────────────────────────────────────── */
.docs__side-by-side {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin: 14px 0;
}
.docs__side-label {
  display: flex; align-items: center; gap: 8px;
  font-size: 12px; color: var(--text-dim);
  margin-bottom: 6px;
  font-family: var(--font-mono);
}

/* ── Steps ───────────────────────────────────────────────────────────────── */
.docs__steps { display: flex; flex-direction: column; gap: 24px; margin-top: 20px; }
.docs__step { display: grid; grid-template-columns: 32px 1fr; gap: 16px; }
.docs__step-num {
  width: 32px; height: 32px;
  border-radius: 99px;
  background: var(--net-accent);
  color: var(--bg);
  font-size: 13px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.docs__step-title { font-size: 14px; font-weight: 600; margin-bottom: 6px; color: var(--text); }
.docs__step-desc { font-size: 13.5px; color: var(--text-muted); line-height: 1.6; margin: 0 0 12px; }

/* ── Endpoint header ─────────────────────────────────────────────────────── */
.docs__endpoint-head {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px;
  background: var(--bg-elev);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-2);
  margin-bottom: 10px;
}
.docs__endpoint-path { font-size: 13.5px; font-weight: 500; color: var(--text); }
.docs__endpoint-desc { font-size: 12.5px; color: var(--text-muted); }

/* ── Param tables ────────────────────────────────────────────────────────── */
.docs__param-table-wrap {
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-2);
  overflow: hidden;
  margin-bottom: 14px;
}
.docs__param-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.docs__param-table th {
  background: var(--bg-elev);
  padding: 8px 14px;
  text-align: left;
  font-size: 11px; font-weight: 500;
  text-transform: uppercase; letter-spacing: 0.06em;
  color: var(--text-dim);
  font-family: var(--font-mono);
  border-bottom: 1px solid var(--border-subtle);
}
.docs__param-table td {
  padding: 10px 14px;
  border-bottom: 1px solid var(--border-subtle);
  color: var(--text-muted);
  vertical-align: top;
  line-height: 1.5;
}
.docs__param-table tr:last-child td { border-bottom: none; }
.docs__param-table td.mono { color: var(--text); font-size: 12px; white-space: nowrap; }

/* ── Callout ─────────────────────────────────────────────────────────────── */
.docs__callout {
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  border-left: 3px solid var(--net-accent);
  border-radius: var(--radius-2);
  padding: 14px 16px;
  font-size: 13.5px;
  color: var(--text-muted);
  line-height: 1.6;
  margin-top: 14px;
}
.docs__callout strong { color: var(--text); display: block; margin-bottom: 8px; font-size: 13px; }
.docs__callout-list {
  margin: 8px 0 0;
  padding-left: 16px;
  display: flex; flex-direction: column; gap: 4px;
}
</style>
