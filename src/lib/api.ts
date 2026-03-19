import type { ThemeConfig } from '../types/theme'
import type { Category, MenuItem, CreateOrderDto, OrderResponse } from '../types/menu'

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api'

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export function fetchTheme(cafeId: string) {
  return fetchJson<ThemeConfig>(`/cafe/${cafeId}/theme`)
}

export function fetchMenu(cafeId: string) {
  return fetchJson<{ categories: Category[]; items: MenuItem[] }>(
    `/cafe/${cafeId}/menu`,
  )
}

export function submitOrder(order: CreateOrderDto) {
  return fetchJson<OrderResponse>('/orders', {
    method: 'POST',
    body: JSON.stringify(order),
  })
}

export function updateTheme(cafeId: string, theme: Partial<ThemeConfig>) {
  return fetchJson<ThemeConfig>(`/cafe/${cafeId}/theme`, {
    method: 'PATCH',
    body: JSON.stringify(theme),
  })
}
