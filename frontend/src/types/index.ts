// ============================================
// Shared Types for the E-Commerce Frontend
// ============================================

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: 'ADMIN' | 'CUSTOMER'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface Category {
  id: string
  name: string
  description?: string
  parentId?: string
  children?: Category[]
  _count?: { products: number }
}

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  sku: string
  imageUrls: string[]
  isActive: boolean
  categoryId: string
  category?: Category
  stock: number
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  productId: string
  productName: string
  price: number
  quantity: number
  imageUrl?: string
}

export interface CartResponse {
  userId: string
  items: CartItem[]
  total: number
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

export interface OrderItem {
  id: string
  productId: string
  productName: string
  price: number
  quantity: number
}

export interface Order {
  id: string
  userId: string
  status: OrderStatus
  totalAmount: number
  shippingAddress: {
    fullName: string
    phone: string
    address: string
    city: string
  }
  note?: string
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
