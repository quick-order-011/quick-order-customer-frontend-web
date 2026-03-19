import { useQuery } from '@tanstack/react-query'
import { mockFetchTheme } from '../mocks/handlers'

export function useTheme(cafeId: string) {
  return useQuery({
    queryKey: ['theme', cafeId],
    queryFn: () => mockFetchTheme(cafeId),
    staleTime: 5 * 60 * 1000,
  })
}
