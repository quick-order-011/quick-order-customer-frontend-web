import { useQuery } from '@tanstack/react-query'
import { fetchMenu } from '../lib/api'

export function useMenu(cafeId: string) {
  return useQuery({
    queryKey: ['menu', cafeId],
    queryFn: () => fetchMenu(cafeId),
    staleTime: 2 * 60 * 1000,
  })
}
