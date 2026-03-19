import { useMutation } from '@tanstack/react-query'
import type { CreateOrderDto } from '../types/menu'
import { mockSubmitOrder } from '../mocks/handlers'

export function useSubmitOrder() {
  return useMutation({
    mutationFn: (_: CreateOrderDto) => mockSubmitOrder(),
  })
}
