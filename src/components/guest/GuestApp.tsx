import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { sileo } from 'sileo'
import { useTheme } from '../../hooks/useTheme'
import { useMenu } from '../../hooks/useMenu'
import { useCartStore } from '../../hooks/useCart'
import { useOrderSocket } from '../../hooks/useOrderSocket'
import { injectTheme } from '../../lib/injectTheme'
import { mockSubmitOrder } from '../../mocks/handlers'
import type { CreateOrderDto } from '../../types/menu'
import { Header } from './Header'
import { CategoryTabs } from './CategoryTabs'
import { MenuGrid } from './MenuGrid'
import { CartBar } from './CartBar'
import { CartDrawer } from './CartDrawer'

export function GuestApp() {
  const { cafeId = '', tableId = '' } = useParams()
  const { data: theme, isLoading: themeLoading } = useTheme(cafeId)
  const { data: menuData, isLoading: menuLoading } = useMenu(cafeId)
  const cartStore = useCartStore()
  const { startListening, pauseForEditing, resumeAfterEdit } = useOrderSocket()

  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (theme) injectTheme(theme)
  }, [theme])

  const activeCategoryId =
    menuData?.categories.some(c => c.id === selectedCategoryId)
      ? selectedCategoryId
      : menuData?.categories[0]?.id ?? ''

  if (themeLoading || menuLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: 'var(--bg, #111)' }}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-600 border-t-white" />
      </div>
    )
  }

  if (!theme || !menuData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <p>Nije moguće učitati meni.</p>
      </div>
    )
  }

  // First order submit (via CartDrawer)
  const handleSubmit = async (note?: string) => {
    setSubmitting(true)
    setDrawerOpen(false)

    const orderDto: CreateOrderDto = {
      cafeId,
      tableId,
      items: cartStore.items.map(i => ({
        menuItemId: i.menuItem.id,
        quantity: i.quantity,
      })),
      note,
    }

    const result = await sileo.promise(mockSubmitOrder(orderDto), {
      loading: { title: 'Saljem narudzbinu...' },
      success: (data) => ({
        title: 'Narudzbina primljena',
        description: `#${data.orderId}`,
        autopilot: false,
      }),
      error: () => ({
        title: 'Greska pri slanju',
        description: 'Pokusajte ponovo.',
        autopilot: false,
      }),
    })

    setSubmitting(false)

    if (result) {
      const orderedItems = [...cartStore.items]
      cartStore.markAsSubmitted()
      startListening(result.orderId, orderedItems)
    }
  }

  // Enter edit mode
  const handleEnterEdit = () => {
    setEditing(true)
    pauseForEditing()
  }

  // Submit update
  const handleSubmitUpdate = async () => {
    setSubmitting(true)

    const orderDto: CreateOrderDto = {
      cafeId,
      tableId,
      items: cartStore.items.map(i => ({
        menuItemId: i.menuItem.id,
        quantity: i.quantity,
      })),
    }

    await sileo.promise(mockSubmitOrder(orderDto), {
      loading: { title: 'Azuriram narudzbinu...' },
      success: (data) => ({
        title: 'Narudzbina azurirana',
        description: `#${data.orderId}`,
        autopilot: false,
      }),
      error: () => ({
        title: 'Greska pri azuriranju',
        autopilot: false,
      }),
    })

    setSubmitting(false)
    setEditing(false)

    const updatedItems = [...cartStore.items]
    cartStore.markAsSubmitted()
    resumeAfterEdit(updatedItems)
  }

  return (
    <div
      className="min-h-screen pb-24"
      style={{ backgroundColor: 'var(--bg)', fontFamily: 'var(--font-body)', fontSize: 'var(--font-size-base)' }}
    >
      <Header theme={theme} tableId={tableId} />

      <CategoryTabs
        categories={menuData.categories}
        activeId={activeCategoryId}
        onSelect={setSelectedCategoryId}
        showIcons={theme.layout.showCategoryIcons}
      />

      <MenuGrid
        items={menuData.items}
        activeCategoryId={activeCategoryId}
        gridColumns={theme.layout.gridColumns}
        showDescription={theme.layout.showItemDescription}
        placeholderImage={theme.assets.placeholderImageUrl}
      />

      <CartBar
        onOpen={() => setDrawerOpen(true)}
        editing={editing}
        onEdit={handleEnterEdit}
        onSubmitUpdate={handleSubmitUpdate}
      />

      <AnimatePresence>
        {drawerOpen && !cartStore.hasOrder() && (
          <CartDrawer
            onClose={() => setDrawerOpen(false)}
            onSubmit={handleSubmit}
            isSubmitting={submitting}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
