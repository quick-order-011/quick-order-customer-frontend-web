import type { MenuItem } from '../../types/menu'
import { ItemCard } from './ItemCard'

interface MenuGridProps {
  items: MenuItem[]
  activeCategoryId: string
  gridColumns?: 1 | 2
  showDescription?: boolean
  placeholderImage?: string
}

export function MenuGrid({
  items,
  activeCategoryId,
  gridColumns = 2,
  showDescription = true,
  placeholderImage,
}: MenuGridProps) {
  const filtered = items.filter(i => i.categoryId === activeCategoryId)

  if (filtered.length === 0) {
    return (
      <p
        className="py-12 text-center text-sm"
        style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
      >
        Nema stavki u ovoj kategoriji
      </p>
    )
  }

  return (
    <div
      className={`grid gap-3.5 px-5 pt-4 pb-28 ${
        gridColumns === 1
          ? 'grid-cols-1'
          : 'grid-cols-2 sm:grid-cols-3'
      }`}
    >
      {filtered.map(item => (
        <ItemCard
          key={item.id}
          item={item}
          showDescription={showDescription}
          placeholderImage={placeholderImage}
        />
      ))}
    </div>
  )
}
