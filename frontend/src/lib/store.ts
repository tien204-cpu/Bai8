import { useState, useCallback, useEffect } from 'react'
import type { User, Product, Category, CartItem, Order, OrderStatus, AuthResponse, PaginatedResponse } from '@/types'
import { api } from './api'

// ============================================
// Global Store (simple React state approach)
// ============================================
interface StoreState {
  user: User | null
  token: string | null
  cart: CartItem[]
  products: Product[]
  categories: Category[]
  orders: Order[]
  users: User[] // Added users for Admin management
  isLoading: boolean
  error: string | null
}

const initialState: StoreState = {
  user: null,
  token: localStorage.getItem('token'),
  cart: JSON.parse(localStorage.getItem('cart') || '[]'),
  products: [],
  categories: [],
  orders: [],
  users: [],
  isLoading: false,
  error: null,
}

let globalState = { ...initialState }
let listeners: (() => void)[] = []

function emit() {
  listeners.forEach((l) => l())
}

export function useStore() {
  const [, forceUpdate] = useState(0)

  const subscribe = useCallback(() => {
    const listener = () => forceUpdate((n) => n + 1)
    listeners.push(listener)
    return () => {
      listeners = listeners.filter((l) => l !== listener)
    }
  }, [])

  useEffect(() => {
    const unsub = subscribe()
    return unsub
  }, [subscribe])

  // Helper to update state and emit
  const setState = (updates: Partial<StoreState>) => {
    globalState = { ...globalState, ...updates }
    emit()
  }

  const fetchProducts = async () => {
    try {
      const res = await api.get<PaginatedResponse<Product>>('/products')
      setState({ products: res.data })
    } catch (err: any) {
      setState({ error: err.message })
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await api.get<Category[]>('/categories')
      setState({ categories: res })
    } catch (err: any) {
      setState({ error: err.message })
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await api.get<PaginatedResponse<User>>('/users')
      setState({ users: res.data })
    } catch (err: any) {
      setState({ error: err.message })
    }
  }

  return {
    state: globalState,
    fetchProducts,
    fetchCategories,
    fetchUsers,
    
    login: async (email: string, password: string) => {
      setState({ isLoading: true, error: null })
      try {
        const res = await api.post<AuthResponse>('/auth/login', { email, password })
        localStorage.setItem('token', res.accessToken)
        setState({ user: res.user, token: res.accessToken, isLoading: false })
      } catch (err: any) {
        setState({ error: err.message, isLoading: false })
        throw err
      }
    },

    register: async (email: string, firstName: string, lastName: string, password?: string) => {
      setState({ isLoading: true, error: null })
      try {
        const res = await api.post<AuthResponse>('/auth/register', { email, firstName, lastName, password: password || 'default123' })
        localStorage.setItem('token', res.accessToken)
        setState({ user: res.user, token: res.accessToken, isLoading: false })
      } catch (err: any) {
        setState({ error: err.message, isLoading: false })
        throw err
      }
    },

    logout: () => {
      localStorage.removeItem('token')
      globalState = { ...initialState, token: null, user: null, cart: [] }
      emit()
    },

    // User Management (Admin)
    addUser: async (userData: any) => {
      try {
        await api.post('/auth/register', userData)
        await fetchUsers()
      } catch (err: any) {
        setState({ error: err.message })
        throw err
      }
    },

    updateUserRole: async (userId: string, role: string) => {
      try {
        await api.put(`/users/${userId}/role`, { role })
        await fetchUsers()
      } catch (err: any) {
        setState({ error: err.message })
        throw err
      }
    },

    deleteUser: async (userId: string) => {
      try {
        await api.delete(`/users/${userId}`)
        await fetchUsers()
      } catch (err: any) {
        setState({ error: err.message })
        throw err
      }
    },

    addToCart: (product: Product, quantity = 1) => {
      const existing = globalState.cart.find((i) => i.productId === product.id)
      let newCart
      if (existing) {
        newCart = globalState.cart.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i
        )
      } else {
        newCart = [...globalState.cart, { productId: product.id, productName: product.name, price: product.price, quantity, imageUrl: product.imageUrls[0] }]
      }
      localStorage.setItem('cart', JSON.stringify(newCart))
      setState({ cart: newCart })
    },

    updateCartItem: (productId: string, quantity: number) => {
      let newCart
      if (quantity <= 0) {
        newCart = globalState.cart.filter((i) => i.productId !== productId)
      } else {
        newCart = globalState.cart.map((i) => i.productId === productId ? { ...i, quantity } : i)
      }
      localStorage.setItem('cart', JSON.stringify(newCart))
      setState({ cart: newCart })
    },

    removeFromCart: (productId: string) => {
      const newCart = globalState.cart.filter((i) => i.productId !== productId)
      localStorage.setItem('cart', JSON.stringify(newCart))
      setState({ cart: newCart })
    },

    clearCart: () => {
      localStorage.removeItem('cart')
      setState({ cart: [] })
    },

    addProduct: async (productData: any) => {
      try {
        await api.post('/products', productData)
        await fetchProducts()
      } catch (err: any) {
        setState({ error: err.message })
        throw err
      }
    },

    updateProduct: async (id: string, updates: any) => {
      try {
        await api.put(`/products/${id}`, updates)
        await fetchProducts()
      } catch (err: any) {
        setState({ error: err.message })
        throw err
      }
    },

    deleteProduct: async (id: string) => {
      try {
        await api.delete(`/products/${id}`)
        await fetchProducts()
      } catch (err: any) {
        setState({ error: err.message })
        throw err
      }
    },

    placeOrder: async (shippingAddress: any, note?: string) => {
      try {
        const res = await api.post<Order>('/orders', {
          shippingAddress,
          note,
          items: globalState.cart.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        })
        setState({ cart: [] })
        localStorage.removeItem('cart')
        return res
      } catch (err: any) {
        setState({ error: err.message })
        throw err
      }
    },

    updateOrderStatus: async (orderId: string, status: OrderStatus) => {
      try {
        await api.put(`/orders/${orderId}/status`, { status })
        // Fetch orders again or update local state
      } catch (err: any) {
        setState({ error: err.message })
        throw err
      }
    },
  }
}
