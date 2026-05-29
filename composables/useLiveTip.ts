/**
 * Reactive clock that polls the real indexer tip from the backend.
 * Uses `useAsyncData` for SSR, and `setInterval` on the client.
 */
export const useLiveTip = () => {
  const { data: state } = useNuxtData('liveTip')
  
  useAsyncData('liveTip', () => $fetch('/v1/stats').catch(() => ({
      indexer_tip: 0,
      node_tip: 0,
      lag_blocks: 0,
      snapshot_age_seconds: 0,
      is_stale: true,
  })), {
    default: () => ({
      indexer_tip: 0,
      node_tip: 0,
      lag_blocks: 0,
      snapshot_age_seconds: 0,
      is_stale: false,
    })
  })

  if (import.meta.client) {
    let id: ReturnType<typeof setInterval> | null = null
    const fetchTip = async () => {
      try {
        const res: any = await $fetch('/v1/stats')
        if (state.value) {
          state.value.indexer_tip = res.indexer_tip ?? 0
          state.value.node_tip = res.node_tip ?? 0
          state.value.lag_blocks = res.lag_blocks ?? 0
          state.value.snapshot_age_seconds = res.snapshot_age_seconds ?? 0
          state.value.is_stale = res.is_stale ?? false
        }
      } catch (e) {
        if (state.value) state.value.is_stale = true
      }
    }

    onMounted(() => {
      id = setInterval(fetchTip, 2000)
    })
    onBeforeUnmount(() => {
      if (id) clearInterval(id)
    })
  }

  return state
}
