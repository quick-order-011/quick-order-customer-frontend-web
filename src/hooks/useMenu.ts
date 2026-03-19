import { useQuery } from '@tanstack/react-query'
import { mockFetchMenu } from '../mocks/handlers'

export function useMenu(cafeId: string) {
  return useQuery({
    queryKey: ['menu', cafeId],
    queryFn: () => mockFetchMenu(cafeId),
    staleTime: 2 * 60 * 1000,
  })
}
