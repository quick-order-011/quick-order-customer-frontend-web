import { useEffect, useRef } from 'react'
import { enterGuestSession } from '../lib/api'

/**
 * Registers the guest with AuthService on entry (QR scan) using the browser
 * fingerprint as the visitor id. Best-effort: a failure here must not block the
 * menu from rendering. Runs once per shop/table mount.
 */
export function useGuestSession(shopId: string, tableId: string) {
  const done = useRef(false)

  useEffect(() => {
    if (!shopId || !tableId || done.current) return
    done.current = true

    enterGuestSession(shopId, tableId).catch(err => {
      console.warn('[guest-session] entry failed:', err)
    })
  }, [shopId, tableId])
}
