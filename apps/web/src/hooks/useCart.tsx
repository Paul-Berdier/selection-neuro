'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { cartApi } from '@/services/api'
import type { Cart } from '@/types'
import { useAuth } from './useAuth'

interface CartContext {
  cart: Cart | null
  loading: boolean
  addItem: (product_id: number, quantity?: number) => Promise<void>
  updateItem: (item_id: number, quantity: number) => Promise<void>
  removeItem: (item_id: number) => Promise<void>
  refresh: () => Promise<void>
}

const Ctx = createContext<CartContext>({
  cart: null,
  loading: false,
  addItem: async () => {},
  updateItem: async () => {},
  removeItem: async () => {},
  refresh: async () => {},
})

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!user) { setCart(null); return }
    try {
      const c = await cartApi.get() as Cart
      setCart(c)
    } catch {
      setCart(null)
    }
  }, [user])

  useEffect(() => { refresh() }, [refresh])

  const addItem = async (product_id: number, quantity = 1) => {
    setLoading(true)
    try {
      const c = await cartApi.addItem(product_id, quantity) as Cart
      setCart(c)
    } finally {
      setLoading(false)
    }
  }

  const updateItem = async (item_id: number, quantity: number) => {
    setLoading(true)
    try {
      const c = await cartApi.updateItem(item_id, quantity) as Cart
      setCart(c)
    } finally {
      setLoading(false)
    }
  }

  const removeItem = async (item_id: number) => {
    setLoading(true)
    try {
      const c = await cartApi.deleteItem(item_id) as Cart
      setCart(c)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Ctx.Provider value={{ cart, loading, addItem, updateItem, removeItem, refresh }}>
      {children}
    </Ctx.Provider>
  )
}

export const useCart = () => useContext(Ctx)
