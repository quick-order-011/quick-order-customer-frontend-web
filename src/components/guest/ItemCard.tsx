import { motion } from 'framer-motion'
import type { MenuItem } from '../../types/menu'
import { useCartStore } from '../../hooks/useCart'

interface ItemCardProps {
  item: MenuItem
  showDescription?: boolean
  placeholderImage?: string
}

export function ItemCard({ item, showDescription = true, placeholderImage }: ItemCardProps) {
  const { items, add, update } = useCartStore()
  const cartItem = items.find(i => i.menuItem.id === item.id)
  const quantity = cartItem?.quantity ?? 0

  return (
    <motion.div
      layout
      className="flex flex-col overflow-hidden"
      style={{
        backgroundColor: 'var(--surface)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow)',
        border: '1px solid var(--border)',
      }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={item.imageUrl ?? placeholderImage}
          alt={item.name}
          className="h-full w-full object-cover"
          style={{ borderRadius: 'var(--radius-img)' }}
          loading="lazy"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3
          className="text-sm font-semibold leading-tight"
          style={{ color: 'var(--text-1)', fontFamily: 'var(--font-display)' }}
        >
          {item.name}
        </h3>

        {showDescription && item.description && (
          <p
            className="line-clamp-2 text-xs leading-snug"
            style={{ color: 'var(--text-2)', fontFamily: 'var(--font-body)' }}
          >
            {item.description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          <span
            className="text-sm font-bold"
            style={{ color: 'var(--text-1)', fontFamily: 'var(--font-display)' }}
          >
            {item.price} rsd
          </span>

          {quantity === 0 ? (
            <button
              onClick={() => add(item)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold transition-transform active:scale-90"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-text)',
              }}
              aria-label={`Dodaj ${item.name}`}
            >
              +
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => update(item.id, quantity - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-transform active:scale-90"
                style={{
                  backgroundColor: 'var(--surface-hover)',
                  color: 'var(--text-1)',
                  border: '1px solid var(--border)',
                }}
                aria-label="Smanji količinu"
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
                onClick={() => add(item)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-transform active:scale-90"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-text)',
                }}
                aria-label="Povećaj količinu"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
