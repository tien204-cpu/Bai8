import { useNavigate } from 'react-router-dom'
import { Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/lib/store'
import { formatPrice, formatDate } from '@/lib/utils'

export function OrderHistoryPage() {
  const { state } = useStore()
  const navigate = useNavigate()

  if (!state.user) {
    navigate('/login')
    return null
  }

  const orders = state.orders.filter((o) => o.userId === state.user?.id)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
          <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
          <Button onClick={() => navigate('/products')}>Browse Products</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-card-hover transition-smooth animate-fade-in">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold">Order #{order.id.slice(0, 8)}</h3>
                      <Badge status={order.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{formatPrice(order.totalAmount)}</p>
                    <p className="text-xs text-muted-foreground">{order.items.length} item(s)</p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex flex-wrap gap-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-1.5">
                        <span className="text-sm">{item.productName}</span>
                        <span className="text-xs text-muted-foreground">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
