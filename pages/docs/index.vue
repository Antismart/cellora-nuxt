<script setup lang="ts">
import { hl } from '~/utils/format'

definePageMeta({ layout: 'dashboard' })

const e = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// ── Active-section tracking ───────────────────────────────────────────────────
const activeSection = ref('quickstart')
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
`// Before: CKB node on :8114 + CKB indexer on :8116
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

// Tip comes back as a hex string — must convert
const tip = parseInt(await rpc(NODE, 'get_tip_block_number'), 16)

// Block number must be hex-encoded before sending
const block = await rpc(NODE, 'get_block_by_number', ['0xf4240'])

// Cells require the indexer at a different port + hex page size
const { objects: cells } = await rpc(INDEXER, 'get_cells', [
  { script: { code_hash: '0x9bd7...', hash_type: 'type', args: '0x...' }, script_type: 'lock' },
  'asc', '0x64',
])`,

  celloraJS:
`// After: just an API key
const BASE = 'https://api.cellora.dev'
const KEY  = process.env.CELLORA_KEY

const get = (path) =>
  fetch(\`\${BASE}\${path}\`, {
    headers: { Authorization: \`Bearer \${KEY}\` },
  }).then((r) => r.json())

// Decimal integer, no conversion
const { node_tip: tip } = await get('/v1/stats')

// Decimal number in the URL, no encoding
const block = await get('/v1/blocks/1000000')

// Same endpoint as everything else
const { data: cells, next_cursor } = await get(
  '/v1/cells?lock_hash=0x...&is_live=true&limit=100',
)`,

  // ── Migration: Python ─────────────────────────────────────────────────────
  nodePython:
`# Before: CKB node on :8114 + CKB indexer on :8116
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

# Cells require the indexer at a different port
result = rpc(INDEXER, "get_cells", [
    {"script": {"code_hash": "0x9bd7...", "hash_type": "type", "args": "0x..."}, "script_type": "lock"},
    "asc", "0x64",
])
cells = result["objects"]`,

  celloraPython:
`# After: just an API key
import requests, os

BASE    = "https://api.cellora.dev"
HEADERS = {"Authorization": f"Bearer {os.environ['CELLORA_KEY']}"}

def get(path):
    return requests.get(f"{BASE}{path}", headers=HEADERS).json()

# Plain decimal
tip = get("/v1/stats")["node_tip"]

# Decimal number, no encoding
block = get("/v1/blocks/1000000")

# No separate indexer service
result = get("/v1/cells?lock_hash=0x...&is_live=true&limit=100")
cells, cursor = result["data"], result["next_cursor"]`,
}

