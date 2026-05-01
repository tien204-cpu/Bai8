import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/lib/store'
import { formatPrice, formatDate } from '@/lib/utils'
import type { OrderStatus } from '@/types'

const STATUS_OPTIONS: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

export function AdminOrderListPage() {
  const { state, updateOrderStatus } = useStore()
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const filtered = statusFilter ? state.orders.filter((o) => o.status === statusFilter) : state.orders

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId)
    setError(null)
    try {
      await updateOrderStatus(orderId, newStatus)
    } catch (err: any) {
      setError(err.message || 'Failed to update order')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">{state.orders.length} total orders</p>
      </div>

      {error && <div className="p-4 bg-destructive/10 border border-destructive text-destructive rounded-lg text-sm">{error}</div>}

      <div className="flex gap-2 flex-wrap">
        <Button size="sm" variant={!statusFilter ? 'default' : 'outline'} onClick={() => setStatusFilter('')}>All</Button>
        {STATUS_OPTIONS.map((s) => (
          <Button key={s} size="sm" variant={statusFilter === s ? 'default' : 'outline'} onClick={() => setStatusFilter(s)}>
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-secondary/30">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Order ID</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Customer</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Items</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Total</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Date</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id} className="border-b last:border-0 hover:bg-secondary/20 transition-smooth">
                    <td className="px-4 py-3 text-sm font-medium">#{order.id.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-sm">{order.shippingAddress.fullName}</td>
                    <td className="px-4 py-3"><Badge status={order.status} /></td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{order.items.length} items</td>
                    <td className="px-4 py-3 text-sm font-medium text-right">{formatPrice(order.totalAmount)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        disabled={updatingId === order.id}
                        className="h-8 rounded-md border border-input bg-background px-2 text-xs disabled:opacity-50 cursor-pointer"
                      >
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
