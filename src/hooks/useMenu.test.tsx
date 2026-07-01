import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useMenu } from './useMenu'
import type { Category, MenuItem } from '../types/menu'

// Mock the api module
vi.mock('../lib/api', () => ({
  fetchMenu: vi.fn(),
}))

// Import the mocked function so we can control its behaviour
import { fetchMenu } from '../lib/api'

const mockCategories: Category[] = [
  { id: 'cat-1', name: 'Coffee', order: 1 },
  { id: 'cat-2', name: 'Pastries', order: 2 },
]

const mockItems: MenuItem[] = [
  {
    id: 'item-1',
    categoryId: 'cat-1',
    name: 'Latte',
    price: 4.5,
    available: true,
  },
  {
    id: 'item-2',
    categoryId: 'cat-2',
    name: 'Croissant',
    price: 3.0,
    available: true,
  },
]

const menuResponse = { categories: mockCategories, items: mockItems }

let queryClient: QueryClient

function createWrapper() {
  queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useMenu', () => {
  it('fetches menu data successfully for demo-cafe', async () => {
    vi.mocked(fetchMenu).mockResolvedValue(menuResponse)

    const { result } = renderHook(() => useMenu('demo-cafe'), {
      wrapper: createWrapper(),
    })

    // Initially loading
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(menuResponse)
  })

  it('uses the exact query key ["menu", "demo-cafe"]', async () => {
    vi.mocked(fetchMenu).mockResolvedValue(menuResponse)

    renderHook(() => useMenu('demo-cafe'), {
      wrapper: createWrapper(),
    })

    await waitFor(() =>
      expect(queryClient.getQueryData(['menu', 'demo-cafe'])).toBeDefined(),
    )

    // Verify the cached data matches the expected response
    expect(queryClient.getQueryData(['menu', 'demo-cafe'])).toEqual(menuResponse)
  })

  it('passes the cafeId through to fetchMenu', async () => {
    vi.mocked(fetchMenu).mockResolvedValue(menuResponse)

    renderHook(() => useMenu('demo-cafe'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(fetchMenu).toHaveBeenCalledWith('demo-cafe'))
  })

  it('surfaces fetch failures as an error state', async () => {
    const testError = new Error('Network error')
    vi.mocked(fetchMenu).mockRejectedValue(testError)

    const { result } = renderHook(() => useMenu('demo-cafe'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBeDefined()
    expect(result.current.error?.message).toBe('Network error')
  })
})
