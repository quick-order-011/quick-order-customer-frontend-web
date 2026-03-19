import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { Category } from '../../types/menu'

interface CategoryTabsProps {
  categories: Category[]
  activeId: string
  onSelect: (id: string) => void
  showIcons?: boolean
}

export function CategoryTabs({ categories, activeId, onSelect, showIcons }: CategoryTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current
      const el = activeRef.current
      const left = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2
      container.scrollTo({ left, behavior: 'smooth' })
    }
  }, [activeId])

  return (
    <div
      ref={scrollRef}
      className="sticky top-14 z-20 flex gap-2 overflow-x-auto px-5 py-3 scrollbar-none"
      style={{
        backgroundColor: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {categories.map(cat => {
        const isActive = cat.id === activeId
        return (
          <button
            key={cat.id}
            ref={isActive ? activeRef : undefined}
            onClick={() => onSelect(cat.id)}
            className="relative shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold whitespace-nowrap outline-none"
            style={{
              color: isActive ? 'var(--primary-text)' : 'var(--text-2)',
              backgroundColor: isActive ? undefined : 'var(--surface)',
              fontFamily: 'var(--font-body)',
            }}
          >
            {isActive && (
              <motion.div
                layoutId="active-tab"
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: 'var(--primary)' }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10">
              {showIcons && cat.icon && <span className="mr-1.5">{cat.icon}</span>}
              {cat.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}
