import { useCallback } from 'react'
import { sileo } from 'sileo'

interface OrderTrackingOptions {
  orderId: string
  estimatedMinutes: number
}

export function useOrderTracking() {
  const startTracking = useCallback(({ orderId, estimatedMinutes }: OrderTrackingOptions) => {
    // Stage 1: Primljeno (immediate — shown via promise in submit)

    // Stage 2: Priprema se (~30% of estimated time)
    const prepDelay = Math.round(estimatedMinutes * 0.3 * 60 * 1000)
    setTimeout(() => {
      sileo.info({
        title: 'Narudžbina se priprema',
        description: `#${orderId} — vaša narudžbina je u pripremi.`,
      })
    }, prepDelay)

    // Stage 3: Konobar nosi (~70% of estimated time)
    const deliveryDelay = Math.round(estimatedMinutes * 0.7 * 60 * 1000)
    setTimeout(() => {
      sileo.info({
        title: 'Konobar je na putu',
        description: `#${orderId} — narudžbina stiže za par trenutaka!`,
      })
    }, deliveryDelay)

    // Stage 4: Isporučeno (100% of estimated time)
    const doneDelay = estimatedMinutes * 60 * 1000
    setTimeout(() => {
      sileo.success({
        title: 'Narudžbina isporučena!',
        description: `#${orderId} — prijatno! 🍽️`,
      })
    }, doneDelay)
  }, [])

  return { startTracking }
}
