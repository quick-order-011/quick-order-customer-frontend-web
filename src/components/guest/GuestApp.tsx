import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { sileo } from 'sileo'
import { useTheme } from '../../hooks/useTheme'
import { useMenu } from '../../hooks/useMenu'
import { useCartStore } from '../../hooks/useCart'
import { useOrderTracking } from '../../hooks/useOrderTracking'
import { injectTheme } from '../../lib/injectTheme'
import { mockSubmitOrder } from '../../mocks/handlers'
import type { CreateOrderDto } from '../../types/menu'
import { Header } from './Header'
import { CategoryTabs } from './CategoryTabs'
import { MenuGrid } from './MenuGrid'
import { CartBar } from './CartBar'
import { CartDrawer } from './CartDrawer'
import { OrderConfirmation } from './OrderConfirmation'

export function GuestApp() {
  const { cafeId = '', tableId = '' } = useParams()
  const { data: theme, isLoading: themeLoading } = useTheme(cafeId)
  const { data: menuData, isLoading: menuLoading } = useMenu(cafeId)
  const cartStore = useCartStore()
  const { startTracking } = useOrderTracking()

  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [orderResult, setOrderResult] = useState<{
    orderId: string
    estimatedMinutes: number
  } | null>(null)

  useEffect(() => {
    if (theme) injectTheme(theme)
  }, [theme])

  // Derive active category: use selected if valid, otherwise default to first
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

  if (orderResult) {
    return (
      <OrderConfirmation
        orderId={orderResult.orderId}
        estimatedMinutes={orderResult.estimatedMinutes}
        onNewOrder={() => {
          setOrderResult(null)
          cartStore.clear()
        }}
      />
    )
  }

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
      loading: { title: 'Šaljem narudžbinu...' },
      success: (data) => ({
        title: 'Narudžbina potvrđena!',
        description: `#${data.orderId} — stižemo za ~${data.estimatedMinutes} min`,
      }),
      error: () => ({
        title: 'Greška pri slanju',
        description: 'Pokušajte ponovo.',
      }),
    })

    setSubmitting(false)

    if (result) {
      startTracking(result)
      setOrderResult(result)
    }
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

      <CartBar onOpen={() => setDrawerOpen(true)} />

      <AnimatePresence>
        {drawerOpen && (
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
