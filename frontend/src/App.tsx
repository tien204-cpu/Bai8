import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ClientLayout } from '@/components/layout/ClientLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { HomePage } from '@/pages/client/HomePage'
import { ProductListPage } from '@/pages/client/ProductListPage'
import { ProductDetailPage } from '@/pages/client/ProductDetailPage'
import { CartPage } from '@/pages/client/CartPage'
import { CheckoutPage } from '@/pages/client/CheckoutPage'
import { OrderHistoryPage } from '@/pages/client/OrderHistoryPage'
import { LoginPage, RegisterPage } from '@/pages/client/AuthPages'
import { DashboardPage } from '@/pages/admin/DashboardPage'
import { AdminProductListPage } from '@/pages/admin/AdminProductListPage'
import { AdminCategoryPage } from '@/pages/admin/AdminCategoryPage'
import { AdminOrderListPage } from '@/pages/admin/AdminOrderListPage'
import { AdminUserListPage } from '@/pages/admin/AdminUserListPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Client Routes */}
        <Route element={<ClientLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrderHistoryPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<AdminProductListPage />} />
          <Route path="categories" element={<AdminCategoryPage />} />
          <Route path="orders" element={<AdminOrderListPage />} />
          <Route path="users" element={<AdminUserListPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
