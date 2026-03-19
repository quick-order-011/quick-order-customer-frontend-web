import { create } from 'zustand'
import type { MenuItem, CartItem } from '../types/menu'

interface CartState {
  items: CartItem[]
  submittedItems: CartItem[]
  add: (item: MenuItem) => void
  remove: (itemId: string) => void
  update: (itemId: string, quantity: number) => void
  markAsSubmitted: () => void
  clear: () => void
  totalItems: () => number
  totalPrice: () => number
  hasOrder: () => boolean
  hasChanges: () => boolean
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  submittedItems: [],

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

  markAsSubmitted: () => {
    set(state => ({
      submittedItems: state.items.map(i => ({ ...i })),
    }))
  },

  clear: () => set({ items: [], submittedItems: [] }),

  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

  totalPrice: () =>
    get().items.reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0),

  hasOrder: () => get().submittedItems.length > 0,

  hasChanges: () => {
    const { items, submittedItems } = get()
    if (submittedItems.length === 0) return items.length > 0
    if (items.length !== submittedItems.length) return true
    return items.some(item => {
      const submitted = submittedItems.find(s => s.menuItem.id === item.menuItem.id)
      return !submitted || submitted.quantity !== item.quantity
    })
  },
}))
