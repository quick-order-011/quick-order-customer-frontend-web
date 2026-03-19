import { motion, AnimatePresence } from 'framer-motion'
import type { OrderStatus } from '../../hooks/useOrderSocket'

interface OrderConfirmationProps {
  orderId: string
  status: OrderStatus
  onNewOrder: () => void
}

const STATUS_CONFIG: Record<string, { icon: string; title: string; subtitle: string; color: string }> = {
  submitted: {
    icon: '📋',
    title: 'Narudžbina primljena!',
    subtitle: 'Čekamo potvrdu od konobara...',
    color: 'var(--primary)',
  },
  inprogress: {
    icon: '👨‍🍳',
    title: 'Priprema se...',
    subtitle: 'Vaša narudžbina je u pripremi.',
    color: 'var(--primary)',
  },
  prepared: {
    icon: '✅',
    title: 'Narudžbina je spremna!',
    subtitle: 'Konobar donosi vašu narudžbinu.',
    color: 'var(--success)',
  },
  delivered: {
    icon: '🍽️',
    title: 'Prijatno!',
    subtitle: 'Vaša narudžbina je isporučena.',
    color: 'var(--success)',
  },
}

export function OrderConfirmation({ orderId, status, onNewOrder }: OrderConfirmationProps) {
  const config = STATUS_CONFIG[status ?? 'submitted'] ?? STATUS_CONFIG.submitted

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="flex flex-col items-center"
        >
          {/* Icon */}
          <div
            className="mb-6 flex h-24 w-24 items-center justify-center rounded-full text-4xl"
            style={{ backgroundColor: config.color, opacity: 0.15 }}
          >
            <span style={{ opacity: 1 }}>{config.icon}</span>
          </div>

          {/* Status indicator dots */}
          <div className="mb-6 flex gap-2">
            {['submitted', 'inprogress', 'prepared', 'delivered'].map((step) => {
              const steps = ['submitted', 'inprogress', 'prepared', 'delivered']
              const currentIdx = steps.indexOf(status ?? 'submitted')
              const stepIdx = steps.indexOf(step)
              const isActive = stepIdx <= currentIdx

              return (
                <div
                  key={step}
                  className="h-2 w-8 rounded-full transition-colors duration-500"
                  style={{
                    backgroundColor: isActive ? config.color : 'var(--border)',
                  }}
                />
              )
            })}
          </div>

          <h1
            className="mb-2 text-2xl font-bold"
            style={{ color: 'var(--text-1)', fontFamily: 'var(--font-display)' }}
          >
            {config.title}
          </h1>

          <p
            className="mb-1 text-sm"
            style={{ color: 'var(--text-2)', fontFamily: 'var(--font-body)' }}
          >
            {config.subtitle}
          </p>

          <p className="mb-8 text-xs" style={{ color: 'var(--text-muted)' }}>
            #{orderId}
          </p>

          {/* Show "order more" button only when delivered */}
          {(status === 'delivered' || status === 'prepared') && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
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
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
