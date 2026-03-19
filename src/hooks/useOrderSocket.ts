import { createElement, useEffect, useCallback, useRef } from 'react'
import { sileo } from 'sileo'
import { useCartStore } from './useCart'
import type { CartItem } from '../types/menu'

export type OrderStatus = 'submitted' | 'inprogress' | 'prepared' | 'delivered' | 'paid' | null

function createMockSocket(
  _orderId: string,
  onEvent: (type: string, payload?: Record<string, string>) => void,
) {
  const timeouts: ReturnType<typeof setTimeout>[] = []

  timeouts.push(setTimeout(() => {
    console.log('[WS mock] inprogress')
    onEvent('STATUS_CHANGED', { status: 'inprogress' })
  }, 3000))

  timeouts.push(setTimeout(() => {
    console.log('[WS mock] prepared')
    onEvent('STATUS_CHANGED', { status: 'prepared' })
  }, 60000))

  timeouts.push(setTimeout(() => {
    console.log('[WS mock] delivered')
    onEvent('STATUS_CHANGED', { status: 'delivered' })
  }, 70000))

  timeouts.push(setTimeout(() => {
    console.log('[WS mock] paid')
    onEvent('STATUS_CHANGED', { status: 'paid' })
  }, 80000))

  return {
    close: () => timeouts.forEach(clearTimeout),
  }
}

function buildPreparingDescription(items: CartItem[]) {
  return createElement('div', {
    className: 'flex flex-col gap-3 pt-1',
  },
    createElement('div', {
      className: 'flex items-center gap-2',
    },
      createElement('span', {
        className: 'text-xs! text-white/60!',
      }, 'Vasa narudzbina je u pripremi'),
    ),
    createElement('div', {
      className: 'h-px w-full',
      style: { backgroundColor: 'rgba(255,255,255,0.1)' },
    }),
    createElement('div', {
      className: 'flex flex-col gap-1.5',
    },
      ...items.map(({ menuItem, quantity }) =>
        createElement('div', {
          key: menuItem.id,
          className: 'flex items-center justify-between text-xs!',
        },
          createElement('span', {
            className: 'text-white/80!',
          }, `${quantity}x ${menuItem.name}`),
          createElement('span', {
            className: 'text-white/40!',
          }, `${menuItem.price * quantity} rsd`),
        ),
      ),
    ),
    createElement('div', {
      className: 'h-px w-full',
      style: { backgroundColor: 'rgba(255,255,255,0.1)' },
    }),
    createElement('div', {
      className: 'flex items-center justify-between text-xs! font-semibold!',
    },
      createElement('span', { className: 'text-white/80!' }, 'Ukupno'),
      createElement('span', { className: 'text-white!' },
        `${items.reduce((s, i) => s + i.menuItem.price * i.quantity, 0)} rsd`,
      ),
    ),
  )
}

export function useOrderSocket() {
  const clear = useCartStore(s => s.clear)
  const socketRef = useRef<{ close: () => void } | null>(null)
  const preparingToastIdRef = useRef<string | null>(null)
  const editingToastIdRef = useRef<string | null>(null)
  const itemsRef = useRef<CartItem[]>([])

  const showPreparingToast = useCallback(() => {
    console.log('[toast] showPreparingToast, dismissing old:', preparingToastIdRef.current)
    if (preparingToastIdRef.current) {
      sileo.dismiss(preparingToastIdRef.current)
    }
    preparingToastIdRef.current = sileo.info({
      title: 'Priprema se',
      icon: createElement('div', {
        style: {
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          border: '2px solid rgba(255,255,255,0.2)',
          borderTopColor: 'rgba(255,255,255,0.8)',
          animation: 'spin 0.6s linear infinite',
        },
      }),
      description: buildPreparingDescription(itemsRef.current),
      duration: 600000,
      autopilot: { expand: 0, collapse: 600000 },
    })
  }, [])

  const pauseForEditing = useCallback(() => {
    console.log('[toast] pauseForEditing, dismissing preparing:', preparingToastIdRef.current)
    if (preparingToastIdRef.current) {
      sileo.dismiss(preparingToastIdRef.current)
      preparingToastIdRef.current = null
    }
    // Delay to let Sileo finish dismiss animation before creating new toast
    setTimeout(() => {
      const id = sileo.warning({
        title: 'Narudzbina se azurira',
        duration: 600000,
      })
      editingToastIdRef.current = id
      console.log('[toast] editing toast created with id:', id)
    }, 800)
  }, [])

  const resumeAfterEdit = useCallback((updatedItems: CartItem[]) => {
    console.log('[toast] resumeAfterEdit, dismissing editing:', editingToastIdRef.current)
    if (editingToastIdRef.current) {
      sileo.dismiss(editingToastIdRef.current)
      editingToastIdRef.current = null
    }
    itemsRef.current = updatedItems
    setTimeout(() => {
      showPreparingToast()
    }, 800)
  }, [showPreparingToast])

  const handleEvent = useCallback((type: string, payload?: Record<string, string>) => {
    switch (type) {
      case 'ORDER_MERGED':
        sileo.info({
          title: 'Narudzbine spojene',
          autopilot: false,
        })
        break

      case 'STATUS_CHANGED': {
        const newStatus = payload?.status as OrderStatus

        console.log('[toast] STATUS_CHANGED →', newStatus)

        if (newStatus === 'inprogress') {
          showPreparingToast()
        }

        if (newStatus === 'prepared') {
          if (preparingToastIdRef.current) {
            sileo.dismiss(preparingToastIdRef.current)
            preparingToastIdRef.current = null
          }
          if (editingToastIdRef.current) {
            sileo.dismiss(editingToastIdRef.current)
            editingToastIdRef.current = null
          }
          sileo.success({
            title: 'Narudzbina je spremna',
            autopilot: false,
          })
        }

        if (newStatus === 'delivered') {
          sileo.success({
            title: 'Prijatno',
            autopilot: false,
          })
        }

        if (newStatus === 'paid') {
          clear()
          sileo.success({
            title: 'Hvala na poseti',
            autopilot: false,
          })
        }
        break
      }
    }
  }, [clear, showPreparingToast])

  const startListening = useCallback((orderId: string, items: CartItem[]) => {
    socketRef.current?.close()
    itemsRef.current = items
    socketRef.current = createMockSocket(orderId, handleEvent)
  }, [handleEvent])

  const reset = useCallback(() => {
    socketRef.current?.close()
    socketRef.current = null
    itemsRef.current = []
    if (preparingToastIdRef.current) {
      sileo.dismiss(preparingToastIdRef.current)
      preparingToastIdRef.current = null
    }
    if (editingToastIdRef.current) {
      sileo.dismiss(editingToastIdRef.current)
      editingToastIdRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      console.log('[toast] CLEANUP effect running! preparing:', preparingToastIdRef.current, 'editing:', editingToastIdRef.current)
      socketRef.current?.close()
      if (preparingToastIdRef.current) sileo.dismiss(preparingToastIdRef.current)
      if (editingToastIdRef.current) sileo.dismiss(editingToastIdRef.current)
    }
  }, [])

  return { startListening, reset, pauseForEditing, resumeAfterEdit }
}
