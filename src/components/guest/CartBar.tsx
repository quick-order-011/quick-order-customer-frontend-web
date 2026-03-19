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
          className="fixed right-0 bottom-0 left-0 z-40 px-5 pb-5"
          style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom, 1.25rem))' }}
        >
          <button
            onClick={onOpen}
            className="flex w-full items-center justify-between rounded-2xl px-5 py-4 text-sm font-semibold transition-transform active:scale-[0.98]"
            style={{
              backgroundColor: 'var(--cart-bar)',
              color: 'var(--cart-bar-text)',
              fontFamily: 'var(--font-body)',
            }}
          >
            <span>{totalItems} {totalItems === 1 ? 'stavka' : 'stavki'}</span>
            <span className="font-bold">Naruči</span>
            <span>{totalPrice} rsd</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
