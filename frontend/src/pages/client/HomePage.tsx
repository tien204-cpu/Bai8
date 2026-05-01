import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Zap, Shield, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'

export function HomePage() {
  const { state, addToCart } = useStore()
  const navigate = useNavigate()
  const featured = state.products.slice(0, 4)
  const popular = state.products.slice(4, 8)

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80" alt="ShopVerse hero" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-transparent" />
        </div>
        <div className="relative container mx-auto px-4 py-24 md:py-36">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-6xl font-extrabold text-primary-foreground mb-6 leading-tight">
              Discover Your <span className="opacity-80">Style</span>
            </h1>
            <p className="text-lg text-primary-foreground/80 mb-8 leading-relaxed">
              Explore curated collections of premium products. From tech to fashion, find everything you need in one place.
            </p>
            <div className="flex gap-3">
              <Button size="lg" variant="premium" onClick={() => navigate('/products')}>
                Shop Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20" onClick={() => navigate('/products?category=1')}>
                Electronics
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Truck, title: 'Free Shipping', desc: 'On orders over 500,000 VND' },
            { icon: Shield, title: 'Secure Payment', desc: 'Stripe & VNPay integration' },
            { icon: Zap, title: 'Fast Delivery', desc: '2-3 business days nationwide' },
          ].map((f) => (
            <Card key={f.title} className="border-0 bg-secondary/50">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                  <f.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{f.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <p className="text-sm text-muted-foreground mt-1">Hand-picked items just for you</p>
          </div>
          <Link to="/products" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((product, i) => (
            <Card key={product.id} className="group overflow-hidden hover:shadow-card-hover cursor-pointer" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="aspect-square bg-secondary/50 relative overflow-hidden">
                <img src={product.imageUrls[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-smooth" />
              </div>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">{product.category?.name}</p>
                <h3 className="font-semibold text-sm mb-2 line-clamp-1" onClick={() => navigate(`/products/${product.id}`)}>{product.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary">{formatPrice(product.price)}</span>
                  <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); addToCart(product); }}>
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Popular Now */}
      <section className="gradient-subtle py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">Popular Now</h2>
              <p className="text-sm text-muted-foreground mt-1">Trending items this week</p>
            </div>
            <Link to="/products" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popular.map((product) => (
              <Card key={product.id} className="group overflow-hidden hover:shadow-card-hover cursor-pointer" onClick={() => navigate(`/products/${product.id}`)}>
                <div className="aspect-square bg-secondary/50 relative overflow-hidden">
                  <img src={product.imageUrls[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                </div>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">{product.category?.name}</p>
                  <h3 className="font-semibold text-sm mb-2 line-clamp-1">{product.name}</h3>
                  <span className="font-bold text-primary">{formatPrice(product.price)}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <Card className="gradient-hero overflow-hidden border-0">
          <CardContent className="p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-3">Ready to Upgrade Your Lifestyle?</h2>
            <p className="text-primary-foreground/80 mb-6 max-w-md mx-auto">Join thousands of happy customers. Sign up today and get 10% off your first order.</p>
            <Button size="lg" className="bg-primary-foreground/20 text-primary-foreground border border-primary-foreground/30 hover:bg-primary-foreground/30" onClick={() => navigate('/register')}>
              Create Account <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
