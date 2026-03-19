import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '../../hooks/useCart'

interface CartBarProps {
  onOpen: () => void
}

export function CartBar({ onOpen }: CartBarProps) {
  const totalItems = useCartStore(s => s.totalItems())
  const totalPrice = useCartStore(s => s.totalPrice())

  return (
    <AnimatePresence>
      {totalItems > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed right-0 bottom-0 left-0 z-40"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <button
            onClick={onOpen}
            className="mx-4 mb-4 flex w-[calc(100%-2rem)] items-center justify-between rounded-2xl px-5 py-4 text-sm font-semibold active:scale-[0.98] transition-transform"
            style={{
              backgroundColor: 'var(--cart-bar)',
              color: 'var(--cart-bar-text)',
              fontFamily: 'var(--font-body)',
            }}
          >
            <span>{totalItems} {totalItems === 1 ? 'stavka' : 'stavki'}</span>
            <span>{totalPrice} rsd</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
