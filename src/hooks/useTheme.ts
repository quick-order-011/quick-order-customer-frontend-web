import { useQuery } from '@tanstack/react-query'
import { fetchTheme } from '../lib/api'

export function useTheme(cafeId: string) {
  return useQuery({
    queryKey: ['theme', cafeId],
    queryFn: () => fetchTheme(cafeId),
    staleTime: 5 * 60 * 1000,
  })
}
