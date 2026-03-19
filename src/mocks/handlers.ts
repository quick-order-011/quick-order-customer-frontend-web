import type { ThemeConfig } from '../types/theme'
import type { Category, MenuItem, CreateOrderDto, OrderResponse } from '../types/menu'
import { getThemeForCafe, mockCategories, mockItems } from './data'

// In-memory overrides per cafe
const themeOverrides: Record<string, Partial<ThemeConfig>> = {}

function delay(ms = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function mockFetchTheme(cafeId: string): Promise<ThemeConfig> {
  await delay()
  const base = getThemeForCafe(cafeId)
  return { ...base, ...themeOverrides[cafeId] }
}

export async function mockFetchMenu(
  _: string,
): Promise<{ categories: Category[]; items: MenuItem[] }> {
  await delay(500)
  return {
    categories: [...mockCategories],
    items: mockItems.filter(i => i.available),
  }
}

export async function mockSubmitOrder(_order?: CreateOrderDto): Promise<OrderResponse> {
  await delay(800)
  return {
    orderId: `ORD-${Date.now()}`,
    estimatedMinutes: 1, // 1 min for demo — notifications fire at ~18s, ~42s, ~60s
  }
}

export async function mockUpdateTheme(
  cafeId: string,
  theme: Partial<ThemeConfig>,
): Promise<ThemeConfig> {
  await delay(400)
  themeOverrides[cafeId] = { ...themeOverrides[cafeId], ...theme }
  const base = getThemeForCafe(cafeId)
  return { ...base, ...themeOverrides[cafeId] }
}
