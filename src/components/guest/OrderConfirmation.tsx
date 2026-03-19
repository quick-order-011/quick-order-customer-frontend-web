import { motion } from 'framer-motion'

interface OrderConfirmationProps {
  orderId: string
  estimatedMinutes: number
  onNewOrder: () => void
}

export function OrderConfirmation({
  orderId,
  estimatedMinutes,
  onNewOrder,
}: OrderConfirmationProps) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="mb-6 flex h-24 w-24 items-center justify-center rounded-full"
        style={{ backgroundColor: 'var(--success)' }}
      >
        <svg
          className="h-12 w-12 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-2 text-2xl font-bold"
        style={{ color: 'var(--text-1)', fontFamily: 'var(--font-display)' }}
      >
        Narudžbina primljena!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-1 text-sm"
        style={{ color: 'var(--text-2)', fontFamily: 'var(--font-body)' }}
      >
        Konobar dolazi uskoro.
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mb-8 text-xs"
        style={{ color: 'var(--text-muted)' }}
      >
        #{orderId} &middot; ~{estimatedMinutes} min
      </motion.p>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        onClick={onNewOrder}
        className="rounded-xl px-8 py-3 text-sm font-semibold transition-transform active:scale-95"
        style={{
          backgroundColor: 'var(--primary)',
          color: 'var(--primary-text)',
          fontFamily: 'var(--font-body)',
        }}
      >
        Naruči još
      </motion.button>
    </div>
  )
}
