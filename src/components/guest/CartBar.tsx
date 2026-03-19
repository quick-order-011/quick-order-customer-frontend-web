import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '../../hooks/useCart'

interface CartBarProps {
  onOpen: () => void
  editing?: boolean
  onEdit?: () => void
  onSubmitUpdate?: () => void
}

export function CartBar({ onOpen, editing, onEdit, onSubmitUpdate }: CartBarProps) {
  const totalItems = useCartStore(s => s.totalItems())
  const totalPrice = useCartStore(s => s.totalPrice())
  const hasOrder = useCartStore(s => s.hasOrder())

  // Determine what to show
  let show = false
  let label = 'Naruci'
  let handler = onOpen

  if (hasOrder && !editing) {
    // After order, not editing → show "Azuriraj"
    show = true
    label = 'Azuriraj'
    handler = onEdit ?? onOpen
  } else if (hasOrder && editing) {
    // Editing mode → show "Azuriraj narudzbinu"
    show = true
    label = 'Azuriraj narudzbinu'
    handler = onSubmitUpdate ?? onOpen
  } else if (totalItems > 0) {
    // First order
    show = true
    label = 'Naruci'
    handler = onOpen
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed right-0 bottom-0 left-0 z-40 px-5 pb-5"
          style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom, 1.25rem))' }}
        >
          <button
            onClick={handler}
            className="flex w-full items-center justify-between rounded-2xl px-5 py-4 text-sm font-semibold transition-transform active:scale-[0.98]"
            style={{
              backgroundColor: 'var(--cart-bar)',
              color: 'var(--cart-bar-text)',
              fontFamily: 'var(--font-body)',
            }}
          >
            <span>{totalItems} {totalItems === 1 ? 'stavka' : 'stavki'}</span>
            <span className="font-bold">{label}</span>
            <span>{totalPrice} rsd</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
