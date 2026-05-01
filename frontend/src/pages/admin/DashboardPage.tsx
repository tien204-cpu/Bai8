import { Package, ShoppingCart, Users, TrendingUp, DollarSign, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'

export function DashboardPage() {
  const { state } = useStore()
  const totalRevenue = state.orders.filter((o) => o.status !== 'CANCELLED').reduce((sum, o) => sum + o.totalAmount, 0)
  const pendingOrders = state.orders.filter((o) => o.status === 'PENDING').length
  const totalProducts = state.products.length
  const recentOrders = state.orders.slice(0, 5)

  const stats = [
    { label: 'Total Revenue', value: formatPrice(totalRevenue), icon: DollarSign, change: '+12.5%' },
    { label: 'Total Orders', value: state.orders.length, icon: ShoppingCart, change: '+8.2%' },
    { label: 'Total Products', value: totalProducts, icon: Package, change: '+3' },
    { label: 'Pending Orders', value: pendingOrders, icon: TrendingUp, change: String(pendingOrders) },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your store performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={stat.label} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-full">{stat.change}</span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" /> Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">#{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">{order.items.length} items</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge status={order.status} />
                    <span className="text-sm font-medium">{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Top Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {state.products.slice(0, 5).map((product, i) => (
                <div key={product.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                  <span className="text-sm font-bold text-muted-foreground w-5">{i + 1}</span>
                  <div className="w-8 h-8 rounded bg-secondary/50 overflow-hidden shrink-0">
                    <img src={product.imageUrls[0]} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category?.name}</p>
                  </div>
                  <span className="text-sm font-medium">{formatPrice(product.price)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
