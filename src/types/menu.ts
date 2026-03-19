export interface Category {
  id: string
  name: string
  icon?: string
  order: number
}

export interface MenuItem {
  id: string
  categoryId: string
  name: string
  description?: string
  price: number
  imageUrl?: string
  available: boolean
}

export interface CartItem {
  menuItem: MenuItem
  quantity: number
}

export interface CreateOrderDto {
  cafeId: string
  tableId: string
  items: { menuItemId: string; quantity: number }[]
  note?: string
}

export interface OrderResponse {
  orderId: string
  estimatedMinutes: number
}
