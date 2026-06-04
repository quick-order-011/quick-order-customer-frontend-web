import type { ThemeConfig } from '../types/theme'
import type { Category, MenuItem, CreateOrderDto, OrderResponse } from '../types/menu'
import { getVisitorId, getFingerprint } from './fingerprint'

// MenuService (ShopService). In dev the vite proxy maps /api -> http://localhost:3001.
const API_BASE = import.meta.env.VITE_API_BASE ?? '/api'
// AuthService guest-entry. In dev the vite proxy maps /auth -> http://localhost:3002/api.
const AUTH_BASE = import.meta.env.VITE_AUTH_BASE ?? '/auth'

// Until an API gateway injects identity from the guest JWT cookie, the frontend
// sends the GUEST identity headers to MenuService directly.
const GUEST_USER_ID =
  import.meta.env.VITE_GUEST_USER_ID ?? '00000000-0000-4000-8000-000000000001'
const GUEST_ROLE = 'GUEST'

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': GUEST_USER_ID,
      'x-user-role': GUEST_ROLE,
      'x-visitor-id': getVisitorId(),
      ...(init?.headers ?? {}),
    },
    ...init,
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  if (res.status === 204) return undefined as T
  return res.json()
}

/**
 * Establishes the guest session against AuthService using the browser
 * fingerprint as the visitor id. The full fingerprint components (screen, UA,
 * WebGL, …) are sent in the body for inspection/storage. AuthService verifies
 * the table via MenuService /internal, then sets an httpOnly guest JWT cookie.
 * POST /session/entry/:shopId/:tableId  -> 201 Created (JWT in cookie)
 */
export async function enterGuestSession(
  shopId: string,
  tableId: string,
): Promise<void> {
  const fp = getFingerprint()

  if (import.meta.env.DEV) {
    // Visible in the browser console so you can see the collected device info.
    console.info('[fingerprint]', fp.visitorId, fp.components)
  }

  const res = await fetch(`${AUTH_BASE}/session/entry/${shopId}/${tableId}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-visitor-id': fp.visitorId,
    },
    body: JSON.stringify({
      visitorId: fp.visitorId,
      collectedAt: fp.collectedAt,
      fingerprint: fp.components,
    }),
  })
  if (!res.ok) throw new Error(`Guest session error: ${res.status}`)
}

const BACKEND_CATEGORIES = [
  { id: 'COFFEE', name: 'Coffee', order: 1 },
  { id: 'FOOD', name: 'Food', order: 2 },
  { id: 'SOFT_DRINKS', name: 'Soft Drinks', order: 3 },
  { id: 'ALCOHOL', name: 'Alcohol', order: 4 },
] as const

interface BackendMenuItem {
  id: string
  name: string
  category: string
  subCategory: string | null
  price: string
  imageUrl: string | null
  createdAt: string
}

export interface BackendPromotion {
  id: string
  name: string
  price: string
  validFrom: string
  validTo: string | null
  isActive: boolean
  createdAt: string
  items: { itemId: string; name: string; quantity: number }[]
}

// Theme is not owned by MenuService. Keep mock until a theme service exists.
export { mockFetchTheme as fetchTheme } from '../mocks/handlers'

export async function fetchMenu(
  menuId: string,
): Promise<{ categories: Category[]; items: MenuItem[] }> {
  const lists = await Promise.all(
    BACKEND_CATEGORIES.map(async cat => {
      const rows = await fetchJson<BackendMenuItem[]>(
        `/menus/${menuId}/items?category=${cat.id}&status=active`,
      )
      return rows.map<MenuItem>(r => ({
        id: r.id,
        categoryId: cat.id,
        name: r.name,
        description: r.subCategory ?? undefined,
        price: Number(r.price),
        imageUrl: r.imageUrl ?? undefined,
        available: true,
      }))
    }),
  )

  const items = lists.flat()
  const usedCategoryIds = new Set(items.map(i => i.categoryId))
  const categories: Category[] = BACKEND_CATEGORIES.filter(c =>
    usedCategoryIds.has(c.id),
  ).map(c => ({ id: c.id, name: c.name, order: c.order }))

  return { categories, items }
}

export function fetchActivePromotions(menuId: string) {
  return fetchJson<BackendPromotion[]>(
    `/menus/${menuId}/promotions?isActive=true`,
  )
}

export function submitOrder(_order: CreateOrderDto): Promise<OrderResponse> {
  return Promise.reject(
    new Error('submitOrder not wired — MenuService does not own orders'),
  )
}

export function updateTheme(
  _cafeId: string,
  _theme: Partial<ThemeConfig>,
): Promise<ThemeConfig> {
  return Promise.reject(new Error('theme not implemented in backend yet'))
}
