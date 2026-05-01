import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Minus, Plus, ShoppingCart, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SimpleBadge } from '@/components/ui/badge'
import { useStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'

export function ProductDetailPage() {
  const { id } = useParams()
  const { state, addToCart } = useStore()
  const navigate = useNavigate()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const product = state.products.find((p) => p.id === id)

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-semibold mb-2">Product not found</h2>
        <Button variant="outline" onClick={() => navigate('/products')}>Back to Products</Button>
      </div>
    )
  }

  const relatedProducts = state.products.filter((p) => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4)

  const handleAdd = () => {
    addToCart(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-smooth mb-6">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image */}
        <div className="aspect-square rounded-2xl bg-secondary/50 overflow-hidden">
          <img src={product.imageUrls[0]} alt={product.name} className="w-full h-full object-cover" />
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <div className="mb-2">
            <span className="text-sm text-muted-foreground">{product.category?.name}</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-muted-foreground leading-relaxed mb-6">{product.description}</p>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
            {product.stock > 0 ? (
              <SimpleBadge variant="success">In Stock ({product.stock})</SimpleBadge>
            ) : (
              <SimpleBadge variant="destructive">Out of Stock</SimpleBadge>
            )}
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center border rounded-lg">
              <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} disabled={quantity >= product.stock}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button size="lg" className="flex-1" onClick={handleAdd} disabled={product.stock === 0}>
              {added ? (
                <><Check className="mr-2 h-4 w-4" /> Added!</>
              ) : (
                <><ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart</>
              )}
            </Button>
          </div>

          <Card className="border-0 bg-secondary/50">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">SKU</span>
                <span className="font-medium">{product.sku}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{product.category?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Availability</span>
                <span className="font-medium">{product.stock} units</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <Card key={p.id} className="group overflow-hidden hover:shadow-card-hover cursor-pointer" onClick={() => navigate(`/products/${p.id}`)}>
                <div className="aspect-square bg-secondary/50 overflow-hidden">
                  <img src={p.imageUrls[0]} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium text-sm line-clamp-1">{p.name}</h3>
                  <span className="font-bold text-sm text-primary">{formatPrice(p.price)}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
