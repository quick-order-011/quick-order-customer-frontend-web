import { useActivePromotions } from '../../hooks/useActivePromotions'

interface PromotionsSectionProps {
  menuId: string
}

export function PromotionsSection({ menuId }: PromotionsSectionProps) {
  const { data, isLoading, isError } = useActivePromotions(menuId)

  if (isLoading || isError || !data || data.length === 0) return null

  return (
    <section className="px-5 pt-3 pb-1">
      <h2
        className="mb-2 text-sm font-semibold uppercase tracking-wide"
        style={{ color: 'var(--text)', fontFamily: 'var(--font-heading)' }}
      >
        Promocije
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {data.map(p => (
          <div
            key={p.id}
            className="min-w-[220px] shrink-0 rounded-xl p-3"
            style={{
              backgroundColor: 'var(--surface, #1a1a1a)',
              color: 'var(--text)',
            }}
          >
            <div className="mb-1 text-base font-semibold">{p.name}</div>
            <div className="mb-2 text-xs opacity-70">
              {p.items.map(i => `${i.quantity}× ${i.name}`).join(' + ')}
            </div>
            <div
              className="text-lg font-bold"
              style={{ color: 'var(--accent, #f5a623)' }}
            >
              {Number(p.price).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
