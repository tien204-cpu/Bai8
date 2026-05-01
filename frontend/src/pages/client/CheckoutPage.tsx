import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'

export function CheckoutPage() {
  const { state, placeOrder } = useStore()
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', phone: '', address: '', city: '' })
  const [note, setNote] = useState('')
  const [success, setSuccess] = useState(false)
  const total = state.cart.reduce((sum, i) => sum + i.price * i.quantity, 0)

  if (!state.user) {
    navigate('/login')
    return null
  }

  if (state.cart.length === 0 && !success) {
    navigate('/cart')
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.fullName || !form.phone || !form.address || !form.city) return
    placeOrder(form, note || undefined)
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="container mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6">
          <Check className="h-8 w-8 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Order Placed Successfully!</h2>
        <p className="text-muted-foreground mb-8">Thank you for your purchase. We'll process your order shortly.</p>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={() => navigate('/orders')}>View Orders</Button>
          <Button onClick={() => navigate('/products')}>Continue Shopping</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-smooth mb-6">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Shipping Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Full Name" placeholder="Nguyen Van A" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
                  <Input label="Phone" placeholder="0901234567" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                  <div className="sm:col-span-2">
                    <Input label="Address" placeholder="123 Le Loi, District 1" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
                  </div>
                  <Input label="City" placeholder="Ho Chi Minh" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
                  <div>
                    <label className="text-sm font-medium text-foreground">Note (optional)</label>
                    <textarea
                      className="mt-1.5 flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="Delivery instructions..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Order Items ({state.cart.length})</h3>
                <div className="space-y-3">
                  {state.cart.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-secondary/50 overflow-hidden shrink-0">
                          <img src={item.imageUrl || '/images/placeholder.svg'} alt={item.productName} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-medium line-clamp-1">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Payment Summary</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-success">Free</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                </div>
                <Button type="submit" className="w-full" size="lg">Place Order</Button>
                <p className="text-xs text-muted-foreground text-center mt-3">By placing this order, you agree to our Terms of Service</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
