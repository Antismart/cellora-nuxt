import type { NetworkId } from '~/utils/data'

/**
 * Shared network state, persisted to localStorage on the client.
 * useState gives us a single SSR-safe ref across components.
 */
export const useNetwork = () => {
  const network = useState<NetworkId>('cellora.network', () => 'mainnet')

  if (import.meta.client) {
    onMounted(() => {
      try {
        const stored = localStorage.getItem('cellora.network') as NetworkId | null
        if (stored === 'mainnet' || stored === 'testnet') network.value = stored
      } catch {}
    })
    watch(network, (v) => {
      try { localStorage.setItem('cellora.network', v) } catch {}
    })
  }

  return network
}
