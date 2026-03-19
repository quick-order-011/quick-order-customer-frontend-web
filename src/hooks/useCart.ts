import { create } from 'zustand'
import type { MenuItem, CartItem } from '../types/menu'

interface CartState {
  items: CartItem[]
  add: (item: MenuItem) => void
  remove: (itemId: string) => void
  update: (itemId: string, quantity: number) => void
  clear: () => void
  totalItems: () => number
  totalPrice: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  add: (menuItem: MenuItem) => {
    set(state => {
      const existing = state.items.find(i => i.menuItem.id === menuItem.id)
      if (existing) {
        return {
          items: state.items.map(i =>
            i.menuItem.id === menuItem.id
              ? { ...i, quantity: i.quantity + 1 }
              : i,
          ),
        }
      }
      return { items: [...state.items, { menuItem, quantity: 1 }] }
    })

    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(50)
  },

  remove: (itemId: string) => {
    set(state => ({
      items: state.items.filter(i => i.menuItem.id !== itemId),
    }))
  },

  update: (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      get().remove(itemId)
      return
    }
    set(state => ({
      items: state.items.map(i =>
        i.menuItem.id === itemId ? { ...i, quantity } : i,
      ),
    }))
  },

  clear: () => set({ items: [] }),

  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

  totalPrice: () =>
    get().items.reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0),
}))