// Pre-rendered HTML for CodeBlock
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
        <a href="#quickstart"     class="docs__nav-link" :class="{ 'docs__nav-link--active': activeSection === 'quickstart' }">Quickstart</a>
        <a href="#the-switch"     class="docs__nav-link" :class="{ 'docs__nav-link--active': activeSection === 'the-switch' }">The switch</a>
        <a href="#authentication" class="docs__nav-link" :class="{ 'docs__nav-link--active': activeSection === 'authentication' }">Authentication</a>
      </div>
      <div class="docs__nav-group">
        <div class="micro docs__nav-label">Code examples</div>
        <a href="#migration"        class="docs__nav-link" :class="{ 'docs__nav-link--active': activeSection === 'migration' }">curl</a>
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
        <h1 class="docs__title">Your API key is your node</h1>
        <p class="docs__subtitle">
          You used to run a CKB node and wait days for it to sync. With Cellora, you get an API key
          and start querying in minutes. This page shows you exactly what changes in your code.
        </p>
        <div style="display: flex; gap: 10px; margin-top: 20px;">
          <Button variant="primary" size="md" @click="navigateTo('/app/explorer')">
            <template #leftIcon><Icon name="terminal" :size="14" /></template>
            Try in the Explorer
          </Button>
          <Button variant="outline" size="md" @click="navigateTo('/app/keys')">
            <template #leftIcon><Icon name="key" :size="14" /></template>
            Get an API key
          </Button>
        </div>
      </div>

      <!-- ── Quickstart ───────────────────────────────────────────────────── -->
      <section id="quickstart" data-doc class="docs__section">
        <h2 class="docs__h2">Quickstart</h2>
        <p class="docs__body">
          No node to run. No indexer to sync. No disk space to provision.
          Sign up, get a key, and you are querying live CKB data in three steps.
        </p>

        <div class="docs__steps">
          <div class="docs__step">
            <div class="docs__step-num">1</div>
            <div class="docs__step-body">
              <div class="docs__step-title">Get your API key</div>
              <p class="docs__step-desc">
                Sign in at the <a class="docs__link" href="/sign-in">dashboard</a>, go to <strong>API Keys</strong>,
                and click <strong>Create key</strong>. Copy the full secret immediately — it is shown exactly once.
              </p>
            </div>
          </div>

          <div class="docs__step">
            <div class="docs__step-num">2</div>
            <div class="docs__step-body">
              <div class="docs__step-title">Export it as an environment variable</div>
              <UiCodeBlock :html="C.exportKey" :copy-value="RAW.exportKey" language="bash" />
            </div>
          </div>

          <div class="docs__step">
            <div class="docs__step-num">3</div>
            <div class="docs__step-body">
              <div class="docs__step-title">Make your first request</div>
              <p class="docs__step-desc">That's it. No syncing, no setup, no ports to open.</p>
              <UiCodeBlock :html="C.firstRequest" :copy-value="RAW.firstRequest" language="bash" />
            </div>
          </div>
        </div>
      </section>

      <!-- ── The switch ─────────────────────────────────────────────────────── -->
      <section id="the-switch" data-doc class="docs__section">
        <h2 class="docs__h2">The switch</h2>
        <p class="docs__body">
          If you have existing code that talks to a local CKB node, this is everything that changes.
          Nothing else in your application needs to move.
        </p>

        <div class="docs__switch-table-wrap">
          <table class="docs__switch-table">
            <thead>
              <tr>
                <th>What you had with a local node</th>
                <th>What you do with Cellora</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <span class="mono docs__switch-before">http://localhost:8114</span>
                  <span class="docs__switch-note">CKB full node, weeks to sync, 100 GB disk</span>
                </td>
                <td>
                  <span class="mono docs__switch-after">https://api.cellora.dev</span>
                  <span class="docs__switch-note">Already synced, nothing to run</span>
                </td>
              </tr>
              <tr>
                <td>
                  <span class="mono docs__switch-before">http://localhost:8116</span>
                  <span class="docs__switch-note">CKB indexer — a second binary to run and keep synced</span>
                </td>
                <td>
                  <span class="mono docs__switch-after">https://api.cellora.dev</span>
                  <span class="docs__switch-note">Same base URL — cell queries are built in</span>
                </td>
              </tr>
              <tr>
                <td>
                  <span class="mono docs__switch-before">No auth header</span>
                  <span class="docs__switch-note">Requests worked on localhost without authentication</span>
                </td>
                <td>
                  <span class="mono docs__switch-after">Authorization: Bearer $CELLORA_KEY</span>
                  <span class="docs__switch-note">Add this one header to every request</span>
                </td>
              </tr>
              <tr>
                <td>
                  <span class="mono docs__switch-before">"0xf4240"</span>
                  <span class="docs__switch-note">Block numbers hex-encoded in JSON-RPC params</span>
                </td>
                <td>
                  <span class="mono docs__switch-after">/v1/blocks/1000000</span>
                  <span class="docs__switch-note">Decimal integers in the URL path — no conversion</span>
                </td>
              </tr>
              <tr>
                <td>
                  <span class="mono docs__switch-before">POST with JSON-RPC envelope</span>
                  <span class="docs__switch-note">Every call wrapped in <span class="mono">{"jsonrpc":"2.0","method":"..."}</span></span>
                </td>
                <td>
                  <span class="mono docs__switch-after">GET with query params</span>
                  <span class="docs__switch-note">Standard REST — works with any HTTP client, no wrapper needed</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="docs__callout" style="margin-top: 0;">
          <strong>Testnet vs Mainnet</strong>
          You do not need different base URLs for different networks. Your key is scoped to one network
          at creation time. Mainnet keys hit the mainnet chain. Pizza Testnet keys hit the testnet chain.
          Same API, same endpoints, same code — just a different key.
        </div>
      </section>

      <!-- ── Authentication ───────────────────────────────────────────────── -->
      <section id="authentication" data-doc class="docs__section">
        <h2 class="docs__h2">Authentication</h2>
        <p class="docs__body">
          Send your key as a Bearer token in the <span class="mono docs__inline-code">Authorization</span> header
          on every request. That is the only change you need to make to your HTTP client setup.
        </p>
        <UiCodeBlock :html="C.authHeader" :copy-value="RAW.authHeader" language="bash" filename="request header" />

        <div class="docs__callout">
          <strong>Public paths (no key required)</strong>
          <ul class="docs__callout-list">
            <li><span class="mono">GET /v1/health</span> and <span class="mono">GET /v1/health/ready</span></li>
            <li><span class="mono">GET /v1/openapi.json</span></li>
          </ul>
          Everything else returns <span class="mono">401 unauthorized</span> without a valid token.
        </div>
      </section>

      <!-- ── Code examples: curl ─────────────────────────────────────────── -->
      <section id="migration" data-doc class="docs__section">
        <h2 class="docs__h2">Code examples</h2>
        <p class="docs__body">
          The following examples show the exact CKB node or indexer call alongside its Cellora equivalent,
          for the three operations developers reach for most often.
        </p>

        <h3 class="docs__h3">Check the chain tip</h3>
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

        <h3 class="docs__h3">Get a block by number</h3>
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

        <h3 class="docs__h3">Query live cells for a lock script</h3>
        <p class="docs__body">
          The CKB indexer is a separate binary that runs alongside the node on its own port.
          If it falls behind or crashes, your cell queries break independently of the node.
          With Cellora, cell queries are a single GET on the same base URL as everything else.
        </p>
        <div class="docs__side-by-side">
          <div>
            <div class="docs__side-label"><Badge variant="amber" mono size="sm">Before</Badge> CKB indexer RPC · port 8116</div>
            <UiCodeBlock :html="C.nodeCells" :copy-value="RAW.nodeCells" language="bash" />
          </div>
          <div>
            <div class="docs__side-label"><Badge variant="brand" mono size="sm">After</Badge> Cellora</div>
            <UiCodeBlock :html="C.celloraCells" :copy-value="RAW.celloraCells" language="bash" />
          </div>
        </div>
      </section>

      <!-- ── Code examples: JavaScript ──────────────────────────────────── -->
      <section id="migration-js" data-doc class="docs__section">
        <h3 class="docs__h3">JavaScript / TypeScript</h3>
        <p class="docs__body">
          Replace the hand-rolled JSON-RPC helper and two service URLs with a single
          <span class="mono docs__inline-code">get()</span> function that attaches your key.
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
          The <span class="mono">get()</span> helper above is all you need to get started.
          For production, wrap it with your preferred HTTP client and add retry logic that respects
          the <span class="mono">Retry-After</span> header on 429 responses.
        </div>
      </section>

      <!-- ── Code examples: Python ──────────────────────────────────────── -->
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
          await the calls. The Cellora API surface does not change.
        </div>
      </section>

      <!-- ── REST: Health ─────────────────────────────────────────────────── -->
      <section id="health" data-doc class="docs__section">
        <h2 class="docs__h2">REST API reference</h2>
        <p class="docs__body">
          Base URL: <span class="mono docs__inline-code">https://api.cellora.dev</span>.
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
          <span class="docs__endpoint-desc">A specific block by its height (decimal integer).</span>
        </div>
        <UiCodeBlock :html="C.blockNum" :copy-value="RAW.blockNum" language="bash" />

        <div class="docs__param-table-wrap">
          <table class="docs__param-table">
            <thead><tr><th>Path param</th><th>Type</th><th>Notes</th></tr></thead>
            <tbody>
              <tr>
                <td class="mono">number</td>
                <td class="mono">integer</td>
                <td>Non-negative decimal integer. Returns 400 for non-numeric or negative values.</td>
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
              <tr><td class="mono">is_stale</td><td><span class="mono">true</span> when the snapshot has not refreshed in the last 5 seconds. Indicates a connectivity issue.</td></tr>
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
        <UiCodeBlock :html="C.gqlBasic" :copy-value="RAW.gqlBasic" language="bash" filename="quick example" />
      </section>

      <section id="gql-schema" data-doc class="docs__section">
        <h3 class="docs__h3">Schema</h3>
        <UiCodeBlock :html="C.gqlSchema" :copy-value="RAW.gqlSchema" language="graphql" filename="schema (abridged)" />
      </section>

      <section id="gql-examples" data-doc class="docs__section">
        <h3 class="docs__h3">Querying cells with variables</h3>
        <p class="docs__body">
          Use variables instead of inline literals to keep queries reusable and prevent injection.
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
          If you hit an unexpected error, include this value in your bug report so the team can find the exact request in server logs.
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

