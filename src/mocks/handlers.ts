import type { ThemeConfig } from '../types/theme'
import type { Category, MenuItem, OrderResponse } from '../types/menu'
import { mockTheme, mockCategories, mockItems } from './data'

// In-memory state for mock
let currentTheme: ThemeConfig = { ...mockTheme }

function delay(ms = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function mockFetchTheme(_: string): Promise<ThemeConfig> {
  await delay()
  return { ...currentTheme }
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

export async function mockSubmitOrder(): Promise<OrderResponse> {
  await delay(800)
  return {
    orderId: `ORD-${Date.now()}`,
    estimatedMinutes: Math.floor(Math.random() * 10) + 5,
  }
}

export async function mockUpdateTheme(
  _: string,
  theme: Partial<ThemeConfig>,
): Promise<ThemeConfig> {
  await delay(400)
  currentTheme = { ...currentTheme, ...theme }
  return { ...currentTheme }
}
