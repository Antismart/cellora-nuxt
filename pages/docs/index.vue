<script setup lang="ts">
import { hl } from '~/utils/format'

definePageMeta({ layout: 'dashboard' })

// HTML-escape helper — prevents angle brackets in code snippets from
// breaking v-html inside CodeBlock
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

// ── Raw code strings (copy-safe, unescaped) ───────────────────────────────────
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
    error: {
      code: 'not_found',
      message: 'block not found',
      details: null,
    },
  }, null, 2),
}

// Pre-rendered HTML for CodeBlock — escaped first, then highlighted
const C = {
  exportKey:    hl.bash(e(RAW.exportKey)),
  firstRequest: hl.bash(e(RAW.firstRequest)),
  authHeader:   hl.bash(e(RAW.authHeader)),
  health:       hl.bash(e(RAW.health)),
  healthResp:   hl.json(e(RAW.healthResp)),
  latest:       hl.bash(e(RAW.latest)),
  latestResp:   hl.json(e(RAW.latestResp)),
  blockNum:     hl.bash(e(RAW.blockNum)),
  cellsQuery:   hl.bash(e(RAW.cellsQuery)),
  cellsResp:    hl.json(e(RAW.cellsResp)),
  stats:        hl.bash(e(RAW.stats)),
  statsResp:    hl.json(e(RAW.statsResp)),
  gqlBasic:     hl.bash(e(RAW.gqlBasic)),
  gqlSchema:    hl.graphql(e(RAW.gqlSchema)),
  gqlCells:     hl.bash(e(RAW.gqlCells)),
  pagination:   hl.bash(e(RAW.pagination)),
  errorResp:    hl.json(e(RAW.errorResp)),
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
          Getting useful data out of it means running your own fully-synced node, writing your own indexer,
          and keeping both operational. That is weeks of work before you write a single line of your application.
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
              <li>2 to 4 days to sync from genesis before you can query anything</li>
              <li>Maintain the node: upgrades, monitoring, crash recovery</li>
              <li>Write and maintain your own indexer for cell queries</li>
              <li>Implement your own pagination, filtering, and aggregation logic</li>
              <li>JSON-RPC only. No GraphQL, no cursor pagination, no REST</li>
              <li>Separate setup required for Mainnet vs Testnet</li>
            </ul>
          </div>
          <div class="docs__compare-col docs__compare-col--after">
            <div class="docs__compare-head">
              <Badge variant="brand" mono size="sm">Cellora</Badge>
            </div>
            <ul class="docs__compare-list">
              <li>Zero disk space. Zero infrastructure</li>
              <li>Data available immediately. No sync step</li>
              <li>Fully managed. No ops burden</li>
              <li>Cell queries by lock hash and type hash, built in</li>
              <li>Cursor-based pagination and live-vs-consumed filtering, built in</li>
              <li>REST and GraphQL. Works with any language or HTTP client</li>
              <li>Mainnet and Pizza Testnet on the same API</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- ── Quickstart ───────────────────────────────────────────────────── -->
      <section id="quickstart" data-doc class="docs__section">
        <h2 class="docs__h2">Quickstart</h2>
        <p class="docs__body">Three steps from zero to your first query.</p>

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
              <p class="docs__step-desc">Query the latest indexed block. You should see a response in under 100 ms.</p>
              <UiCodeBlock :html="C.firstRequest" :copy-value="RAW.firstRequest" language="bash" />
            </div>
          </div>
        </div>
      </section>

      <!-- ── Authentication ───────────────────────────────────────────────── -->
      <section id="authentication" data-doc class="docs__section">
        <h2 class="docs__h2">Authentication</h2>
        <p class="docs__body">
          All data endpoints require a Bearer token sent in the <span class="mono docs__inline-code">Authorization</span> header.
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
                <td>Non-negative integer. Returns 400 for non-numeric, negative, or overflowing values.</td>
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
                <td class="mono">lock_hash</td>
                <td class="mono">string</td>
                <td class="mono">—</td>
                <td>Required if <span class="mono">type_hash</span> is absent. 0x-prefixed 32-byte hex.</td>
              </tr>
              <tr>
                <td class="mono">type_hash</td>
                <td class="mono">string</td>
                <td class="mono">—</td>
                <td>Required if <span class="mono">lock_hash</span> is absent.</td>
              </tr>
              <tr>
                <td class="mono">is_live</td>
                <td class="mono">boolean</td>
                <td class="mono">—</td>
                <td><span class="mono">true</span> for unspent cells, <span class="mono">false</span> for consumed. Omit to return both.</td>
              </tr>
              <tr>
                <td class="mono">limit</td>
                <td class="mono">integer</td>
                <td class="mono">50</td>
                <td>Page size. Max 500.</td>
              </tr>
              <tr>
                <td class="mono">cursor</td>
                <td class="mono">string</td>
                <td class="mono">—</td>
                <td>Pass the <span class="mono">next_cursor</span> from the previous response to fetch the next page.</td>
              </tr>
              <tr>
                <td class="mono">include_data</td>
                <td class="mono">boolean</td>
                <td class="mono">false</td>
                <td>Include the raw cell data blob. Off by default since data can be large.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <UiCodeBlock :html="C.cellsQuery" :copy-value="RAW.cellsQuery" language="bash" />
        <UiCodeBlock :html="C.cellsResp" :copy-value="RAW.cellsResp" language="json" filename="response" />

        <div class="docs__callout">
          <strong>Common errors</strong>
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
          <span class="docs__endpoint-desc">Indexer progress and chain lag. Served from an in-memory snapshot — safe to poll frequently without hitting the database.</span>
        </div>
        <UiCodeBlock :html="C.stats" :copy-value="RAW.stats" language="bash" />
        <UiCodeBlock :html="C.statsResp" :copy-value="RAW.statsResp" language="json" filename="response" />

        <div class="docs__param-table-wrap" style="margin-top: 16px;">
          <table class="docs__param-table">
            <thead><tr><th>Field</th><th>Notes</th></tr></thead>
            <tbody>
              <tr><td class="mono">indexer_tip</td><td>Highest block Cellora has fully indexed.</td></tr>
              <tr><td class="mono">node_tip</td><td>Current head of the CKB chain as seen by the node.</td></tr>
              <tr><td class="mono">lag_blocks</td><td>Blocks between <span class="mono">indexer_tip</span> and <span class="mono">node_tip</span>. A small lag of 0 to 5 blocks is normal.</td></tr>
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
          Authentication is identical — send your Bearer token in the <span class="mono">Authorization</span> header.
          The rate limit bucket is separate from REST, so GraphQL and REST do not consume each other's quota.
        </p>
        <p class="docs__body">
          GraphQL errors follow the standard protocol shape: a top-level <span class="mono">errors</span> array on a
          <span class="mono">200 OK</span> response. Auth failures (401) and rate limit refusals (429) still return
          their HTTP status codes with the REST error envelope, because those checks happen before the GraphQL handler runs.
        </p>

        <UiCodeBlock :html="C.gqlBasic" :copy-value="RAW.gqlBasic" language="bash" filename="quick example" />
      </section>

      <!-- ── GraphQL schema ───────────────────────────────────────────────── -->
      <section id="gql-schema" data-doc class="docs__section">
        <h3 class="docs__h3">Schema</h3>
        <UiCodeBlock :html="C.gqlSchema" :copy-value="RAW.gqlSchema" language="graphql" filename="schema (abridged)" />
      </section>

      <!-- ── GraphQL examples ─────────────────────────────────────────────── -->
      <section id="gql-examples" data-doc class="docs__section">
        <h3 class="docs__h3">Querying cells with variables</h3>
        <p class="docs__body">
          Using variables instead of inline literals keeps queries reusable and prevents injection. Pass them
          as a separate <span class="mono">variables</span> object alongside the <span class="mono">query</span> field.
        </p>
        <UiCodeBlock :html="C.gqlCells" :copy-value="RAW.gqlCells" language="bash" />
      </section>

      <!-- ── Pagination ────────────────────────────────────────────────────── -->
      <section id="pagination" data-doc class="docs__section">
        <h2 class="docs__h2">Pagination</h2>
        <p class="docs__body">
          List endpoints return a <span class="mono docs__inline-code">next_cursor</span> field alongside the
          <span class="mono">data</span> array. When <span class="mono">next_cursor</span> is a non-null string,
          there are more results. Pass it back as <span class="mono">?cursor=...</span> to fetch the next page.
          A null <span class="mono">next_cursor</span> means you are on the last page.
        </p>
        <p class="docs__body">
          Cursors are opaque base64-encoded values. Do not parse or construct them yourself — they are an
          implementation detail and their internal format may change.
        </p>

        <h3 class="docs__h3">Walking all pages</h3>
        <UiCodeBlock :html="C.pagination" :copy-value="RAW.pagination" language="bash" />

        <div class="docs__callout">
          Start with a small <span class="mono">limit</span> (10 or 20) while building your integration,
          then raise it toward the maximum of <span class="mono">500</span> once you are confident in
          your processing loop. Large pages reduce round trips but increase per-request latency.
        </div>
      </section>

      <!-- ── Rate limiting ─────────────────────────────────────────────────── -->
      <section id="rate-limiting" data-doc class="docs__section">
        <h2 class="docs__h2">Rate Limiting</h2>
        <p class="docs__body">
          Limits are enforced per API key using a token bucket. REST and GraphQL have independent buckets,
          so heavy GraphQL usage does not affect your REST quota and vice versa.
        </p>

        <div class="docs__param-table-wrap">
          <table class="docs__param-table">
            <thead>
              <tr>
                <th>Tier</th>
                <th>REST burst</th>
                <th>REST refill</th>
                <th>GraphQL burst</th>
                <th>GraphQL refill</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><Badge variant="neutral" mono size="sm">free</Badge></td>
                <td class="mono">30</td><td class="mono">1 / sec</td>
                <td class="mono">10</td><td class="mono">0.5 / sec</td>
              </tr>
              <tr>
                <td><Badge variant="blue" mono size="sm">starter</Badge></td>
                <td class="mono">300</td><td class="mono">20 / sec</td>
                <td class="mono">100</td><td class="mono">10 / sec</td>
              </tr>
              <tr>
                <td><Badge variant="brand" mono size="sm">pro</Badge></td>
                <td class="mono">3,000</td><td class="mono">200 / sec</td>
                <td class="mono">1,000</td><td class="mono">100 / sec</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="docs__body">
          Burst is the bucket capacity: how many requests you can fire in rapid succession before the limiter activates.
          Refill is how fast the bucket recovers.
        </p>

        <h3 class="docs__h3">Response headers</h3>
        <div class="docs__param-table-wrap">
          <table class="docs__param-table">
            <thead><tr><th>Header</th><th>Present on</th><th>Value</th></tr></thead>
            <tbody>
              <tr>
                <td class="mono">X-RateLimit-Limit</td>
                <td>2xx</td>
                <td>Bucket capacity for this key and surface.</td>
              </tr>
              <tr>
                <td class="mono">X-RateLimit-Remaining</td>
                <td>2xx</td>
                <td>Tokens remaining after this request.</td>
              </tr>
              <tr>
                <td class="mono">X-RateLimit-Reset</td>
                <td>2xx, 429</td>
                <td>Unix timestamp (seconds) of the next bucket refill.</td>
              </tr>
              <tr>
                <td class="mono">Retry-After</td>
                <td>429 only</td>
                <td>Seconds until the bucket has at least one token. Respect this value in your retry logic.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="docs__callout">
          When you receive a 429, read the <span class="mono">Retry-After</span> header and wait that many seconds
          before retrying. Hammering the endpoint while rate-limited wastes your burst allocation once the bucket refills.
          Implement exponential backoff with jitter for production workloads.
        </div>
      </section>

      <!-- ── Error handling ─────────────────────────────────────────────────── -->
      <section id="errors" data-doc class="docs__section">
        <h2 class="docs__h2">Error Handling</h2>
        <p class="docs__body">
          Every non-2xx REST response uses a single consistent envelope. Parse on <span class="mono">code</span>
          for programmatic handling; use <span class="mono">message</span> for display.
        </p>
        <UiCodeBlock :html="C.errorResp" :copy-value="RAW.errorResp" language="json" filename="error envelope" />

        <div class="docs__param-table-wrap" style="margin-top: 20px;">
          <table class="docs__param-table">
            <thead><tr><th>code</th><th>HTTP status</th><th>Meaning</th></tr></thead>
            <tbody>
              <tr><td class="mono">unauthorized</td><td class="mono">401</td><td>Missing, invalid, or revoked Bearer token.</td></tr>
              <tr><td class="mono">bad_request</td><td class="mono">400</td><td>Invalid parameters. Check <span class="mono">message</span> for specifics.</td></tr>
              <tr><td class="mono">invalid_cursor</td><td class="mono">400</td><td>The cursor value is malformed or tampered.</td></tr>
              <tr><td class="mono">not_found</td><td class="mono">404</td><td>The requested resource does not exist or has not been indexed.</td></tr>
              <tr><td class="mono">rate_limited</td><td class="mono">429</td><td>Token bucket empty. Respect the <span class="mono">Retry-After</span> header.</td></tr>
              <tr><td class="mono">upstream_unavailable</td><td class="mono">503</td><td>Cellora cannot reach the CKB node. Retry with backoff.</td></tr>
              <tr><td class="mono">internal</td><td class="mono">500</td><td>Unexpected server error. Include the <span class="mono">x-request-id</span> header value when reporting.</td></tr>
            </tbody>
          </table>
        </div>

        <h3 class="docs__h3">The x-request-id header</h3>
        <p class="docs__body">
          Every response carries an <span class="mono docs__inline-code">x-request-id</span> header with a unique UUID.
          If you raise a support issue or file a bug report, include this value. It lets the team locate the exact
          request in server logs regardless of when it happened.
        </p>
      </section>

    </div>
  </div>
</template>

<style scoped>
/* ── Layout ──────────────────────────────────────────────────────────────── */
.docs {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 48px;
  align-items: start;
}

/* ── Left nav ────────────────────────────────────────────────────────────── */
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

/* ── Page header ─────────────────────────────────────────────────────────── */
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

/* ── Sections ────────────────────────────────────────────────────────────── */
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