/* ── The switch table ────────────────────────────────────────────────────── */
.docs__switch-table-wrap {
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-3);
  overflow: hidden;
  margin-bottom: 16px;
}
.docs__switch-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.docs__switch-table thead tr {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.docs__switch-table th {
  padding: 10px 16px;
  font-size: 11px; font-weight: 500;
  text-transform: uppercase; letter-spacing: 0.06em;
  font-family: var(--font-mono);
  text-align: left;
  border-bottom: 1px solid var(--border-subtle);
}
.docs__switch-table th:first-child {
  background: var(--bg-elev);
  color: var(--amber);
  border-right: 1px solid var(--border-subtle);
}
.docs__switch-table th:last-child {
  background: var(--bg-elev);
  color: var(--net-accent);
}
.docs__switch-table tbody tr {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-bottom: 1px solid var(--border-subtle);
}
.docs__switch-table tbody tr:last-child { border-bottom: none; }
.docs__switch-table td {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  vertical-align: top;
}
.docs__switch-table td:first-child {
  border-right: 1px solid var(--border-subtle);
  background: var(--bg-base);
}
.docs__switch-table td:last-child {
  background: var(--surface);
}
.docs__switch-before {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--amber);
}
.docs__switch-after {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--net-accent);
}
.docs__switch-note {
  font-size: 12px;
  color: var(--text-dim);
  line-height: 1.4;
}

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
