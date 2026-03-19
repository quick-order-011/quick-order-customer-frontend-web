import { useState } from 'react'
import { motion } from 'framer-motion'
import { useCartStore } from '../../hooks/useCart'

interface CartDrawerProps {
  onClose: () => void
  onSubmit: (note?: string) => void
  isSubmitting: boolean
}

export function CartDrawer({ onClose, onSubmit, isSubmitting }: CartDrawerProps) {
  const { items, update, remove, totalPrice, hasOrder, submittedItems } = useCartStore()
  const [note, setNote] = useState('')
  const isUpdate = hasOrder()

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50"
        onClick={onClose}
      />

      {/* Drawer */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.y > 100) onClose()
        }}
        className="fixed right-0 bottom-0 left-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl"
        style={{
          backgroundColor: 'var(--bg)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center py-3">
          <div
            className="h-1 w-10 rounded-full"
            style={{ backgroundColor: 'var(--border)' }}
          />
        </div>

        <div className="px-4 pb-4">
          <h2
            className="mb-4 text-lg font-bold"
            style={{ color: 'var(--text-1)', fontFamily: 'var(--font-display)' }}
          >
            Vaša narudžbina
          </h2>

          {/* Items */}
          <div className="flex flex-col gap-3">
            {items.map(({ menuItem, quantity }) => {
              const prev = submittedItems.find(s => s.menuItem.id === menuItem.id)
              const isNew = isUpdate && !prev
              const isChanged = isUpdate && prev && prev.quantity !== quantity

              return (
              <div
                key={menuItem.id}
                className="flex items-center gap-3 rounded-xl p-3"
                style={{
                  backgroundColor: 'var(--surface)',
                  border: isNew ? '1px solid var(--primary)' : '1px solid var(--border)',
                }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p
                      className="text-sm font-medium"
                      style={{ color: 'var(--text-1)', fontFamily: 'var(--font-body)' }}
                    >
                      {menuItem.name}
                    </p>
                    {isNew && (
                      <span className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-text)' }}>
                        novo
                      </span>
                    )}
                    {isChanged && (
                      <span className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: 'var(--surface-hover)', color: 'var(--text-2)' }}>
                        izmenjeno
                      </span>
                    )}
                  </div>
                  <p
                    className="text-xs"
                    style={{ color: 'var(--text-2)' }}
                  >
                    {menuItem.price} rsd
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => update(menuItem.id, quantity - 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold active:scale-90"
                    style={{
                      backgroundColor: 'var(--surface-hover)',
                      color: 'var(--text-1)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    −
                  </button>
                  <span
                    className="min-w-[1.25rem] text-center text-sm font-bold"
                    style={{ color: 'var(--text-1)' }}
                  >
                    {quantity}
                  </span>
                  <button
                    onClick={() => update(menuItem.id, quantity + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold active:scale-90"
                    style={{
                      backgroundColor: 'var(--primary)',
                      color: 'var(--primary-text)',
                    }}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => remove(menuItem.id)}
                  className="ml-1 text-xs active:scale-90"
                  style={{ color: 'var(--error)' }}
                  aria-label={`Ukloni ${menuItem.name}`}
                >
                  ✕
                </button>
              </div>
              )
            })}
          </div>

          {/* Note */}
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Napomena za kuhinju (opciono)"
            rows={2}
            className="mt-4 w-full resize-none rounded-xl px-4 py-3 text-sm outline-none placeholder:text-[var(--text-muted)]"
            style={{
              backgroundColor: 'var(--surface)',
              color: 'var(--text-1)',
              border: '1px solid var(--border)',
              fontFamily: 'var(--font-body)',
            }}
          />

          {/* Total + CTA */}
          <div className="mt-4 flex items-center justify-between">
            <span
              className="text-lg font-bold"
              style={{ color: 'var(--text-1)', fontFamily: 'var(--font-display)' }}
            >
              Ukupno: {totalPrice()} rsd
            </span>
          </div>

          <button
            onClick={() => onSubmit(note || undefined)}
            disabled={isSubmitting}
            className="mt-3 w-full rounded-xl py-4 text-center text-sm font-bold transition-transform active:scale-[0.98] disabled:opacity-50"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-text)',
              fontFamily: 'var(--font-body)',
            }}
          >
            {isSubmitting ? 'Saljem...' : isUpdate ? 'Azuriraj narudzbinu' : 'Naruci'}
          </button>
        </div>
      </motion.div>
    </>
  )
}
