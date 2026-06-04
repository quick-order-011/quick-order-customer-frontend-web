import { useQuery } from '@tanstack/react-query'
import { fetchActivePromotions } from '../lib/api'

export function useActivePromotions(menuId: string) {
  return useQuery({
    queryKey: ['promotions', 'active', menuId],
    queryFn: () => fetchActivePromotions(menuId),
    staleTime: 2 * 60 * 1000,
    enabled: Boolean(menuId),
  })
}
