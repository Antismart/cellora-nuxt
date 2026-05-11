import { TIP_BASE } from '~/utils/data'

const startedAt = Date.now()

/**
 * Reactive clock that models indexer chasing node tip with ~3-block lag.
 * Ticks roughly every 1.1s on the client. Server returns a stable initial value.
 */
export const useLiveTip = () => {
  const tick = ref(0)

  if (import.meta.client) {
    let id: ReturnType<typeof setInterval> | null = null
    onMounted(() => {
      id = setInterval(() => (tick.value += 1), 1100)
    })
    onBeforeUnmount(() => {
      if (id) clearInterval(id)
    })
  }

  const state = computed(() => {
    void tick.value
    const elapsed = import.meta.client ? Math.floor((Date.now() - startedAt) / 1100) : 0
    const node_tip = TIP_BASE + elapsed
    const indexer_tip = Math.max(node_tip - 3, TIP_BASE - 3)
    return {
      indexer_tip,
      node_tip,
      lag_blocks: node_tip - indexer_tip,
      snapshot_age_seconds: 5,
      is_stale: false,
    }
  })

  return state
}
