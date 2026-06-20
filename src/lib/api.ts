import type { ThemeConfig } from '../types/theme'
import type { Category, MenuItem, CreateOrderDto, OrderResponse } from '../types/menu'
import { getVisitorId, getFingerprint } from './fingerprint'

// Everything goes through the API gateway (single entry point). In dev the vite
// proxy maps /api -> http://localhost:3003 (the gateway). The gateway routes by
// the service segment (auth, public, menus, shops, session, ...) and injects the
// identity headers (x-user-id / x-user-role / x-visitor-id) from the JWT cookie,
// so the frontend no longer sends them itself.
const GATEWAY_BASE = import.meta.env.VITE_GATEWAY_BASE ?? '/api/v1'

// The only device signals the gateway needs: MobileGuard (session/entry, orders)
// validates exactly these five. Sourced from getFingerprint() so they match the
// derived x-visitor-id. (The full fingerprint stays client-side in the visitor id.)
function mobileHeaders(): Record<string, string> {
  const { components: c } = getFingerprint()
  const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false
  const isMobile =
    c.uaData?.mobile ??
    (/Mobi|Android|iPhone|iPad|iPod/i.test(c.userAgent) || c.maxTouchPoints > 0)
  return {
    'x-is-mobile': String(isMobile),
    'x-coarse-pointer': String(coarse),
    'x-touch-points': String(c.maxTouchPoints),
    'x-inner-width': String(c.viewport.innerWidth),
    'x-inner-height': String(c.viewport.innerHeight),
  }
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${GATEWAY_BASE}${url}`, {
    credentials: 'include',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'x-visitor-id': getVisitorId(),
      ...(init?.headers ?? {}),
    },
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  if (res.status === 204) return undefined as T
  return res.json()
}

/**
 * Establishes the guest session against AuthService. The browser fingerprint
 * travels as request headers (x-visitor-id + the x-* device headers); the
 * backend reads them there, so no request body is sent. AuthService verifies the
 * table via MenuService /internal, then sets an httpOnly guest JWT cookie.
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

  const res = await fetch(`${GATEWAY_BASE}/session/entry/${shopId}/${tableId}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'x-visitor-id': fp.visitorId,
      ...mobileHeaders(),
    },
  })
  if (!res.ok) throw new Error(`Guest session error: ${res.status}`)
}

/**
 * Completes a password reset using the token from the forgot-password email.
 * Goes through the gateway: POST /api/v1/auth/reset-password?token=...
 * Returns void on success; throws Error with the backend message on 4xx.
 */
export async function resetPassword(
  token: string,
  newPassword: string,
  confirmedPassword: string,
): Promise<void> {
  const res = await fetch(
    `${GATEWAY_BASE}/auth/reset-password?token=${encodeURIComponent(token)}`,
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword, confirmedPassword }),
    },
  )
  if (res.ok) return

  let message = `Reset failed (${res.status})`
  try {
    const data = (await res.json()) as { errors?: string[] }
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      message = data.errors[0]
    }
  } catch {
    // non-JSON error body — keep the default message
  }
  throw new Error(message)
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
