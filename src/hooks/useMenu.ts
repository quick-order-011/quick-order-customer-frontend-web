import { useQuery } from '@tanstack/react-query'
import { fetchMenu } from '../lib/api'

export function useMenu(menuId: string) {
  return useQuery({
    queryKey: ['menu', menuId],
    queryFn: () => fetchMenu(menuId),
    staleTime: 2 * 60 * 1000,
    enabled: Boolean(menuId),
  })
}
